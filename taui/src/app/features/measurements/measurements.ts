import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/services/storage.service';
import { CustomerMeasurement, ClothingType } from '../../core/models/models';

@Component({
  selector: 'app-measurements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './measurements.html',
  styleUrl: './measurements.css'
})
export class MeasurementsComponent {
  private readonly storageService = inject(StorageService);

  readonly measurements = this.storageService.measurements;
  readonly clothingTypes = this.storageService.clothingTypes;

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
  readonly formClothingTypeId = signal<string>('');
  formValues: Record<string, string> = {};

  // Computed filtered list
  readonly filteredMeasurements = computed(() => {
    const list = this.measurements();
    const localSearch = this.searchTerm().trim().toLowerCase();
    const globalSearch = this.storageService.globalSearchQuery().trim().toLowerCase();
    const search = localSearch || globalSearch;
    const typeId = this.typeFilter();

    return list.filter(m => {
      const matchSearch = !search ||
        m.customerName.toLowerCase().includes(search) ||
        m.mobileNumber.includes(search);
      const matchType = !typeId || m.clothingTypeId === typeId;
      return matchSearch && matchType;
    });
  });

  // Computed selected clothing type for form
  readonly selectedFormClothingType = computed<ClothingType | null>(() => {
    const typeId = this.formClothingTypeId();
    return this.clothingTypes().find(t => t.id === typeId) || null;
  });

  constructor() {}

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
    this.formDate = new Date().toISOString().split('T')[0];
    
    // Default to first type if available
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
    this.formClothingTypeId.set(m.clothingTypeId);
    this.formValues = { ...m.values };
  }

  // Pre-fill measurements if there's a history for this mobile number
  onMobileNumberChange(): void {
    const mobile = this.formMobileNumber.trim();
    if (mobile.length >= 10 && this.isCreating()) {
      // Find latest measurement for this mobile
      const history = this.measurements().filter(m => m.mobileNumber === mobile);
      if (history.length > 0) {
        // Auto-fill customer name from latest record
        this.formCustomerName = history[0].customerName;

        // Optionally, if we find a record of the CURRENT clothing type, pre-fill values
        const typeHistory = history.find(m => m.clothingTypeId === this.formClothingTypeId());
        if (typeHistory) {
          this.formValues = { ...typeHistory.values };
        }
      }
    }
  }

  onTypeChange(typeId: string): void {
    this.formClothingTypeId.set(typeId);

    // Reinitialize values for select template
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
    const typeId = this.formClothingTypeId();

    if (!name || !mobile || !date || !typeId) {
      alert('Please fill out all fields.');
      return;
    }

    const selectedType = this.clothingTypes().find(t => t.id === typeId);
    if (!selectedType) return;

    const measurementData = {
      customerName: name,
      mobileNumber: mobile,
      date,
      clothingTypeId: typeId,
      clothingTypeName: selectedType.name,
      values: this.formValues
    };

    if (this.isCreating()) {
      const newM = this.storageService.addMeasurement(measurementData);
      this.selectMeasurement(newM);
    } else if (this.isEditing()) {
      const m = this.selectedMeasurement();
      if (!m) return;
      this.storageService.updateMeasurement(m.id, measurementData);
      const updated = this.measurements().find(x => x.id === m.id) || null;
      this.selectedMeasurement.set(updated);
    }

    this.isCreating.set(false);
    this.isEditing.set(false);
  }

  cancel(): void {
    this.selectedMeasurement.set(null);
    this.isCreating.set(false);
    this.isEditing.set(false);
  }

  deleteMeasurement(m: CustomerMeasurement): void {
    if (confirm(`Are you sure you want to delete measurement for "${m.customerName}" taken on ${m.date}?`)) {
      this.storageService.deleteMeasurement(m.id);
      this.selectedMeasurement.set(null);
      this.isEditing.set(false);
      this.isCreating.set(false);
      if (this.measurements().length > 0) {
        this.selectedMeasurement.set(this.measurements()[0]);
      }
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // Get keys of record for iterations
  getFieldsList(values: Record<string, string>): { key: string, value: string }[] {
    return Object.entries(values).map(([key, value]) => ({ key, value }));
  }
}
