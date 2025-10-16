import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// 💥 FIX 1: Corregir la ruta al archivo environment (subir dos niveles desde services/)
import { environment } from '../../environments/environment';
// 💥 FIX 2: Importar la interfaz User desde el nuevo archivo de interfaces
import { User } from '../interfaces/user.interface'; 

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl + '/users'; 

  constructor(private http: HttpClient) { }

  // Nombre de método correcto: getUsers() (sustituye al erróneo getAllUsers)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }
}