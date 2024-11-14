import { Routes } from '@angular/router';
import { AuthGuard } from './authentication/auth-guard';
import { AgentPortalComponent } from './agent-portal/agent-portal.component';

export const routes: Routes = [
  {
    path: 'agent-portal',
    component: AgentPortalComponent,
    canActivate: [AuthGuard],
  },
];
