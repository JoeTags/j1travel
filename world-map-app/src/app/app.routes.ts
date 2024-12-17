import { Routes } from '@angular/router';
import { AgentPortalComponent } from './agent-portal/agent-portal.component';
import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { PaymentComponent } from './payments/payment.component';
import { RegistrationComponent } from './registration/registration.component';

export const appRoutes: Routes = [
  {
    path: 'agent-portal',
    component: AgentPortalComponent,
  },
  {
    path: 'map',
    component: MapComponent,
  },
  {
    path: 'payment',
    component: PaymentComponent,
  },
  { path: 'register', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },
  {
    path: '', // Default route
    redirectTo: '/agent-portal',
    pathMatch: 'full',
  },
  {
    path: '**', // Wildcard route for undefined paths
    redirectTo: '/agent-portal',
  },

  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: '**', redirectTo: '/register' },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
