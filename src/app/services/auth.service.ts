import { Injectable } from '@angular/core'; 
import { HttpClient } from '@angular/common/http'; 
import { BehaviorSubject, Observable } from 'rxjs'; 
import { tap } from 'rxjs/operators'; 
import { environment } from '../../environments/environment'; 
import { Router } from '@angular/router'; 
 
@Injectable({ 
  providedIn: 'root' 
}) 
export class AuthService { 
  private apiUrl = environment.apiUrl; 
  private TOKEN_KEY = 'auth_token';
  private ROLE_KEY = 'user_role'; 
  private authState = new BehaviorSubject<boolean>(this.hasToken()); 
 
  constructor(private http: HttpClient, private router: Router) {} 
 
  private hasToken(): boolean { 
    return !!localStorage.getItem(this.TOKEN_KEY); 
  }

  // 💥 FIX: Propiedad GET (sin paréntesis) - Usado en AdminPage y HomePage
  get isAdmin(): boolean {
    return localStorage.getItem(this.ROLE_KEY) === 'ADMIN';
  }

  // 💥 FIX: Nuevo método para obtener el token - Usado en auth-guard
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  register(username: string, password: string): Observable<any> { 
    return this.http.post(`${this.apiUrl}/register`, { 
    username, password }); 
  } 
  
  login(username: string, password: string): Observable<{ token: string, role: 'USER' | 'ADMIN' }> { 
    return this.http.post<{ token: string, role: 'USER' | 'ADMIN' }>(`${this.apiUrl}/login`, { username, password }).pipe( 
      tap(response => { 
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.ROLE_KEY, response.role); 
        this.authState.next(true); 
      }) 
    ); 
  } 
  
  logout() { 
    localStorage.removeItem(this.TOKEN_KEY); 
    localStorage.removeItem(this.ROLE_KEY); 
    this.authState.next(false); 
    this.router.navigateByUrl('/login');
  }

  isAuthenticated(): Observable<boolean> {
    return this.authState.asObservable();
  }
}