import { Injectable } from '@angular/core'; 
import { HttpClient } from '@angular/common/http'; 
import { BehaviorSubject, Observable } from 'rxjs'; 
import { tap } from 'rxjs/operators'; 
import { environment } from '../../environments/environment'; 
import { Router } from '@angular/router'; 
import { jwtDecode } from 'jwt-decode'; // 👈 IMPORTANTE: Añadir jwt-decode
 
interface JwtPayload {
  _id: string;
  role: 'user' | 'admin'; // El rol debe estar en el token
  iat: number;
  exp: number;
}

@Injectable({ 
  providedIn: 'root' 
}) 
export class AuthService { 
  private apiUrl = environment.apiUrl; 
  private TOKEN_KEY = 'auth_token'; 
  private authState = new BehaviorSubject<boolean>(this.hasToken()); 
 
  constructor(private http: HttpClient, private router: Router) {} 
 
  private hasToken(): boolean { 
    return !!localStorage.getItem(this.TOKEN_KEY); 
  }
  
  // 🚀 NUEVA FUNCIÓN: Obtiene el rol del usuario actual desde el token
  public getUserRole(): 'user' | 'admin' | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      // Retorna 'user' si el campo role no existe por defecto (seguridad)
      return decoded.role || 'user'; 
    } catch (error) {
      // Si el token no es válido, retorna null
      return null;
    }
  }

  // 🚀 NUEVA FUNCIÓN: Verifica si el usuario actual es administrador
  public isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  register(username: string, password: string): Observable<any> { 
    return this.http.post(`${this.apiUrl}/register`, { 
    username, password }); 
  } 
  
  login(username: string, password: string): Observable<{ token: string }> { 
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { username, password }).pipe( 
      tap(response => { 
        localStorage.setItem(this.TOKEN_KEY, response.token); 
        this.authState.next(true); 
      }) 
    ); 
  } 
  
  logout() { 
    localStorage.removeItem(this.TOKEN_KEY); 
    this.authState.next(false); 
    this.router.navigate(['/login']); 
  } 
  
  isAuthenticated(): Observable<boolean> { 
    return this.authState.asObservable(); 
  } 
  
  getToken(): string | null { 
    return localStorage.getItem(this.TOKEN_KEY); 
  } 
}