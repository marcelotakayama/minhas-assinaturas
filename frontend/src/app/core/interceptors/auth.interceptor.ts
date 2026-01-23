import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('ma_token');

  // rotas públicas (não manda token)
  const isAuthEndpoint =
    req.url.includes('/api/Auth/login') ||
    req.url.includes('/api/Auth/register');

  if (!token || isAuthEndpoint) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  );
};
