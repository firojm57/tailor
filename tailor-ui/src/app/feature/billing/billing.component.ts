import { Component, OnInit } from '@angular/core';
import { BillDetail, Billing } from 'src/app/model/billing.model';
import { ApiService } from 'src/app/service/api/api.service';

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

  constructor(private apiService: ApiService) {
  }

  ngOnInit(): void {
    this.apiService.getAllBills().subscribe((value: Billing[]) => {
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
    this.apiService.getBillDetails(bill.billId).subscribe((value: BillDetail) =>{
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
