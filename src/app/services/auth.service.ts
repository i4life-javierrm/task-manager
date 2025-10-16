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
  private ADMIN_KEY = 'is_admin'; 
  private authState = new BehaviorSubject<boolean>(this.hasToken()); 
 
  constructor(private http: HttpClient, private router: Router) {} 
 
  private hasToken(): boolean { 
    return !!localStorage.getItem(this.TOKEN_KEY); 
  }

  // 💥 FIX: Propiedad GET (sin paréntesis) - Usado en AdminPage y HomePage
  get isAdmin(): boolean {
    return localStorage.getItem(this.ADMIN_KEY) === 'true';
  }

  // 💥 FIX: Nuevo método para obtener el token - Usado en auth-guard
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  register(username: string, password: string): Observable<any> { 
    return this.http.post(`${this.apiUrl}/register`, { 
    username, password }); 
  } 
  
  login(username: string, password: string): Observable<{ token: string, isAdmin: boolean }> { 
    return this.http.post<{ token: string, isAdmin: boolean }>(`${this.apiUrl}/login`, { username, password }).pipe( 
      tap(response => { 
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.ADMIN_KEY, response.isAdmin ? 'true' : 'false'); 
        this.authState.next(true); 
      }) 
    ); 
  } 
  
  logout() { 
    localStorage.removeItem(this.TOKEN_KEY); 
    localStorage.removeItem(this.ADMIN_KEY); 
    this.authState.next(false); 
    this.router.navigateByUrl('/login');
  }

  isAuthenticated(): Observable<boolean> {
    return this.authState.asObservable();
  }
}