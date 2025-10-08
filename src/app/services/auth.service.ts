import { Injectable } from '@angular/core'; 
import { HttpClient } from '@angular/common/http'; 
import { BehaviorSubject, Observable } from 'rxjs'; // 👈 Added Observable
import { tap } from 'rxjs/operators'; 
import { environment } from '../../environments/environment'; 
import { Router } from '@angular/router'; 
 
@Injectable({ 
  providedIn: 'root' 
}) 
export class AuthService { 
  private apiUrl = environment.apiUrl; 
  private TOKEN_KEY = 'auth_token'; // 👈 Standardized Token Key
  private authState = new BehaviorSubject<boolean>(this.hasToken()); 
 
  constructor(private http: HttpClient, private router: Router) {} 
 
  private hasToken(): boolean { 
    return !!localStorage.getItem(this.TOKEN_KEY); // 👈 Use standardized key
  }
  
  // No change needed for register logic itself
  register(username: string, password: string): Observable<any> { // 👈 Added return type
    return this.http.post(`${this.apiUrl}/register`, { 
    username, password }); 
  } 
  
  login(username: string, password: string): Observable<{ token: string }> { // 👈 Added return type
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { username, password }).pipe( 
      tap(response => { 
        localStorage.setItem(this.TOKEN_KEY, response.token); // 👈 Use standardized key
        this.authState.next(true); 
      }) 
    ); 
  } 
  
  logout() { 
    localStorage.removeItem(this.TOKEN_KEY); // 👈 Use standardized key
    this.authState.next(false); 
    this.router.navigate(['/login']); 
  } 
  
  isAuthenticated(): Observable<boolean> { // 👈 Added return type
    return this.authState.asObservable(); 
  } 
  
  getToken(): string | null { 
    return localStorage.getItem(this.TOKEN_KEY); // 👈 Use standardized key
  } 
}