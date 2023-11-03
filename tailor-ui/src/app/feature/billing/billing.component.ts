import { Component, OnInit } from '@angular/core';
import { BillDetail, Billing } from 'src/app/model/billing.model';
import { BillingService } from 'src/app/service/billing/billing.service';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {
  billingList: Billing [] = [];
  selectedBill: BillDetail | null = null;
  searchTerm: string = '';
  billTotal: number = 0;
  advance: number = 100;

  constructor(private billingService: BillingService) {
  }

  ngOnInit(): void {
    this.billingService.getAllBills().subscribe((value: Billing[]) => {
      this.billingList = value;
    });
  }

  printInvoice() {
    console.info("print");
  }

  onBackClick() {
    this.selectedBill = null;
  }

  onBillClick(bill: Billing) {
    this.billingService.getBillDetails(bill.billId).subscribe((value: BillDetail) =>{
      if(value) {
        this.selectedBill = value;
        if(this.selectedBill.billingItems) {
          for(let item of this.selectedBill.billingItems) {
            this.billTotal += (item.quantity * item.rate);
          }
        }
      }
    });
  }
}
