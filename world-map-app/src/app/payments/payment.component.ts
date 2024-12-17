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

import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { StripeCardComponent, StripeService } from 'ngx-stripe';
import { catchError, from, of, switchMap, tap, throwError } from 'rxjs';
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
    private firestore: Firestore,
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

  //   pay(): void {
  //     if (!CommonUtils.isNullOrUndefined(this.card)) {
  //       if (this.paymentForm.valid) {
  //         const { name } = this.paymentForm.value; //email

  //         // Step 1: Create Payment Intent
  //         this.paymentService
  //           .createPaymentIntent(this.amount)
  //           .subscribe(({ clientSecret }) => {
  //             // Step 2: Confirm Payment
  //             this.paymentService
  //               .confirmPayment(clientSecret, this.card.element, { name }) //email
  //               .subscribe(async (result) => {
  //                 if (result.error) {
  //                   console.error('Payment failed:', result.error.message);
  //                 } else if (result.paymentIntent.status === 'succeeded') {
  //                   console.log('Payment succeeded!');
  //                   // Update agent status in Firebase
  //                   const agentId = this.route.snapshot.queryParams['agentId'];
  //                   if (!agentId) {
  //                     this.router.navigate(['/register'], {
  //                       queryParams: { paymentSuccess: true },
  //                     });
  //                   } else {
  //                     await setDoc(
  //                       doc(this.firestore, 'agents', agentId),
  //                       { status: 'completed' },
  //                       { merge: true }
  //                     );
  //                     this.router.navigate(['/agent-portal'], {
  //                       queryParams: { agentId, paymentSuccess: true },
  //                     });
  //                   }
  //                 }
  //               });
  //           });
  //       }
  //     }
  //   }
  // }

  pay(): void {
    if (CommonUtils.isNullOrUndefined(this.card)) {
      console.error('Card element is not initialized.');
      return;
    }

    if (!this.paymentForm.valid) {
      console.error('Payment form is invalid. Please provide valid details.');
      return;
    }

    const { name } = this.paymentForm.value; // Extract user input
    const agentId = this.route.snapshot.queryParams['agentId'];

    console.log('Initiating payment process...');

    // Step 1: Create Payment Intent
    this.paymentService
      .createPaymentIntent(this.amount)
      .pipe(
        switchMap(({ clientSecret }) => {
          if (!clientSecret) {
            throw new Error('Failed to retrieve clientSecret for payment.');
          }
          console.log('Client secret received. Confirming payment...');
          // Step 2: Confirm Payment
          return this.paymentService.confirmPayment(
            clientSecret,
            this.card.element,
            { name }
          );
        }),
        switchMap((result) => {
          if (result.error) {
            console.error('Payment failed:', result.error.message);
            return throwError(() => new Error(result.error.message));
          }

          console.log('Payment succeeded!');
          // Check if agentId exists
          if (!agentId) {
            console.warn('No agentId found. Redirecting to registration.');
            this.router.navigate(['/register'], {
              queryParams: { paymentSuccess: true },
            });
            return of(null); // Stop the observable chain here
          } else {
            console.log('Updating agent status in Firebase...');
            const agentRef = doc(this.firestore, 'agents', agentId);
            return from(
              setDoc(agentRef, { status: 'completed' }, { merge: true })
            );
          }
        }),
        tap(() => {
          if (agentId) {
            console.log('Agent status updated successfully.');
            this.router.navigate(['/agent-portal'], {
              queryParams: { agentId, paymentSuccess: true },
            });
          }
        }),
        catchError((error) => {
          console.error('Error during payment process:', error.message);
          alert(`Payment Error: ${error.message}`);
          return of(null); // Gracefully handle the error
        })
      )
      .subscribe();
  }
}
