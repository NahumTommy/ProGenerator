/**
 * Model classes for the application
 */

// Invoice model
class Invoice {
  constructor(data = {}) {
    this.id = data.id || null;
    this.invoiceNumber = data.invoiceNumber || "";
    this.invoiceDate = data.invoiceDate || this.formatDate(new Date());
    this.invoiceDueDate =
      data.invoiceDueDate || this.calculateDueDate(new Date(), 30);
    this.clientId = data.clientId || "";
    this.items = data.items || [];
    this.subtotal = data.subtotal || 0;
    this.taxRate = data.taxRate || 0;
    this.taxAmount = data.taxAmount || 0;
    this.discount = data.discount || 0;
    this.discountType = data.discountType || "fixed";
    this.discountAmount = data.discountAmount || 0;
    this.total = data.total || 0;
    this.notes = data.notes || "";
    this.status = data.status || "draft";
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  // Format a date as YYYY-MM-DD for input fields
  formatDate(date) {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }

  // Calculate a due date based on days
  calculateDueDate(date, days) {
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + days);
    return this.formatDate(dueDate);
  }

  // Add an item to the invoice
  addItem(item) {
    this.items.push(item);
    this.recalculateInvoice();
    return this;
  }

  // Remove an item from the invoice
  removeItem(index) {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
      this.recalculateInvoice();
    }
    return this;
  }

  // Update an item in the invoice
  updateItem(index, item) {
    if (index >= 0 && index < this.items.length) {
      this.items[index] = { ...this.items[index], ...item };
      this.recalculateInvoice();
    }
    return this;
  }

  // Recalculate the invoice totals
  recalculateInvoice() {
    // Calculate subtotal
    this.subtotal = this.items.reduce((total, item) => {
      const itemTotal =
        (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0);
      return total + itemTotal;
    }, 0);

    // Calculate tax amount
    this.taxAmount = this.subtotal * (parseFloat(this.taxRate) / 100);

    // Calculate discount amount
    if (this.discountType === "percentage") {
      this.discountAmount = this.subtotal * (parseFloat(this.discount) / 100);
    } else {
      this.discountAmount = parseFloat(this.discount) || 0;
    }

    // Calculate total
    this.total = this.subtotal + this.taxAmount - this.discountAmount;

    // Round values to 2 decimal places
    this.subtotal = parseFloat(this.subtotal.toFixed(2));
    this.taxAmount = parseFloat(this.taxAmount.toFixed(2));
    this.discountAmount = parseFloat(this.discountAmount.toFixed(2));
    this.total = parseFloat(this.total.toFixed(2));

    return this;
  }

  // Update the invoice status
  updateStatus(status) {
    const validStatuses = ["draft", "pending", "paid"];
    if (validStatuses.includes(status)) {
      this.status = status;
    }
    return this;
  }
}

// Invoice Item model
class InvoiceItem {
  constructor(data = {}) {
    this.description = data.description || "";
    this.quantity = data.quantity || 1;
    this.price = data.price || 0;
    this.total = data.total || 0;
  }

  // Calculate the total for this item
  calculateTotal() {
    this.total =
      (parseFloat(this.quantity) || 0) * (parseFloat(this.price) || 0);
    this.total = parseFloat(this.total.toFixed(2));
    return this;
  }
}

// Client model
class Client {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || "";
    this.email = data.email || "";
    this.phone = data.phone || "";
    this.address = data.address || "";
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

// Settings model
class Settings {
  constructor(data = {}) {
    this.companyName = data.companyName || "";
    this.companyEmail = data.companyEmail || "";
    this.companyPhone = data.companyPhone || "";
    this.companyAddress = data.companyAddress || "";
    this.currency = data.currency || "USD";
    this.taxRate = data.taxRate || 0;
    this.paymentTerms = data.paymentTerms || "Due within 30 days";
    this.invoiceNotes = data.invoiceNotes || "Thank you for your business!";
  }

  // Get currency symbol based on currency code
  getCurrencySymbol() {
    const symbols = {
      UGX: "Shs",
    };
    return symbols[this.currency] || this.currency;
  }

  // Format a number as currency
  formatCurrency(amount) {
    const symbol = this.getCurrencySymbol();
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  }
}
