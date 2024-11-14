import { Component } from '@angular/core';

// agent-portal.component.ts
import { OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Agent } from '../interfaces/agent.model';

@Component({
  selector: 'app-agent-portal',
  templateUrl: './agent-portal.component.html',
  styleUrls: ['./agent-portal.component.css'],
})
export class AgentPortalComponent implements OnInit {
  agentForm: FormGroup;
  paymentService: any;
  firestore: any;
  agentService: any;

  constructor(private fb: FormBuilder) {
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
      // Process payment
      const membership = this.agentForm.get('membership')?.value;
      const amount = this.getMembershipAmount(membership);

      this.paymentService.checkout(amount).then(() => {
        // After payment confirmation
        const agentId = this.firestore.createId();
        this.uploadFiles(agentId).then(() => {
          // Get file URLs
          const visaUrl = ''; // Get from storage reference
          const photoUrl = ''; // Get from storage reference

          // Get latitude and longitude from city and country
          this.getLocationFromAddress(
            this.agentForm.get('city')?.value,
            this.agentForm.get('country')?.value
          ).then((location) => {
            const agentData: Agent = {
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
            };

            this.agentService.addAgent(agentData).then(() => {
              // Success
            });
          });
        });
      });
    }
  }
  getMembershipAmount(membership: any) {
    throw new Error('Method not implemented.');
  }
  uploadFiles(agentId: any) {
    throw new Error('Method not implemented.');
  }
  getLocationFromAddress(value: any, value1: any) {
    throw new Error('Method not implemented.');
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
