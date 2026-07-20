import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/services/storage.service';
import { Bill, BillItem } from '../../core/models/models';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.html',
  styleUrl: './billing.css'
})
export class BillingComponent {
  private readonly storageService = inject(StorageService);

  readonly bills = this.storageService.bills;
  readonly clothingTypes = this.storageService.clothingTypes;

  // Search & Filter
  readonly searchTerm = signal<string>('');

  // UI state
  readonly selectedBill = signal<Bill | null>(null);
  readonly isCreating = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);

  // Form fields
  formCustomerName = '';
  formMobileNumber = '';
  formDate = '';
  readonly formDiscount = signal<number>(0);
  formPaid = true;
  formNotes = '';
  readonly formItems = signal<BillItem[]>([]);

  // Temporary item form fields
  tempClothingTypeId = '';
  tempDescription = '';
  tempQuantity = 1;
  tempPrice = 0;

  // Computed filtered bills
  readonly filteredBills = computed(() => {
    const list = this.bills();
    const localSearch = this.searchTerm().trim().toLowerCase();
    const globalSearch = this.storageService.globalSearchQuery().trim().toLowerCase();
    const search = localSearch || globalSearch;

    return list.filter(b => {
      return !search ||
        b.customerName.toLowerCase().includes(search) ||
        b.mobileNumber.includes(search) ||
        b.billNumber.toLowerCase().includes(search);
    });
  });

  // Computed totals for the invoice form
  readonly formTotalAmount = computed(() => {
    return this.formItems().reduce((sum, item) => sum + (item.quantity * item.price), 0);
  });

  readonly formGrandTotal = computed(() => {
    const total = this.formTotalAmount();
    return Math.max(0, total - this.formDiscount());
  });

  selectBill(bill: Bill): void {
    this.selectedBill.set(bill);
    this.isCreating.set(false);
    this.isEditing.set(false);
  }

  startCreate(): void {
    this.isCreating.set(true);
    this.isEditing.set(false);
    this.selectedBill.set(null);

    this.formCustomerName = '';
    this.formMobileNumber = '';
    this.formDate = new Date().toISOString().split('T')[0];
    this.formDiscount.set(0);
    this.formPaid = true;
    this.formNotes = '';
    this.formItems.set([]);

    // Clear temp item
    const types = this.clothingTypes();
    this.tempClothingTypeId = types.length > 0 ? types[0].id : '';
    this.tempDescription = '';
    this.tempQuantity = 1;
    this.tempPrice = 0;
  }

  onMobileNumberChange(): void {
    const mobile = this.formMobileNumber.trim();
    if (mobile.length >= 10 && this.isCreating()) {
      // Find customer name from previous records
      const latestMeas = this.storageService.measurements().find(m => m.mobileNumber === mobile);
      if (latestMeas) {
        this.formCustomerName = latestMeas.customerName;
      } else {
        const latestBill = this.bills().find(b => b.mobileNumber === mobile);
        if (latestBill) {
          this.formCustomerName = latestBill.customerName;
        }
      }
    }
  }

  addBillItem(): void {
    const typeId = this.tempClothingTypeId;
    if (!typeId) {
      alert('Please select a clothing category.');
      return;
    }

    const type = this.clothingTypes().find(t => t.id === typeId);
    if (!type) return;

    if (this.tempQuantity <= 0) {
      alert('Quantity must be greater than zero.');
      return;
    }

    if (this.tempPrice < 0) {
      alert('Price cannot be negative.');
      return;
    }

    const newItem: BillItem = {
      id: 'bi-' + Date.now(),
      clothingTypeId: typeId,
      clothingTypeName: type.name,
      quantity: this.tempQuantity,
      price: this.tempPrice,
      description: this.tempDescription.trim() || `${type.name} stitching service`
    };

    // Add to items array
    this.formItems.update(items => [...items, newItem]);

    // Reset temp item inputs
    this.tempDescription = '';
    this.tempQuantity = 1;
    this.tempPrice = 0;
  }

  removeBillItem(index: number): void {
    this.formItems.update(items => items.filter((_, i) => i !== index));
  }

  save(): void {
    const name = this.formCustomerName.trim();
    const mobile = this.formMobileNumber.trim();
    const date = this.formDate;

    if (!name || !mobile || !date) {
      alert('Please enter customer details.');
      return;
    }

    if (this.formItems().length === 0) {
      alert('Please add at least one item to the bill.');
      return;
    }

    const billData = {
      customerName: name,
      mobileNumber: mobile,
      date,
      items: this.formItems(),
      totalAmount: this.formTotalAmount(),
      discount: this.formDiscount(),
      grandTotal: this.formGrandTotal(),
      paid: this.formPaid,
      notes: this.formNotes.trim() || undefined
    };

    if (this.isCreating()) {
      const newBill = this.storageService.addBill(billData);
      this.selectBill(newBill);
    } else if (this.isEditing()) {
      const bill = this.selectedBill();
      if (!bill) return;
      this.storageService.updateBill(bill.id, billData);
      const updated = this.bills().find(x => x.id === bill.id) || null;
      this.selectedBill.set(updated);
    }

    this.isCreating.set(false);
    this.isEditing.set(false);
  }

  cancel(): void {
    this.selectedBill.set(null);
    this.isCreating.set(false);
    this.isEditing.set(false);
  }

  deleteBill(bill: Bill): void {
    if (confirm(`Are you sure you want to delete bill ${bill.billNumber} for "${bill.customerName}"?`)) {
      this.storageService.deleteBill(bill.id);
      this.selectedBill.set(null);
      this.isEditing.set(false);
      this.isCreating.set(false);
      if (this.bills().length > 0) {
        this.selectedBill.set(this.bills()[0]);
      }
    }
  }

  printInvoice(): void {
    window.print();
  }

  formatCurrency(value: number): string {
    return '₹' + value.toLocaleString('en-IN');
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
