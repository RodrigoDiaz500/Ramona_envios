import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MsalBroadcastService,
  MsalGuard,
  MsalService
} from '@azure/msal-angular';

import {
  MSALGuardConfigFactory,
  MSALInstanceFactory
} from '../core/auth/msal.config';

import { authTokenInterceptor } from '../core/auth/auth-token.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // Se usa un único interceptor explícito para garantizar que todas las
    // llamadas a http://localhost:8080/api lleven el access token.
    provideHttpClient(
      withInterceptors([authTokenInterceptor])
    ),

    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },

    MsalService,
    MsalGuard,
    MsalBroadcastService
  ]
};
