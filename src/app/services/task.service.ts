// File: task.service.ts (MODIFICADO para tareas grupales)
import { Injectable } from '@angular/core'; 
import { HttpClient, HttpParams } from '@angular/common/http'; 
import { Observable } from 'rxjs'; 
import { environment } from '../../environments/environment'; 

// 🚀 CAMBIO CRÍTICO: Interfaz Task adaptada a la estructura de grupo
export interface Task { 
  _id?: string; 
  title: string; 
  completed: boolean; 
  description: string; 
  createdAt?: string; 
  completedAt?: string | null; 
  
  // 💡 CAMBIO DE 'user' A 'users': Ahora es un array de usuarios poblados
  users?: { username: string; _id: string }[]; 
  tags: string[];
} 

@Injectable({ 
  providedIn: 'root' 
}) 
export class TaskService { 
  private apiUrl = environment.apiUrl + '/tasks'; 
  
  constructor(private http: HttpClient) { } 

  /**
   * Obtiene las tareas. Si 'allTasks' es true, solicita todas las tareas (requiere permisos de admin).
   */
  getTasks(allTasks: boolean = false): Observable<Task[]> { 
    let params = new HttpParams();
    if (allTasks) {
      // Si es admin, enviamos un flag al backend.
      params = params.set('all', 'true');
    }
    return this.http.get<Task[]>(this.apiUrl, { params }); 
  } 

  /**
   * Crea una nueva tarea. Ahora acepta un array opcional de IDs de usuario.
   * Si no se proporciona el array, el backend asignará al usuario logeado por defecto.
   */
  createTask(newTask: Partial<Task>, userIds?: string[]): Observable<Task> {
    const body = userIds && userIds.length > 0
        // Si se proporcionan IDs, se envía el array 'users'
        ? { ...newTask, users: userIds } 
        // Si no se proporcionan IDs, se envía solo la tarea (el backend debe asignarla al creador)
        : newTask;                             

    return this.http.post<Task>(this.apiUrl, body); 
  }

  updateTask(task: Task): Observable<Task> { 
    // Nota: La interfaz Task debe ser enviada sin el array 'users' para evitar errores. 
    // Es mejor que esta ruta solo maneje title, description, completed, etc.
    // El array 'users' debe manejarse con updateTaskMembers().
    const taskToSend = { ...task };
    delete taskToSend.users; 
    
    return this.http.put<Task>(`${this.apiUrl}/${task._id}`, taskToSend); 
  } 
 
  deleteTask(id: string): Observable<any> { 
    return this.http.delete(`${this.apiUrl}/${id}`); 
  } 

  // 🆕 NUEVO MÉTODO: Para gestionar los miembros de una tarea ya existente
  /**
   * Actualiza la lista COMPLETA de miembros asignados a una tarea específica.
   * @param taskId El ID de la tarea a modificar.
   * @param userIds El array de IDs de usuario que deben ser los NUEVOS miembros.
   */
  updateTaskMembers(taskId: string, userIds: string[]): Observable<Task> {
    const body = { userIds: userIds };
    // Llama a la nueva ruta dedicada: PUT /api/tasks/:id/members
    return this.http.put<Task>(`${this.apiUrl}/${taskId}/members`, body);
  }
}