import { Component } from '@angular/core';
import { Customer } from 'src/app/model/customer.model';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent {
  searchTerm: string = '';
  customers: Customer [] = [];
  selectedCustomer: Customer | null = null;

  constructor() {
    this.customers.push(new Customer("1", "John", "9876543210", "Solapur, India"));
    this.customers.push(new Customer("2", "Smith", "9638527410", "Pune, India"));
    this.customers.push(new Customer("3", "Clara", "9517538520", "Hyderabad, India"));
  }

  onCustomerClick(customer: Customer) {
    this.selectedCustomer = customer;
  }

  onEditCustomer(customer: Customer | null) {

  }

  onDeleteCustomer(id: string) {
    
  }

  onEditCustomerRow(id: string) {

  }

  closeCustomerDetails() {
    this.selectedCustomer = null;
  }
}
