import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ClothingType, CustomerMeasurement, Bill, DashboardStats, InvoiceDraft } from '../models/models';

export interface PagedResult<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = typeof window !== 'undefined' && window.location.port === '4200'
    ? 'http://localhost:8080/api'
    : '/api';

  // In-memory signals representing the application state (NO business data in localStorage)
  private readonly clothingTypesSignal = signal<ClothingType[]>([]);
  private readonly measurementsSignal = signal<CustomerMeasurement[]>([]);
  private readonly billsSignal = signal<Bill[]>([]);
  readonly toastMessage = signal<{ text: string; type: 'success' | 'danger' | 'info' } | null>(null);

  private toastTimeout: any = null;

  showToast(text: string, type: 'success' | 'danger' | 'info' = 'success'): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
    this.toastMessage.set({ text, type });
    const duration = type === 'danger' ? 7000 : 4000;
    this.toastTimeout = setTimeout(() => {
      this.toastMessage.set(null);
      this.toastTimeout = null;
    }, duration);
  }

  clearToast(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
    this.toastMessage.set(null);
  }

  // Public readonly views of the in-memory signals
  readonly clothingTypes = this.clothingTypesSignal.asReadonly();
  readonly measurements = this.measurementsSignal.asReadonly();
  readonly bills = this.billsSignal.asReadonly();

  // Computed dashboard statistics
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
    // Proactively clean up any stale legacy business data from localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('tailor_clothing_types');
      localStorage.removeItem('tailor_measurements');
      localStorage.removeItem('tailor_bills');
    }

    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('tailor_auth_token') : null;
    if (token) {
      this.refreshData(true);
    }
  }

  clearAllData(): void {
    this.clothingTypesSignal.set([]);
    this.measurementsSignal.set([]);
    this.billsSignal.set([]);
  }

  searchCustomerSuggestions(query: string): Observable<{ mobile: string; name: string }[]> {
    if (!query || !query.trim()) return of([]);
    const q = query.trim().toLowerCase();

    return this.http.get<any[]>(`${this.apiUrl}/customers/search?query=${encodeURIComponent(q)}`).pipe(
      map(data => (data || []).map(item => ({ mobile: item.mobile, name: item.name }))),
      catchError(() => of([]))
    );
  }

  refreshData(silent = false): void {
    // 1. Fetch varieties / clothing types
    this.http.get<any[]>(`${this.apiUrl}/varieties`).subscribe({
      next: (data) => {
        const types: ClothingType[] = (data || []).map(item => ({
          id: String(item.id),
          name: item.type,
          fields: item.measureList || [],
          styles: item.styleList || []
        }));
        this.clothingTypesSignal.set(types);
      },
      error: (err) => {
        if (err?.status === 401) return;
        if (!silent) {
          this.showToast('Unable to fetch categories from server.', 'danger');
        }
      }
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
      },
      error: (err) => {
        if (err?.status === 401) return;
        if (!silent) {
          this.showToast('Unable to fetch measurements from server.', 'danger');
        }
      }
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
          dueDate: item.dueDate,
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
      },
      error: (err) => {
        if (err?.status === 401) return;
        if (!silent) {
          this.showToast('Unable to fetch invoices from server.', 'danger');
        }
      }
    });
  }

  // --- Clothing Type CRUD ---
  addClothingType(name: string, fields: string[], styles: string[]): Observable<ClothingType | null> {
    const payload = { type: name, measureList: fields, styleList: styles };

    return this.http.post<any>(`${this.apiUrl}/varieties`, payload).pipe(
      map((res) => {
        const created: ClothingType = {
          id: String(res.id),
          name: res.type,
          fields: res.measureList || fields,
          styles: res.styleList || styles
        };
        this.showToast(`Category "${name}" created successfully!`);
        this.refreshData();
        return created;
      }),
      catchError((err) => {
        const msg = err?.error?.error || err?.error?.message || `Failed to create category "${name}".`;
        this.showToast(msg, 'danger');
        return of(null);
      })
    );
  }

  updateClothingType(id: string, name: string, fields: string[], styles: string[]): Observable<any> {
    const numericId = Number(id);
    const payload = { id: numericId, type: name, measureList: fields, styleList: styles };

    return this.http.put(`${this.apiUrl}/varieties/${numericId}`, payload).pipe(
      tap(() => {
        this.showToast(`Category "${name}" updated successfully!`);
        this.refreshData();
      }),
      catchError((err) => {
        const msg = err?.error?.error || err?.error?.message || `Failed to update category "${name}".`;
        this.showToast(msg, 'danger');
        return of(null);
      })
    );
  }

  deleteClothingType(id: string): Observable<any> {
    const numericId = Number(id);

    return this.http.delete(`${this.apiUrl}/varieties/${numericId}`).pipe(
      tap(() => {
        this.showToast('Category deleted successfully!', 'danger');
        this.refreshData();
      }),
      catchError((err) => {
        const msg = err?.error?.error || err?.error?.message || 'Failed to delete category.';
        this.showToast(msg, 'danger');
        return of(null);
      })
    );
  }

  // --- Customer Measurement CRUD ---
  addMeasurement(measurement: Omit<CustomerMeasurement, 'id'>): Observable<CustomerMeasurement | null> {
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
      catchError((err) => {
        const msg = err?.error?.error || err?.error?.message || `Failed to save measurement for "${measurement.customerName}".`;
        this.showToast(msg, 'danger');
        return of(null);
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

    return this.http.put(`${this.apiUrl}/measurements/${numericId}`, payload).pipe(
      tap(() => {
        this.showToast(`Measurement for "${measurement.customerName}" updated!`);
        this.refreshData();
      }),
      catchError((err) => {
        const msg = err?.error?.error || err?.error?.message || `Failed to update measurement for "${measurement.customerName}".`;
        this.showToast(msg, 'danger');
        return of(null);
      })
    );
  }

  deleteMeasurement(id: string): Observable<any> {
    const numericId = Number(id);

    return this.http.delete(`${this.apiUrl}/measurements/${numericId}`).pipe(
      tap(() => {
        this.showToast('Measurement deleted successfully!', 'danger');
        this.refreshData();
      }),
      catchError((err) => {
        const msg = err?.error?.error || err?.error?.message || 'Failed to delete measurement.';
        this.showToast(msg, 'danger');
        return of(null);
      })
    );
  }

  getMeasurementsByMobile(mobile: string): CustomerMeasurement[] {
    return this.measurementsSignal().filter(m => m.mobileNumber === mobile);
  }

  // --- Bill CRUD ---
  addBill(bill: Omit<Bill, 'id' | 'billNumber'>): Observable<Bill | null> {
    const payload = {
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

    return this.http.post<any>(`${this.apiUrl}/billing`, payload).pipe(
      map(res => {
        const billNumber = res.billNumber || 'New Invoice';
        this.showToast(`Invoice ${billNumber} created!`);
        this.refreshData();
        return {
          id: String(res.id),
          billNumber: res.billNumber,
          customerName: res.customerName,
          mobileNumber: res.mobileNumber,
          date: res.date,
          dueDate: res.dueDate,
          items: (res.items || []).map((it: any) => ({
            id: String(it.id),
            clothingTypeId: String(it.clothingTypeId || ''),
            clothingTypeName: it.clothingTypeName,
            quantity: it.quantity,
            price: it.price,
            description: it.description
          })),
          totalAmount: res.totalAmount,
          discount: res.discount,
          grandTotal: res.grandTotal,
          paid: Boolean(res.paid),
          notes: res.notes
        };
      }),
      catchError((err) => {
        const msg = err?.error?.error || err?.error?.message || 'Failed to save invoice on server.';
        this.showToast(msg, 'danger');
        return of(null);
      })
    );
  }

  updateBill(id: string, bill: Omit<Bill, 'id' | 'billNumber'>): Observable<any> {
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

    return this.http.put(`${this.apiUrl}/billing/${numericId}`, payload).pipe(
      tap(() => {
        this.showToast(`Invoice ${payload.billNumber} updated!`);
        this.refreshData();
      }),
      catchError((err) => {
        const msg = err?.error?.error || err?.error?.message || `Failed to update invoice ${payload.billNumber}.`;
        this.showToast(msg, 'danger');
        return of(null);
      })
    );
  }

  deleteBill(id: string): Observable<any> {
    const numericId = Number(id);

    return this.http.delete(`${this.apiUrl}/billing/${numericId}`).pipe(
      tap(() => {
        this.showToast('Invoice deleted successfully!', 'danger');
        this.refreshData();
      }),
      catchError((err) => {
        const msg = err?.error?.error || err?.error?.message || 'Failed to delete invoice.';
        this.showToast(msg, 'danger');
        return of(null);
      })
    );
  }

  toggleBillPaid(id: string): Observable<Bill | null> {
    const numericId = Number(id);

    return this.http.patch<any>(`${this.apiUrl}/billing/${numericId}/paid`, {}).pipe(
      map(res => {
        const isPaid = Boolean(res.paid);
        const updated = this.billsSignal().map(b =>
          b.id === id ? { ...b, paid: isPaid } : b
        );
        this.billsSignal.set(updated);
        this.showToast(isPaid ? 'Invoice marked as Paid!' : 'Invoice marked as Unpaid!', 'success');
        return {
          id: String(res.id),
          billNumber: res.billNumber,
          customerName: res.customerName,
          mobileNumber: res.mobileNumber,
          date: res.date,
          dueDate: res.dueDate,
          totalAmount: res.totalAmount || 0,
          discount: res.discount || 0,
          grandTotal: res.grandTotal || 0,
          paid: isPaid,
          notes: res.notes || '',
          items: (res.items || []).map((it: any) => ({
            id: String(it.id),
            clothingTypeId: String(it.clothingTypeId || ''),
            clothingTypeName: it.clothingTypeName,
            quantity: it.quantity || 1,
            price: it.price || 0,
            description: it.description || ''
          }))
        };
      }),
      catchError((err) => {
        const msg = err?.error?.error || err?.error?.message || 'Failed to update invoice payment status.';
        this.showToast(msg, 'danger');
        return of(null);
      })
    );
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
      catchError((err) => {
        if (err?.status !== 401) {
          this.showToast('API Error: Could not fetch measurements from server.', 'danger');
        }
        return of({
          content: [],
          pageNumber: page,
          pageSize: size,
          totalElements: 0,
          totalPages: 0,
          last: true
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
          dueDate: item.dueDate,
          totalAmount: item.totalAmount || 0,
          discount: item.discount || 0,
          grandTotal: item.grandTotal || 0,
          paid: Boolean(item.paid),
          notes: item.notes || '',
          items: (item.items || []).map((it: any) => ({
            id: String(it.id),
            clothingTypeId: String(it.clothingTypeId || ''),
            clothingTypeName: item.clothingTypeName,
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
      catchError((err) => {
        if (err?.status !== 401) {
          this.showToast('API Error: Could not fetch billing records from server.', 'danger');
        }
        return of({
          content: [],
          pageNumber: page,
          pageSize: size,
          totalElements: 0,
          totalPages: 0,
          last: true
        });
      })
    );
  }

  // --- Invoice Draft DB Endpoints ---
  saveDraft(draft: InvoiceDraft): Observable<InvoiceDraft | null> {
    return this.http.post<InvoiceDraft>(`${this.apiUrl}/drafts`, draft).pipe(
      catchError(() => of(null))
    );
  }

  getDraft(id: string): Observable<InvoiceDraft | null> {
    return this.http.get<InvoiceDraft>(`${this.apiUrl}/drafts/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  deleteDraft(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/drafts/${id}`).pipe(
      catchError(() => of(undefined))
    );
  }
}
