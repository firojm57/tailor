import { Injectable } from '@angular/core';
import { UrlService } from '../url/url.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BillDetail, Billing } from 'src/app/model/billing.model';
import { Variety, VarietyRequest } from 'src/app/model/variety.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private url: UrlService) { }

  getAllBills(): Observable<Billing[]> {
    return this.http.get<Billing[]>(this.url.getBillingEndpoint());
  }

  getBillDetails(billId: string): Observable<BillDetail> {
    return this.http.get<BillDetail>(this.url.getBillingIdEndpoint(billId));
  }

  getAllVarieties(): Observable<Variety[]> {
    return this.http.get<Variety[]>(this.url.getVarietiesEndpoint())
  }

  saveVariety(requestVar: Variety): Observable<any> {
    return this.http.post<any>(this.url.getVarietiesEndpoint(), requestVar);
  }

  updateVariety(requestVar: VarietyRequest): Observable<any> {
    return this.http.put<any>(this.url.getVarietiesEndpoint(), requestVar);
  }

  deleteVarietyById(id: number): Observable<any> {
    return this.http.delete(this.url.getVarietyIdEndpoint(id));
  }

}
