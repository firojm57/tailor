import { Component, inject, signal, computed, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';
import { CustomerMeasurement, ClothingType, InvoiceDraft } from '../../../core/models/models';

export interface SelectedInvoiceItem {
  measurementId?: string;
  clothingTypeId: string;
  clothingTypeName: string;
  keyDimensions: string;
  quantity: number;
  price: number;
  description: string;
  selected: boolean;
}

@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-invoice.html',
  styleUrl: './create-invoice.css'
})
export class CreateInvoiceComponent {
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly currentDraftId = signal<string | null>(null);
  readonly clothingTypes = this.storageService.clothingTypes;
  readonly allMeasurements = this.storageService.measurements;
  readonly allBills = this.storageService.bills;

  // Form Signals
  customerName = '';
  readonly mobileNumberSignal = signal<string>('');
  get mobileNumber(): string { return this.mobileNumberSignal(); }
  set mobileNumber(val: string) { this.mobileNumberSignal.set(val || ''); }

  billDate = new Date().toISOString().split('T')[0];
  dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  notes = '';
  readonly discountSignal = signal<number>(0);
  get discount(): number { return this.discountSignal(); }
  set discount(val: number) { this.discountSignal.set(Number(val) || 0); }

  // Mobile suggestion state
  showMobileSuggestions = false;

  // Invoice Items state
  items = signal<SelectedInvoiceItem[]>([]);

  constructor() {
    // Check if URL contains draftId query parameter
    const draftIdParam = this.route.snapshot.queryParamMap.get('draftId');
    if (draftIdParam) {
      this.currentDraftId.set(draftIdParam);
      this.restoreDraft(draftIdParam);
    }

    effect(() => {
      // Subscribe to signals to trigger saveDraft automatically on changes
      const itemsList = this.items();
      const mobile = this.mobileNumberSignal();
      const disc = this.discountSignal();
      this.saveDraft();
    });
  }

  saveDraft(): void {
    const hasData = this.customerName.trim() || this.mobileNumber.trim() || this.notes.trim() || this.items().length > 0;
    if (!hasData) return;

    const draftPayload: InvoiceDraft = {
      id: this.currentDraftId() || undefined,
      customerName: this.customerName,
      mobileNumber: this.mobileNumber,
      dueDate: this.dueDate,
      notes: this.notes,
      discount: Number(this.discount) || 0,
      itemsJson: JSON.stringify(this.items())
    };

    this.storageService.saveDraft(draftPayload).subscribe(savedDraft => {
      if (savedDraft && savedDraft.id && savedDraft.id !== this.currentDraftId()) {
        this.currentDraftId.set(savedDraft.id);
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { draftId: savedDraft.id },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });
  }

  private restoreDraft(draftId: string): void {
    this.storageService.getDraft(draftId).subscribe(draft => {
      if (draft) {
        if (draft.customerName) this.customerName = draft.customerName;
        if (draft.mobileNumber) this.mobileNumber = draft.mobileNumber;
        if (draft.dueDate) this.dueDate = draft.dueDate;
        if (draft.notes) this.notes = draft.notes;
        if (typeof draft.discount === 'number') this.discount = draft.discount;
        if (draft.itemsJson) {
          try {
            const parsedItems = JSON.parse(draft.itemsJson);
            if (Array.isArray(parsedItems) && parsedItems.length > 0) {
              this.items.set(parsedItems);
            }
          } catch (e) {
            // Ignore JSON parse error
          }
        }
      }
    });
  }

  clearDraft(): void {
    const id = this.currentDraftId();
    if (id) {
      this.storageService.deleteDraft(id).subscribe();
      this.currentDraftId.set(null);
    }
  }

  // Measurement Modal (Picker + Recorder)
  isMeasurementModalOpen = signal<boolean>(false);
  activeModalTab = signal<'picker' | 'new'>('picker'); // 'picker' or 'new'
  editingMeasurementId = signal<string | null>(null);
  selectedType = signal<ClothingType | null>(null);
  measValues: Record<string, string> = {};
  modalStyle = '';
  pickerSearchTerm = signal<string>('');

  readonly customerSuggestions = signal<{ mobile: string; name: string }[]>([]);

  // Available system measurements for picker modal
  readonly pickerMeasurements = computed(() => {
    const term = this.pickerSearchTerm().trim().toLowerCase();
    const currentMobile = this.mobileNumberSignal().trim();
    
    let list = this.allMeasurements();
    if (currentMobile && !term) {
      const matchMobile = list.filter(m => m.mobileNumber === currentMobile);
      if (matchMobile.length > 0) return matchMobile;
    }

    if (!term) return list;
    return list.filter(m =>
      m.customerName.toLowerCase().includes(term) ||
      m.mobileNumber.includes(term) ||
      m.clothingTypeName.toLowerCase().includes(term)
    );
  });

  // Computed Subtotal and Grand Total
  readonly subtotal = computed(() => {
    return this.items()
      .filter(i => i.selected)
      .reduce((sum, item) => sum + (item.quantity * item.price), 0);
  });

  readonly grandTotal = computed(() => {
    const total = this.subtotal() - (Number(this.discountSignal()) || 0);
    return total < 0 ? 0 : total;
  });

  selectMobileSuggestion(mobile: string, name: string): void {
    this.mobileNumber = mobile;
    this.customerName = name;
    this.showMobileSuggestions = false;
    this.loadCustomerMeasurements(mobile);
  }

  onMobileInput(value: string): void {
    this.mobileNumber = value;
    this.showMobileSuggestions = true;

    if (!value || !value.trim()) {
      this.customerSuggestions.set([]);
      return;
    }

    this.storageService.searchCustomerSuggestions(value).subscribe(suggestions => {
      this.customerSuggestions.set(suggestions);
    });

    const match = this.allMeasurements().find(m => m.mobileNumber === value.trim());
    if (match && !this.customerName) {
      this.customerName = match.customerName;
    }
    if (value.trim().length >= 3) {
      this.loadCustomerMeasurements(value.trim());
    }
  }

  loadCustomerMeasurements(mobile: string): void {
    if (!mobile) return;

    const customerMeas = this.allMeasurements().filter(m => m.mobileNumber === mobile);
    if (customerMeas.length === 0) return;

    const existingMeasIds = new Set(this.items().map(i => i.measurementId));
    const newInvoiceItems: SelectedInvoiceItem[] = customerMeas
      .filter(m => !existingMeasIds.has(m.id))
      .map(m => {
        const dimensionsStr = Object.entries(m.values || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');

        return {
          measurementId: m.id,
          clothingTypeId: m.clothingTypeId,
          clothingTypeName: m.clothingTypeName,
          keyDimensions: dimensionsStr || 'Custom Dimensions',
          quantity: 1,
          price: 500,
          description: m.style ? `${this.capitalize(m.style)} ${this.capitalize(m.clothingTypeName)}` : this.capitalize(m.clothingTypeName),
          selected: true
        };
      });

    if (newInvoiceItems.length > 0) {
      this.items.update(curr => [...curr, ...newInvoiceItems]);
    }
  }

  toggleItemSelection(index: number): void {
    const current = [...this.items()];
    current[index].selected = !current[index].selected;
    this.items.set(current);
  }

  removeItem(index: number): void {
    const current = [...this.items()];
    current.splice(index, 1);
    this.items.set(current);
  }

  // --- Measurement Modal (Picker + Custom Dimensions) ---
  openAddMeasurementModal(): void {
    this.isMeasurementModalOpen.set(true);
    this.activeModalTab.set('picker');
    this.editingMeasurementId.set(null);
    this.pickerSearchTerm.set(this.mobileNumberSignal());

    if (this.clothingTypes().length > 0) {
      this.selectedType.set(this.clothingTypes()[0]);
      this.modalStyle = '';
      this.initMeasValues(this.clothingTypes()[0]);
    }
  }

  addMeasurementFromPicker(meas: CustomerMeasurement): void {
    // Auto-fill customer info if empty
    if (!this.customerName) this.customerName = meas.customerName;
    if (!this.mobileNumber) this.mobileNumber = meas.mobileNumber;

    const dimensionsStr = Object.entries(meas.values || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    const newItem: SelectedInvoiceItem = {
      measurementId: meas.id,
      clothingTypeId: meas.clothingTypeId,
      clothingTypeName: meas.clothingTypeName,
      keyDimensions: dimensionsStr || 'Custom Dimensions',
      quantity: 1,
      price: 500,
      description: meas.style ? `${this.capitalize(meas.style)} ${this.capitalize(meas.clothingTypeName)}` : this.capitalize(meas.clothingTypeName),
      selected: true
    };

    // Check if already added
    if (this.items().some(i => i.measurementId === meas.id)) {
      alert('This measurement is already added to the invoice items list.');
      return;
    }

    this.items.update(curr => [...curr, newItem]);
    this.isMeasurementModalOpen.set(false);
  }

  openEditMeasurementModal(item: SelectedInvoiceItem): void {
    if (!item.measurementId) return;
    const meas = this.allMeasurements().find(m => m.id === item.measurementId);
    if (!meas) return;

    const type = this.clothingTypes().find(t => t.id === meas.clothingTypeId) || this.clothingTypes()[0];
    this.isMeasurementModalOpen.set(true);
    this.activeModalTab.set('new');
    this.editingMeasurementId.set(meas.id);
    this.selectedType.set(type);
    this.modalStyle = meas.style || '';
    this.measValues = { ...(meas.values || {}) };
  }

  onTypeChange(typeId: string): void {
    const type = this.clothingTypes().find(t => t.id === typeId) || null;
    this.selectedType.set(type);
    if (type) this.initMeasValues(type);
  }

  private initMeasValues(type: ClothingType): void {
    this.measValues = {};
    for (const field of type.fields) {
      this.measValues[field] = '';
    }
  }

  saveMeasurement(): void {
    if (!this.customerName.trim() || !this.mobileNumber.trim()) {
      this.storageService.showToast('Please enter Customer Name and Mobile Number first.', 'danger');
      return;
    }
    const type = this.selectedType();
    if (!type) return;

    const editId = this.editingMeasurementId();
    if (editId) {
      this.storageService.updateMeasurement(editId, {
        customerName: this.customerName,
        mobileNumber: this.mobileNumber,
        date: new Date().toISOString().split('T')[0],
        clothingTypeId: type.id,
        clothingTypeName: type.name,
        values: this.measValues,
        style: this.modalStyle.trim() || undefined
      }).subscribe({
        next: (updatedMeas) => {
          const dimensionsStr = Object.entries(updatedMeas.values || {})
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');

          this.items.update(curr => curr.map(item => {
            if (item.measurementId === updatedMeas.id) {
              return {
                ...item,
                clothingTypeId: updatedMeas.clothingTypeId,
                clothingTypeName: updatedMeas.clothingTypeName,
                keyDimensions: dimensionsStr || 'Custom Dimensions',
                description: updatedMeas.style ? `${this.capitalize(updatedMeas.style)} ${this.capitalize(updatedMeas.clothingTypeName)}` : this.capitalize(updatedMeas.clothingTypeName)
              };
            }
            return item;
          }));

          this.loadCustomerMeasurements(this.mobileNumber.trim());
        }
      });
    } else {
      this.storageService.addMeasurement({
        customerName: this.customerName,
        mobileNumber: this.mobileNumber,
        date: new Date().toISOString().split('T')[0],
        clothingTypeId: type.id,
        clothingTypeName: type.name,
        values: this.measValues,
        style: this.modalStyle.trim() || undefined
      }).subscribe({
        next: (savedMeas) => {
          const dimensionsStr = Object.entries(savedMeas.values || {})
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');

          const newItem: SelectedInvoiceItem = {
            measurementId: savedMeas.id,
            clothingTypeId: savedMeas.clothingTypeId,
            clothingTypeName: savedMeas.clothingTypeName,
            keyDimensions: dimensionsStr || 'Custom Dimensions',
            quantity: 1,
            price: 500,
            description: savedMeas.style ? `${this.capitalize(savedMeas.style)} ${this.capitalize(savedMeas.clothingTypeName)}` : this.capitalize(savedMeas.clothingTypeName),
            selected: true
          };

          this.items.update(curr => {
            if (curr.some(i => i.measurementId === savedMeas.id)) return curr;
            return [...curr, newItem];
          });

          this.loadCustomerMeasurements(this.mobileNumber.trim());
        }
      });
    }

    this.isMeasurementModalOpen.set(false);
  }

  capitalize(str: string): string {
    if (!str) return '';
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  cancelMeasurementModal(): void {
    this.isMeasurementModalOpen.set(false);
  }

  // --- Save Invoice ---
  saveInvoice(): void {
    if (!this.customerName.trim() || !this.mobileNumber.trim()) {
      this.storageService.showToast('Please provide customer name and mobile number.', 'danger');
      return;
    }

    const selectedItems = this.items().filter(i => i.selected);
    if (selectedItems.length === 0) {
      this.storageService.showToast('Please select at least one measurement item to include in the invoice.', 'danger');
      return;
    }

    const billItems = selectedItems.map((item, idx) => ({
      id: `bi-${Date.now()}-${idx}`,
      clothingTypeId: item.clothingTypeId,
      clothingTypeName: item.clothingTypeName,
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
      description: item.description || `${item.clothingTypeName} (${item.keyDimensions})`
    }));

    this.storageService.addBill({
      customerName: this.customerName,
      mobileNumber: this.mobileNumber,
      date: this.billDate,
      dueDate: this.dueDate || undefined,
      totalAmount: this.subtotal(),
      discount: Number(this.discount) || 0,
      grandTotal: this.grandTotal(),
      paid: false,
      notes: this.notes,
      items: billItems
    }).subscribe({
      next: () => {
        this.clearDraft();
        this.router.navigate(['/billing']);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.mobile-autocomplete-container')) {
      this.showMobileSuggestions = false;
    }
  }

  @HostListener('document:keydown.escape')
  handleKeydownEscape(): void {
    if (this.isMeasurementModalOpen()) {
      this.cancelMeasurementModal();
    }
  }
}
