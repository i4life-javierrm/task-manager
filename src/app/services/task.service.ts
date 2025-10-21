// File: task.service.ts (MODIFICADO para tareas grupales y papelera)
import { Injectable } from '@angular/core'; 
import { HttpClient, HttpParams } from '@angular/common/http'; 
import { Observable } from 'rxjs'; 
import { environment } from '../../environments/environment'; 

// 🚀 CAMBIO CRÍTICO: Interfaz Task adaptada a la estructura de grupo y AÑADIDA la propiedad isTrashed
export interface Task { 
  _id?: string; 
  title: string; 
  completed: boolean; 
  description: string; 
  createdAt?: string; 
  updatedAt?: string;
  completedAt?: string | null; 
  
  // 🗑️ CAMBIO CRÍTICO: Nueva propiedad para la papelera
  isTrashed: boolean; 
  
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

  // --- MÉTODOS DE GESTIÓN DE TAREAS ACTIVAS ---

  /**
   * Obtiene las tareas ACTIVAS (isTrashed: false). Si 'allTasks' es true, solicita todas las tareas activas (requiere permisos de admin).
   */
  getTasks(allTasks: boolean = false): Observable<Task[]> { 
    let params = new HttpParams();
    if (allTasks) {
      // Si es admin, enviamos un flag al backend.
      params = params.set('all', 'true');
    }
    // Llama a: GET /api/tasks (que ya excluye las tareas en papelera)
    return this.http.get<Task[]>(this.apiUrl, { params }); 
  } 

  /**
   * Crea una nueva tarea.
   */
  createTask(newTask: Partial<Task>, userIds?: string[]): Observable<Task> {
    // La nueva propiedad isTrashed: false se establece por defecto en el backend.
    const body = userIds && userIds.length > 0
        ? { ...newTask, users: userIds } 
        : newTask;                             

    return this.http.post<Task>(this.apiUrl, body); 
  }

  /**
   * Actualiza una tarea.
   */
  updateTask(task: Task): Observable<Task> { 
    // Siempre eliminamos 'users' y ahora 'isTrashed' al enviar la tarea
    const taskToSend: Partial<Task> = { ...task };
    delete taskToSend.users; 
    delete taskToSend.isTrashed; // No debería ser modificable por la ruta PUT principal
    
    return this.http.put<Task>(`${this.apiUrl}/${task._id}`, taskToSend); 
  } 

  /**
   * Actualiza la lista COMPLETA de miembros asignados a una tarea.
   */
  updateTaskMembers(taskId: string, userIds: string[]): Observable<Task> {
    const body = { userIds: userIds };
    return this.http.put<Task>(`${this.apiUrl}/${taskId}/members`, body);
  }

  // --- MÉTODOS DE GESTIÓN DE PAPELERA (BIN FUNCTIONALITY) ---

  /**
   * 🆕 Obtiene las tareas EN LA PAPELERA (isTrashed: true).
   * @param allTasks Si es true, obtiene todas las tareas en papelera (admin only).
   */
  getTrashedTasks(allTasks: boolean = false): Observable<Task[]> { 
    let params = new HttpParams();
    if (allTasks) {
      // Si es admin, enviamos un flag al backend.
      params = params.set('all', 'true');
    }
    // Llama a: GET /api/tasks/trashed
    return this.http.get<Task[]>(`${this.apiUrl}/trashed`, { params }); 
  } 

  /**
   * 🗑️ Mueve una tarea a la papelera (Soft Delete).
   * @param id El ID de la tarea a eliminar suavemente.
   */
  moveToTrash(id: string): Observable<any> { 
    // Llama a la ruta DELETE /api/tasks/:id, que el backend reconfiguró para el soft delete.
    return this.http.delete(`${this.apiUrl}/${id}`); 
  } 

  /**
   * 🔄 Restaura una tarea desde la papelera.
   * @param id El ID de la tarea a restaurar.
   */
  restoreTask(id: string): Observable<Task> { 
    // Llama a: PUT /api/tasks/:id/restore
    return this.http.put<Task>(`${this.apiUrl}/${id}/restore`, {}); 
  }

  /**
   * ❌ Elimina una tarea PERMANENTEMENTE de la base de datos.
   * @param id El ID de la tarea a eliminar.
   */
  deleteTaskPermanent(id: string): Observable<any> { 
    // Llama a la ruta de eliminación permanente: DELETE /api/tasks/:id/permanent
    return this.http.delete(`${this.apiUrl}/${id}/permanent`); 
  }
}