import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ClothingType, CustomerMeasurement, Bill, DashboardStats } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api';

  // Signals representing the state
  private readonly clothingTypesSignal = signal<ClothingType[]>([]);
  private readonly measurementsSignal = signal<CustomerMeasurement[]>([]);
  private readonly billsSignal = signal<Bill[]>([]);
  readonly toastMessage = signal<{ text: string; type: 'success' | 'danger' | 'info' } | null>(null);

  showToast(text: string, type: 'success' | 'danger' | 'info' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }

  // Public readonly views of the signals
  readonly clothingTypes = this.clothingTypesSignal.asReadonly();
  readonly measurements = this.measurementsSignal.asReadonly();
  readonly bills = this.billsSignal.asReadonly();

  // Computed signals
  readonly stats = computed<DashboardStats>(() => {
    const uniqueMobiles = new Set([
      ...this.measurementsSignal().map(m => m.mobileNumber),
      ...this.billsSignal().map(b => b.mobileNumber)
    ]);
    const totalEarnings = this.billsSignal()
      .filter(b => b.paid)
      .reduce((sum, b) => sum + (b.grandTotal || 0), 0);

    return {
      totalCustomers: uniqueMobiles.size,
      totalEarnings,
      totalMeasurements: this.measurementsSignal().length,
      totalBills: this.billsSignal().length
    };
  });

  constructor() {
    this.refreshData();
  }

  searchCustomerSuggestions(query: string): Observable<{ mobile: string; name: string }[]> {
    if (!query || !query.trim()) return of([]);
    const q = query.trim().toLowerCase();

    return this.http.get<any[]>(`${this.apiUrl}/customers/search?query=${encodeURIComponent(q)}`).pipe(
      map(data => data.map(item => ({ mobile: item.mobile, name: item.name }))),
      catchError(() => {
        const mapRes = new Map<string, string>();
        for (const m of this.measurementsSignal()) {
          if (m.mobileNumber.toLowerCase().includes(q) || m.customerName.toLowerCase().includes(q)) {
            mapRes.set(m.mobileNumber, m.customerName);
          }
        }
        for (const b of this.billsSignal()) {
          if (b.mobileNumber.toLowerCase().includes(q) || b.customerName.toLowerCase().includes(q)) {
            if (!mapRes.has(b.mobileNumber)) mapRes.set(b.mobileNumber, b.customerName);
          }
        }
        return of(Array.from(mapRes.entries()).map(([mobile, name]) => ({ mobile, name })));
      })
    );
  }

  refreshData(): void {
    // 1. Fetch varieties / clothing types
    this.http.get<any[]>(`${this.apiUrl}/varieties`).subscribe({
      next: (data) => {
        const types: ClothingType[] = data.map(item => ({
          id: String(item.id),
          name: item.type,
          fields: item.measureList || [],
          styles: item.styleList || []
        }));
        this.clothingTypesSignal.set(types);
        localStorage.setItem('tailor_clothing_types', JSON.stringify(types));
      },
      error: () => this.loadLocalTypes()
    });

    // 2. Fetch measurements
    this.http.get<any>(`${this.apiUrl}/measurements?page=0&size=1000`).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res?.content || []);
        const meas: CustomerMeasurement[] = list.map((item: any) => ({
          id: String(item.id),
          customerName: item.customerName,
          mobileNumber: item.mobileNumber,
          date: item.date,
          clothingTypeId: String(item.clothingTypeId || ''),
          clothingTypeName: item.clothingTypeName,
          values: item.values || {},
          style: item.style
        }));
        this.measurementsSignal.set(meas);
        localStorage.setItem('tailor_measurements', JSON.stringify(meas));
      },
      error: () => this.loadLocalMeasurements()
    });

    // 3. Fetch bills
    this.http.get<any>(`${this.apiUrl}/billing?page=0&size=1000`).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res?.content || []);
        const bills: Bill[] = list.map((item: any) => ({
          id: String(item.id),
          billNumber: item.billNumber,
          customerName: item.customerName,
          mobileNumber: item.mobileNumber,
          date: item.date,
          totalAmount: item.totalAmount || 0,
          discount: item.discount || 0,
          grandTotal: item.grandTotal || 0,
          paid: Boolean(item.paid),
          notes: item.notes || '',
          items: (item.items || []).map((it: any) => ({
            id: String(it.id),
            clothingTypeId: String(it.clothingTypeId || ''),
            clothingTypeName: it.clothingTypeName,
            quantity: it.quantity || 1,
            price: it.price || 0,
            description: it.description || ''
          }))
        }));
        this.billsSignal.set(bills);
        localStorage.setItem('tailor_bills', JSON.stringify(bills));
      },
      error: () => this.loadLocalBills()
    });
  }

  // Fallback to local storage if API is offline
  private loadLocalTypes(): void {
    const types = localStorage.getItem('tailor_clothing_types');
    if (types) this.clothingTypesSignal.set(JSON.parse(types));
  }

  private loadLocalMeasurements(): void {
    const meas = localStorage.getItem('tailor_measurements');
    if (meas) this.measurementsSignal.set(JSON.parse(meas));
  }

  private loadLocalBills(): void {
    const bills = localStorage.getItem('tailor_bills');
    if (bills) this.billsSignal.set(JSON.parse(bills));
  }

  // --- Clothing Type CRUD ---
  addClothingType(name: string, fields: string[], styles: string[]): ClothingType {
    const payload = { type: name, measureList: fields, styleList: styles };
    const tempId = 'type-' + Date.now();
    const newType: ClothingType = { id: tempId, name, fields, styles };

    this.http.post<any>(`${this.apiUrl}/varieties`, payload).subscribe({
      next: (res) => {
        if (res && res.id) newType.id = String(res.id);
        this.showToast(`Category "${name}" created successfully!`);
        this.refreshData();
      },
      error: () => {
        const updated = [...this.clothingTypesSignal(), newType];
        this.clothingTypesSignal.set(updated);
        localStorage.setItem('tailor_clothing_types', JSON.stringify(updated));
        this.showToast(`Category "${name}" created locally!`);
      }
    });

    return newType;
  }

  updateClothingType(id: string, name: string, fields: string[], styles: string[]): void {
    const numericId = Number(id);
    const payload = { id: numericId, type: name, measureList: fields, styleList: styles };

    if (!isNaN(numericId)) {
      this.http.put(`${this.apiUrl}/varieties/${numericId}`, payload).subscribe({
        next: () => {
          this.showToast(`Category "${name}" updated successfully!`);
          this.refreshData();
        },
        error: () => this.updateLocalClothingType(id, name, fields, styles)
      });
    } else {
      this.updateLocalClothingType(id, name, fields, styles);
    }
  }

  private updateLocalClothingType(id: string, name: string, fields: string[], styles: string[]): void {
    const updated = this.clothingTypesSignal().map(t =>
      t.id === id ? { ...t, name, fields, styles } : t
    );
    this.clothingTypesSignal.set(updated);
    localStorage.setItem('tailor_clothing_types', JSON.stringify(updated));
    this.showToast(`Category "${name}" updated locally!`);
  }

  deleteClothingType(id: string): void {
    const numericId = Number(id);
    if (!isNaN(numericId)) {
      this.http.delete(`${this.apiUrl}/varieties/${numericId}`).subscribe({
        next: () => {
          this.showToast('Category deleted successfully!', 'danger');
          this.refreshData();
        },
        error: () => this.deleteLocalClothingType(id)
      });
    } else {
      this.deleteLocalClothingType(id);
    }
  }

  private deleteLocalClothingType(id: string): void {
    const filtered = this.clothingTypesSignal().filter(t => t.id !== id);
    this.clothingTypesSignal.set(filtered);
    localStorage.setItem('tailor_clothing_types', JSON.stringify(filtered));
    this.showToast('Category deleted locally!', 'danger');
  }

  // --- Customer Measurement CRUD ---
  addMeasurement(measurement: Omit<CustomerMeasurement, 'id'>): Observable<CustomerMeasurement> {
    const payload = {
      customerName: measurement.customerName,
      mobileNumber: measurement.mobileNumber,
      date: measurement.date,
      deliveryDate: measurement.deliveryDate,
      clothingTypeId: Number(measurement.clothingTypeId) || null,
      clothingTypeName: measurement.clothingTypeName,
      values: measurement.values,
      style: measurement.style || null
    };
    const newMeas: CustomerMeasurement = { ...measurement, id: 'm-' + Date.now() };

    return this.http.post<any>(`${this.apiUrl}/measurements`, payload).pipe(
      map(res => {
        this.showToast(`Measurement for "${measurement.customerName}" recorded!`);
        this.refreshData();
        return {
          id: String(res.id),
          customerName: res.customerName,
          mobileNumber: res.mobileNumber,
          date: res.date,
          clothingTypeId: String(res.clothingTypeId || ''),
          clothingTypeName: res.clothingTypeName,
          values: res.values || {},
          style: res.style
        };
      }),
      catchError(() => {
        const updated = [newMeas, ...this.measurementsSignal()];
        this.measurementsSignal.set(updated);
        localStorage.setItem('tailor_measurements', JSON.stringify(updated));
        this.showToast(`Measurement for "${measurement.customerName}" saved locally!`);
        return of(newMeas);
      })
    );
  }

  updateMeasurement(id: string, measurement: Omit<CustomerMeasurement, 'id'>): Observable<any> {
    const numericId = Number(id);
    const payload = {
      id: numericId,
      customerName: measurement.customerName,
      mobileNumber: measurement.mobileNumber,
      date: measurement.date,
      deliveryDate: measurement.deliveryDate,
      clothingTypeId: Number(measurement.clothingTypeId) || null,
      clothingTypeName: measurement.clothingTypeName,
      values: measurement.values,
      style: measurement.style || null
    };

    if (!isNaN(numericId)) {
      return this.http.put(`${this.apiUrl}/measurements/${numericId}`, payload).pipe(
        tap(() => {
          this.showToast(`Measurement for "${measurement.customerName}" updated!`);
          this.refreshData();
        }),
        catchError(() => {
          this.updateLocalMeasurement(id, measurement);
          return of(null);
        })
      );
    } else {
      this.updateLocalMeasurement(id, measurement);
      return of(null);
    }
  }

  private updateLocalMeasurement(id: string, measurement: Omit<CustomerMeasurement, 'id'>): void {
    const updated = this.measurementsSignal().map(m =>
      m.id === id ? { ...m, ...measurement } : m
    );
    this.measurementsSignal.set(updated);
    localStorage.setItem('tailor_measurements', JSON.stringify(updated));
    this.showToast(`Measurement for "${measurement.customerName}" updated locally!`);
  }

  deleteMeasurement(id: string): Observable<any> {
    const numericId = Number(id);
    if (!isNaN(numericId)) {
      return this.http.delete(`${this.apiUrl}/measurements/${numericId}`).pipe(
        tap(() => {
          this.showToast('Measurement deleted successfully!', 'danger');
          this.refreshData();
        }),
        catchError(() => {
          this.deleteLocalMeasurement(id);
          return of(null);
        })
      );
    } else {
      this.deleteLocalMeasurement(id);
      return of(null);
    }
  }

  private deleteLocalMeasurement(id: string): void {
    const filtered = this.measurementsSignal().filter(m => m.id !== id);
    this.measurementsSignal.set(filtered);
    localStorage.setItem('tailor_measurements', JSON.stringify(filtered));
    this.showToast('Measurement deleted locally!', 'danger');
  }

  getMeasurementsByMobile(mobile: string): CustomerMeasurement[] {
    return this.measurementsSignal().filter(m => m.mobileNumber === mobile);
  }

  // --- Bill CRUD ---
  addBill(bill: Omit<Bill, 'id' | 'billNumber'>): Bill {
    const count = this.billsSignal().length + 1001;
    const generatedBillNumber = 'INV-' + count;
    const payload = {
      billNumber: generatedBillNumber,
      customerName: bill.customerName,
      mobileNumber: bill.mobileNumber,
      date: bill.date,
      dueDate: bill.dueDate,
      totalAmount: bill.totalAmount,
      discount: bill.discount,
      grandTotal: bill.grandTotal,
      paid: bill.paid,
      notes: bill.notes,
      items: bill.items.map(it => ({
        clothingTypeId: Number(it.clothingTypeId) || null,
        clothingTypeName: it.clothingTypeName,
        quantity: it.quantity,
        price: it.price,
        description: it.description
      }))
    };

    const newBill: Bill = {
      ...bill,
      id: 'b-' + Date.now(),
      billNumber: generatedBillNumber
    };

    this.http.post<any>(`${this.apiUrl}/billing`, payload).subscribe({
      next: () => {
        this.showToast(`Invoice ${generatedBillNumber} created!`);
        this.refreshData();
      },
      error: () => {
        const updated = [newBill, ...this.billsSignal()];
        this.billsSignal.set(updated);
        localStorage.setItem('tailor_bills', JSON.stringify(updated));
        this.showToast(`Invoice ${generatedBillNumber} created locally!`);
      }
    });

    return newBill;
  }

  updateBill(id: string, bill: Omit<Bill, 'id' | 'billNumber'>): void {
    const numericId = Number(id);
    const existing = this.billsSignal().find(b => b.id === id);
    const payload = {
      id: numericId,
      billNumber: existing?.billNumber || 'INV-1001',
      customerName: bill.customerName,
      mobileNumber: bill.mobileNumber,
      date: bill.date,
      dueDate: bill.dueDate,
      totalAmount: bill.totalAmount,
      discount: bill.discount,
      grandTotal: bill.grandTotal,
      paid: bill.paid,
      notes: bill.notes,
      items: bill.items.map(it => ({
        clothingTypeId: Number(it.clothingTypeId) || null,
        clothingTypeName: it.clothingTypeName,
        quantity: it.quantity,
        price: it.price,
        description: it.description
      }))
    };

    if (!isNaN(numericId)) {
      this.http.put(`${this.apiUrl}/billing/${numericId}`, payload).subscribe({
        next: () => {
          this.showToast(`Invoice ${payload.billNumber} updated!`);
          this.refreshData();
        },
        error: () => this.updateLocalBill(id, bill)
      });
    } else {
      this.updateLocalBill(id, bill);
    }
  }

  private updateLocalBill(id: string, bill: Omit<Bill, 'id' | 'billNumber'>): void {
    const updated = this.billsSignal().map(b =>
      b.id === id ? { ...b, ...bill } : b
    );
    this.billsSignal.set(updated);
    localStorage.setItem('tailor_bills', JSON.stringify(updated));
    this.showToast('Invoice updated locally!');
  }

  deleteBill(id: string): void {
    const numericId = Number(id);
    if (!isNaN(numericId)) {
      this.http.delete(`${this.apiUrl}/billing/${numericId}`).subscribe({
        next: () => {
          this.showToast('Invoice deleted successfully!', 'danger');
          this.refreshData();
        },
        error: () => this.deleteLocalBill(id)
      });
    } else {
      this.deleteLocalBill(id);
    }
  }

  private deleteLocalBill(id: string): void {
    const filtered = this.billsSignal().filter(b => b.id !== id);
    this.billsSignal.set(filtered);
    localStorage.setItem('tailor_bills', JSON.stringify(filtered));
    this.showToast('Invoice deleted locally!', 'danger');
  }

  getMeasurementsPage(page: number, size: number, search: string, clothingTypeId: string): Observable<PagedResult<CustomerMeasurement>> {
    const typeId = clothingTypeId ? Number(clothingTypeId) : 0;
    const url = `${this.apiUrl}/measurements?page=${page}&size=${size}&search=${encodeURIComponent(search)}&clothingTypeId=${typeId}`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const content: CustomerMeasurement[] = (res.content || []).map((item: any) => ({
          id: String(item.id),
          customerName: item.customerName,
          mobileNumber: item.mobileNumber,
          date: item.date,
          clothingTypeId: String(item.clothingTypeId || ''),
          clothingTypeName: item.clothingTypeName,
          values: item.values || {},
          style: item.style
        }));
        return {
          content,
          pageNumber: res.pageNumber,
          pageSize: res.pageSize,
          totalElements: res.totalElements,
          totalPages: res.totalPages,
          last: res.last
        };
      }),
      catchError(() => {
        const all = this.measurementsSignal();
        const filtered = all.filter(m => {
          const matchSearch = !search || m.customerName.toLowerCase().includes(search.toLowerCase()) || m.mobileNumber.includes(search);
          const matchType = !clothingTypeId || m.clothingTypeId === clothingTypeId;
          return matchSearch && matchType;
        });
        const start = page * size;
        const pageItems = filtered.slice(start, start + size);
        return of({
          content: pageItems,
          pageNumber: page,
          pageSize: size,
          totalElements: filtered.length,
          totalPages: Math.ceil(filtered.length / size),
          last: start + size >= filtered.length
        });
      })
    );
  }

  getBillsPage(page: number, size: number, search: string): Observable<PagedResult<Bill>> {
    const url = `${this.apiUrl}/billing?page=${page}&size=${size}&search=${encodeURIComponent(search)}`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const content: Bill[] = (res.content || []).map((item: any) => ({
          id: String(item.id),
          billNumber: item.billNumber,
          customerName: item.customerName,
          mobileNumber: item.mobileNumber,
          date: item.date,
          totalAmount: item.totalAmount || 0,
          discount: item.discount || 0,
          grandTotal: item.grandTotal || 0,
          paid: Boolean(item.paid),
          notes: item.notes || '',
          items: (item.items || []).map((it: any) => ({
            id: String(it.id),
            clothingTypeId: String(it.clothingTypeId || ''),
            clothingTypeName: it.clothingTypeName,
            quantity: it.quantity || 1,
            price: it.price || 0,
            description: it.description || ''
          }))
        }));
        return {
          content,
          pageNumber: res.pageNumber,
          pageSize: res.pageSize,
          totalElements: res.totalElements,
          totalPages: res.totalPages,
          last: res.last
        };
      }),
      catchError(() => {
        const all = this.billsSignal();
        const filtered = all.filter(b => {
          return !search || b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
                 b.customerName.toLowerCase().includes(search.toLowerCase()) ||
                 b.mobileNumber.includes(search);
        });
        const start = page * size;
        const pageItems = filtered.slice(start, start + size);
        return of({
          content: pageItems,
          pageNumber: page,
          pageSize: size,
          totalElements: filtered.length,
          totalPages: Math.ceil(filtered.length / size),
          last: start + size >= filtered.length
        });
      })
    );
  }
}

export interface PagedResult<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
