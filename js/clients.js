/**
 * Client management functionality
 */
class ClientManager {
  constructor() {
    // DOM elements
    this.clientList = document.getElementById('client-list');
    this.noClientsMessage = document.getElementById('no-clients-message');
    this.clientForm = document.getElementById('client-form');
    
    // Buttons
    this.createClientBtn = document.getElementById('create-client-btn');
    this.saveClientBtn = document.getElementById('save-client-btn');
    this.cancelClientBtn = document.getElementById('cancel-client-btn');
    this.importClientsBtn = document.getElementById('import-clients-btn');
    this.exportClientsBtn = document.getElementById('export-clients-btn');
    
    // Current client
    this.currentClient = null;
    this.isEditMode = false;
    
    // Initialize
    this.init();
  }
  
  // Initialize the client manager
  init() {
    // Load and render clients
    this.loadClients();
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  // Set up event listeners
  setupEventListeners() {
    // Create new client
    this.createClientBtn.addEventListener('click', () => {
      this.createNewClient();
    });
    
    // Save client
    this.saveClientBtn.addEventListener('click', event => {
      event.preventDefault();
      this.saveClient();
    });
    
    // Cancel client editing
    this.cancelClientBtn.addEventListener('click', () => {
      ui.showView('clients');
    });
    
    // Import clients
    this.importClientsBtn.addEventListener('click', () => {
      invoiceManager.showImportModal('clients');
    });
    
    // Export clients
    this.exportClientsBtn.addEventListener('click', () => {
      this.exportClients();
    });
  }
  
  // Load clients from storage
  loadClients() {
    const clients = db.getAll(db.clientStore);
    this.renderClientList(clients);
  }
  
  // Render the client list
  renderClientList(clients) {
    this.clientList.innerHTML = '';
    
    if (clients.length === 0) {
      this.noClientsMessage.classList.remove('hidden');
      return;
    }
    
    this.noClientsMessage.classList.add('hidden');
    
    // Sort clients by name
    clients.sort((a, b) => a.name.localeCompare(b.name));
    
    clients.forEach(client => {
      const card = document.createElement('div');
      card.className = 'client-card';
      card.innerHTML = `
        <div class="client-card-content">
          <h4>${client.name}</h4>
          <div class="client-card-meta">
            <span>${client.email}</span>
            <span>${client.phone || 'No phone'}</span>
          </div>
        </div>
        <div class="client-card-actions">
          <button class="btn btn-sm btn-outline btn-edit" data-id="${client.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-edit">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn btn-sm btn-outline btn-delete" data-id="${client.id}">
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
      card.querySelector('.btn-edit').addEventListener('click', () => {
        this.editClient(client.id);
      });
      
      card.querySelector('.btn-delete').addEventListener('click', () => {
        this.deleteClient(client.id);
      });
      
      this.clientList.appendChild(card);
    });
  }
  
  // Create a new client
  createNewClient() {
    this.isEditMode = false;
    this.currentClient = new Client();
    
    // Clear form
    ui.clearForm('client-form');
    
    // Show client editor
    ui.showView('client-editor');
    document.getElementById('client-editor-title').textContent = 'New Client';
  }
  
  // Edit an existing client
  editClient(clientId) {
    this.isEditMode = true;
    this.currentClient = new Client(db.getById(db.clientStore, clientId));
    
    // Populate form
    document.getElementById('client-name').value = this.currentClient.name;
    document.getElementById('client-email').value = this.currentClient.email;
    document.getElementById('client-phone').value = this.currentClient.phone;
    document.getElementById('client-address').value = this.currentClient.address;
    
    // Show client editor
    ui.showView('client-editor');
    document.getElementById('client-editor-title').textContent = `Edit Client: ${this.currentClient.name}`;
  }
  
  // Delete a client
  deleteClient(clientId) {
    // Check if client is used in any invoices
    const invoices = db.getAll(db.invoiceStore);
    const hasInvoices = invoices.some(invoice => invoice.clientId === clientId);
    
    if (hasInvoices) {
      ui.showNotification('Cannot delete client with associated invoices', 'error');
      return;
    }
    
    ui.showConfirmDialog('Are you sure you want to delete this client?', confirmed => {
      if (confirmed) {
        db.delete(db.clientStore, clientId);
        this.loadClients();
        ui.showNotification('Client deleted successfully');
      }
    });
  }
  
  // Save the current client
  saveClient() {
    // Validate form
    if (!this.validateClientForm()) {
      return;
    }
    
    // Get form values
    const formData = new FormData(this.clientForm);
    
    // Update client with form values
    this.currentClient.name = formData.get('name');
    this.currentClient.email = formData.get('email');
    this.currentClient.phone = formData.get('phone');
    this.currentClient.address = formData.get('address');
    
    // Save to database
    db.save(db.clientStore, this.currentClient);
    
    // Show success message and return to clients
    ui.showNotification(this.isEditMode ? 'Client updated successfully' : 'Client created successfully');
    this.loadClients();
    
    // If we're adding a client from the invoice editor, return there
    if (document.getElementById('invoice-editor').classList.contains('hidden')) {
      ui.showView('clients');
    } else {
      ui.showView('invoice-editor');
      invoiceManager.populateClientDropdown();
      
      // Set the newly created client in the invoice
      if (!this.isEditMode) {
        document.getElementById('client-select').value = this.currentClient.id;
        invoiceManager.updateClientDetails();
      }
    }
  }
  
  // Validate the client form
  validateClientForm() {
    const name = document.getElementById('client-name').value;
    const email = document.getElementById('client-email').value;
    const address = document.getElementById('client-address').value;
    
    // Check required fields
    if (!name || !email || !address) {
      ui.showNotification('Please fill in all required fields', 'error');
      return false;
    }
    
    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      ui.showNotification('Please enter a valid email address', 'error');
      return false;
    }
    
    return true;
  }
  
  // Export clients
  exportClients() {
    try {
      const clients = db.exportData(db.clientStore);
      ui.exportJSON(clients, 'clients.json');
      ui.showNotification(`Successfully exported ${clients.length} clients`);
    } catch (error) {
      ui.showNotification(`Error exporting clients: ${error.message}`, 'error');
    }
  }
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Client manager will be initialized in app.js
});