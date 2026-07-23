import { Component, inject, signal, computed, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/services/storage.service';
import { Bill, BillItem } from '../../core/models/models';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

import { Router } from '@angular/router';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './billing.html',
  styleUrl: './billing.css'
})
export class BillingComponent {
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);

  readonly bills = this.storageService.bills;
  readonly clothingTypes = this.storageService.clothingTypes;

  // Pagination Signals
  readonly page = signal<number>(0);
  readonly size = signal<number>(10);
  readonly totalElements = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly isLastPage = signal<boolean>(true);
  readonly pagedBills = signal<Bill[]>([]);

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
  formDueDate = '';
  readonly formDiscount = signal<number>(0);
  formPaid = true;
  formNotes = '';
  readonly formItems = signal<BillItem[]>([]);

  // Temporary item form fields
  tempClothingTypeId = '';
  tempDescription = '';
  tempQuantity = 1;
  tempPrice = 0;

  readonly Math = Math;
  private searchDebounceTimer: any;

  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    if (this.deleteTarget()) {
      this.cancelDelete();
    } else if (this.isCreating() || this.isEditing() || this.selectedBill()) {
      this.cancel();
    }
  }

  // Computed totals for the invoice form
  readonly formTotalAmount = computed(() => {
    return this.formItems().reduce((sum, item) => sum + (item.quantity * item.price), 0);
  });

  readonly formGrandTotal = computed(() => {
    const total = this.formTotalAmount();
    return Math.max(0, total - this.formDiscount());
  });

  constructor() {
    // Reload page whenever page or search term changes
    effect(() => {
      this.page();
      this.searchTerm();
      this.loadPagedData();
    });
  }

  loadPagedData(): void {
    this.storageService.getBillsPage(
      this.page(),
      this.size(),
      this.searchTerm()
    ).subscribe({
      next: (res) => {
        this.pagedBills.set(res.content);
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.isLastPage.set(res.last);

        // Auto-select first bill if nothing selected and not in form state
        if (res.content.length > 0 && !this.selectedBill() && !this.isCreating() && !this.isEditing()) {
          this.selectedBill.set(res.content[0]);
        }
      }
    });
  }

  onSearchInput(value: string): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.page.set(0);
      this.searchTerm.set(value);
    }, 300);
  }

  prevPage(): void {
    if (this.page() > 0) {
      this.page.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (!this.isLastPage()) {
      this.page.update(p => p + 1);
    }
  }

  selectBill(bill: Bill): void {
    this.selectedBill.set(bill);
    this.isCreating.set(false);
    this.isEditing.set(false);
  }

  startCreate(): void {
    this.router.navigate(['/billing/create']);
  }

  onMobileNumberChange(): void {
    const mobile = this.formMobileNumber.trim();
    if (mobile.length >= 10 && this.isCreating()) {
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

    this.formItems.update(items => [...items, newItem]);

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
    const dueDate = this.formDueDate;

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
      dueDate: dueDate || undefined,
      items: this.formItems(),
      totalAmount: this.formTotalAmount(),
      discount: this.formDiscount(),
      grandTotal: this.formGrandTotal(),
      paid: this.formPaid,
      notes: this.formNotes.trim() || undefined
    };

    if (this.isCreating()) {
      this.storageService.addBill(billData);
      setTimeout(() => {
        this.page.set(0);
        this.loadPagedData();
      }, 300);
    } else if (this.isEditing()) {
      const bill = this.selectedBill();
      if (!bill) return;
      this.storageService.updateBill(bill.id, billData);
      setTimeout(() => {
        this.loadPagedData();
        const updated = this.bills().find(x => x.id === bill.id) || null;
        this.selectedBill.set(updated);
      }, 300);
    }

    this.isCreating.set(false);
    this.isEditing.set(false);
  }

  cancel(): void {
    this.selectedBill.set(null);
    this.isCreating.set(false);
    this.isEditing.set(false);
  }

  readonly deleteTarget = signal<Bill | null>(null);

  confirmDelete(bill: Bill): void {
    this.deleteTarget.set(bill);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  executeDelete(): void {
    const target = this.deleteTarget();
    if (target) {
      this.storageService.deleteBill(target.id);
      this.deleteTarget.set(null);
      this.selectedBill.set(null);
      this.isEditing.set(false);
      this.isCreating.set(false);
      setTimeout(() => {
        this.loadPagedData();
      }, 300);
    }
  }

  printInvoice(): void {
    window.print();
  }

  formatCurrency(value: number): string {
    return '₹' + value.toLocaleString('en-IN');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
