import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { AgentPortalComponent } from './agent-portal/agent-portal.component';

@NgModule({
  declarations: [AppComponent, MapComponent, AgentPortalComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)), // Initialize Firebase App
    provideFirestore(() => getFirestore()), // Firestore Provider
    provideStorage(() => getStorage()), // Storage Provider
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}


