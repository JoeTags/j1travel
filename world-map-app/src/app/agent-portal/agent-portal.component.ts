import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import {
  catchError,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { Agent } from '../interfaces/agent.model';

@Component({
  selector: 'app-agent-portal',
  templateUrl: './agent-portal.component.html',
  styleUrls: ['./agent-portal.component.scss'],
})
export class AgentPortalComponent implements OnInit {
  agentForm: FormGroup;
  paymentService: any;
  firestore: any;
  agentService: any;

  constructor(
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private storage: AngularFireStorage
  ) {
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

  ngOnInit(): void {}

  onSubmit() {
    if (this.agentForm.valid) {
      // Extract form values
      const membership = this.agentForm.get('membership')?.value;
      const amount = this.getMembershipAmount(membership);
      const agentId = this.firestore.createId();

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
  getMembershipAmount(membership: any) {
    throw new Error('Method not implemented.');
  }

  uploadFiles(
    agentId: string
  ): Observable<{ visaUrl: string; photoUrl: string }> {
    const visaFile = this.agentForm.get('visaCopy')?.value;
    const photoFile = this.agentForm.get('photo')?.value;

    const visaFilePath = `visas/${agentId}/${visaFile.name}`;
    const photoFilePath = `photos/${agentId}/${photoFile.name}`;

    const visaRef = this.storage.ref(visaFilePath);
    const photoRef = this.storage.ref(photoFilePath);

    const visaUploadTask = this.storage.upload(visaFilePath, visaFile);
    const photoUploadTask = this.storage.upload(photoFilePath, photoFile);

    const visaUrl$ = visaUploadTask.snapshotChanges().pipe(
      finalize(() => {}),
      switchMap(() => visaRef.getDownloadURL())
    );

    const photoUrl$ = photoUploadTask.snapshotChanges().pipe(
      finalize(() => {}),
      switchMap(() => photoRef.getDownloadURL())
    );

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
