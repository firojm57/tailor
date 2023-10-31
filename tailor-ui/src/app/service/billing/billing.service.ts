import { Injectable } from '@angular/core';
import { UrlService } from '../url/url.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Billing } from 'src/app/model/billing.model';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(private http: HttpClient, private url: UrlService) { }

  getAllBills(): Observable<any> {
    return this.http.get<Billing>(this.url.getAllBillings());
  }
}
