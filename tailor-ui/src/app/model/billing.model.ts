import { Customer } from "./customer.model";

export class Billing {
  constructor(
    public billId: string,
    public custId: number,
    public custName: string,
    public custMobile: string
  ) { }
}

export class BillingItem {
  constructor(
    public type: string,
    public quantity: number,
    public rate: number,
    public measurement: Map<string, any>
  ) {}
}

export class BillDetail {
  constructor(
    public billId: string,
    public billDate: string,
    public dueDate: string,
    public paidAmount: number,
    public pendingAmount: number,
    public customer: Customer,
    public billingItems: BillingItem[]
  ) {}
}