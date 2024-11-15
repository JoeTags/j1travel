import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

// AngularFire imports
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AgentPortalComponent } from './agent-portal/agent-portal.component';
import { MapComponent } from './map/map.component';

@NgModule({
  declarations: [AppComponent, MapComponent, AgentPortalComponent],
  imports: [BrowserModule, ReactiveFormsModule, FormsModule],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)), // Firebase initialization
    provideFirestore(() => getFirestore()), // Firestore integration
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
