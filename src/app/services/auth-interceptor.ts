import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  // Use the same key as defined in AuthService
  private TOKEN_KEY = 'auth_token'; 

  constructor() {} 

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    const token = localStorage.getItem(this.TOKEN_KEY); // Use the new token key
    
    // Check if the token exists. We only need to add the header if we have a token.
    if (token) { 
      // Clone the request and add the Authorization header
      const cloned = request.clone({
        setHeaders: {
          // The backend expects the token in the format "Bearer <token>" 
          // due to the split logic in auth.middleware.js.
          Authorization: `Bearer ${token}` 
        }
      });
      return next.handle(cloned);
    }

    // If no token, pass the original request through
    return next.handle(request);
  }
}