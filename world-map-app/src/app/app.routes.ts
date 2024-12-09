import { Routes } from '@angular/router';
import { AgentPortalComponent } from './agent-portal/agent-portal.component';
import { MapComponent } from './map/map.component';

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
    path: '',
    redirectTo: '/agent-portal',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/agent-portal',
  },
];
