import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
} from '@angular/fire/auth';
import {
  collection,
  doc,
  Firestore,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';

import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  catchError,
  forkJoin,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { environment } from '../../environments/environments';
import { Agent } from '../interfaces/agent.model';
import { PaymentComponent } from '../payments/payment.component';
import { PaymentService } from '../payments/payments.service';
import { AgentService } from './agent.service';
import { FileUploadService } from './file-upload.service';

@Component({
  selector: 'app-agent-portal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './agent-portal.component.html',
  styleUrls: ['./agent-portal.component.scss'],
})
export class AgentPortalComponent implements OnInit {
  agentForm: FormGroup;
  agentId: string = '';
  paymentSuccess: boolean = false;
  user: any = null;

  constructor(
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private firestore: Firestore,
    private storage: Storage,
    private agentService: AgentService,
    private paymentService: PaymentService,
    private fileUploadService: FileUploadService,
    private dialog: MatDialog
  ) {
    console.log('Firestore initialized:', firestore);
    this.agentForm = this.fb.group({
      name: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      description: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      membership: ['', Validators.required],
      visaCopy: [null],
      photo: [null],
    });
  }

  ngOnInit(): void {
    this.checkAuthentication();
    this.route.queryParams.subscribe((params) => {
      this.paymentSuccess = params['paymentSuccess'] === 'true';
      //todo: not really needed anymore, but getting lat and long from here. clear agent serive state
      const agentId = params['agentId'];
      if (agentId) {
        this.agentId = agentId;
        this.loadDraft(agentId);
      }
      if (this.paymentSuccess) {
        this.continueAgentCreation();
      }
    });
  }
  private checkAuthentication(): void {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User authenticated:', user.uid);
        this.user = user;
      } else {
        console.log('No user authenticated. Signing in anonymously...');
        signInAnonymously(auth).then((cred) => {
          console.log('Anonymous sign-in successful:', cred.user.uid);
          this.user = cred.user;
        });
      }
    });
  }

  onSubmit(): void {
    if (this.agentForm.valid) {
      // Extract membership to calculate the payment amount
      const membership = this.agentForm.get('membership')?.value;
      const amount = this.getMembershipAmount(membership);

      // Save draft and navigate to payment
      this.saveDraft();
      const dialogRef = this.dialog.open(PaymentComponent, {
        data: { amount, agentId: this.agentId },
        panelClass: 'dialog-container',
        width: '400px',
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log('Dialog closed', result);
      });
      // this.router.navigate(['/payment'], {
      //   queryParams: { amount, agentId: this.agentId },
      // });
    }
  }

  /**
   * Helper method to determine payment amount based on membership type.
   */
  private getMembershipAmount(membership: string): number {
    switch (membership) {
      case '25':
        console.log('case 25', membership);
        return 2500;
      case '50':
        return 5000;
      case '100':
        return 10000;
      default:
        return 0;
    }
  }

  private loadDraft(agentId: string): void {
    getDoc(doc(this.firestore, 'agents', agentId)).then((docSnap) => {
      if (docSnap.exists()) {
        this.agentForm.patchValue(docSnap.data());
      }
    });
    //this.getLocationFromAddress()
  }

  saveDraft(): void {
    if (!this.user) {
      console.error('User not authenticated. Cannot save draft.');
      return;
    }

    if (this.agentForm) {
      const agentId =
        this.agentId || doc(collection(this.firestore, 'agents')).id;
      this.agentId = agentId;

      const visaFile = this.agentForm.get('visaCopy')?.value;
      const photoFile = this.agentForm.get('photo')?.value;
      console.log('Visa file, PhotoFile:', visaFile, photoFile);
      const uploadVisa$ = visaFile
        ? this.fileUploadService.uploadFile(
            `visas/${agentId}/${visaFile.name}`,
            visaFile
          )
        : of(null);

      const uploadPhoto$ = photoFile
        ? this.fileUploadService.uploadFile(
            `photos/${agentId}/${photoFile.name}`,
            photoFile
          )
        : of(null);

      forkJoin({ visaUrl: uploadVisa$, photoUrl: uploadPhoto$ })
        .pipe(
          switchMap(({ visaUrl, photoUrl }) => {
            const formData = {
              ...this.agentForm.value,
              visaCopy: visaUrl || null,
              photo: photoUrl || null,
              status: 'draft',
            };
            return from(
              setDoc(doc(this.firestore, 'agents', agentId), formData, {
                merge: true,
              })
            );
          })
        )
        .subscribe({
          next: () => console.log('Draft saved successfully'),
          error: (err) => console.error('Error saving draft:', err),
        });
    }
  }

  continueAgentCreation(): void {
    if (!this.user) {
      // todo: fix this bug
      console.error('User not authenticated. Cannot create agent.');
      return;
    }

    if (this.agentForm.valid) {
      const agentId = this.agentId;
      console.log('agentId:', agentId);
      this.uploadFiles(agentId)
        .pipe(
          switchMap(({ visaUrl, photoUrl }) =>
            this.getLocationFromAddress(
              this.agentForm.get('city')?.value,
              this.agentForm.get('country')?.value
            ).pipe(
              map((location) => ({
                agentData: {
                  ...this.agentForm.value,
                  id: agentId,
                  visaUrl,
                  photoUrl,
                  location,
                } as Agent,
              }))
            )
          ),
          switchMap(({ agentData }) => this.agentService.addAgent(agentData)),
          tap(() => console.log('Agent created successfully')),
          catchError((error) => {
            console.error('Error occurred:', error);
            return of();
          })
        )
        .subscribe();
    }
  }

  private uploadFiles(
    agentId: string
  ): Observable<{ visaUrl: string | null; photoUrl: string | null }> {
    const visaFile = this.agentForm.get('visaCopy')?.value;
    const photoFile = this.agentForm.get('photo')?.value;
    console.log('Visa file, PhotoFile:', visaFile, photoFile);

    const uploadVisa$ = visaFile
      ? this.fileUploadService.uploadFile(
          `visas/${agentId}/${visaFile.name}`,
          visaFile
        )
      : of(null);

    const uploadPhoto$ = photoFile
      ? this.fileUploadService.uploadFile(
          `photos/${agentId}/${photoFile.name}`,
          photoFile
        )
      : of(null);

    return forkJoin({ visaUrl: uploadVisa$, photoUrl: uploadPhoto$ });
  }

  private getLocationFromAddress(
    city: string,
    country: string
  ): Observable<{ latitude: number; longitude: number }> {
    const address = `${city}, ${country}`;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?access_token=${environment.mapboxAccessToken}`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const [longitude, latitude] = res.features[0].center;
        return { latitude, longitude };
      }),
      catchError((error) => {
        console.error('Error fetching location:', error);
        return of({ latitude: 0, longitude: 0 });
      })
    );
  }

  onVisaCopySelected(event: any): void {
    const file = event.target.files[0];
    this.agentForm.patchValue({ visaCopy: file });
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    this.agentForm.patchValue({ photo: file });
  }
}
