import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Utility function to decode and check JWT expiration
 */
function isTokenExpired(token: string): boolean {
  try {
    // SECURITY NOTE: This check is for client-side UX only. 
    // The backend MUST perform the full signature validation.
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if 'exp' exists and if the expiration time (in seconds) * 1000 
    // is less than the current time (in milliseconds)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return true;
    }
    return false;

  } catch (error) {
    // Handle cases where token is malformed and cannot be decoded
    console.error('Error decoding token:', error);
    return true; // Treat malformed token as expired
  }
}


export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = authService.getToken();

  if (!token) {
    // 1. No token found, redirect to login
    router.navigate(['/login']);
    return false;
  }

  if (isTokenExpired(token)) {
    // 2. Token is expired, log out and redirect
    authService.logout();
    router.navigate(['/login']);
    return false;
  }
  
  // 3. Token exists and is not expired
  return true;
};

// NOTE: You can now delete the old AuthGuard class, as it's replaced by the function 'authGuard'.