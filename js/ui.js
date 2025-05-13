/**
 * UI utility functions
 */
class UI {
  constructor() {
    // References to UI elements
    this.navButtons = document.querySelectorAll(".nav-btn");
    this.views = document.querySelectorAll(".view");

    // Modal elements
    this.modals = document.querySelectorAll(".modal");
    this.modalCloseBtns = document.querySelectorAll(
      ".close-modal, .cancel-modal"
    );

    // Notification element
    this.notification = document.getElementById("notification");
    this.notificationMessage = document.getElementById("notification-message");
    this.notificationCloseBtn = document.querySelector(".close-notification");

    // Initialize UI
    this.initEventListeners();
  }

  // Initialize event listeners
  initEventListeners() {
    // Navigation buttons
    this.navButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.showView(button.id.replace("nav-", ""));
      });
    });

    // Modal close buttons
    this.modalCloseBtns.forEach((button) => {
      button.addEventListener("click", (event) => {
        this.closeModal(event.target.closest(".modal").id);
      });
    });

    // Notification close button
    this.notificationCloseBtn.addEventListener("click", () => {
      this.closeNotification();
    });
  }

  // Show a specific view and hide others
  showView(viewName) {
    // Update navigation buttons
    this.navButtons.forEach((button) => {
      if (button.id === `nav-${viewName}`) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });

    // Show/hide views
    this.views.forEach((view) => {
      if (view.id === `${viewName}-view` || view.id === viewName) {
        view.classList.remove("hidden");
      } else {
        view.classList.add("hidden");
      }
    });
  }

  // Show a modal
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
    }
  }

  // Close a modal
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
    }
  }

  // Show a notification
  showNotification(message, type = "success") {
    this.notificationMessage.textContent = message;
    this.notification.className = "notification active " + type;

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      this.closeNotification();
    }, 3000);
  }

  // Close the notification
  closeNotification() {
    this.notification.className = "notification";
  }

  // Show confirmation dialog
  showConfirmDialog(message, callback) {
    const confirmMessage = document.getElementById("confirm-message");
    const confirmYesBtn = document.getElementById("confirm-yes-btn");
    const confirmNoBtn = document.getElementById("confirm-no-btn");

    confirmMessage.textContent = message;

    // Remove existing event listeners
    const newYesBtn = confirmYesBtn.cloneNode(true);
    const newNoBtn = confirmNoBtn.cloneNode(true);
    confirmYesBtn.parentNode.replaceChild(newYesBtn, confirmYesBtn);
    confirmNoBtn.parentNode.replaceChild(newNoBtn, confirmNoBtn);

    // Add new event listeners
    newYesBtn.addEventListener("click", () => {
      this.closeModal("confirm-modal");
      callback(true);
    });

    newNoBtn.addEventListener("click", () => {
      this.closeModal("confirm-modal");
      callback(false);
    });

    this.showModal("confirm-modal");
  }

  // Format a date for display
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  // Format currency based on settings
  formatCurrency(amount, settings) {
    const symbol = this.getCurrencySymbol(settings.currency);
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  }

  // Get currency symbol
  getCurrencySymbol(currency) {
    const symbols = {
      UGX: "Shs",
    };
    return symbols[currency] || currency;
  }

  // Clear form fields
  clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
    }
  }

  // Filter and sort items
  filterItems(items, filterFn, sortFn) {
    let filteredItems = items;

    if (typeof filterFn === "function") {
      filteredItems = filteredItems.filter(filterFn);
    }

    if (typeof sortFn === "function") {
      filteredItems = filteredItems.sort(sortFn);
    }

    return filteredItems;
  }

  // Export data as JSON file
  exportJSON(data, fileName) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url);
  }

  // Read a file as JSON
  readJSONFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error("Invalid JSON file"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };

      reader.readAsText(file);
    });
  }
}

// Create UI instance
const ui = new UI();
