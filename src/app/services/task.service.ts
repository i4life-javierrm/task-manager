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

  // 🚀 FIX: Ensure addTask accepts description
  addTask(title: string, description: string): Observable<Task> { 
    return this.http.post<Task>(this.apiUrl, { title, description }); 
  }

  toggleTask(id: string): Observable<Task> { 
    return this.http.put<Task>(`${this.apiUrl}/${id}`, {}); 
  } 
 
  deleteTask(id: string): Observable<any> { 
    return this.http.delete(`${this.apiUrl}/${id}`); 
  } 
}
