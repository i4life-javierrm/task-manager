import { Component, OnInit } from '@angular/core'; 
import { TaskService, Task } from '../services/task.service'; 
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router'; // 💡 NEW: Needed for navigation
import { ToastService } from '../services/toast.service'; // 💡 NEW: Needed for toasts
 
@Component({ 
  selector: 'app-home', 
  templateUrl: './home.page.html', 
  styleUrls: ['./home.page.scss'], 
  standalone: true, 
  imports: [
    IonicModule,
    FormsModule,
    CommonModule
  ]
}) 
export class HomePage implements OnInit { 
  tasks: Task[] = []; 
  newTaskTitle: string = ''; 

  // Removed direct injection of AuthService and redundant apiUrl/http fields for cleaner constructor
 
  constructor(
    private http: HttpClient, 
    private taskService: TaskService,
    private authService: AuthService, // 💡 NEW: Inject AuthService
    private router: Router, // 💡 NEW: Inject Router
    private toastService: ToastService // 💡 NEW: Inject ToastService
  ) { } 
 
  ngOnInit() { 
    this.loadTasks(); 
  } 
 
  loadTasks() { 
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
      },
      error: (error) => {
        console.error('Error al cargar tareas:', error);
        this.toastService.showError('No se pudieron cargar las tareas. Verifica la conexión.', 'Error de Carga');
      }
    });
  } 
 
  addTask() { 
    const title = this.newTaskTitle.trim();
    if (!title) return;
    
    // Assuming the user's service method is 'addTask' and not 'createTask'
    this.taskService.addTask(title).subscribe({
      next: (task) => { 
        this.tasks.push(task); 
        this.newTaskTitle = '';
        this.toastService.showSuccess('Tarea añadida con éxito.', 'Creación Exitosa');
      },
      error: (error) => {
        let errorMessage = 'Error al crear la tarea.';
        // Check for specific validation error (e.g., 400 Bad Request)
        if (error.status === 400) {
            errorMessage = error.error?.error || 'El título es obligatorio.';
        }
        this.toastService.showError(errorMessage, 'Error de Validación');
      }
    }); 
  } 

  // The task object is passed from the UI
  toggleTask(task: Task) { 
    this.taskService.toggleTask(task._id!).subscribe({
      next: (updatedTask) => { 
        // Update local task status directly on the passed object reference
        task.completed = updatedTask.completed; 
        this.toastService.showSuccess(
          `Tarea marcada como ${updatedTask.completed ? 'completa' : 'pendiente'}.`, 
          'Actualización Exitosa'
        );
      },
      error: (error) => {
        console.error('Error al actualizar tarea:', error);
        this.toastService.showError('No se pudo actualizar la tarea.', 'Error de Actualización');
      }
    }); 
  } 

  // The task object is passed from the UI
  deleteTask(task: Task) { 
    this.taskService.deleteTask(task._id!).subscribe({
      next: () => { 
        this.tasks = this.tasks.filter(t => t._id !== task._id);
        this.toastService.showSuccess('Tarea eliminada correctamente.', 'Eliminación Exitosa');
      },
      error: (error) => {
        console.error('Error al eliminar tarea:', error);
        // Check for 404 Not Found from backend
        let errorMessage = 'No se pudo eliminar la tarea.';
        if (error.status === 404) {
          errorMessage = 'La tarea no existe o ya fue eliminada.';
        }
        this.toastService.showError(errorMessage, 'Error de Eliminación');
      }
    }); 
  } 

  logout() { 
    this.authService.logout(); 
    this.toastService.showSuccess('Has cerrado sesión.', 'Adiós!');
    this.router.navigate(['/login']);
  }   
  
  // Note: Removed the redundant 'getTasks' method from the class body.
}