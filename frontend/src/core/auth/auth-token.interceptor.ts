import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

import { MsalService } from '@azure/msal-angular';
import { loginRequest } from './msal.config';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const msalService = inject(MsalService);

  if (!req.url.startsWith('http://localhost:8080/api')) {
    return next(req);
  }

  return from(msalService.instance.initialize()).pipe(
    switchMap(() => {
      const account =
        msalService.instance.getActiveAccount()
        ?? msalService.instance.getAllAccounts()[0];

      if (!account) {
        return next(req);
      }

      return from(
        msalService.instance.acquireTokenSilent({
          ...loginRequest,
          account
        })
      ).pipe(
        switchMap(result => {
          const authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${result.accessToken}`
            }
          });

          return next(authReq);
        })
      );
    })
  );
};