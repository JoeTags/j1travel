import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
import { RegistrationService } from './registration.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  paymentAmount: number = 1000;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private registrationService: RegistrationService
  ) {
    this.registrationForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      age: ['', [Validators.required, Validators.min(18)]],
      location: ['', Validators.required],
      travelDestinations: ['', Validators.required],
      budget: ['', Validators.required],
      accommodation: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Check if payment succeeded
    this.route.queryParams.subscribe((params) => {
      if (params['paymentSuccess'] === 'true') {
        this.completeRegistration();
      }
    });
  }

  onRegister(): void {
    if (this.registrationForm.valid) {
      console.log('Valid form, proceeding to payment...');
      const formData = this.registrationForm.value;

      // Save user data in the service
      this.registrationService.setUserData(formData);

      // Navigate to Payment Component with query parameters
      this.router.navigate(['/payment'], {
        queryParams: { amount: this.paymentAmount },
      });
    } else {
      console.log('Form is invalid. Please correct errors.');
    }
  }

  completeRegistration(): void {
    const formData = this.registrationService.getUserData();

    if (!formData) {
      console.error('No user data available. Registration cannot proceed.');
      return;
    }

    const { email, password, ...userData } = formData;

    this.authService.register(email, password, userData).subscribe({
      next: () => {
        console.log('User registered successfully');
        this.registrationService.clearUserData(); // Clear stored data
        this.router.navigate(['/map']);
      },
      error: (err) => {
        console.error('Registration failed:', err);
      },
    });
  }

  // onSubmit() {
  //   if (this.registrationForm.valid) {
  //     const {
  //       email,
  //       password,
  //       age,
  //       location,
  //       travelDestinations,
  //       budget,
  //       accommodation,
  //     } = this.registrationForm.value;

  //     // Sign up with Firebase Authentication
  //     createUserWithEmailAndPassword(this.auth, email, password)
  //       .then((userCredential) => {
  //         const userId = userCredential.user.uid;

  //         // Save additional user data to Firestore
  //         const userData = {
  //           email,
  //           age,
  //           location,
  //           travelDestinations,
  //           budget,
  //           accommodation,
  //           createdAt: new Date(),
  //         };

  //         return setDoc(doc(this.firestore, 'users', userId), userData);
  //       })
  //       .then(() => {
  //         console.log('User registered and data saved successfully');
  //         this.router.navigate(['/map']); // Redirect to home or another page
  //       })
  //       .catch((error) => {
  //         console.error('Registration error:', error.message);
  //       });
  //   }
  // }
}
