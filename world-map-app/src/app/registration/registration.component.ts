import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-registration',
  standalone: true,
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
})
export class RegistrationComponent {
  registrationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      age: ['', [Validators.required, Validators.min(18)]],
      location: ['', Validators.required],
      travelDestinations: ['', Validators.required],
      budget: ['', Validators.required],
      accommodation: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      const {
        email,
        password,
        age,
        location,
        travelDestinations,
        budget,
        accommodation,
      } = this.registrationForm.value;

      // Sign up with Firebase Authentication
      createUserWithEmailAndPassword(this.auth, email, password)
        .then((userCredential) => {
          const userId = userCredential.user.uid;

          // Save additional user data to Firestore
          const userData = {
            email,
            age,
            location,
            travelDestinations,
            budget,
            accommodation,
            createdAt: new Date(),
          };

          return setDoc(doc(this.firestore, 'users', userId), userData);
        })
        .then(() => {
          console.log('User registered and data saved successfully');
          this.router.navigate(['/map']); // Redirect to home or another page
        })
        .catch((error) => {
          console.error('Registration error:', error.message);
        });
    }
  }
}
