const appOrigin = window.location.origin;

export const environment = {
  production: true,

  apiUrl: '/api',

  azure: {
    authority:
      'https://login.microsoftonline.com/common',

    clientId:
      'b82da08a-15ea-4bd6-902e-236d2d2e523a',

    redirectUri:
      appOrigin,

    postLogoutRedirectUri:
      `${appOrigin}/login`,

    scope:
      'api://b82da08a-15ea-4bd6-902e-236d2d2e523a/Acceso.Total'
  }
};
