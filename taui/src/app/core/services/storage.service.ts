import { Injectable, signal, computed } from '@angular/core';
import { ClothingType, CustomerMeasurement, Bill, DashboardStats } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // Signals representing the state
  private readonly clothingTypesSignal = signal<ClothingType[]>([]);
  private readonly measurementsSignal = signal<CustomerMeasurement[]>([]);
  private readonly billsSignal = signal<Bill[]>([]);
  readonly globalSearchQuery = signal<string>('');

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
      .reduce((sum, b) => sum + b.grandTotal, 0);

    return {
      totalCustomers: uniqueMobiles.size,
      totalEarnings,
      totalMeasurements: this.measurementsSignal().length,
      totalBills: this.billsSignal().length
    };
  });

  constructor() {
    this.initData();
  }

  private initData(): void {
    // 1. Load clothing types
    let types = localStorage.getItem('tailor_clothing_types');
    if (!types) {
      const defaultTypes: ClothingType[] = [
        {
          id: 'type-shirt',
          name: 'Shirt',
          fields: ['Length', 'Chest', 'Sleeve Length', 'Collar', 'Shoulder', 'Cuff']
        },
        {
          id: 'type-pant',
          name: 'Pant',
          fields: ['Length', 'Waist', 'Hip', 'Inseam', 'Thigh', 'Bottom Width']
        },
        {
          id: 'type-tshirt',
          name: 'T-Shirt',
          fields: ['Length', 'Chest', 'Shoulder', 'Sleeve Length']
        }
      ];
      localStorage.setItem('tailor_clothing_types', JSON.stringify(defaultTypes));
      types = JSON.stringify(defaultTypes);
    }
    this.clothingTypesSignal.set(JSON.parse(types));

    // 2. Load measurements
    let meas = localStorage.getItem('tailor_measurements');
    if (!meas) {
      const today = new Date().toISOString().split('T')[0];
      const defaultMeas: CustomerMeasurement[] = [
        {
          id: 'm-1',
          customerName: 'John Doe',
          mobileNumber: '9876543210',
          date: today,
          clothingTypeId: 'type-shirt',
          clothingTypeName: 'Shirt',
          values: {
            'Length': '30',
            'Chest': '40',
            'Sleeve Length': '24',
            'Collar': '15.5',
            'Shoulder': '18',
            'Cuff': '9.5'
          }
        },
        {
          id: 'm-2',
          customerName: 'Alex Smith',
          mobileNumber: '9988776655',
          date: today,
          clothingTypeId: 'type-pant',
          clothingTypeName: 'Pant',
          values: {
            'Length': '41',
            'Waist': '34',
            'Hip': '40',
            'Inseam': '31',
            'Thigh': '22',
            'Bottom Width': '16'
          }
        }
      ];
      localStorage.setItem('tailor_measurements', JSON.stringify(defaultMeas));
      meas = JSON.stringify(defaultMeas);
    }
    this.measurementsSignal.set(JSON.parse(meas));

    // 3. Load bills
    let billsStr = localStorage.getItem('tailor_bills');
    if (!billsStr) {
      const today = new Date().toISOString().split('T')[0];
      const defaultBills: Bill[] = [
        {
          id: 'b-1',
          billNumber: 'B-1001',
          customerName: 'John Doe',
          mobileNumber: '9876543210',
          date: today,
          items: [
            {
              id: 'bi-1',
              clothingTypeId: 'type-shirt',
              clothingTypeName: 'Shirt',
              quantity: 2,
              price: 350,
              description: 'Cotton shirt sewing service'
            }
          ],
          totalAmount: 700,
          discount: 50,
          grandTotal: 650,
          paid: true,
          notes: 'Standard stitching'
        }
      ];
      localStorage.setItem('tailor_bills', JSON.stringify(defaultBills));
      billsStr = JSON.stringify(defaultBills);
    }
    this.billsSignal.set(JSON.parse(billsStr));
  }

  // --- Clothing Type CRUD ---
  saveClothingTypes(types: ClothingType[]): void {
    localStorage.setItem('tailor_clothing_types', JSON.stringify(types));
    this.clothingTypesSignal.set(types);
  }

  addClothingType(name: string, fields: string[]): ClothingType {
    const newType: ClothingType = {
      id: 'type-' + Date.now(),
      name,
      fields
    };
    const current = this.clothingTypesSignal();
    this.saveClothingTypes([...current, newType]);
    return newType;
  }

  updateClothingType(id: string, name: string, fields: string[]): void {
    const updated = this.clothingTypesSignal().map(t => 
      t.id === id ? { ...t, name, fields } : t
    );
    this.saveClothingTypes(updated);

    // Update denormalized type names in measurements
    const currentMeas = this.measurementsSignal();
    let changed = false;
    const updatedMeas = currentMeas.map(m => {
      if (m.clothingTypeId === id && m.clothingTypeName !== name) {
        changed = true;
        return { ...m, clothingTypeName: name };
      }
      return m;
    });
    if (changed) {
      this.saveMeasurements(updatedMeas);
    }
  }

  deleteClothingType(id: string): void {
    const filtered = this.clothingTypesSignal().filter(t => t.id !== id);
    this.saveClothingTypes(filtered);
  }

  // --- Customer Measurement CRUD ---
  saveMeasurements(meas: CustomerMeasurement[]): void {
    localStorage.setItem('tailor_measurements', JSON.stringify(meas));
    this.measurementsSignal.set(meas);
  }

  addMeasurement(measurement: Omit<CustomerMeasurement, 'id'>): CustomerMeasurement {
    const newMeas: CustomerMeasurement = {
      ...measurement,
      id: 'm-' + Date.now()
    };
    const current = this.measurementsSignal();
    this.saveMeasurements([newMeas, ...current]);
    return newMeas;
  }

  updateMeasurement(id: string, measurement: Omit<CustomerMeasurement, 'id'>): void {
    const updated = this.measurementsSignal().map(m =>
      m.id === id ? { ...m, ...measurement } : m
    );
    this.saveMeasurements(updated);
  }

  deleteMeasurement(id: string): void {
    const filtered = this.measurementsSignal().filter(m => m.id !== id);
    this.saveMeasurements(filtered);
  }

  getMeasurementsByMobile(mobile: string): CustomerMeasurement[] {
    return this.measurementsSignal().filter(m => m.mobileNumber === mobile);
  }

  // --- Bill CRUD ---
  saveBills(bills: Bill[]): void {
    localStorage.setItem('tailor_bills', JSON.stringify(bills));
    this.billsSignal.set(bills);
  }

  addBill(bill: Omit<Bill, 'id' | 'billNumber'>): Bill {
    const count = this.billsSignal().length + 1001;
    const newBill: Bill = {
      ...bill,
      id: 'b-' + Date.now(),
      billNumber: 'B-' + count
    };
    const current = this.billsSignal();
    this.saveBills([newBill, ...current]);
    return newBill;
  }

  updateBill(id: string, bill: Omit<Bill, 'id' | 'billNumber'>): void {
    const updated = this.billsSignal().map(b =>
      b.id === id ? { ...b, ...bill } : b
    );
    this.saveBills(updated);
  }

  deleteBill(id: string): void {
    const filtered = this.billsSignal().filter(b => b.id !== id);
    this.saveBills(filtered);
  }
}
