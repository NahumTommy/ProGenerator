/**
 * Settings management functionality
 */
class SettingsManager {
  constructor() {
    // DOM elements
    this.settingsForm = document.getElementById('settings-form');
    
    // Current settings
    this.settings = new Settings();
    
    // Initialize
    this.init();
  }
  
  // Initialize the settings manager
  init() {
    // Load settings
    this.loadSettings();
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  // Set up event listeners
  setupEventListeners() {
    // Save settings
    this.settingsForm.addEventListener('submit', event => {
      event.preventDefault();
      this.saveSettings();
    });
  }
  
  // Load settings from storage
  loadSettings() {
    const savedSettings = db.getSettings();
    this.settings = new Settings(savedSettings);
    this.populateSettingsForm();
  }
  
  // Populate the settings form with current values
  populateSettingsForm() {
    document.getElementById('company-name').value = this.settings.companyName;
    document.getElementById('company-email').value = this.settings.companyEmail;
    document.getElementById('company-phone').value = this.settings.companyPhone;
    document.getElementById('company-address').value = this.settings.companyAddress;
    document.getElementById('currency').value = this.settings.currency;
    document.getElementById('tax-rate').value = this.settings.taxRate;
    document.getElementById('payment-terms').value = this.settings.paymentTerms;
    document.getElementById('invoice-notes').value = this.settings.invoiceNotes;
  }
  
  // Save settings
  saveSettings() {
    // Get form values
    const formData = new FormData(this.settingsForm);
    
    // Update settings
    this.settings.companyName = formData.get('companyName');
    this.settings.companyEmail = formData.get('companyEmail');
    this.settings.companyPhone = formData.get('companyPhone');
    this.settings.companyAddress = formData.get('companyAddress');
    this.settings.currency = formData.get('currency');
    this.settings.taxRate = parseFloat(formData.get('taxRate')) || 0;
    this.settings.paymentTerms = formData.get('paymentTerms');
    this.settings.invoiceNotes = formData.get('invoiceNotes');
    
    // Save to database
    db.saveSettings(this.settings);
    
    // Show success message
    ui.showNotification('Settings saved successfully');
  }
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Settings manager will be initialized in app.js
});