import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';
import { RAMONA_API_SCOPE } from './msal.config';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const msalService = inject(MsalService);

  return from(msalService.instance.initialize()).pipe(
    switchMap(() => {
      const account =
        msalService.instance.getActiveAccount() ??
        msalService.instance.getAllAccounts()[0];

      if (!account) {
        return next(req);
      }

      msalService.instance.setActiveAccount(account);

      return from(
        msalService.instance.acquireTokenSilent({
          scopes: [RAMONA_API_SCOPE],
          account
        })
      ).pipe(
        switchMap(result => next(req.clone({
          setHeaders: {
            Authorization: `Bearer ${result.accessToken}`
          }
        })))
      );
    })
  );
};
