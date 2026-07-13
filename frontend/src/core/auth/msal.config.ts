import {
  BrowserCacheLocation,
  Configuration,
  InteractionType,
  IPublicClientApplication,
  PublicClientApplication,
  RedirectRequest
} from '@azure/msal-browser';

import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration
} from '@azure/msal-angular';

import { environment } from '../../environments/environment';


export const RAMONA_API_SCOPE =
  environment.azure.scope.trim();


const authority =
  environment.azure.authority.trim();

export const msalConfig: Configuration = {
  auth: {
    clientId:
      environment.azure.clientId.trim(),

    authority,

    redirectUri:
      environment.azure.redirectUri.trim(),

  
    postLogoutRedirectUri:
      environment.azure.postLogoutRedirectUri.trim()
  },

  cache: {
    cacheLocation:
      BrowserCacheLocation.LocalStorage
  }
};


export const loginRequest: RedirectRequest = {
  scopes: [
    RAMONA_API_SCOPE
  ],

  prompt:
    'select_account'
};

export function MSALInstanceFactory():
  IPublicClientApplication {

  return new PublicClientApplication(
    msalConfig
  );
}

/**
 * Configuración del guard de MSAL.
 */
export function MSALGuardConfigFactory():
  MsalGuardConfiguration {

  return {
    interactionType:
      InteractionType.Redirect,

    authRequest:
      loginRequest
  };
}

/**
 * Configuración del interceptor de MSAL.
 */
export function MSALInterceptorConfigFactory():
  MsalInterceptorConfiguration {

  const protectedResourceMap =
    new Map<string, Array<string>>();

  protectedResourceMap.set(
    'http://localhost:8080/api/*',
    [
      RAMONA_API_SCOPE
    ]
  );

  return {
    interactionType:
      InteractionType.Redirect,

    protectedResourceMap
  };
}