import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType
} from '@azure/msal-browser';

import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration
} from '@azure/msal-angular';

export const msalConfig = {
  auth: {
    clientId: 'b82da08a-15ea-4bd6-902e-236d2d2e523a',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'http://localhost:4200'
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  }
};

export const loginRequest = {
  scopes: [
    'api://b82da08a-15ea-4bd6-902e-236d2d2e523a/Acceso.Total'
  ]
};

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: loginRequest
  };
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();

  protectedResourceMap.set(
  'http://localhost:8080/api',
  ['api://b82da08a-15ea-4bd6-902e-236d2d2e523a/Acceso.Total']
);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}