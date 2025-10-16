import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaz para tipar los objetos de usuario devueltos por la API
export interface User {
  _id: string;
  username: string;
  role: 'user' | 'admin';
  createdAt: string; // La fecha se recibe como string ISO
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de todos los usuarios registrados.
   * Requiere rol de administrador en el token JWT.
   * @returns Observable con el array de usuarios.
   */
  getAllUsers(): Observable<User[]> {
    // 🎯 Endpoint del backend: GET /api/admin/users
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`);
  }

  /**
   * Elimina un usuario por su ID.
   * Requiere rol de administrador en el token JWT.
   * @param userId El ID del usuario a eliminar.
   * @returns Observable con la respuesta de éxito.
   */
  deleteUser(userId: string): Observable<any> {
    // 🎯 Endpoint del backend: DELETE /api/admin/users/:id
    return this.http.delete(`${this.apiUrl}/admin/users/${userId}`);
  }
}