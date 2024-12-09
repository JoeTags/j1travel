import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { collection, doc, Firestore } from '@angular/fire/firestore';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { Agent } from '../interfaces/agent.model';
import { AgentService } from './agent.service';

@Component({
  selector: 'app-agent-portal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
  ],
  templateUrl: './agent-portal.component.html',
  styleUrls: ['./agent-portal.component.scss'],
  // providers: [
  //   { provide: Firestore, useFactory: () => getFirestore() }, // Explicit Firestore provider
  //   {
  //     provide: AgentService,
  //     useClass: AgentService, // Provide AgentService explicitly
  //   },
  //   {
  //     provide: 'FirebaseApp',
  //     useFactory: () => initializeApp(environment.firebase), // Firebase Initialization
  //   },
  // ],
})
export class AgentPortalComponent implements OnInit {
  agentForm: FormGroup;
  paymentService: any;

  constructor(
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private agentService: AgentService,
    private firestore: Firestore
  ) {
    console.log('Firestore initialized:', firestore);
    //todo: replace with FireStorage or DB
    this.agentForm = this.fb.group({
      name: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      description: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      membership: [''], //Validators.required],
      visaCopy: [null], //Validators.required],
      photo: [null], //Validators.required],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.agentForm.valid) {
      // Generate a unique agent ID
      const agentId = doc(collection(this.firestore, 'agents')).id;

      // Begin the Observable chain
      this.uploadFiles(agentId)
        .pipe(
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
                  membership: this.agentForm.get('membership')?.value,
                  visaUrl,
                  photoUrl,
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

  // onSubmit() {
  //   if (this.agentForm.valid) {
  //     // Extract form values
  //     const membership = this.agentForm.get('membership')?.value;
  //     const amount = 25; //this.getMembershipAmount(membership);
  //     const agentId = doc(collection(this.firestore, 'agents')).id;

  //     // Begin the Observable chain
  //     this.paymentService
  //       .checkout(amount)
  //       .pipe(
  //         switchMap(() => this.uploadFiles(agentId)),
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
  //                 membership,
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
  // getMembershipAmount(membership: any) {
  //   throw new Error('Method not implemented.');
  // }

  uploadFiles(
    agentId: string
  ): Observable<{ visaUrl: string; photoUrl: string }> {
    // const visaFile = this.agentForm.get('visaCopy')?.value;
    // const photoFile = this.agentForm.get('photo')?.value;

    // const visaFilePath = `visas/${agentId}/${visaFile.name}`;
    // const photoFilePath = `photos/${agentId}/${photoFile.name}`;

    // const visaRef = this.storage.ref(visaFilePath);
    // const photoRef = this.storage.ref(photoFilePath);

    // const visaUploadTask = this.storage.upload(visaFilePath, visaFile);
    // const photoUploadTask = this.storage.upload(photoFilePath, photoFile);

    const visaUrl$ = 'visa';
    // visaUploadTask.snapshotChanges().pipe(
    //   finalize(() => {}),
    //   switchMap(() => visaRef.getDownloadURL())
    // );

    const photoUrl$ = 'photo';
    // photoUploadTask.snapshotChanges().pipe(
    //   finalize(() => {}),
    //   switchMap(() => photoRef.getDownloadURL())
    // );

    // // Wait for both URLs to be available
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
