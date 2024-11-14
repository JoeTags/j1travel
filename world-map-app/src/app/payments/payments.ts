// payment.service.ts
import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private stripePromise: Promise<Stripe | null>;

  constructor() {
    this.stripePromise = loadStripe('YOUR_STRIPE_PUBLISHABLE_KEY');
  }

  async checkout(amount: number) {
    const stripe = await this.stripePromise;

    if (stripe) {
      // Call backend to create a PaymentIntent
      // Redirect to Stripe Checkout or handle payment on the page
    }
  }
}
