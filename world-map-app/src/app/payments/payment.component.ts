import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  StripeCardElementOptions,
  StripeElementsOptions,
} from '@stripe/stripe-js';

import { StripeCardComponent, StripeService } from 'ngx-stripe';
import { CommonUtils } from '../utils/common-utils';
import { PaymentService } from './payments.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  imports: [ReactiveFormsModule, StripeCardComponent],
})
export class PaymentComponent implements OnInit, AfterViewInit {
  // test card: 4242 4242 4242 4242
  amount: number = 0;
  paymentForm: FormGroup;
  @ViewChild(StripeCardComponent)
  card!: StripeCardComponent;
  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        fontWeight: 300,
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#CFD7E0',
        },
      },
    },
  };
  elementsOptions: StripeElementsOptions = {
    locale: 'en',
  };

  constructor(
    private fb: FormBuilder,
    private stripeService: StripeService,
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.paymentForm = this.fb.group({
      name: ['', [Validators.required]],
      // email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    // Get the amount from the query parameters
    this.route.queryParams.subscribe((params) => {
      this.amount = +params['amount'];
    });
  }

  ngAfterViewInit(): void {
    if (this.card) {
      console.log('Stripe Card Initialized:', this.card);
    } else {
      console.error('Stripe Card not initialized');
    }
  }

  pay(): void {
    if (!CommonUtils.isNullOrUndefined(this.card)) {
      if (this.paymentForm.valid) {
        const { name } = this.paymentForm.value; //email

        // Step 1: Create Payment Intent
        this.paymentService
          .createPaymentIntent(1000)
          .subscribe(({ clientSecret }) => {
            // Step 2: Confirm Payment
            this.paymentService
              .confirmPayment(clientSecret, this.card.element, { name }) //email
              .subscribe((result) => {
                if (result.error) {
                  console.error('Payment failed:', result.error.message);
                } else if (result.paymentIntent.status === 'succeeded') {
                  console.log('Payment succeeded!');
                  this.router.navigate(['/agent-portal'], {
                    queryParams: { paymentSuccess: true },
                  });
                }
              });
          });
      }
    }
  }
}
