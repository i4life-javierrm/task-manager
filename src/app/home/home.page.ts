import { Component, OnInit, inject } from '@angular/core'; 
import { TaskService, Task } from '../services/task.service'; 
import { IonicModule, AlertController } from '@ionic/angular'; 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service'; // 👈 Usamos la versión actualizada
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
  newTaskDescription: string = '';
  // NEW STATE VARIABLE: Para mostrar el botón de Admin
  isAdminUser: boolean = false; 

  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private alertController = inject(AlertController);

  constructor() { } 
 
  ngOnInit() { 
    this.loadTasks(); 
    // 💥 FIX: Usar 'isAdmin' como propiedad (sin paréntesis)
    this.isAdminUser = this.authService.isAdmin; 
  } 
 
  loadTasks() { 
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
      },
      error: (error) => {
        console.error('Error al cargar tareas:', error);
        if (error.status === 401) {
          this.authService.logout();
        }
        this.toastService.showError('Error al cargar las tareas.', 'Error');
      }
    });
  } 

  addTask() {
    if (!this.newTaskTitle.trim()) {
      this.toastService.showWarning('El título de la tarea es obligatorio.', 'Falta Título');
      return;
    }

    const newTask: Partial<Task> = {
      title: this.newTaskTitle,
      description: this.newTaskDescription,
      completed: false
    };

    this.taskService.createTask(newTask).subscribe({
      next: (task) => {
        this.tasks.unshift(task); 
        this.newTaskTitle = '';
        this.newTaskDescription = '';
        this.toastService.showSuccess('Tarea creada correctamente.', 'Creación Exitosa');
      },
      error: (error) => {
        console.error('Error al crear tarea:', error);
        this.toastService.showError('No se pudo crear la tarea. Inténtelo de nuevo.', 'Error');
      }
    });
  }

  toggleTaskCompletion(task: Task) {
    const updatedTask = { ...task, completed: !task.completed };

    this.taskService.updateTask(updatedTask).subscribe({
      next: (response) => {
        const index = this.tasks.findIndex(t => t._id === task._id);
        if (index > -1) {
          this.tasks[index] = response;
          this.toastService.showSuccess(`Tarea marcada como ${response.completed ? 'completa' : 'pendiente'}.`, 'Actualización Exitosa');
        }
      },
      error: (error) => {
        console.error('Error al actualizar tarea:', error);
        this.toastService.showError('No se pudo actualizar la tarea.', 'Error de Actualización');
      }
    });
  }

  async deleteTask(task: Task) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Está seguro que desea eliminar la tarea \"${task.title}\"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          cssClass: 'ion-color-danger', 
          handler: () => {
            this.taskService.deleteTask(task._id!).subscribe({
              next: () => { 
                this.tasks = this.tasks.filter(t => t._id !== task._id);
                this.toastService.showSuccess('Tarea eliminada correctamente.', 'Eliminación Exitosa');
              },
              error: (error) => {
                console.error('Error al eliminar tarea:', error);
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
    this.router.navigateByUrl('/login'); 
  }
}