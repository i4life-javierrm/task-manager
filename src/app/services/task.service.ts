import { Injectable } from '@angular/core'; 
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs'; 
import { environment } from '../../environments/environment'; 

// 🚀 UPDATED: Include the optional description field
export interface Task { 
_id?: string; 
title: string; 
description?: string; // ⬅️ NEW: Description field added
completed: boolean; 
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

// 🚀 UPDATED: Method now accepts the description parameter
addTask(title: string, description: string): Observable<Task> { 
// ⬅️ NEW: Pass description in the request body
return this.http.post<Task>(this.apiUrl, { title, description }); 
}

toggleTask(id: string): Observable<Task> { 
    return this.http.put<Task>(`${this.apiUrl}/${id}`, {}); 
  } 
 
  deleteTask(id: string): Observable<any> { 
    return this.http.delete(`${this.apiUrl}/${id}`); 
  } 
}