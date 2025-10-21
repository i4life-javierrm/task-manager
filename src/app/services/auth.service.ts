// File: src/app/services/auth.service.ts (MODIFICADO)
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

  // 💥 NUEVO: Función auxiliar para decodificar el payload del JWT
  private decodeTokenPayload(token: string): any {
    try {
        // Un JWT tiene el formato header.payload.signature
        const payload = token.split('.')[1];
        // Decodificación Base64 y parseo a JSON
        return JSON.parse(atob(payload));
    } catch (e) {
        // Manejar token mal formado o decodificación fallida
        return null;
    }
  }

  // 🚀 NUEVA PROPIEDAD: Obtiene el ID del usuario actual
  get currentUserId(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;

    const decoded = this.decodeTokenPayload(token);
    // Asumimos que el payload del token tiene la propiedad 'userId' (lo que genera el backend)
    return decoded ? decoded.userId : null; 
  }

  get isAdmin(): boolean {
    return localStorage.getItem(this.ROLE_KEY) === 'ADMIN';
  }

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
    // No redirigimos aquí; el componente que lo llama maneja la navegación.
  }

  isAuthenticated(): Observable<boolean> { 
    return this.authState.asObservable(); 
  }

}