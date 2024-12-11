import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StripeService } from 'ngx-stripe';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private backendUrl = 'http://localhost:4242'; // Replace with your backend URL

  constructor(private http: HttpClient, private stripeService: StripeService) {}

  checkout(amount: number): Observable<Object> {
    // Replace with your actual payment processing endpoint
    return this.http.post('/api/process-payment', { amount });
  }

  /**
   * Create a payment intent by calling your backend server.
   * @param amount The payment amount in the smallest currency unit (e.g., cents).
   * @returns An Observable that emits the client secret from the PaymentIntent.
   */
  createPaymentIntent(amount: number): Observable<{ clientSecret: string }> {
    return this.http.post<{ clientSecret: string }>(
      `${this.backendUrl}/create-payment-intent`,
      { amount }
    );
  }

  /**
   * Confirm the payment using Stripe.js
   * @param clientSecret The client secret from the PaymentIntent.
   * @param cardElement The card element from ngx-stripe.
   * @param billingDetails Billing details for the cardholder.
   * @returns An Observable with the payment result.
   */
  confirmPayment(
    clientSecret: string,
    cardElement: any,
    billingDetails: { name: string; email?: string }
  ): Observable<any> {
    return this.stripeService.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: billingDetails,
      },
    });
  }
}
