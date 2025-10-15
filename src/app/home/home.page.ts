import { Component, OnInit } from '@angular/core'; 
import { TaskService, Task } from '../services/task.service'; 
import { IonicModule, AlertController } from '@ionic/angular'; // ⬅️ UPDATED: Import AlertController
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router'; 
import { ToastService } from '../services/toast.service'; 
 
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
  // 🚀 NEW STATE VARIABLE: For task description input
  newTaskDescription: string = ''; 

  constructor(
    private http: HttpClient, 
    private taskService: TaskService,
    private authService: AuthService, 
    private router: Router, 
    private toastService: ToastService,
    private alertController: AlertController // ⬅️ NEW: Inject AlertController
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
        this.toastService.showError('No se pudieron cargar las tareas.', 'Error de Carga');
      }
    }); 
  } 

  addTask() {
    // Add validation check for the case where the input might be empty (even with disabled button)
    if (!this.newTaskTitle) {
      this.toastService.showError('El título de la tarea es obligatorio.', 'Faltan Datos');
      return;
    }

    this.taskService.addTask(this.newTaskTitle, this.newTaskDescription).subscribe({
      next: (newTask) => {
        this.tasks.unshift(newTask); // Add to the start of the array
        this.newTaskTitle = ''; // Clear input
        this.newTaskDescription = ''; // Clear description
        this.toastService.showSuccess('Tarea añadida correctamente.', 'Creación Exitosa');
      },
      error: (error) => {
        console.error('Error al agregar tarea:', error);
        this.toastService.showError('No se pudo añadir la tarea.', 'Error de Creación');
      }
    });
  }

  toggleTask(task: Task) { 
    // Optimistic UI update: change the state locally immediately
    const tempCompleted = task.completed;
    
    this.taskService.toggleTask(task._id!).subscribe({
      next: (updatedTask) => { 
        // 🚀 CRITICAL FIX: Update ALL fields that might have changed (completed AND completedAt)
        // This ensures the frontend task object gets the new completedAt timestamp from the backend.
        task.completed = updatedTask.completed; 
        task.completedAt = updatedTask.completedAt; // This line is essential
        
        this.toastService.showSuccess(
          `Tarea marcada como ${updatedTask.completed ? 'completa' : 'pendiente'}.`, 
          'Actualización Exitosa'
        );
      },
      error: (error) => {
        console.error('Error al actualizar tarea:', error);
        // Revert optimistic update on error
        task.completed = tempCompleted; 
        this.toastService.showError('No se pudo actualizar la tarea.', 'Error de Actualización');
      }
    }); 
  } 

  // 🚀 UPDATED: Handles the confirmation pop-up
  async deleteTask(task: Task) { 
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Está seguro que desea eliminar la tarea "${task.title}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          cssClass: 'ion-color-danger', // Use Ionic danger color for delete button
          handler: () => {
            this.taskService.deleteTask(task._id!).subscribe({
              next: () => { 
                // Remove the task from the local array
                this.tasks = this.tasks.filter(t => t._id !== task._id);
                this.toastService.showSuccess('Tarea eliminada correctamente.', 'Eliminación Exitosa');
              },
              error: (error) => {
                console.error('Error al eliminar tarea:', error);
                // Check for 404/403 status for specific user feedback
                let errorMessage = 'No se pudo eliminar la tarea.';
                if (error.status === 404 || error.status === 403) { 
                  errorMessage = 'La tarea no existe o no tienes permiso.';
                }
                this.toastService.showError(errorMessage, 'Error de Eliminación');
              }
            });
          },
        },
      ],
    });

    await alert.present();
  } 

  logout() { 
    this.authService.logout(); 
    this.toastService.showSuccess('Has cerrado sesión.', 'Adiós!');
    this.router.navigateByUrl('/login'); // Redirect to login
  }
}