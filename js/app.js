/**
 * Main application initialization
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize managers in the correct order
  window.settingsManager = new SettingsManager();
  window.clientManager = new ClientManager();
  window.invoiceManager = new InvoiceManager();
  
  // Generate sample data if first time use
  if (isFirstTimeUse()) {
    generateSampleData();
  }
  
  // Set up file import handlers
  setupFileImportHandlers();
});

// Check if this is the first time the app is used
function isFirstTimeUse() {
  const clients = db.getAll(db.clientStore);
  const invoices = db.getAll(db.invoiceStore);
  const settings = db.getSettings();
  
  return clients.length === 0 && invoices.length === 0 && !settings.companyName;
}

// Generate sample data for first-time users
function generateSampleData() {
  // Sample company settings
  const settings = new Settings({
    companyName: 'Acme Corporation',
    companyEmail: 'invoices@acmecorp.com',
    companyPhone: '(555) 123-4567',
    companyAddress: '123 Business Rd\nSuite 100\nAnytown, CA 12345',
    currency: 'USD',
    taxRate: 7.5,
    paymentTerms: 'Due within 30 days',
    invoiceNotes: 'Thank you for your business! Please make payment via bank transfer or check.'
  });
  
  db.saveSettings(settings);
  
  // Sample clients
  const clients = [
    new Client({
      name: 'John Doe Consulting',
      email: 'john@doeconsulting.com',
      phone: '(555) 987-6543',
      address: '456 Consultant Ave\nProfessional Building\nTech City, CA 54321'
    }),
    new Client({
      name: 'Smith & Sons Manufacturing',
      email: 'accounting@smithsons.com',
      phone: '(555) 789-0123',
      address: '789 Industry Blvd\nManufacturing District\nMetropolis, NY 67890'
    })
  ];
  
  // Save clients and get their IDs
  const savedClients = clients.map(client => db.save(db.clientStore, client));
  
  // Sample invoices
  const invoice1 = new Invoice({
    invoiceNumber: '1001',
    invoiceDate: new Date().toISOString().split('T')[0],
    invoiceDueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    clientId: savedClients[0].id,
    items: [
      {
        description: 'Web Development Services',
        quantity: 40,
        price: 75,
        total: 3000
      },
      {
        description: 'UI/UX Design',
        quantity: 20,
        price: 85,
        total: 1700
      }
    ],
    subtotal: 4700,
    taxRate: 7.5,
    taxAmount: 352.5,
    discount: 500,
    discountType: 'fixed',
    discountAmount: 500,
    total: 4552.5,
    notes: 'Payment due within 30 days. Late payments subject to a 1.5% monthly fee.',
    status: 'pending'
  });
  
  // Recalculate to ensure correct totals
  invoice1.recalculateInvoice();
  
  // Add an invoice from 2 months ago
  const pastDate = new Date();
  pastDate.setMonth(pastDate.getMonth() - 2);
  
  const invoice2 = new Invoice({
    invoiceNumber: '1000',
    invoiceDate: new Date(pastDate).toISOString().split('T')[0],
    invoiceDueDate: new Date(pastDate.getTime() + 30*24*60*60*1000).toISOString().split('T')[0],
    clientId: savedClients[1].id,
    items: [
      {
        description: 'Custom Software Development',
        quantity: 80,
        price: 95,
        total: 7600
      },
      {
        description: 'Server Configuration',
        quantity: 5,
        price: 120,
        total: 600
      },
      {
        description: 'Project Management',
        quantity: 15,
        price: 85,
        total: 1275
      }
    ],
    subtotal: 9475,
    taxRate: 7.5,
    taxAmount: 710.63,
    discount: 5,
    discountType: 'percentage',
    discountAmount: 473.75,
    total: 9711.88,
    notes: 'Thank you for your business!',
    status: 'paid'
  });
  
  // Recalculate to ensure correct totals
  invoice2.recalculateInvoice();
  
  // Save invoices
  db.save(db.invoiceStore, invoice1);
  db.save(db.invoiceStore, invoice2);
}

// Set up file import handlers for the import modals
function setupFileImportHandlers() {
  const importModal = document.getElementById('import-modal');
  const importConfirmBtn = document.getElementById('import-confirm-btn');
  
  // Close buttons for modals
  document.querySelectorAll('.close-modal, .cancel-modal').forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
      }
    });
  });
}