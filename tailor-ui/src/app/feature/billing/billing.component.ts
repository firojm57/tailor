import { Component, OnInit } from '@angular/core';
import { Billing } from 'src/app/model/billing.model';
import { BillingService } from 'src/app/service/billing/billing.service';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {
  billingList: Billing [] = [];
  selectedBill: Billing | null = null;
  listView: boolean;
  searchTerm: string = '';

  constructor(private billingService: BillingService) {
    this.listView = true;
  }

  ngOnInit(): void {
    this.billingService.getAllBills().subscribe((value: Billing[]) => {
      this.billingList = value;
    });
  }

  printInvoice() {
    console.info("print");
  }

  onBillClick(bill: Billing) {
    this.selectedBill = bill;
    this.listView = false;
  }
}
