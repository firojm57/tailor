import { Component, inject, signal, computed, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/services/storage.service';
import { CustomerMeasurement, ClothingType } from '../../core/models/models';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-measurements',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './measurements.html',
  styleUrl: './measurements.css'
})
export class MeasurementsComponent {
  private readonly storageService = inject(StorageService);

  readonly measurements = this.storageService.measurements;
  readonly clothingTypes = this.storageService.clothingTypes;

  // Pagination Signals
  readonly page = signal<number>(0);
  readonly size = signal<number>(10);
  readonly totalElements = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly isLastPage = signal<boolean>(true);
  readonly pagedMeasurements = signal<CustomerMeasurement[]>([]);

  // Search & Filters
  readonly searchTerm = signal<string>('');
  readonly typeFilter = signal<string>('');

  // UI state
  readonly selectedMeasurement = signal<CustomerMeasurement | null>(null);
  readonly isCreating = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);

  // Form fields
  formCustomerName = '';
  formMobileNumber = '';
  formDate = '';
  formDeliveryDate = '';
  formStyle = '';
  readonly formClothingTypeId = signal<string>('');
  formValues: Record<string, string> = {};

  private searchDebounceTimer: any;

  readonly showingTo = computed(() => {
    return Math.min((this.page() + 1) * this.size(), this.totalElements());
  });

  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    if (this.deleteTarget()) {
      this.cancelDelete();
    } else if (this.isCreating() || this.isEditing() || this.selectedMeasurement()) {
      this.cancel();
    }
  }

  // Computed selected clothing type for form
  readonly selectedFormClothingType = computed<ClothingType | null>(() => {
    const typeId = this.formClothingTypeId();
    return this.clothingTypes().find(t => t.id === typeId) || null;
  });

  constructor() {
    // Reload page whenever page, search term, or type filter changes
    effect(() => {
      this.page();
      this.searchTerm();
      this.typeFilter();
      this.loadPagedData();
    });
  }

  loadPagedData(): void {
    this.storageService.getMeasurementsPage(
      this.page(),
      this.size(),
      this.searchTerm(),
      this.typeFilter()
    ).subscribe({
      next: (res) => {
        if (this.page() >= res.totalPages && res.totalPages > 0) {
          this.page.set(0);
          return;
        }

        this.pagedMeasurements.set(res.content);
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.isLastPage.set(res.last);
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

  onTypeFilterChange(typeId: string): void {
    this.page.set(0);
    this.typeFilter.set(typeId);
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

  selectMeasurement(m: CustomerMeasurement): void {
    this.selectedMeasurement.set(m);
    this.isCreating.set(false);
    this.isEditing.set(false);
  }

  startCreate(): void {
    this.isCreating.set(true);
    this.isEditing.set(false);
    this.selectedMeasurement.set(null);

    this.formCustomerName = '';
    this.formMobileNumber = '';
    this.formStyle = '';
    const today = new Date().toISOString().split('T')[0];
    this.formDate = today;

    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 7);
    this.formDeliveryDate = delivery.toISOString().split('T')[0];

    const types = this.clothingTypes();
    const defaultTypeId = types.length > 0 ? types[0].id : '';
    this.formClothingTypeId.set(defaultTypeId);
    this.formValues = {};
    if (defaultTypeId) {
      this.onTypeChange(defaultTypeId);
    }
  }

  startEdit(): void {
    const m = this.selectedMeasurement();
    if (!m) return;

    this.isEditing.set(true);
    this.isCreating.set(false);

    this.formCustomerName = m.customerName;
    this.formMobileNumber = m.mobileNumber;
    this.formDate = m.date;
    this.formDeliveryDate = m.deliveryDate || '';
    this.formStyle = m.style || '';
    this.formClothingTypeId.set(m.clothingTypeId);
    this.formValues = { ...m.values };
  }

  onMobileNumberChange(): void {
    const mobile = this.formMobileNumber.trim();
    if (mobile.length >= 10 && this.isCreating()) {
      const history = this.measurements().filter(m => m.mobileNumber === mobile);
      if (history.length > 0) {
        this.formCustomerName = history[0].customerName;

        const typeHistory = history.find(m => m.clothingTypeId === this.formClothingTypeId());
        if (typeHistory) {
          this.formValues = { ...typeHistory.values };
        }
      }
    }
  }

  onTypeChange(typeId: string): void {
    this.formClothingTypeId.set(typeId);

    const selectedType = this.clothingTypes().find(t => t.id === typeId);
    if (selectedType) {
      const newValues: Record<string, string> = {};
      selectedType.fields.forEach(field => {
        newValues[field] = this.formValues[field] || '';
      });
      this.formValues = newValues;
    } else {
      this.formValues = {};
    }

    const mobile = this.formMobileNumber.trim();
    if (mobile.length >= 10) {
      const history = this.measurements().filter(m => m.mobileNumber === mobile);
      const typeHistory = history.find(m => m.clothingTypeId === typeId);
      if (typeHistory) {
        this.formValues = { ...typeHistory.values };
      }
    }
  }

  save(): void {
    const name = this.formCustomerName.trim();
    const mobile = this.formMobileNumber.trim();
    const date = this.formDate;
    const deliveryDate = this.formDeliveryDate;
    const typeId = this.formClothingTypeId();

    if (!name || !mobile || !date || !typeId) {
      this.storageService.showToast('Please fill out all required fields.', 'danger');
      return;
    }

    const selectedType = this.clothingTypes().find(t => t.id === typeId);
    if (!selectedType) return;

    const measurementData = {
      customerName: name,
      mobileNumber: mobile,
      date,
      deliveryDate: deliveryDate || undefined,
      clothingTypeId: typeId,
      clothingTypeName: selectedType.name,
      values: this.formValues,
      style: this.formStyle.trim() || undefined
    };

    if (this.isCreating()) {
      this.storageService.addMeasurement(measurementData).subscribe({
        next: () => {
          this.page.set(0);
          this.loadPagedData();
        }
      });
    } else if (this.isEditing()) {
      const m = this.selectedMeasurement();
      if (!m) return;
      this.storageService.updateMeasurement(m.id, measurementData).subscribe({
        next: () => {
          this.loadPagedData();
          // Update details drawer immediately with new fields
          this.selectedMeasurement.set({
            ...m,
            ...measurementData
          });
        }
      });
    }

    this.isCreating.set(false);
    this.isEditing.set(false);
  }

  cancel(): void {
    this.selectedMeasurement.set(null);
    this.isCreating.set(false);
    this.isEditing.set(false);
  }

  readonly deleteTarget = signal<CustomerMeasurement | null>(null);

  confirmDelete(m: CustomerMeasurement): void {
    this.deleteTarget.set(m);
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
  }

  executeDelete(): void {
    const target = this.deleteTarget();
    if (target) {
      this.storageService.deleteMeasurement(target.id).subscribe({
        next: () => {
          this.loadPagedData();
        }
      });
      this.deleteTarget.set(null);
      this.selectedMeasurement.set(null);
      this.isEditing.set(false);
      this.isCreating.set(false);
    }
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

  getFieldsList(values: Record<string, string>): { key: string, value: string }[] {
    return Object.entries(values || {}).map(([key, value]) => ({ key, value }));
  }
}
