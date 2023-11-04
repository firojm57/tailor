import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  private apiBaseUrl: string = environment.apiUrl;

  constructor() { }

  getBillingEndpoint(): string {
    return `${this.apiBaseUrl}/bills`;
  }

  getBillingIdEndpoint(billId: string): string {
    return `${this.apiBaseUrl}/bills/${billId}`;
  }

  getVarietiesEndpoint(): string {
    return `${this.apiBaseUrl}/varieties`;
  }

  getVarietyIdEndpoint(type: number): string {
    return `${this.apiBaseUrl}/varieties/${type}`;
  }
}
