
export const environment = {
  production: false,

  apiUrl:
    'http://localhost:8080/api',

  azure: {
    authority:
      'https://login.microsoftonline.com/common',

    clientId:
      'b82da08a-15ea-4bd6-902e-236d2d2e523a',

    redirectUri:
      'http://localhost:4200',

    postLogoutRedirectUri:
      'http://localhost:4200/login',

    scope:
      'api://b82da08a-15ea-4bd6-902e-236d2d2e523a/Acceso.Total'
  }
};