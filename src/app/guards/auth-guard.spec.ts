import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth.service'; // Assuming path

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    // Create a spy object for AuthService
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    
    router = TestBed.inject(Router);
    spyOn(router, 'navigate'); // Spy on router navigation
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow activation if token is valid and not expired', () => {
    // Simulate a non-expired token (example payload exp is in the future)
    // "{"exp": 2000000000}" -> Base64URL-encoded: "eyJleHAiOiAyMDAwMDAwMDAwfQ"
    const futureToken = `header.eyJleHAiOiA${Math.floor(Date.now() / 1000) + 3600}fQ.signature`;
    
    authServiceSpy.getToken.and.returnValue(futureToken);
    
    const result = executeGuard({} as any, {} as any);
    
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });
  
  it('should deny activation and navigate to /login if no token is found', () => {
    authServiceSpy.getToken.and.returnValue(null);
    
    const result = executeGuard({} as any, {} as any);
    
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should deny activation, logout, and navigate to /login if token is expired', () => {
    // Simulate an expired token (example payload exp is in the past)
    // "{"exp": 1000000000}" -> Base64URL-encoded: "eyJleHAiOiAxMDAwMDAwMDAwfQ"
    const expiredToken = 'header.eyJleHAiOiAxMDAwMDAwMDAwfQ.signature';
    
    authServiceSpy.getToken.and.returnValue(expiredToken);
    
    const result = executeGuard({} as any, {} as any);
    
    expect(result).toBe(false);
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});