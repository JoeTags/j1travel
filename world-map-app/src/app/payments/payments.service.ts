import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private http: HttpClient) {}

  checkout(amount: number): Observable<Object> {
    // Replace with your actual payment processing endpoint
    return this.http.post('/api/process-payment', { amount });
  }
}
