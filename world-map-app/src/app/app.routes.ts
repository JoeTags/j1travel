import { Routes } from '@angular/router';
import { AgentPortalComponent } from './agent-portal/agent-portal.component';
import { MapComponent } from './map/map.component';
import { PaymentComponent } from './payments/payment.component';

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
  {
    path: '', // Default route
    redirectTo: '/agent-portal',
    pathMatch: 'full',
  },
  {
    path: '**', // Wildcard route for undefined paths
    redirectTo: '/agent-portal',
  },
];
