import PDFDocument from 'pdfkit';

export const generateRentAgreementPDF = async (agreementData: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50, 
        size: 'A4',
        bufferPages: true 
      });
      const chunks: Buffer[] = [];

      // Collect PDF data
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Helper function to format date
      const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      };

      // Helper function to get end date
      const getEndDate = () => {
        const startDate = new Date(agreementData.rentStartDate);
        const duration = parseInt(agreementData.agreementDuration || '11', 10);
        startDate.setMonth(startDate.getMonth() + duration);
        return formatDate(startDate.toISOString());
      };

      // Title
      doc.fontSize(20).font('Helvetica-Bold').text('RENTAL AGREEMENT', { 
        align: 'center', 
        underline: true 
      });
      doc.moveDown(1.5);

      // Introduction Paragraphs
      doc.fontSize(11).font('Helvetica');
      
      doc.text(
        `THIS RENTAL AGREEMENT is executed at ${agreementData.propertyAddress.split(',').slice(-2).join(',').trim() || 'Location'} on ${formatDate(agreementData.rentStartDate)} by and between `,
        { continued: true, align: 'justify' }
      );
      doc.font('Helvetica-Bold').text(agreementData.ownerFullName.toUpperCase(), { continued: true });
      doc.font('Helvetica').text(
        `, resident of ${agreementData.ownerAddress} (hereinafter jointly and severally called the "LANDLORD", which expression shall include their heirs, legal representatives, successors and assigns of the one part).`
      );
      doc.moveDown();

      doc.text('AND ', { continued: true });
      doc.font('Helvetica-Bold').text(agreementData.tenantFullName.toUpperCase(), { continued: true });
      doc.font('Helvetica').text(
        `, having permanent address at ${agreementData.tenantPermanentAddress} (hereinafter called the "TENANT", which expression shall include its legal representatives, successors and assigns of the other part).`,
        { align: 'justify' }
      );
      doc.moveDown();

      doc.text(
        `WHEREAS the Landlord is the absolute owner of ${agreementData.propertyAddress}, consisting inbuilt fittings & fixtures and inventory of the equipments as detailed in Annexure-I, hereinafter referred to as "Demised Premises".`,
        { align: 'justify' }
      );
      doc.moveDown(1.5);

      doc.font('Helvetica-Bold').fontSize(12).text('THIS DEED WITNESSETH AS FOLLOWS:');
      doc.font('Helvetica').fontSize(11).moveDown();

      // All 22 Clauses with proper formatting
      const clauses = [
        `The rent in respect of the "Demised Premises" shall commence from ${formatDate(agreementData.rentStartDate)} and shall be valid till ${getEndDate()} (hereinafter "Rent Period"). Thereafter, the same may be extended further on mutual consent of both the parties.`,
        
        `That the Tenant shall pay to the Landlord a monthly rent of Rs. ${agreementData.rentAmount}/- (hereinafter "Rent"). The rent shall be paid in advance monthly on or before 10th of every month. If the rent remains unpaid for one month and the Tenant does not pay the same despite service of a notice by the Landlord, the Landlord shall be entitled to immediately terminate this Agreement and take back possession of the Demised Premises immediately.`,
        
        `That during the Rent period, in addition to the rental amount payable to the Landlord, the Tenant shall pay for the use of electricity, water and any other utilities as per actual bills received from the authorities concerned directly. Before vacating the Demised Premises on ${getEndDate()}, Tenant must ensure that all dues of any utilities are cleared and no amounts remain unpaid. Dues of electricity and water before the Rent Period shall be paid and cleared by the Landlord.`,
        
        `Servicing & repair of any appliances or fixtures provided by the Landlord will be the responsibility of the Tenant. Any Landlord provided appliances which have been damaged by Tenant will be replaced by the Tenant.`,
        
        `The Tenant shall pay to the Landlord an interest-free refundable security deposit of Rs. ${agreementData.securityDeposit}/- (hereinafter "Security Deposit"). The said Security Deposit shall be refunded by the Landlord to the Tenant at the time of handing back possession of the Demised Premises by the Tenant on expiry or sooner termination of this Agreement. Landlord shall be entitled to adjust any dues of Rent, utilities or cost of damage to the Demised Premises caused by the Tenant except for normal wear & tear in the ordinary course of usage.`,
        
        `That the Tenant shall not sublet, assign or part with the Demised Premises in whole or part thereof to any person in any circumstances whatsoever and the same shall be used for the bonafide residential purposes of the Tenant or the Tenant's family guests only.`,
        
        `That the day-to-day minor repairs will be the responsibility of the Tenant at his/her own expense. However, any structural or major repairs, if so required, shall be carried out by the Landlord.`,
        
        `That no structural additions or alterations shall be made by the Tenant to the Demised Premises without the prior written consent of the Landlord. However, the Tenant can install air-conditioners in the space provided and other electrical gadgets and make such changes for the purposes as may be necessary, at his own cost. The Landlord represents that the Premises possesses the adequate electrical infrastructure to cater for the electrical appliances including the air-conditioners. On termination or expiry of the tenancy or earlier, the Tenant will be entitled to remove such equipments and should restore the premises if any.`,
        
        `That the Landlord shall have the right to visit or enter the Demised Premises in person or through his authorized agent(s), servants, workmen etc., for inspection (not exceeding once in a month) or to carry out repairs / construction, as and when required, by giving a 24 hours notice to the Tenant.`,
        
        `That the Tenant shall comply with all the rules and regulations of the local authority or the resident welfare association as applicable to the Demised Premises.`,
        
        `The Landlord shall pay for all property or other taxes/cesses levied on the Demised Premises by the local or government authorities. Further, any other payment in the nature of subscription or periodic fee to the welfare association shall be paid by the Landlord.`,
        
        `That the Landlord will keep the Demised Premises free and harmless from any liens, claims, proceedings, demands or actions on his account and subject to payment of monthly rent and compliance with the terms of this Agreement the Tenant shall be entitled to enjoy peaceful possession of the Demised Premises.`,
        
        `That this Rent Agreement cannot be terminated by either party for a period of ${Math.floor(parseInt(agreementData.agreementDuration || '11', 10) / 30)} month(s) from the ${formatDate(agreementData.rentStartDate)} (hereinafter "Lock-in Period"). If any party intends to terminate this Agreement during the Lock-in Period, it must pay the other Party, as compensation, an amount equal to the Rent for the remainder of the Lock-in Period. After the completion of lock-in-period, the Tenant can terminate the Rent Agreement by giving ${Math.floor(parseInt(agreementData.noticePeriod || '30', 10) / 30)} month's notice to the Landlord or the rent in lieu of. After the completion of Lock-in-Period, the Landlord can also terminate the Rent Agreement by giving ${Math.floor(parseInt(agreementData.noticePeriod || '30', 10) / 30)} month's notice to the Tenant. It is clarified that in the event of non-payment of rent by the Tenant during the lock-in period being in arrears for 2 consecutive months, then the Landlord shall have the right to terminate the Rent Agreement with immediate effect and take back possession of the Demised Premises.`,
        
        `In the event the Landlord transfers, alienates or encumbers or otherwise disposes or deals with Demised Premises, the Landlord shall intimate the Tenant about the same in writing and shall ensure that the purchaser/transferee shall honor the terms of this Rent Agreement. Landlord shall provide undertaking to the Tenant from the said purchaser/transferee to that effect.`,
        
        `The Landlord shall acknowledge and give valid receipts for each payment made by the Tenant to the Landlord, which shall be treated as conclusive proof of such payments.`,
        
        `The Landlord confirms that in case for any reason whatsoever the premises is unfit for residence or any part thereof cannot be used for residential purposes because of any earthquake, civil commotion, or due to any natural calamity or Premises is acquired compulsorily by any authority, over which the Landlord has no control, the Tenant shall have the right to terminate this Agreement forthwith and vacate the premises and the Landlord shall refund the security deposit or the rent received in advance to the Tenant without any deductions whatsoever.`,
        
        `That the Tenant will keep the Landlord harmless and keep it exonerated from all losses (whether financial or life), damage, liability or expense occasioned or claimed by reasons of acts or neglects of the Tenant or his visitors, employees, whether in the Demised Premises or elsewhere in the building, unless caused by the negligent acts of the Landlord.`,
        
        `The Tenant shall maintain the Demised Premises in good and tenable condition and all the minor repairs such as leakage in the sanitary fittings, water taps and electrical usage etc. shall be carried out by the Tenant at his own expense. That it shall be the responsibility of the Tenant to hand over the vacant and peaceful possession of the demised premises on expiry of the Rent period, or on its early termination, as stated hereinabove in the same condition subject to natural wear and tear.`,
        
        `That in case, where the Premises are not vacated by the Tenant, at the termination of the Rent period, the Tenant will pay damages calculated at two times the rent for any period of occupation commencing from the expiry of the Rent period. The payment of damages as aforesaid will not preclude the Landlord from initiating legal proceedings against the Tenant for recovery possession of premises or for any other purpose.`,
        
        `That both the parties shall observe and adhere to the terms and conditions contained hereinabove.`,
        
        `That the Tenant and Landlord represent and warrant that they are fully empowered and competent to make this Rent.`,
        
        `If required, the Rent Agreement will be registered in front of registrar and the charges towards stamp duty, court fee & lawyer/coordinator will be equally borne by the Landlord & Tenant.`,
      ];

      // Add clauses with proper page management
      clauses.forEach((clause, index) => {
        // Check if we need a new page (leave space for at least 80 points)
        if (doc.y > 720) {
          doc.addPage();
        }
        
        doc.font('Helvetica').fontSize(11).text(`${index + 1}. ${clause}`, { 
          align: 'justify',
          indent: 0 
        });
        doc.moveDown(0.6);
      });

      // Signatures section
      if (doc.y > 680) doc.addPage();
      
      doc.moveDown(1.5);
      doc.font('Helvetica-Bold').fontSize(12).text('IN WITNESS WHERE OF', { align: 'center' });
      doc.font('Helvetica').fontSize(11).text(
        'The parties hereto have executed these presents on the day and year first above written.', 
        { align: 'center' }
      );
      doc.moveDown(2);

      doc.font('Helvetica-Bold').text('LANDLORD SIGNATURE:');
      doc.font('Helvetica').text(agreementData.ownerFullName);
      doc.moveDown(1.5);

      doc.font('Helvetica-Bold').text('TENANT SIGNATURE:');
      doc.font('Helvetica').text(agreementData.tenantFullName);
      doc.moveDown(1.5);

      doc.font('Helvetica-Bold').text('WITNESS ONE:');
      doc.font('Helvetica').fontSize(10).fillColor('#666666').text('Name & Address');
      doc.fillColor('#000000').fontSize(11).moveDown(1.5);

      doc.font('Helvetica-Bold').text('WITNESS TWO:');
      doc.font('Helvetica').fontSize(10).fillColor('#666666').text('Name & Address');
      doc.fillColor('#000000').fontSize(11);

      // Annexure with proper table formatting
      if (agreementData.annexures && agreementData.annexures.trim()) {
        // Add spacing before annexure
        doc.moveDown(3);
        
        doc.font('Helvetica-Bold').fontSize(14).text('ANNEXURE-I', { 
          align: 'center',
          underline: true 
        });
        doc.moveDown(1.5);

        // Table headers
        const tableTop = doc.y;
        const col1X = 70;
        const col2X = 400;
        
        doc.fontSize(11).font('Helvetica-Bold');
        doc.rect(col1X - 5, tableTop - 5, 510, 25).fillAndStroke('#f0f0f0', '#333333');
        doc.fillColor('#000000').text('Item Name', col1X, tableTop + 5);
        doc.text('Item Count', col2X, tableTop + 5);
        
        let currentY = tableTop + 30;

        // Parse and display annexure items
        const items = agreementData.annexures.split('\n').filter((line: string) => line.trim());
        
        items.forEach((line: string) => {
          let itemName = line.trim();
          let itemCount = '1';

          const numberFirstMatch = line.match(/^(\d+)\s+(.+)$/);
          if (numberFirstMatch && numberFirstMatch[1] && numberFirstMatch[2]) {
            itemCount = numberFirstMatch[1].trim();
            itemName = numberFirstMatch[2].trim();
          } else if (line.includes('-')) {
            const splitParts = line.split('-');
            if (splitParts.length >= 2 && splitParts[0] && splitParts[1]) {
              itemName = splitParts[0].trim();
              itemCount = splitParts[1].trim().replace(/\D/g, '') || '1';
            }
          } else if (line.includes(':')) {
            const splitParts = line.split(':');
            if (splitParts.length >= 2 && splitParts[0] && splitParts[1]) {
              itemName = splitParts[0].trim();
              itemCount = splitParts[1].trim().replace(/\D/g, '') || '1';
            }
          } else if (line.includes(',')) {
            const splitParts = line.split(',');
            if (splitParts.length >= 2) {
              const lastPart = splitParts[splitParts.length - 1];
              if (lastPart && /^\d+$/.test(lastPart.trim())) {
                itemCount = lastPart.trim();
                itemName = splitParts.slice(0, -1).join(',').trim();
              }
            }
          }

          // Check if we need a new page
          if (currentY > 720) {
            doc.addPage();
            currentY = 80;
          }

          doc.font('Helvetica').fontSize(10);
          doc.rect(col1X - 5, currentY - 5, 325, 25).stroke('#333333');
          doc.rect(col2X - 5, currentY - 5, 185, 25).stroke('#333333');
          
          doc.text(itemName, col1X, currentY, { width: 315 });
          doc.text(itemCount, col2X, currentY, { width: 175 });
          
          currentY += 30;
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
