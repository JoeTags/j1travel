import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideNgxStripe } from 'ngx-stripe';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { environment } from './environments/environments';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes), // Provide routes
    importProvidersFrom(HttpClientModule),
    provideFirebaseApp(() => initializeApp(environment.firebase)), // Firebase initialization
    provideFirestore(() => getFirestore()), // Firestore service
    provideStorage(() => getStorage()), // Storage service
    provideNgxStripe(environment.testStripePublishable),
  ],
}).catch((err) => console.error(err));
