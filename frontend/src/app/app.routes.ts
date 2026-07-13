import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';

import { MainLayout } from './layouts/main-layout/main-layout';
import { adminOperatorGuard } from '../core/guards/role.guard';
import { TrackingPage } from './features/tracking/tracking-page/tracking-page';
import { CreateShipment } from './features/shipments/create-shipment/create-shipment';
import { ShipmentHistory } from './features/history/shipment-history/shipment-history';
import { ProfilePage } from './features/profile/profile-page/profile-page';
import { UserManagement } from './features/users/user-management/user-management';
import { BranchManagement } from './features/branches/branch-management/branch-management';
import { UpdateShipmentStatus } from './features/shipments/update-shipment-status/update-shipment-status';
import { DashboardPage } from './features/dashboard/dashboard-page/dashboard-page';
import { IncidentManagement } from './features/incidents/incident-management/incident-management';
import { NotificationCenter } from './features/notifications/notification-center/notification-center';
import { ReviewManagement } from './features/reviews/review-management/review-management';


export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: '',
    component: MainLayout,
    children: [

      {
        path: 'tracking',
        component: TrackingPage
      },

      {
        path: 'shipment',
        component: CreateShipment
      },

      {
        path: 'history',
        component: ShipmentHistory
      },

      {
        path: 'profile',
        component: ProfilePage
      },

      {
        path: 'users',
        component: UserManagement
      },

      {
        path: 'branches',
        component: BranchManagement
      },

      {
        path: 'shipments',
        component: UpdateShipmentStatus
      },

      {
        path: 'dashboard',
        component: DashboardPage,
        canActivate: [adminOperatorGuard]
      },

      {
        path: 'incidents',
        component: IncidentManagement
      },

      {
        path: 'notifications',
        component: NotificationCenter
      },

      {
        path: 'reviews',
        component: ReviewManagement
      }

    ]
  }

];