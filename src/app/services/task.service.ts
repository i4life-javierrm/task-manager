// File: task.service.ts
import { Injectable } from '@angular/core'; 
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs'; 
import { environment } from '../../environments/environment'; 

// 🚀 FIX: Ensure Task interface includes all necessary fields for dates and description
export interface Task { 
  _id?: string; 
  title: string; 
  completed: boolean; 
  description: string; // Add description field
  createdAt?: string; // Mongoose timestamp
  completedAt?: string | null; // New completion date field
} 

@Injectable({ 
  providedIn: 'root' 
}) 
export class TaskService { 
  private apiUrl = environment.apiUrl + '/tasks'; 
  
  constructor(private http: HttpClient) { } 

  getTasks(): Observable<Task[]> { 
    return this.http.get<Task[]>(this.apiUrl); 
  } 

  // ✅ FIX/IMPROVEMENT: Renombrado de addTask a createTask para mayor claridad
  // y acepta un objeto Partial<Task> para la creación.
  createTask(newTask: Partial<Task>): Observable<Task> { 
    return this.http.post<Task>(this.apiUrl, newTask); 
  }

  // ✅ FIX: Se elimina toggleTask y se añade un updateTask más versátil.
  updateTask(task: Task): Observable<Task> { 
    return this.http.put<Task>(`${this.apiUrl}/${task._id}`, task); 
  } 
 
  deleteTask(id: string): Observable<any> { 
    return this.http.delete(`${this.apiUrl}/${id}`); 
  } 
}