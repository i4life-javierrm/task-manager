// File: task.service.ts
import { Injectable } from '@angular/core'; 
import { HttpClient, HttpParams } from '@angular/common/http'; // 👈 Importamos HttpParams
import { Observable } from 'rxjs'; 
import { environment } from '../../environments/environment'; 

// 🚀 MEJORA: Se añade el campo 'owner' para el panel de administrador
export interface Task { 
  _id?: string; 
  title: string; 
  completed: boolean; 
  description: string; 
  createdAt?: string; 
  completedAt?: string | null; 
  // 💡 NUEVO CAMPO: Para mostrar el creador de la tarea en AdminPage
  user?: { username: string; _id: string }; 
} 

@Injectable({ 
  providedIn: 'root' 
}) 
export class TaskService { 
  private apiUrl = environment.apiUrl + '/tasks'; 
  
  constructor(private http: HttpClient) { } 

  /**
   * Obtiene las tareas. Si 'allTasks' es true, solicita todas las tareas (requiere permisos de admin en el backend).
   */
  getTasks(allTasks: boolean = false): Observable<Task[]> { 
    let params = new HttpParams();
    if (allTasks) {
      // Si es admin, enviamos un flag al backend.
      params = params.set('all', 'true');
    }
    // Añadimos 'params' al request, si no hay 'allTasks', params está vacío y no afecta la request normal.
    return this.http.get<Task[]>(this.apiUrl, { params }); 
  } 

  createTask(newTask: Partial<Task>): Observable<Task> { 
    return this.http.post<Task>(this.apiUrl, newTask); 
  }

  updateTask(task: Task): Observable<Task> { 
    return this.http.put<Task>(`${this.apiUrl}/${task._id}`, task); 
  } 
 
  deleteTask(id: string): Observable<any> { 
    return this.http.delete(`${this.apiUrl}/${id}`); 
  } 
}