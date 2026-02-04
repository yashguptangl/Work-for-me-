"use client";
import { useState } from "react";
import { User, Building, FileText, Check, Plus, Trash2 } from "lucide-react";

interface OwnerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

interface TenantDetails {
  fullName: string;
  email: string;
  phone: string;
  permanentAddress: string;
}

interface PropertyDetails {
  propertyAddress: string;
  rentAmount: string;
  securityDeposit: string;
  rentStartDate: string;
  agreementDuration: string;
  noticePeriod: string;
  annexures: string;
}

interface AnnexureItem {
  name: string;
  count: string;
}

export default function RentAgreementPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [agreementGenerated, setAgreementGenerated] = useState(false);
  const [agreementFilledBy, setAgreementFilledBy] = useState<"owner" | "tenant" | "">("");
  // const [selectedStampType, setSelectedStampType] = useState("withStamp");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [createdAgreementId, setCreatedAgreementId] = useState<string>("");
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  
  // Annexure items state
  const [annexureItems, setAnnexureItems] = useState<AnnexureItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCount, setNewItemCount] = useState("1");
  
  const [ownerDetails, setOwnerDetails] = useState<OwnerDetails>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  
  const [tenantDetails, setTenantDetails] = useState<TenantDetails>({
    fullName: "",
    email: "",
    phone: "",
    permanentAddress: "",
  });
  
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>({
    propertyAddress: "",
    rentAmount: "",
    securityDeposit: "",
    rentStartDate: "",
    agreementDuration: "11",
    noticePeriod: "30",
    annexures: "",
  });

  const steps = [
    { number: 1, title: "Owner Details", icon: User },
    { number: 2, title: "Tenant Details", icon: User },
    { number: 3, title: "Property Details", icon: Building },
    { number: 4, title: "Agreement Terms", icon: FileText },
  ];

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isStepComplete = (stepNum: number) => stepNum < currentStep;

  // Validation functions
  const isOwnerDetailsValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      ownerDetails.fullName.trim() !== "" &&
      ownerDetails.email.trim() !== "" &&
      emailRegex.test(ownerDetails.email) &&
      ownerDetails.phone.trim() !== "" &&
      ownerDetails.phone.length === 10 &&
      ownerDetails.address.trim() !== ""
    );
  };

  const isTenantDetailsValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      tenantDetails.fullName.trim() !== "" &&
      tenantDetails.email.trim() !== "" &&
      emailRegex.test(tenantDetails.email) &&
      tenantDetails.phone.trim() !== "" &&
      tenantDetails.phone.length === 10 &&
      tenantDetails.permanentAddress.trim() !== ""
    );
  };

  const isPropertyDetailsValid = () => {
    return propertyDetails.propertyAddress.trim() !== "";
  };

  const isAgreementTermsValid = () => {
    return (
      propertyDetails.rentAmount.trim() !== "" &&
      propertyDetails.securityDeposit.trim() !== "" &&
      propertyDetails.agreementDuration.trim() !== "" &&
      propertyDetails.noticePeriod.trim() !== "" &&
      propertyDetails.rentStartDate.trim() !== ""
    );
  };

  // Annexure item functions
  const addAnnexureItem = () => {
    if (newItemName.trim() && newItemCount.trim()) {
      setAnnexureItems([...annexureItems, { name: newItemName.trim(), count: newItemCount.trim() }]);
      setNewItemName("");
      setNewItemCount("1");
    }
  };

  const removeAnnexureItem = (index: number) => {
    setAnnexureItems(annexureItems.filter((_, i) => i !== index));
  };

  const generateAgreement = () => {
    // Convert annexure items to string format for backward compatibility
    const annexuresString = annexureItems.map(item => `${item.count} ${item.name}`).join('\n');
    setPropertyDetails({ ...propertyDetails, annexures: annexuresString });
    setAgreementGenerated(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadPDF = async () => {
    if (!createdAgreementId) {
      alert('Agreement ID not found. Please try again.');
      return;
    }

    try {
      setDownloadingPDF(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rent-agreements/${createdAgreementId}/download`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rent_Agreement_${ownerDetails.fullName}_${tenantDetails.fullName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('PDF downloaded successfully! ✅');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handlePayment = async () => {
    if (!termsAccepted) {
      alert("Kripya Terms & Conditions accept karein");
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      // Get the phone number based on who filled the form
      const recipientPhone = agreementFilledBy === "owner" ? ownerDetails.phone : tenantDetails.phone;
      const recipientName = agreementFilledBy === "owner" ? ownerDetails.fullName : tenantDetails.fullName;
      
      // Prepare data for API
      const agreementData = {
        createdBy: agreementFilledBy,
        creatorPhone: recipientPhone,
        ownerFullName: ownerDetails.fullName,
        ownerEmail: ownerDetails.email,
        ownerPhone: ownerDetails.phone,
        ownerAddress: ownerDetails.address,
        tenantFullName: tenantDetails.fullName,
        tenantEmail: tenantDetails.email,
        tenantPhone: tenantDetails.phone,
        tenantPermanentAddress: tenantDetails.permanentAddress,
        propertyAddress: propertyDetails.propertyAddress,
        annexures: propertyDetails.annexures,
        rentAmount: propertyDetails.rentAmount,
        securityDeposit: propertyDetails.securityDeposit,
        agreementDuration: propertyDetails.agreementDuration,
        noticePeriod: propertyDetails.noticePeriod,
        rentStartDate: propertyDetails.rentStartDate,
      };

      // Create rent agreement in database
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rent-agreements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(agreementData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create agreement');
      }

      const agreementId = data.data.id;
      setCreatedAgreementId(agreementId); // Store agreement ID for download

      // Directly update payment status to completed (payment gateway will be added later)
      const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rent-agreements/${agreementId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          paymentStatus: 'COMPLETED',
          paymentAmount: '0', // Free for now, payment gateway will be added later
          paymentId: `FREE_${Date.now()}`,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentData.success) {
        throw new Error(paymentData.message || 'Failed to update payment status');
      }

      // Mark payment as completed
      setPaymentCompleted(true);
      
      alert(`Agreement Generated Successfully! ✅\n\nYour rent agreement has been created successfully and sent to the email.`);
      
      // Check if user is logged in
      const isLoggedIn = !!token;
      
      if (!isLoggedIn) {
        // If not logged in, redirect to home page after 2 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        // If logged in, just scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
    } catch (error) {
      console.error('Agreement generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Agreement generation failed.\n\nError: ${errorMessage}\n\nKripya dobara try karein.`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // If agreement is generated, show preview
  if (agreementGenerated) {
    return (
      <div className="min-h-screen bg-gray-50 py-3 sm:py-4 md:py-6 lg:py-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {/* Left Side - Payment Section */}
            <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm h-fit">
              {!paymentCompleted ? (
                <>
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
                    Complete Your Payment
                  </h1>

                  {/* Payment Card */}
                  <div className="space-y-4 mt-6">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary rounded-lg p-6">
                      <div className="text-center mb-4">
                        <p className="text-sm text-gray-600 mb-2">Amount to Pay</p>
                        <p className="text-4xl md:text-5xl font-bold text-primary">₹100</p>
                      </div>
                      <div className="border-t border-primary/30 pt-4 mt-4">
                        <p className="text-xs text-gray-600 text-center">
                          Professional Rent Agreement Document with Email Delievery
                        </p>
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-2">
                      <input 
                        type="checkbox" 
                        id="terms" 
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 sm:mt-1 w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" 
                      />
                      <label htmlFor="terms" className="text-[11px] sm:text-xs md:text-sm text-gray-600 cursor-pointer">
                        I accept Roomkarts&apos;s terms & conditions
                      </label>
                    </div>

                    {/* Pay Button */}
                    <button 
                      onClick={handlePayment}
                      disabled={!termsAccepted || isProcessingPayment}
                      className={`w-full px-4 sm:px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-sm sm:text-base md:text-lg transition-colors ${
                        termsAccepted && !isProcessingPayment
                          ? "bg-primary hover:bg-primary/90 cursor-pointer"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isProcessingPayment ? "Processing Payment..." : "Pay Now & Generate Agreement"}
                    </button>

                    {/* Back Button */}
                    <button 
                      onClick={() => setAgreementGenerated(false)}
                      className="w-full px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm sm:text-base font-medium transition-colors"
                    >
                      Back to Edit
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-500 mb-3 sm:mb-4 md:mb-6">
                    Payment Successful!
                  </h1>

                  {/* Payment Success Message */}
                  <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 md:p-6 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Check className="w-8 h-8 text-blue-500" />
                      <div>
                        <h3 className="text-base md:text-lg font-bold text-blue-700">
                          ₹100 Paid Successfully
                        </h3>
                        <p className="text-xs sm:text-sm text-blue-600">
                          Rent Agreement Generated Successfully and sent to the Email.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button 
                    onClick={handleDownloadPDF}
                    disabled={downloadingPDF}
                    className={`w-full mb-3 px-4 sm:px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-sm sm:text-base md:text-lg transition-colors ${
                      downloadingPDF
                        ? 'bg-gray-400  cursor-not-allowed'
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                  >
                    {downloadingPDF ? 'Downloading...' : 'Download Agreement PDF'}
                  </button>

                  {/* View All Agreements Button */}
                  <button 
                    onClick={() => window.location.href = '/rent-agreements'}
                    className="w-full px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm sm:text-base font-medium transition-colors"
                  >
                    View All Agreements
                  </button>
                </>
              )}
            </div>

            {/* Right Side - Agreement Preview */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div 
                className="p-3 sm:p-4 md:p-6 lg:p-8 h-[400px] sm:h-[500px] md:h-[600px] overflow-y-auto select-none"
                style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
                onCopy={(e) => e.preventDefault()}
              >
                <div className="text-center mb-3 sm:mb-4 md:mb-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 underline">RENTAL AGREEMENT</h2>
                </div>

                <div className="text-[11px] sm:text-xs md:text-sm text-gray-800 space-y-2 sm:space-y-3 md:space-y-4 leading-relaxed" style={{ fontFamily: 'Times New Roman, serif' }}>
                  <p>
                    THIS RENTAL AGREEMENT is executed at {propertyDetails.propertyAddress.split(',').slice(-2).join(',').trim() || 'Location'} on {new Date(propertyDetails.rentStartDate).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })} by and between <strong>{ownerDetails.fullName.toUpperCase()}</strong>, resident of {ownerDetails.address} (hereinafter jointly and severally called the &quot;LANDLORD&quot;, which expression shall include their heirs, legal representatives, successors and assigns of the one part).
                  </p>

                  <p>
                    AND <strong>{tenantDetails.fullName.toUpperCase()}</strong>, having permanent address at {tenantDetails.permanentAddress}, and having (hereinafter called the &quot;TENANT&quot;, which expression shall include its legal representatives, successors and assigns of the other part).
                  </p>

                  <p>
                    WHEREAS the Landlord is the absolute owner of {propertyDetails.propertyAddress}, consisting inbuilt fittings & fixtures and inventory of the equipments as detailed in Annexure-I, hereinafter referred to as &quot;Demised Premises&quot;.
                  </p>

                  <p className="font-bold">THIS DEED WITNESSETH AS FOLLOWS:</p>

                  <ol className="space-y-3" style={{ listStyleType: 'decimal', paddingLeft: '20px' }}>
                    <li>
                      The rent in respect of the &quot;Demised Premises&quot; shall commence from {new Date(propertyDetails.rentStartDate).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })} and shall be valid till {new Date(new Date(propertyDetails.rentStartDate).setMonth(new Date(propertyDetails.rentStartDate).getMonth() + parseInt(propertyDetails.agreementDuration || '11'))).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })} (hereinafter &quot;Rent Period&quot;). Thereafter, the same may be extended further on mutual consent of both the parties.
                    </li>
                    
                    <li>
                      That the Tenant shall pay to the Landlord a monthly rent of Rs. {propertyDetails.rentAmount}/-. (hereinafter &quot;Rent&quot;). The rent shall be paid in advance monthly on or before 10th of every month. If the rent remains unpaid for one month and the Tenant does not pay the same despite service of a notice by the Landlord, the Landlord shall be entitled to immediately terminate this Agreement and take back possession of the Demised Premises immediately.
                    </li>
                    
                    <li>
                      That during the Rent period, in addition to the rental amount payable to the Landlord, the Tenant shall pay for the use of electricity, water and any other utilities as per actual bills received from the authorities concerned directly. Before vacating the Demised Premises on {new Date(new Date(propertyDetails.rentStartDate).setMonth(new Date(propertyDetails.rentStartDate).getMonth() + parseInt(propertyDetails.agreementDuration || '11'))).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })}, Tenant must ensure that all dues of any utilities are cleared and no amounts remain unpaid. Dues of electricity and water before the Rent Period shall be paid and cleared by the Landlord.
                    </li>
                    
                    <li>
                      Servicing & repair of any appliances or fixtures provided by the Landlord will be the responsibility of the Tenant. Any Landlord provided appliances which have been damaged by Tenant will be replaced by the Tenant.
                    </li>
                    
                    <li>
                      The Tenant shall pay to the Landlord an interest-free refundable security deposit of Rs. {propertyDetails.securityDeposit}/- (hereinafter &quot;Security Deposit&quot;). The said Security Deposit shall be refunded by the Landlord to the Tenant at the time of handing back possession of the Demised Premises by the Tenant on expiry or sooner termination of this Agreement. Landlord shall be entitled to adjust any dues of Rent, utilities or cost of damage to the Demised Premises caused by the Tenant except for normal wear & tear in the ordinary course of usage.
                    </li>
                    
                    <li>
                      That the Tenant shall not sublet, assign or part with the Demised Premises in whole or part thereof to any person in any circumstances whatsoever and the same shall be used for the bonafide residential purposes of the Tenant or the Tenant&apos;s family guests only.
                    </li>
                    
                    <li>
                      That the day-to-day minor repairs will be the responsibility of the Tenant at his/her own expense. However, any structural or major repairs, if so required, shall be carried out by the Landlord.
                    </li>
                    
                    <li>
                      That no structural additions or alterations shall be made by the Tenant to the Demised Premises without the prior written consent of the Landlord. However, the Tenant can install air-conditioners in the space provided and other electrical gadgets and make such changes for the purposes as may be necessary, at his own cost. The Landlord represents that the Premises possesses the adequate electrical infrastructure to cater for the electrical appliances including the air-conditioners. On termination or expiry of the tenancy or earlier, the Tenant will be entitled to remove such equipments and should restore the premises if any.
                    </li>
                    
                    <li>
                      That the Landlord shall have the right to visit or enter the Demised Premises in person or through his authorized agent(s), servants, workmen etc., for inspection (not exceeding once in a month) or to carry out repairs / construction, as and when required, by giving a 24 hours notice to the Tenant.
                    </li>
                    
                    <li>
                      That the Tenant shall comply with all the rules and regulations of the local authority or the resident welfare association as applicable to the Demised Premises.
                    </li>
                    
                    <li>
                      The Landlord shall pay for all property or other taxes/cesses levied on the Demised Premises by the local or government authorities. Further, any other payment in the nature of subscription or periodic fee to the welfare association shall be paid by the Landlord.
                    </li>
                    
                    <li>
                      That the Landlord will keep the Demised Premises free and harmless from any liens, claims, proceedings, demands or actions on his account and subject to payment of monthly rent and compliance with the terms of this Agreement the Tenant shall be entitled to enjoy peaceful possession of the Demised Premises.
                    </li>
                    
                    <li>
                      That this Rent Agreement cannot be terminated by either party for a period of {Math.floor(parseInt(propertyDetails.agreementDuration || '11') / 30)} month(s) from the {new Date(propertyDetails.rentStartDate).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })} (hereinafter &quot;Lock-in Period&quot;). If any party intends to terminate this Agreement during the Lock-in Period, it must pay the other Party, as compensation, an amount equal to the Rent for the remainder of the Lock-in Period. After the completion of lock-in-period, the Tenant can terminate the Rent Agreement by giving {Math.floor(parseInt(propertyDetails.noticePeriod || '30') / 30)} month&apos;s notice to the Landlord or the rent in lieu of. After the completion of Lock-in-Period, the Landlord can also terminate the Rent Agreement by giving {Math.floor(parseInt(propertyDetails.noticePeriod || '30') / 30)} month&apos;s notice to the Tenant. It is clarified that in the event of non-payment of rent by the Tenant during the lock-in period being in arrears for 2 consecutive months, then the Landlord shall have the right to terminate the Rent Agreement with immediate effect and take back possession of the Demised Premises.
                    </li>
                    
                    <li>
                      In the event the Landlord transfers, alienates or encumbers or otherwise disposes or deals with Demised Premises, the Landlord shall intimate the Tenant about the same in writing and shall ensure that the purchaser/transferee shall honor the terms of this Rent Agreement. Landlord shall provide undertaking to the Tenant from the said purchaser/transferee to that effect.
                    </li>
                    
                    <li>
                      The Landlord shall acknowledge and give valid receipts for each payment made by the Tenant to the Landlord, which shall be treated as conclusive proof of such payments.
                    </li>
                    
                    <li>
                      The Landlord confirms that in case for any reason whatsoever the premises is unfit for residence or any part thereof cannot be used for residential purposes because of any earthquake, civil commotion, or due to any natural calamity of Premises is acquired compulsorily by any authority, over which the Landlord has no control, the Tenant shall have the right to terminate this Agreement forthwith and vacate the premises and the Landlord shall refund the security deposit or the rent received in advance to the Tenant without any deductions whatsoever.
                    </li>
                    
                    <li>
                      That the Tenant will keep the Landlord harmless and keep it exonerated from all losses (whether financial or life), damage, liability or expense occasioned or claimed by reasons of acts or neglects of the Tenant or his visitors, employees, whether in the Demised Premises or elsewhere in the building, unless caused by the negligent acts of the Landlord.
                    </li>
                    
                    <li>
                      The Tenant shall maintain the Demised Premises in good and tenable condition and all the minor repairs such as leakage in the sanitary fittings, water taps and electrical usage etc. shall be carried out by the Tenant at his own expense. That it shall be the responsibility of the Tenant to hand over the vacant and peaceful possession of the demised premises on expiry of the Rent period, or on its early termination, as stated hereinabove in the same condition subject to natural wear and tear.
                    </li>
                    
                    <li>
                      That in case, where the Premises are not vacated by the Tenant, at the termination of the Rent period, the Tenant will pay damages calculated at two times the rent for any period of occupation commencing from the expiry of the Rent period. The payment of damages as aforesaid will not preclude the Landlord from initiating legal proceedings against the Tenant for recovery possession of premises or for any other purpose.
                    </li>
                    
                    <li>
                      That both the parties shall observe and adhere to the terms and conditions contained hereinabove.
                    </li>
                    
                    <li>
                      That the Tenant and Landlord represent and warrant that they are fully empowered and competent to make this Rent.
                    </li>
                    
                    <li>
                      If required, the Rent Agreement will be registered in front of registrar and the charges towards stamp duty, court fee & lawyer/coordinator will be equally borne by the Landlord & Tenant.
                    </li>
                  </ol>

                  <p className="font-bold mt-6">IN WITNESS WHEREOF</p>
                  <p>The parties hereto have executed these presents on the day and year first above written.</p>

                  <div className="mt-8 space-y-4">
                    <div>
                      <p className="font-bold">LANDLORD SIGNATURE:</p>
                      <p className="mt-2">{ownerDetails.fullName}</p>
                    </div>
                    
                    <div>
                      <p className="font-bold">TENANT SIGNATURE:</p>
                      <p className="mt-2">{tenantDetails.fullName}</p>
                    </div>
                    
                    <div>
                      <p className="font-bold">WITNESS ONE:</p>
                      <p className="text-gray-500 text-xs mt-1">Name & Address</p>
                    </div>
                    
                    <div>
                      <p className="font-bold">WITNESS TWO:</p>
                      <p className="text-gray-500 text-xs mt-1">Name & Address</p>
                    </div>
                  </div>

                  {propertyDetails.annexures && (
                    <div className="mt-8 pt-6 border-t-2 border-gray-400">
                      <p className="font-bold text-base mb-3">ANNEXURE-I</p>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-400">
                            <th className="text-left py-2 px-2 font-bold">Item Name</th>
                            <th className="text-left py-2 px-2 font-bold">Item Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {propertyDetails.annexures.split('\n').filter((line) => line.trim()).map((line, idx) => {
                            // Parse item line: supports formats like "1 AC", "2 Beds", "AC - 2", "Bed: 1", "Fridge, 1"
                            let itemName = line.trim();
                            let itemCount = '1';
                            
                            // Try pattern: "number item" (e.g., "1 AC", "2 Beds")
                            const numberFirstMatch = line.match(/^(\d+)\s+(.+)$/);
                            if (numberFirstMatch && numberFirstMatch[1] && numberFirstMatch[2]) {
                              itemCount = numberFirstMatch[1].trim();
                              itemName = numberFirstMatch[2].trim();
                            } 
                            // Try pattern: "item - number" (e.g., "AC - 2")
                            else if (line.includes('-')) {
                              const splitParts = line.split('-');
                              if (splitParts.length >= 2 && splitParts[0] && splitParts[1]) {
                                itemName = splitParts[0].trim();
                                itemCount = splitParts[1].trim().replace(/\D/g, '') || '1';
                              }
                            } 
                            // Try pattern: "item: number" (e.g., "Bed: 1")
                            else if (line.includes(':')) {
                              const splitParts = line.split(':');
                              if (splitParts.length >= 2 && splitParts[0] && splitParts[1]) {
                                itemName = splitParts[0].trim();
                                itemCount = splitParts[1].trim().replace(/\D/g, '') || '1';
                              }
                            } 
                            // Try pattern: "item, number" (e.g., "Fridge, 1")
                            else if (line.includes(',')) {
                              const splitParts = line.split(',');
                              if (splitParts.length >= 2) {
                                const lastPart = splitParts[splitParts.length - 1];
                                // Check if last part is a number
                                if (lastPart && /^\d+$/.test(lastPart.trim())) {
                                  itemCount = lastPart.trim();
                                  itemName = splitParts.slice(0, -1).join(',').trim();
                                }
                              }
                            }
                            
                            return (
                              <tr key={idx} className="border-b border-gray-300">
                                <td className="py-2 px-2">{itemName}</td>
                                <td className="py-2 px-2">{itemCount}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-4 md:py-6 lg:py-10">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-3 sm:mb-4 md:mb-6 lg:mb-10">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
            Rent Agreement
          </h1>
          <div className="w-12 sm:w-14 md:w-16 lg:w-20 h-0.5 sm:h-1 bg-gray-900 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
          {/* Left Sidebar - Stepper */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm lg:sticky lg:top-4">
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className={`flex items-center gap-2 sm:gap-2.5 md:gap-3 ${
                      step.number <= currentStep ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                    }`}
                    onClick={() => {
                      if (step.number <= currentStep) {
                        setCurrentStep(step.number);
                      }
                    }}
                  >
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        isStepComplete(step.number)
                          ? "bg-blue-500 text-white"
                          : currentStep === step.number
                          ? "bg-gray-900 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isStepComplete(step.number) ? (
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                      ) : (
                        <step.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                      )}
                    </div>
                    <span
                      className={`text-[11px] sm:text-xs md:text-sm font-medium ${
                        currentStep === step.number
                          ? "text-gray-900"
                          : "text-gray-600"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Form */}
          <div className="lg:col-span-9 order-1 lg:order-2">
            <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm">
              {/* Step 1: Owner Details */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">
                    Who owns the property?
                  </h2>
                  <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 mb-3 sm:mb-4 md:mb-6">
                    Fill in details of the owner/lessor/landlord.
                  </p>

                  <div className="space-y-3 md:space-y-4">
                    {/* Ask who is filling the form */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Who is creating this agreement? *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Owner Option */}
                        <div 
                          onClick={() => setAgreementFilledBy("owner")}
                          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            agreementFilledBy === "owner" 
                              ? "border-blue-500 bg-blue-50" 
                              : "border-gray-300 bg-white hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              id="filledByOwner"
                              name="agreementFilledBy"
                              value="owner"
                              checked={agreementFilledBy === "owner"}
                              onChange={(e) => setAgreementFilledBy(e.target.value as "owner")}
                              className="mt-1 w-4 h-4 text-blue-500"
                            />
                            <div className="flex-1">
                              <label htmlFor="filledByOwner" className="text-sm md:text-base font-semibold text-gray-900 cursor-pointer block">
                                Property Owner
                              </label>
                              <p className="text-xs text-gray-600 mt-1">
                                I own the property
                              </p>
                            </div>
                          </div>
                          {agreementFilledBy === "owner" && (
                            <div className="absolute top-2 right-2">
                              <Check className="w-5 h-5 text-blue-500" />
                            </div>
                          )}
                        </div>

                        {/* Tenant Option */}
                        <div 
                          onClick={() => setAgreementFilledBy("tenant")}
                          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            agreementFilledBy === "tenant" 
                              ? "border-blue-500 bg-blue-50" 
                              : "border-gray-300 bg-white hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              id="filledByTenant"
                              name="agreementFilledBy"
                              value="tenant"
                              checked={agreementFilledBy === "tenant"}
                              onChange={(e) => setAgreementFilledBy(e.target.value as "tenant")}
                              className="mt-1 w-4 h-4 text-blue-500"
                            />
                            <div className="flex-1">
                              <label htmlFor="filledByTenant" className="text-sm md:text-base font-semibold text-gray-900 cursor-pointer block">
                                Tenant / Renter
                              </label>
                              <p className="text-xs text-gray-600 mt-1">
                                I am renting the property
                              </p>
                            </div>
                          </div>
                          {agreementFilledBy === "tenant" && (
                            <div className="absolute top-2 right-2">
                              <Check className="w-5 h-5 text-blue-500" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Full Name*
                      </label>
                      <input
                        type="text"
                        value={ownerDetails.fullName}
                        onChange={(e) =>
                          setOwnerDetails({ ...ownerDetails, fullName: e.target.value })
                        }
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter owner's full name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Email Address*
                      </label>
                      <input
                        type="email"
                        value={ownerDetails.email}
                        onChange={(e) =>
                          setOwnerDetails({ ...ownerDetails, email: e.target.value })
                        }
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="owner@example.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        📧 Rent agreement will be sent to this email
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Mobile Number*
                      </label>
                      <input
                        type="tel"
                        value={ownerDetails.phone}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setOwnerDetails({ ...ownerDetails, phone: numericValue });
                        }}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="10-digit mobile number"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        minLength={10}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Address*
                      </label>
                      <textarea
                        value={ownerDetails.address}
                        onChange={(e) =>
                          setOwnerDetails({ ...ownerDetails, address: e.target.value })
                        }
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                        rows={3}
                        placeholder="Enter Owner's full address with pincode"
                      />
                    </div>

                    <div className="flex justify-end pt-2 md:pt-4">
                      <button
                        onClick={nextStep}
                        disabled={!isOwnerDetailsValid() || !agreementFilledBy}
                        className={`px-6 md:px-8 py-2 md:py-2.5 text-sm md:text-base rounded-lg font-medium transition-all ${
                          isOwnerDetailsValid() && agreementFilledBy
                            ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Save & Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Tenant Details */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">
                    Who is renting the property?
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
                    Fill in details of the tenant/lessee/renter.
                  </p>

                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Full Name*
                      </label>
                      <input
                        type="text"
                        value={tenantDetails.fullName}
                        onChange={(e) =>
                          setTenantDetails({ ...tenantDetails, fullName: e.target.value })
                        }
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter tenant's full name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Email Address*
                      </label>
                      <input
                        type="email"
                        value={tenantDetails.email}
                        onChange={(e) =>
                          setTenantDetails({ ...tenantDetails, email: e.target.value })
                        }
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="tenant@example.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        📧 Rent agreement will be sent to this email
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Mobile Number*
                      </label>
                      <input
                        type="tel"
                        value={tenantDetails.phone}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setTenantDetails({ ...tenantDetails, phone: numericValue });
                        }}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="10-digit mobile number"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        minLength={10}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Permanent Address*
                      </label>
                      <textarea
                        value={tenantDetails.permanentAddress}
                        onChange={(e) =>
                          setTenantDetails({
                            ...tenantDetails,
                            permanentAddress: e.target.value,
                          })
                        }
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                        rows={3}
                        placeholder="Enter permanent address with pincode"
                      />
                    </div>

                    <div className="flex justify-end pt-2 md:pt-4">
                      <button
                        onClick={nextStep}
                        disabled={!isTenantDetailsValid()}
                        className={`px-6 md:px-8 py-2 md:py-2.5 text-sm md:text-base rounded-lg font-medium transition-all ${
                          isTenantDetailsValid()
                            ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Save & Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Property Details */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">
                    Property Details
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
                    Fill in details of the property being rented.
                  </p>

                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Property Address*
                      </label>
                      <textarea
                        value={propertyDetails.propertyAddress}
                        onChange={(e) =>
                          setPropertyDetails({
                            ...propertyDetails,
                            propertyAddress: e.target.value,
                          })
                        }
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                        rows={3}
                        placeholder="Enter full address of property with pincode"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Annexures (Property Inventory)
                      </label>
                      
                      {/* Add Item Form */}
                      <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 md:p-4 mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                          <div className="md:col-span-2">
                            <input
                              type="text"
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addAnnexureItem()}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Item Name (e.g., AC, Bed, Fridge)"
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={newItemCount}
                              onChange={(e) => setNewItemCount(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addAnnexureItem()}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Count"
                              min="1"
                            />
                            <button
                              type="button"
                              onClick={addAnnexureItem}
                              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex-shrink-0"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Items List */}
                      {annexureItems.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {annexureItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2 md:p-3">
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-sm md:text-base font-medium text-gray-900">{item.name}</span>
                                <span className="text-xs md:text-sm text-gray-500">×</span>
                                <span className="text-sm md:text-base text-gray-700">{item.count}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAnnexureItem(index)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-gray-500">
                        Optional: Add furniture, appliances, and fixtures included in the property
                      </p>
                    </div>

                    <div className="flex justify-end pt-2 md:pt-4">
                      <button
                        onClick={nextStep}
                        disabled={!isPropertyDetailsValid()}
                        className={`px-6 md:px-8 py-2 md:py-2.5 text-sm md:text-base rounded-lg font-medium transition-all ${
                          isPropertyDetailsValid()
                            ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Save & Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Agreement Terms */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">
                    Agreement Terms
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
                    Set the financial terms for the rental agreement.
                  </p>

                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Monthly Rent (₹)*
                      </label>
                      <input
                        type="number"
                        value={propertyDetails.rentAmount}
                        onChange={(e) =>
                          setPropertyDetails({
                            ...propertyDetails,
                            rentAmount: e.target.value,
                          })
                        }
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="10000"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Security Deposit (₹)*
                      </label>
                      <input
                        type="number"
                        value={propertyDetails.securityDeposit}
                        onChange={(e) =>
                          setPropertyDetails({
                            ...propertyDetails,
                            securityDeposit: e.target.value,
                          })
                        }
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="20000"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Lock-in Period (months)*
                      </label>
                      <input
                        type="number"
                        value={propertyDetails.agreementDuration}
                        onChange={(e) =>
                          setPropertyDetails({
                            ...propertyDetails,
                            agreementDuration: e.target.value,
                          })
                        }
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="11"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Notice Period (days)*
                      </label>
                      <input
                        type="number"
                        value={propertyDetails.noticePeriod}
                        onChange={(e) =>
                          setPropertyDetails({
                            ...propertyDetails,
                            noticePeriod: e.target.value,
                          })
                        }
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                        Rent Start Date*
                      </label>
                      <input
                        type="date"
                        value={propertyDetails.rentStartDate}
                        onChange={(e) =>
                          setPropertyDetails({
                            ...propertyDetails,
                            rentStartDate: e.target.value,
                          })
                        }
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>

                    <div className="flex justify-end pt-2 md:pt-4">
                      <button
                        onClick={generateAgreement}
                        disabled={!isAgreementTermsValid()}
                        className={`px-6 md:px-8 py-2 md:py-2.5 text-sm md:text-base rounded-lg font-medium transition-all ${
                          isAgreementTermsValid()
                            ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Generate Agreement
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
