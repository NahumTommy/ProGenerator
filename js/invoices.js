/**
 * Invoice management functionality
 */
class InvoiceManager {
  constructor() {
    // DOM elements
    this.invoiceList = document.getElementById('invoice-list');
    this.noInvoicesMessage = document.getElementById('no-invoices-message');
    this.invoiceForm = document.getElementById('invoice-form');
    this.invoiceItemsBody = document.getElementById('invoice-items-body');
    this.invoiceSubtotal = document.getElementById('invoice-subtotal');
    this.invoiceTaxAmount = document.getElementById('invoice-tax-amount');
    this.invoiceDiscountAmount = document.getElementById('invoice-discount-amount');
    this.invoiceTotal = document.getElementById('invoice-total');
    this.invoicePreviewContainer = document.getElementById('invoice-preview-container');
    
    // Buttons
    this.createInvoiceBtn = document.getElementById('create-invoice-btn');
    this.saveInvoiceBtn = document.getElementById('save-invoice-btn');
    this.cancelInvoiceBtn = document.getElementById('cancel-invoice-btn');
    this.addItemBtn = document.getElementById('add-item-btn');
    this.invoicePreviewBtn = document.getElementById('invoice-preview-btn');
    this.generatePdfBtn = document.getElementById('generate-pdf-btn');
    this.editInvoiceBtn = document.getElementById('edit-invoice-btn');
    this.backToInvoicesBtn = document.getElementById('back-to-invoices-btn');
    this.importInvoicesBtn = document.getElementById('import-invoices-btn');
    this.exportInvoicesBtn = document.getElementById('export-invoices-btn');
    
    // Form inputs
    this.taxRateInput = document.getElementById('invoice-tax-rate');
    this.discountInput = document.getElementById('invoice-discount');
    this.discountTypeSelect = document.getElementById('discount-type');
    this.clientSelect = document.getElementById('client-select');
    this.addNewClientBtn = document.getElementById('add-new-client-btn');
    
    // Current invoice
    this.currentInvoice = null;
    this.isEditMode = false;
    
    // Initialize
    this.init();
  }
  
  // Initialize the invoice manager
  init() {
    // Load and render invoices
    this.loadInvoices();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Add an empty first row to the invoice items
    this.addItemRow();
  }
  
  // Set up event listeners
  setupEventListeners() {
    // Create new invoice
    this.createInvoiceBtn.addEventListener('click', () => {
      this.createNewInvoice();
    });
    
    // Save invoice
    this.saveInvoiceBtn.addEventListener('click', event => {
      event.preventDefault();
      this.saveInvoice();
    });
    
    // Cancel invoice editing
    this.cancelInvoiceBtn.addEventListener('click', () => {
      ui.showView('invoices');
    });
    
    // Add invoice item
    this.addItemBtn.addEventListener('click', () => {
      this.addItemRow();
    });
    
    // Preview invoice
    this.invoicePreviewBtn.addEventListener('click', event => {
      event.preventDefault();
      this.previewInvoice();
    });
    
    // Generate PDF
    this.generatePdfBtn.addEventListener('click', () => {
      pdfGenerator.generateInvoicePDF(this.currentInvoice);
    });
    
    // Edit invoice from preview
    this.editInvoiceBtn.addEventListener('click', () => {
      ui.showView('invoice-editor');
    });
    
    // Back to invoices
    this.backToInvoicesBtn.addEventListener('click', () => {
      ui.showView('invoices');
    });
    
    // Import invoices
    this.importInvoicesBtn.addEventListener('click', () => {
      this.showImportModal('invoices');
    });
    
    // Export invoices
    this.exportInvoicesBtn.addEventListener('click', () => {
      this.exportInvoices();
    });
    
    // Tax rate and discount changes
    this.taxRateInput.addEventListener('input', () => this.recalculateInvoiceTotals());
    this.discountInput.addEventListener('input', () => this.recalculateInvoiceTotals());
    this.discountTypeSelect.addEventListener('change', () => this.recalculateInvoiceTotals());
    
    // Client selection
    this.clientSelect.addEventListener('change', () => this.updateClientDetails());
    
    // Add new client
    this.addNewClientBtn.addEventListener('click', () => {
      clientManager.createNewClient();
    });
  }
  
  // Load invoices from storage
  loadInvoices() {
    const invoices = db.getAll(db.invoiceStore);
    this.renderInvoiceList(invoices);
  }
  
  // Render the invoice list
  renderInvoiceList(invoices) {
    this.invoiceList.innerHTML = '';
    
    if (invoices.length === 0) {
      this.noInvoicesMessage.classList.remove('hidden');
      return;
    }
    
    this.noInvoicesMessage.classList.add('hidden');
    
    // Sort invoices by creation date, newest first
    invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    invoices.forEach(invoice => {
      const client = db.getById(db.clientStore, invoice.clientId);
      const clientName = client ? client.name : 'Unknown Client';
      
      const card = document.createElement('div');
      card.className = 'invoice-card';
      card.innerHTML = `
        <div class="invoice-card-content">
          <h4>Invoice #${invoice.invoiceNumber}</h4>
          <div class="invoice-card-meta">
            <span>${clientName}</span>
            <span>${ui.formatDate(invoice.invoiceDate)}</span>
            <span>${ui.formatCurrency(invoice.total, settingsManager.settings)}</span>
            <span class="invoice-card-status status-${invoice.status}">${invoice.status}</span>
          </div>
        </div>
        <div class="invoice-card-actions">
          <button class="btn btn-sm btn-outline btn-view" data-id="${invoice.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button class="btn btn-sm btn-outline btn-edit" data-id="${invoice.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-edit">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn btn-sm btn-outline btn-delete" data-id="${invoice.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" x2="10" y1="11" y2="17"/>
              <line x1="14" x2="14" y1="11" y2="17"/>
            </svg>
          </button>
        </div>
      `;
      
      // Add event listeners for buttons
      card.querySelector('.btn-view').addEventListener('click', () => {
        this.viewInvoice(invoice.id);
      });
      
      card.querySelector('.btn-edit').addEventListener('click', () => {
        this.editInvoice(invoice.id);
      });
      
      card.querySelector('.btn-delete').addEventListener('click', () => {
        this.deleteInvoice(invoice.id);
      });
      
      this.invoiceList.appendChild(card);
    });
  }
  
  // Create a new invoice
  createNewInvoice() {
    this.isEditMode = false;
    this.currentInvoice = new Invoice();
    
    // Generate next invoice number (simple auto-increment)
    const invoices = db.getAll(db.invoiceStore);
    let nextNumber = 1001;
    
    if (invoices.length > 0) {
      const lastInvoice = invoices.reduce((latest, invoice) => {
        const invoiceNum = parseInt(invoice.invoiceNumber.replace(/\D/g, ''));
        return invoiceNum > parseInt(latest.invoiceNumber.replace(/\D/g, '')) ? invoice : latest;
      }, { invoiceNumber: '1000' });
      
      nextNumber = parseInt(lastInvoice.invoiceNumber.replace(/\D/g, '')) + 1;
    }
    
    this.currentInvoice.invoiceNumber = nextNumber.toString();
    
    // Clear form and set values
    this.resetInvoiceForm();
    this.populateInvoiceForm(this.currentInvoice);
    this.populateClientDropdown();
    this.updateCompanyDetails();
    
    // Show invoice editor
    ui.showView('invoice-editor');
    document.getElementById('invoice-editor-title').textContent = 'New Invoice';
  }
  
  // Edit an existing invoice
  editInvoice(invoiceId) {
    this.isEditMode = true;
    this.currentInvoice = new Invoice(db.getById(db.invoiceStore, invoiceId));
    
    // Reset and populate form
    this.resetInvoiceForm();
    this.populateInvoiceForm(this.currentInvoice);
    this.populateClientDropdown();
    this.updateCompanyDetails();
    this.updateClientDetails();
    
    // Populate items
    this.invoiceItemsBody.innerHTML = '';
    if (this.currentInvoice.items.length === 0) {
      this.addItemRow();
    } else {
      this.currentInvoice.items.forEach(item => {
        this.addItemRow(item);
      });
    }
    
    // Show invoice editor
    ui.showView('invoice-editor');
    document.getElementById('invoice-editor-title').textContent = `Edit Invoice #${this.currentInvoice.invoiceNumber}`;
  }
  
  // View an invoice
  viewInvoice(invoiceId) {
    this.currentInvoice = new Invoice(db.getById(db.invoiceStore, invoiceId));
    this.renderInvoicePreview();
    ui.showView('invoice-preview');
  }
  
  // Delete an invoice
  deleteInvoice(invoiceId) {
    ui.showConfirmDialog('Are you sure you want to delete this invoice?', confirmed => {
      if (confirmed) {
        db.delete(db.invoiceStore, invoiceId);
        this.loadInvoices();
        ui.showNotification('Invoice deleted successfully');
      }
    });
  }
  
  // Reset the invoice form
  resetInvoiceForm() {
    ui.clearForm('invoice-form');
    this.invoiceItemsBody.innerHTML = '';
    
    // Set default values from settings
    const settings = settingsManager.settings;
    document.getElementById('invoice-tax-rate').value = settings.taxRate;
    document.getElementById('invoice-notes-input').value = settings.invoiceNotes;
    
    // Set current date and due date
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30);
    
    document.getElementById('invoice-date').value = this.formatDateForInput(today);
    document.getElementById('invoice-due-date').value = this.formatDateForInput(dueDate);
  }
  
  // Format a date for input fields (YYYY-MM-DD)
  formatDateForInput(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    
    return [year, month, day].join('-');
  }
  
  // Populate invoice form with data
  populateInvoiceForm(invoice) {
    document.getElementById('invoice-number').value = invoice.invoiceNumber;
    document.getElementById('invoice-date').value = invoice.invoiceDate;
    document.getElementById('invoice-due-date').value = invoice.invoiceDueDate;
    document.getElementById('invoice-tax-rate').value = invoice.taxRate;
    document.getElementById('invoice-discount').value = invoice.discount;
    document.getElementById('discount-type').value = invoice.discountType;
    document.getElementById('invoice-notes-input').value = invoice.notes;
    
    if (invoice.clientId) {
      document.getElementById('client-select').value = invoice.clientId;
    }
    
    this.recalculateInvoiceTotals();
  }
  
  // Populate client dropdown
  populateClientDropdown() {
    const clients = db.getAll(db.clientStore);
    const select = document.getElementById('client-select');
    
    // Clear existing options except the placeholder
    while (select.options.length > 1) {
      select.remove(1);
    }
    
    // Add clients to dropdown
    clients.forEach(client => {
      const option = document.createElement('option');
      option.value = client.id;
      option.textContent = client.name;
      select.appendChild(option);
    });
    
    // Set current client if editing
    if (this.currentInvoice && this.currentInvoice.clientId) {
      select.value = this.currentInvoice.clientId;
    }
  }
  
  // Update company details in the invoice
  updateCompanyDetails() {
    const settings = settingsManager.settings;
    const companyDetails = document.getElementById('company-details');
    
    if (!settings.companyName) {
      companyDetails.innerHTML = '<p class="empty-message">Please configure company details in Settings</p>';
      return;
    }
    
    companyDetails.innerHTML = `
      <p><strong>${settings.companyName}</strong></p>
      <p>${settings.companyEmail}</p>
      <p>${settings.companyPhone}</p>
      <p>${settings.companyAddress.replace(/\n/g, '<br>')}</p>
    `;
  }
  
  // Update client details when client is selected
  updateClientDetails() {
    const clientId = document.getElementById('client-select').value;
    const clientDetails = document.getElementById('client-details');
    
    if (!clientId) {
      clientDetails.classList.add('hidden');
      return;
    }
    
    const client = db.getById(db.clientStore, clientId);
    if (!client) {
      clientDetails.classList.add('hidden');
      return;
    }
    
    clientDetails.innerHTML = `
      <p><strong>${client.name}</strong></p>
      <p>${client.email}</p>
      <p>${client.phone}</p>
      <p>${client.address.replace(/\n/g, '<br>')}</p>
    `;
    
    clientDetails.classList.remove('hidden');
    
    // Update current invoice client
    if (this.currentInvoice) {
      this.currentInvoice.clientId = clientId;
    }
  }
  
  // Add an item row to the invoice
  addItemRow(item) {
    const row = document.createElement('tr');
    row.className = 'item-row';
    
    // Create item data
    const itemData = item || new InvoiceItem();
    
    row.innerHTML = `
      <td>
        <input type="text" class="item-description" value="${itemData.description}" placeholder="Item description">
      </td>
      <td>
        <input type="number" class="item-quantity" value="${itemData.quantity}" min="1" step="1">
      </td>
      <td>
        <input type="number" class="item-price" value="${itemData.price}" min="0" step="0.01">
      </td>
      <td class="item-total">${ui.formatCurrency(itemData.total, settingsManager.settings)}</td>
      <td>
        <button type="button" class="action-btn delete-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            <line x1="10" x2="10" y1="11" y2="17"/>
            <line x1="14" x2="14" y1="11" y2="17"/>
          </svg>
        </button>
      </td>
    `;
    
    // Add event listeners for item row
    const quantityInput = row.querySelector('.item-quantity');
    const priceInput = row.querySelector('.item-price');
    const descriptionInput = row.querySelector('.item-description');
    const deleteBtn = row.querySelector('.delete-item');
    
    // Calculate item total when quantity or price changes
    const updateItemTotal = () => {
      const quantity = parseFloat(quantityInput.value) || 0;
      const price = parseFloat(priceInput.value) || 0;
      const total = quantity * price;
      
      row.querySelector('.item-total').textContent = ui.formatCurrency(total, settingsManager.settings);
      this.recalculateInvoiceTotals();
    };
    
    quantityInput.addEventListener('input', updateItemTotal);
    priceInput.addEventListener('input', updateItemTotal);
    descriptionInput.addEventListener('input', this.recalculateInvoiceTotals.bind(this));
    
    // Delete item row
    deleteBtn.addEventListener('click', () => {
      // Don't delete the last row
      if (this.invoiceItemsBody.children.length > 1) {
        row.remove();
        this.recalculateInvoiceTotals();
      }
    });
    
    this.invoiceItemsBody.appendChild(row);
  }
  
  // Recalculate invoice totals based on form values
  recalculateInvoiceTotals() {
    // Get all item rows
    const itemRows = this.invoiceItemsBody.querySelectorAll('.item-row');
    const items = [];
    let subtotal = 0;
    
    // Calculate subtotal and collect items
    itemRows.forEach(row => {
      const description = row.querySelector('.item-description').value;
      const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
      const price = parseFloat(row.querySelector('.item-price').value) || 0;
      const total = quantity * price;
      
      subtotal += total;
      
      items.push({
        description,
        quantity,
        price,
        total
      });
    });
    
    // Get tax and discount values
    const taxRate = parseFloat(this.taxRateInput.value) || 0;
    const discount = parseFloat(this.discountInput.value) || 0;
    const discountType = this.discountTypeSelect.value;
    
    // Calculate tax amount
    const taxAmount = subtotal * (taxRate / 100);
    
    // Calculate discount amount
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = subtotal * (discount / 100);
    } else {
      discountAmount = discount;
    }
    
    // Calculate total
    const total = subtotal + taxAmount - discountAmount;
    
    // Update UI
    const settings = settingsManager.settings;
    this.invoiceSubtotal.textContent = ui.formatCurrency(subtotal, settings);
    this.invoiceTaxAmount.textContent = ui.formatCurrency(taxAmount, settings);
    this.invoiceDiscountAmount.textContent = ui.formatCurrency(discountAmount, settings);
    this.invoiceTotal.textContent = ui.formatCurrency(total, settings);
    
    // Update current invoice
    if (this.currentInvoice) {
      this.currentInvoice.items = items;
      this.currentInvoice.subtotal = subtotal;
      this.currentInvoice.taxRate = taxRate;
      this.currentInvoice.taxAmount = taxAmount;
      this.currentInvoice.discount = discount;
      this.currentInvoice.discountType = discountType;
      this.currentInvoice.discountAmount = discountAmount;
      this.currentInvoice.total = total;
    }
  }
  
  // Save the current invoice
  saveInvoice() {
    // Validate form
    if (!this.validateInvoiceForm()) {
      return;
    }
    
    // Get form values
    const formData = new FormData(this.invoiceForm);
    
    // Update invoice with form values
    this.currentInvoice.invoiceNumber = formData.get('invoiceNumber');
    this.currentInvoice.invoiceDate = formData.get('invoiceDate');
    this.currentInvoice.invoiceDueDate = formData.get('invoiceDueDate');
    this.currentInvoice.clientId = formData.get('clientId');
    this.currentInvoice.notes = formData.get('notes');
    
    // Keep existing status or set to draft for new invoices
    if (!this.isEditMode) {
      this.currentInvoice.status = 'draft';
    }
    
    // Recalculate once more to ensure all values are up to date
    this.recalculateInvoiceTotals();
    
    // Save to database
    db.save(db.invoiceStore, this.currentInvoice);
    
    // Show success message and return to invoices
    ui.showNotification(this.isEditMode ? 'Invoice updated successfully' : 'Invoice created successfully');
    this.loadInvoices();
    ui.showView('invoices');
  }
  
  // Validate the invoice form
  validateInvoiceForm() {
    const invoiceNumber = document.getElementById('invoice-number').value;
    const invoiceDate = document.getElementById('invoice-date').value;
    const invoiceDueDate = document.getElementById('invoice-due-date').value;
    const clientId = document.getElementById('client-select').value;
    
    // Check required fields
    if (!invoiceNumber || !invoiceDate || !invoiceDueDate) {
      ui.showNotification('Please fill in all required fields', 'error');
      return false;
    }
    
    // Check client
    if (!clientId) {
      ui.showNotification('Please select a client', 'error');
      return false;
    }
    
    // Check items
    const items = this.invoiceItemsBody.querySelectorAll('.item-row');
    let hasValidItems = false;
    
    for (const row of items) {
      const description = row.querySelector('.item-description').value;
      const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
      const price = parseFloat(row.querySelector('.item-price').value) || 0;
      
      if (description && quantity > 0 && price > 0) {
        hasValidItems = true;
        break;
      }
    }
    
    if (!hasValidItems) {
      ui.showNotification('Please add at least one valid item', 'error');
      return false;
    }
    
    return true;
  }
  
  // Preview the current invoice
  previewInvoice() {
    // Validate form
    if (!this.validateInvoiceForm()) {
      return;
    }
    
    // Update invoice with form values
    const formData = new FormData(this.invoiceForm);
    
    this.currentInvoice.invoiceNumber = formData.get('invoiceNumber');
    this.currentInvoice.invoiceDate = formData.get('invoiceDate');
    this.currentInvoice.invoiceDueDate = formData.get('invoiceDueDate');
    this.currentInvoice.clientId = formData.get('clientId');
    this.currentInvoice.notes = formData.get('notes');
    
    // Recalculate to ensure all values are up to date
    this.recalculateInvoiceTotals();
    
    // Render preview
    this.renderInvoicePreview();
    
    // Show preview view
    ui.showView('invoice-preview');
  }
  
  // Render invoice preview
  renderInvoicePreview() {
    const settings = settingsManager.settings;
    const client = db.getById(db.clientStore, this.currentInvoice.clientId);
    
    if (!client) {
      ui.showNotification('Client not found', 'error');
      return;
    }
    
    // Build preview HTML
    let html = `
      <div class="preview-header">
        <div class="preview-company">
          <div class="preview-logo">${settings.companyName}</div>
          <div class="preview-company-info">
            <p>${settings.companyEmail}</p>
            <p>${settings.companyPhone}</p>
            <p>${settings.companyAddress.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      </div>
      
      <div class="preview-title">INVOICE</div>
      
      <div class="preview-addresses">
        <div class="preview-bill-from">
          <h4>Bill From:</h4>
          <p><strong>${settings.companyName}</strong></p>
          <p>${settings.companyAddress.replace(/\n/g, '<br>')}</p>
        </div>
        
        <div class="preview-bill-to">
          <h4>Bill To:</h4>
          <p><strong>${client.name}</strong></p>
          <p>${client.address.replace(/\n/g, '<br>')}</p>
          <p>${client.email}</p>
          <p>${client.phone}</p>
        </div>
      </div>
      
      <div class="preview-meta">
        <div class="preview-meta-item">
          <h4>Invoice Number</h4>
          <p>${this.currentInvoice.invoiceNumber}</p>
        </div>
        
        <div class="preview-meta-item">
          <h4>Invoice Date</h4>
          <p>${ui.formatDate(this.currentInvoice.invoiceDate)}</p>
        </div>
        
        <div class="preview-meta-item">
          <h4>Due Date</h4>
          <p>${ui.formatDate(this.currentInvoice.invoiceDueDate)}</p>
        </div>
      </div>
      
      <div class="preview-items">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add items
    this.currentInvoice.items.forEach(item => {
      if (item.description && item.quantity > 0) {
        html += `
          <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>${ui.formatCurrency(item.price, settings)}</td>
            <td>${ui.formatCurrency(item.total, settings)}</td>
          </tr>
        `;
      }
    });
    
    html += `
          </tbody>
        </table>
      </div>
      
      <div class="preview-totals">
        <div class="preview-totals-content">
          <div class="preview-totals-row">
            <span>Subtotal:</span>
            <span>${ui.formatCurrency(this.currentInvoice.subtotal, settings)}</span>
          </div>
          
          <div class="preview-totals-row">
            <span>Tax (${this.currentInvoice.taxRate}%):</span>
            <span>${ui.formatCurrency(this.currentInvoice.taxAmount, settings)}</span>
          </div>
    `;
    
    // Add discount if applicable
    if (this.currentInvoice.discount > 0) {
      const discountLabel = this.currentInvoice.discountType === 'percentage' 
        ? `Discount (${this.currentInvoice.discount}%):` 
        : 'Discount:';
      
      html += `
        <div class="preview-totals-row">
          <span>${discountLabel}</span>
          <span>${ui.formatCurrency(this.currentInvoice.discountAmount, settings)}</span>
        </div>
      `;
    }
    
    html += `
          <div class="preview-totals-row preview-total">
            <span>Total:</span>
            <span>${ui.formatCurrency(this.currentInvoice.total, settings)}</span>
          </div>
        </div>
      </div>
    `;
    
    // Add notes if applicable
    if (this.currentInvoice.notes) {
      html += `
        <div class="preview-notes">
          <h4>Notes</h4>
          <p>${this.currentInvoice.notes}</p>
        </div>
      `;
    }
    
    // Update preview container
    this.invoicePreviewContainer.innerHTML = html;
  }
  
  // Show import modal
  showImportModal(type) {
    const importModal = document.getElementById('import-modal');
    const importModalTitle = document.getElementById('import-modal-title');
    const importFile = document.getElementById('import-file');
    const importPreview = document.getElementById('import-preview');
    const importPreviewCount = document.getElementById('import-preview-count');
    const importPreviewData = document.getElementById('import-preview-data');
    const importConfirmBtn = document.getElementById('import-confirm-btn');
    
    // Reset modal
    importModalTitle.textContent = `Import ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    importFile.value = '';
    importPreview.classList.add('hidden');
    importConfirmBtn.disabled = true;
    
    // Handle file selection
    importFile.onchange = async () => {
      if (!importFile.files || importFile.files.length === 0) {
        importPreview.classList.add('hidden');
        importConfirmBtn.disabled = true;
        return;
      }
      
      try {
        const data = await ui.readJSONFile(importFile.files[0]);
        
        // Validate data
        if (!Array.isArray(data)) {
          throw new Error('Import data must be an array');
        }
        
        // Show preview
        importPreviewCount.textContent = `Found ${data.length} ${type} to import`;
        
        // Show sample data
        const sampleSize = Math.min(3, data.length);
        const samples = data.slice(0, sampleSize);
        
        let previewHtml = '<ul>';
        samples.forEach(item => {
          if (type === 'invoices') {
            previewHtml += `<li>Invoice #${item.invoiceNumber} - ${ui.formatCurrency(item.total || 0, settingsManager.settings)}</li>`;
          } else if (type === 'clients') {
            previewHtml += `<li>${item.name} - ${item.email}</li>`;
          }
        });
        
        if (data.length > sampleSize) {
          previewHtml += `<li>... and ${data.length - sampleSize} more</li>`;
        }
        
        previewHtml += '</ul>';
        importPreviewData.innerHTML = previewHtml;
        
        importPreview.classList.remove('hidden');
        importConfirmBtn.disabled = false;
        
        // Setup confirm button
        importConfirmBtn.onclick = () => {
          this.importData(type, data);
          ui.closeModal('import-modal');
        };
      } catch (error) {
        ui.showNotification(`Error reading file: ${error.message}`, 'error');
        importPreview.classList.add('hidden');
        importConfirmBtn.disabled = true;
      }
    };
    
    // Show modal
    ui.showModal('import-modal');
  }
  
  // Import data
  importData(type, data) {
    try {
      const count = db.importData(type === 'invoices' ? db.invoiceStore : db.clientStore, data);
      ui.showNotification(`Successfully imported ${count} ${type}`);
      
      // Refresh data
      if (type === 'invoices') {
        this.loadInvoices();
      } else if (type === 'clients') {
        clientManager.loadClients();
      }
    } catch (error) {
      ui.showNotification(`Error importing data: ${error.message}`, 'error');
    }
  }
  
  // Export invoices
  exportInvoices() {
    try {
      const invoices = db.exportData(db.invoiceStore);
      ui.exportJSON(invoices, 'invoices.json');
      ui.showNotification(`Successfully exported ${invoices.length} invoices`);
    } catch (error) {
      ui.showNotification(`Error exporting invoices: ${error.message}`, 'error');
    }
  }
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Invoice manager will be initialized after other managers
});