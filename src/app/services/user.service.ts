// File: src/app/services/user.service.ts (COMPLETO Y CORREGIDO)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  _id: string;
  username: string; 
  role: 'USER' | 'ADMIN';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // La ruta de usuarios apunta a la ruta de administración /api/users
  private apiUrl = environment.apiUrl + '/users'; 
  
  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista completa de todos los usuarios (Ruta Admin).
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl); 
  }

  /**
   * Elimina un usuario por su ID (Ruta Admin DELETE /api/users/:id).
   * @param id El ID del usuario a eliminar.
   * @returns Un Observable de respuesta vacía (204 No Content).
   */
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}