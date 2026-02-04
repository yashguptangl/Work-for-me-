import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface RentAgreementData {
  id: string;
  ownerFullName: string;
  tenantFullName: string;
  propertyAddress: string;
}

export const generateRentAgreementPDF = async (
  elementRef: HTMLElement,
  agreementData: RentAgreementData
): Promise<void> => {
  try {
    // Show loading state
    const loadingElement = document.createElement('div');
    loadingElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px 40px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: system-ui;
    `;
    loadingElement.innerHTML = `
      <div style="text-align: center;">
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
        <p style="margin: 0; color: #333; font-weight: 500;">Generating PDF...</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(loadingElement);

    // Wait a bit for the element to be fully rendered
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Create PDF with A4 dimensions
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm

    // Convert HTML to canvas with better settings
    const canvas = await html2canvas(elementRef, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 793.7,
      width: 793.7,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;
    let pageNumber = 0;

    // Add pages properly
    while (heightLeft > 0 || pageNumber === 0) {
      if (pageNumber > 0) {
        pdf.addPage();
      }
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      position -= pageHeight;
      pageNumber++;
      
      // Safety check to prevent infinite loop
      if (pageNumber > 50) break;
    }

    // Generate filename
    const filename = `Rent_Agreement_${agreementData.ownerFullName.replace(
      /\s+/g,
      '_'
    )}_${agreementData.tenantFullName.replace(
      /\s+/g,
      '_'
    )}_${agreementData.id.substring(0, 8)}.pdf`;

    // Save PDF
    pdf.save(filename);

    // Remove loading
    if (document.body.contains(loadingElement)) {
      document.body.removeChild(loadingElement);
    }

    // Show success message
    const successElement = document.createElement('div');
    successElement.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-family: system-ui; font-weight: 500;';
    successElement.textContent = '✓ PDF Downloaded Successfully!';
    document.body.appendChild(successElement);

    setTimeout(() => {
      if (document.body.contains(successElement)) {
        document.body.removeChild(successElement);
      }
    }, 3000);

  } catch (error) {
    console.error('Error generating PDF:', error);

    // Remove loading if it exists
    const loadingElement = Array.from(document.querySelectorAll('div')).find(
      (el) => el.textContent?.includes('Generating PDF...')
    );
    if (loadingElement && loadingElement.parentElement) {
      loadingElement.parentElement.removeChild(loadingElement);
    }

    // Show error message
    const errorElement = document.createElement('div');
    errorElement.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-family: system-ui; font-weight: 500;';
    errorElement.textContent = '✗ Failed to generate PDF';
    document.body.appendChild(errorElement);

    setTimeout(() => {
      if (document.body.contains(errorElement)) {
        document.body.removeChild(errorElement);
      }
    }, 3000);

    throw error;
  }
};
