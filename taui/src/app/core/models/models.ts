export interface ClothingType {
  id: string;
  name: string;
  fields: string[]; // List of measurement fields (e.g. Length, Sleeve Length, Chest, Waist, Inseam)
}

export interface CustomerMeasurement {
  id: string;
  customerName: string;
  mobileNumber: string;
  date: string; // YYYY-MM-DD
  deliveryDate?: string; // Expected Delivery Date
  clothingTypeId: string;
  clothingTypeName: string;
  values: Record<string, string>; // e.g. { "Length": "40", "Chest": "38" }
}

export interface BillItem {
  id: string;
  clothingTypeId: string;
  clothingTypeName: string;
  quantity: number;
  price: number;
  description: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  customerName: string;
  mobileNumber: string;
  date: string; // YYYY-MM-DD
  dueDate?: string; // Expected Delivery Date (YYYY-MM-DD)
  items: BillItem[];
  totalAmount: number;
  discount: number;
  grandTotal: number;
  paid: boolean;
  notes?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalEarnings: number;
  totalMeasurements: number;
  totalBills: number;
}
