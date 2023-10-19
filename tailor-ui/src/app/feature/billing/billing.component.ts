import { Component } from '@angular/core';
import { Billing } from 'src/app/model/billing.model';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent {
  billingList: Billing [] = [];
  selectedBill: Billing | null = null;
  listView: boolean;
  searchTerm: string = '';

  constructor() {
    this.billingList.push(new Billing("1", "John", "9876543210"));
    this.billingList.push(new Billing("2", "Smith", "9638527410"));
    this.billingList.push(new Billing("3", "Clara", "9517538520"));
    this.listView = true;
  }

  printInvoice() {
    console.info("print");
  }

  onBillClick(bill: Billing) {
    this.selectedBill = bill;
    this.listView = false;
  }
}
