import { provideHttpClient } from '@angular/common/http';

import {
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

import { of } from 'rxjs';

import {
  beforeEach,
  vi
} from 'vitest';

export const msalServiceMock = {
  instance: {
    initialize: vi.fn()
      .mockResolvedValue(undefined),

    loginRedirect: vi.fn()
      .mockResolvedValue(undefined),

    logoutRedirect: vi.fn()
      .mockResolvedValue(undefined),

    getAllAccounts: vi.fn()
      .mockReturnValue([]),

    getActiveAccount: vi.fn()
      .mockReturnValue(null),

    setActiveAccount: vi.fn(),

    handleRedirectPromise: vi.fn()
      .mockResolvedValue(null)
  },

  /*
   * Este método pertenece directamente a MsalService,
   * no a msalService.instance.
   */
  handleRedirectObservable: vi.fn(() => of(null)),

  inProgress$: of(),

  msalSubject$: of()
};

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      /*
       * Entrega Router, ActivatedRoute y las dependencias
       * necesarias para RouterLink y RouterOutlet.
       */
      provideRouter([]),

      provideHttpClient(),
      provideHttpClientTesting(),

      {
        provide: MsalService,
        useValue: msalServiceMock
      }
    ]
  });

  vi.clearAllMocks();

  msalServiceMock.instance.initialize
    .mockResolvedValue(undefined);

  msalServiceMock.instance.loginRedirect
    .mockResolvedValue(undefined);

  msalServiceMock.instance.logoutRedirect
    .mockResolvedValue(undefined);

  msalServiceMock.instance.getAllAccounts
    .mockReturnValue([]);

  msalServiceMock.instance.getActiveAccount
    .mockReturnValue(null);

  msalServiceMock.instance.handleRedirectPromise
    .mockResolvedValue(null);

  msalServiceMock.handleRedirectObservable
    .mockReturnValue(of(null));
});