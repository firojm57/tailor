import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';

/**
 * Unit tests for StorageService — toast, signal state, and HTTP delegation.
 */
describe('StorageService', () => {
  let service: StorageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        StorageService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(StorageService);
    httpMock = TestBed.inject(HttpTestingController);
    // No token in localStorage → constructor does NOT call refreshData → no pending requests
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ── Creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Toast notifications ───────────────────────────────────────────────────

  it('showToast(): sets toastMessage signal with text and type', () => {
    service.showToast('Invoice saved!', 'success');
    expect(service.toastMessage()?.text).toBe('Invoice saved!');
    expect(service.toastMessage()?.type).toBe('success');
  });

  it('showToast(): defaults type to "success" when not specified', () => {
    service.showToast('Done');
    expect(service.toastMessage()?.type).toBe('success');
  });

  it('showToast(): danger type is preserved', () => {
    service.showToast('Error occurred!', 'danger');
    expect(service.toastMessage()?.type).toBe('danger');
  });

  it('showToast(): info type is preserved', () => {
    service.showToast('Processing...', 'info');
    expect(service.toastMessage()?.type).toBe('info');
  });

  it('clearToast(): sets toastMessage to null', () => {
    service.showToast('Some message', 'info');
    service.clearToast();
    expect(service.toastMessage()).toBeNull();
  });

  it('clearToast(): is safe to call when no toast is active', () => {
    expect(() => service.clearToast()).not.toThrow();
  });

  // ── Initial signal state ──────────────────────────────────────────────────

  it('clothingTypes() should be empty when localStorage is empty', () => {
    expect(service.clothingTypes()).toEqual([]);
  });

  it('measurements() should be empty when localStorage is empty', () => {
    expect(service.measurements()).toEqual([]);
  });

  it('bills() should be empty when localStorage is empty', () => {
    expect(service.bills()).toEqual([]);
  });

  // ── Stats computed signal ─────────────────────────────────────────────────

  it('stats() should return all zeros when no data is loaded', () => {
    const stats = service.stats();
    expect(stats.totalCustomers).toBe(0);
    expect(stats.totalEarnings).toBe(0);
    expect(stats.totalMeasurements).toBe(0);
    expect(stats.totalBills).toBe(0);
  });

  // ── Customer search ───────────────────────────────────────────────────────

  it('searchCustomerSuggestions(): returns empty array for blank query', () => {
    let result: any[] = [{ placeholder: true }];
    service.searchCustomerSuggestions('').subscribe(r => { result = r; });
    httpMock.expectNone(() => true);
    expect(result).toEqual([]);
  });

  it('searchCustomerSuggestions(): returns empty array for whitespace-only query', () => {
    let result: any[] = [{ placeholder: true }];
    service.searchCustomerSuggestions('   ').subscribe(r => { result = r; });
    httpMock.expectNone(() => true);
    expect(result).toEqual([]);
  });

  it('searchCustomerSuggestions(): makes an HTTP request for non-empty query', () => {
    service.searchCustomerSuggestions('Ali').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/customers/search'));
    expect(req.request.urlWithParams).toContain('query=ali');
    req.flush([{ mobile: '9000000001', name: 'Alice' }]);
  });

  // ── Toggle Bill Paid ──────────────────────────────────────────────────────

  it('toggleBillPaid(): sends PATCH to /billing/:id/paid and updates paid signal', () => {
    let result: any = null;
    service.toggleBillPaid('101').subscribe(res => {
      result = res;
    });

    const req = httpMock.expectOne(r => r.url.includes('/billing/101/paid'));
    expect(req.request.method).toBe('PATCH');
    req.flush({
      id: 101,
      billNumber: 'INV-101',
      customerName: 'Customer X',
      mobileNumber: '9999999999',
      date: '2026-09-06',
      totalAmount: 1500,
      grandTotal: 1500,
      paid: true,
      items: []
    });

    expect(result).toBeTruthy();
    expect(result.paid).toBe(true);
    expect(service.toastMessage()?.text).toBe('Invoice marked as Paid!');
  });
});
