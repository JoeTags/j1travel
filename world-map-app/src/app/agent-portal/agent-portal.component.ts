import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { collection, doc, Firestore } from '@angular/fire/firestore';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadBytesResumable,
} from '@angular/fire/storage';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { environment } from '../../environments/environments';
import { Agent } from '../interfaces/agent.model';
import { PaymentService } from '../payments/payments.service';
import { AgentService } from './agent.service';

@Component({
  selector: 'app-agent-portal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    //HttpClientModule,
    RouterModule,
  ],
  templateUrl: './agent-portal.component.html',
  styleUrls: ['./agent-portal.component.scss'],
})
export class AgentPortalComponent implements OnInit {
  agentForm: FormGroup;
  paymentSuccess: boolean = false;

  constructor(
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private agentService: AgentService,
    private paymentService: PaymentService,
    private firestore: Firestore,
    private storage: Storage,
    private router: Router,
    private route: ActivatedRoute
  ) {
    console.log('Firestore initialized:', firestore);
    //todo: replace with FireStorage or DB
    this.agentForm = this.fb.group({
      name: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      description: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      membership: ['', Validators.required],
      visaCopy: [null, Validators.required],
      photo: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.paymentSuccess = params['paymentSuccess'] === 'true';
      if (this.paymentSuccess) {
        console.log('Payment was successful. Continue registration.');
      }
    });
  }

  // onSubmit() {
  //   if (this.agentForm.valid) {
  //     // Generate a unique agent ID
  //     const agentId = doc(collection(this.firestore, 'agents')).id;

  //     // Begin the Observable chain
  //     this.uploadFiles(agentId)
  //       .pipe(
  //         switchMap(({ visaUrl, photoUrl }) =>
  //           this.getLocationFromAddress(
  //             this.agentForm.get('city')?.value,
  //             this.agentForm.get('country')?.value
  //           ).pipe(
  //             map((location) => ({
  //               agentData: {
  //                 id: agentId,
  //                 name: this.agentForm.get('name')?.value,
  //                 city: this.agentForm.get('city')?.value,
  //                 country: this.agentForm.get('country')?.value,
  //                 description: this.agentForm.get('description')?.value,
  //                 email: this.agentForm.get('email')?.value,
  //                 membership: this.agentForm.get('membership')?.value,
  //                 visaUrl,
  //                 photoUrl,
  //                 location,
  //               } as Agent,
  //             }))
  //           )
  //         ),
  //         switchMap(({ agentData }) => this.agentService.addAgent(agentData)),
  //         tap(() => {
  //           // Handle success (e.g., show a success message)
  //           console.log('Agent added successfully');
  //         }),
  //         catchError((error) => {
  //           // Handle errors here
  //           console.error('Error occurred:', error);
  //           return of(); // Return an empty observable to complete the chain
  //         })
  //       )
  //       .subscribe();
  //   }
  // }

  onSubmit() {
    if (this.agentForm.valid && this.paymentSuccess) {
      // Extract form values
      const membership = this.agentForm.get('membership')?.value;
      const amount = this.getMembershipAmount(membership);
      this.router.navigate(['/payment'], { queryParams: { amount } });
      const agentId = doc(collection(this.firestore, 'agents')).id;

      // Begin the Observable chain
      this.paymentService
        .checkout(amount)
        .pipe(
          switchMap(() => this.uploadFiles(agentId)),
          switchMap(({ visaUrl, photoUrl }) =>
            this.getLocationFromAddress(
              this.agentForm.get('city')?.value,
              this.agentForm.get('country')?.value
            ).pipe(
              map((location) => ({
                agentData: {
                  id: agentId,
                  name: this.agentForm.get('name')?.value,
                  city: this.agentForm.get('city')?.value,
                  country: this.agentForm.get('country')?.value,
                  description: this.agentForm.get('description')?.value,
                  email: this.agentForm.get('email')?.value,
                  membership,
                  visaUrl: this.agentForm.get('visaCopy')?.value,
                  photoUrl: this.agentForm.get('photo')?.value,
                  location,
                } as Agent,
              }))
            )
          ),
          switchMap(({ agentData }) => this.agentService.addAgent(agentData)),
          tap(() => {
            // Handle success (e.g., show a success message)
            console.log('Agent added successfully');
          }),
          catchError((error) => {
            // Handle errors here
            console.error('Error occurred:', error);
            return of(); // Return an empty observable to complete the chain
          })
        )
        .subscribe();
    }
  }
  getMembershipAmount(membership: string): number {
    switch (membership) {
      case '25':
        return 25; // Example amount for "basic" membership
      case '50':
        return 50; // Example amount for "premium" membership
      case '75':
        return 75;
      default:
        return 0;
    }
  }

  uploadFiles(
    agentId: string
  ): Observable<{ visaUrl: string; photoUrl: string }> {
    const visaFile = this.agentForm.get('visaCopy')?.value;
    const photoFile = this.agentForm.get('photo')?.value;

    const visaFilePath = `visas/${agentId}/${visaFile.name}`;
    const photoFilePath = `photos/${agentId}/${photoFile.name}`;

    // Create storage references
    const visaRef = ref(this.storage, visaFilePath);
    const photoRef = ref(this.storage, photoFilePath);

    // Upload files
    const visaUploadTask = uploadBytesResumable(visaRef, visaFile);
    const photoUploadTask = uploadBytesResumable(photoRef, photoFile);

    // Monitor upload progress and get URLs

    const visaUrl$ = new Observable<string>((observer) => {
      visaUploadTask.on(
        'state_changed',
        null,
        (error) => observer.error(error),
        () => {
          getDownloadURL(visaRef).then((url) => {
            observer.next(url);
            observer.complete();
          });
        }
      );
    });

    const photoUrl$ = new Observable<string>((observer) => {
      photoUploadTask.on(
        'state_changed',
        null,
        (error) => observer.error(error),
        () => {
          getDownloadURL(photoRef).then((url) => {
            observer.next(url);
            observer.complete();
          });
        }
      );
    });
    // Wait for both URLs to be available
    return forkJoin({
      visaUrl: visaUrl$,
      photoUrl: photoUrl$,
    });
  }

  getLocationFromAddress(
    city: string,
    country: string
  ): Observable<{ latitude: number; longitude: number }> {
    const address = `${city}, ${country}`;
    const accessToken = environment.mapboxAccessToken;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?access_token=${accessToken}`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const [longitude, latitude] = res.features[0].center;
        console.log('lat:', latitude, 'long:', longitude);
        return { latitude, longitude };
      })
    );
  }

  onVisaCopySelected(event: any) {
    const file = event.target.files[0];
    this.agentForm.patchValue({ visaCopy: file });
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    this.agentForm.patchValue({ photo: file });
  }
}
