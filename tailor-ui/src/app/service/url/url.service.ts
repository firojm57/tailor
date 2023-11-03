import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  private apiBaseUrl: string = environment.apiUrl;

  constructor() { }

  getAllBillings(): string {
    return `${this.apiBaseUrl}/bills`;
  }

  getBillDetails(billId: string): string {
    return `${this.apiBaseUrl}/bills/${billId}`;
  }
}
