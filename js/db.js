/**
 * Database service to handle local storage operations
 */
class Database {
  constructor() {
    this.invoiceStore = 'invoices';
    this.clientStore = 'clients';
    this.settingsStore = 'settings';
    
    // Initialize stores if they don't exist
    if (!localStorage.getItem(this.invoiceStore)) {
      localStorage.setItem(this.invoiceStore, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(this.clientStore)) {
      localStorage.setItem(this.clientStore, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(this.settingsStore)) {
      localStorage.setItem(this.settingsStore, JSON.stringify({
        companyName: '',
        companyEmail: '',
        companyPhone: '',
        companyAddress: '',
        currency: 'USD',
        taxRate: 0,
        paymentTerms: 'Due within 30 days',
        invoiceNotes: 'Thank you for your business!'
      }));
    }
  }
  
  // Generic methods for CRUD operations
  getAll(store) {
    try {
      return JSON.parse(localStorage.getItem(store)) || [];
    } catch (error) {
      console.error(`Error getting data from ${store}:`, error);
      return [];
    }
  }
  
  getById(store, id) {
    try {
      const items = this.getAll(store);
      return items.find(item => item.id === id) || null;
    } catch (error) {
      console.error(`Error getting item by ID from ${store}:`, error);
      return null;
    }
  }
  
  save(store, item) {
    try {
      const items = this.getAll(store);
      
      // If item has an ID, update existing item
      if (item.id) {
        const index = items.findIndex(i => i.id === item.id);
        if (index >= 0) {
          items[index] = { ...items[index], ...item };
        } else {
          items.push(item);
        }
      } else {
        // New item, generate ID
        item.id = this.generateId();
        items.push(item);
      }
      
      localStorage.setItem(store, JSON.stringify(items));
      return item;
    } catch (error) {
      console.error(`Error saving item to ${store}:`, error);
      throw error;
    }
  }
  
  delete(store, id) {
    try {
      let items = this.getAll(store);
      items = items.filter(item => item.id !== id);
      localStorage.setItem(store, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error(`Error deleting item from ${store}:`, error);
      return false;
    }
  }
  
  // Settings specific methods
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(this.settingsStore)) || {};
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  }
  
  saveSettings(settings) {
    try {
      localStorage.setItem(this.settingsStore, JSON.stringify(settings));
      return settings;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }
  
  // Import/Export methods
  importData(store, data) {
    try {
      if (!Array.isArray(data)) {
        throw new Error('Import data must be an array');
      }
      
      // Validate and process each item
      const validData = data.filter(item => item && typeof item === 'object');
      
      // Ensure all items have IDs
      const processedData = validData.map(item => {
        if (!item.id) {
          item.id = this.generateId();
        }
        return item;
      });
      
      localStorage.setItem(store, JSON.stringify(processedData));
      return processedData.length;
    } catch (error) {
      console.error(`Error importing data to ${store}:`, error);
      throw error;
    }
  }
  
  exportData(store) {
    try {
      return this.getAll(store);
    } catch (error) {
      console.error(`Error exporting data from ${store}:`, error);
      throw error;
    }
  }
  
  // Helper method to generate unique IDs
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  
  // Clear all data (for testing)
  clearAll() {
    localStorage.removeItem(this.invoiceStore);
    localStorage.removeItem(this.clientStore);
    localStorage.removeItem(this.settingsStore);
  }
}

// Create and export the database instance
const db = new Database();