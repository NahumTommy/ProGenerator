/**
 * PDF Generation functionality using jsPDF
 */
class PDFGenerator {
  constructor() {
    // Check if jsPDF is available
    if (typeof jspdf === 'undefined') {
      console.error('jsPDF library not found');
      return;
    }
  }
  
  // Generate a PDF for the given invoice
  generateInvoicePDF(invoice) {
    if (!invoice) {
      ui.showNotification('No invoice to generate PDF', 'error');
      return;
    }
    
    try {
      // Get client and settings
      const client = db.getById(db.clientStore, invoice.clientId);
      const settings = settingsManager.settings;
      
      // Create new PDF document
      const { jsPDF } = jspdf;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set document properties
      doc.setProperties({
        title: `Invoice ${invoice.invoiceNumber}`,
        subject: `Invoice for ${client.name}`,
        author: settings.companyName,
        creator: 'InvoiceGen'
      });
      
      // Define colors and styles
      const primaryColor = [37, 99, 235]; // #2563EB
      const grayColor = [75, 85, 99]; // #4B5563
      const lightGrayColor = [209, 213, 219]; // #D1D5DB
      
      // Set up coordinates
      let y = 20; // Starting y position
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Add company logo/name
      doc.setFontSize(24);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(settings.companyName, margin, y);
      
      // Add invoice title
      doc.setFontSize(24);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text('INVOICE', pageWidth - margin, y, { align: 'right' });
      
      y += 15;
      
      // Add company details
      doc.setFontSize(10);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      
      const companyDetails = [
        settings.companyEmail,
        settings.companyPhone,
        ...settings.companyAddress.split('\n')
      ];
      
      companyDetails.forEach(line => {
        if (line.trim()) {
          doc.text(line, margin, y);
          y += 5;
        }
      });
      
      y += 10;
      
      // Add invoice info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const invoiceDetails = [
        [`Invoice Number:`, `#${invoice.invoiceNumber}`],
        [`Invoice Date:`, `${ui.formatDate(invoice.invoiceDate)}`],
        [`Due Date:`, `${ui.formatDate(invoice.invoiceDueDate)}`]
      ];
      
      invoiceDetails.forEach(([label, value]) => {
        doc.text(label, pageWidth - 80, y);
        doc.text(value, pageWidth - margin, y, { align: 'right' });
        y += 7;
      });
      
      y += 10;
      
      // Add client details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Bill To:', margin, y);
      
      y += 7;
      
      doc.setFontSize(11);
      doc.text(client.name, margin, y);
      y += 5;
      
      doc.setFontSize(10);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      
      const clientDetails = [
        client.email,
        client.phone,
        ...client.address.split('\n')
      ];
      
      clientDetails.forEach(line => {
        if (line.trim()) {
          doc.text(line, margin, y);
          y += 5;
        }
      });
      
      y += 15;
      
      // Add invoice items table
      const validItems = invoice.items.filter(item => item.description && item.quantity > 0);
      
      if (validItems.length > 0) {
        // Set table header
        doc.setFontSize(10);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        
        // Draw table header background
        doc.setFillColor(245, 247, 250);
        doc.rect(margin, y - 5, contentWidth, 10, 'F');
        
        // Draw header text
        doc.text('Description', margin + 5, y);
        doc.text('Qty', margin + 100, y, { align: 'right' });
        doc.text('Price', margin + 130, y, { align: 'right' });
        doc.text('Total', pageWidth - margin - 5, y, { align: 'right' });
        
        y += 8;
        
        // Draw header line
        doc.setDrawColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
        doc.line(margin, y - 3, margin + contentWidth, y - 3);
        
        // Draw items
        doc.setTextColor(0, 0, 0);
        
        validItems.forEach(item => {
          // Check if we need a new page
          if (y > 250) {
            doc.addPage();
            y = 30;
          }
          
          const total = item.total;
          
          doc.text(item.description, margin + 5, y);
          doc.text(item.quantity.toString(), margin + 100, y, { align: 'right' });
          doc.text(ui.formatCurrency(item.price, settings), margin + 130, y, { align: 'right' });
          doc.text(ui.formatCurrency(total, settings), pageWidth - margin - 5, y, { align: 'right' });
          
          // Draw item line
          y += 8;
          doc.setDrawColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
          doc.line(margin, y - 3, margin + contentWidth, y - 3);
        });
        
        y += 5;
      }
      
      // Add totals
      const totalsX = pageWidth - margin - 80;
      const valuesX = pageWidth - margin - 5;
      
      // Subtotal
      doc.text('Subtotal:', totalsX, y);
      doc.text(ui.formatCurrency(invoice.subtotal, settings), valuesX, y, { align: 'right' });
      y += 7;
      
      // Tax
      if (invoice.taxRate > 0) {
        doc.text(`Tax (${invoice.taxRate}%):`, totalsX, y);
        doc.text(ui.formatCurrency(invoice.taxAmount, settings), valuesX, y, { align: 'right' });
        y += 7;
      }
      
      // Discount
      if (invoice.discount > 0) {
        const discountLabel = invoice.discountType === 'percentage' 
          ? `Discount (${invoice.discount}%):` 
          : 'Discount:';
        
        doc.text(discountLabel, totalsX, y);
        doc.text(ui.formatCurrency(invoice.discountAmount, settings), valuesX, y, { align: 'right' });
        y += 7;
      }
      
      // Total
      doc.setFontSize(12);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Total:', totalsX, y);
      doc.text(ui.formatCurrency(invoice.total, settings), valuesX, y, { align: 'right' });
      
      y += 15;
      
      // Add payment terms or notes
      if (invoice.notes || settings.paymentTerms) {
        doc.setFontSize(10);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        
        // Terms
        if (settings.paymentTerms) {
          doc.text('Payment Terms:', margin, y);
          y += 5;
          doc.text(settings.paymentTerms, margin, y);
          y += 10;
        }
        
        // Notes
        if (invoice.notes) {
          doc.text('Notes:', margin, y);
          y += 5;
          
          // Split notes into lines
          const splitNotes = doc.splitTextToSize(invoice.notes, contentWidth);
          doc.text(splitNotes, margin, y);
        }
      }
      
      // Save the PDF
      doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
      ui.showNotification('PDF generated successfully');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      ui.showNotification('Error generating PDF', 'error');
    }
  }
}

// Create PDF generator instance
const pdfGenerator = new PDFGenerator();