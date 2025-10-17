import { Component, OnInit, inject } from '@angular/core'; 
import { TaskService, Task } from '../services/task.service'; 
import { IonicModule, AlertController } from '@ionic/angular'; 
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
  newTaskDescription: string = '';
  isAdminUser: boolean = false; 

  // 🚀 NUEVA PROPIEDAD: ID de la tarea que se está editando
  editingTaskId: string | null = null; 

  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private alertController = inject(AlertController);

  constructor() { } 
 
  ngOnInit() { 
    this.loadTasks(); 
    this.isAdminUser = this.authService.isAdmin; 
  } 
 
  loadTasks() { 
    this.taskService.getTasks().subscribe({ 
      next: (tasks) => { 
        this.tasks = tasks; 
      }, 
      error: (error) => { 
        console.error('Error al cargar tareas:', error); 
        this.toastService.showError('Error al cargar tareas.', 'Error');
      } 
    }); 
  }

  // 🚀 CÁLCULO DE TAREAS PENDIENTES
  get pendingTasks(): Task[] {
    return this.tasks.filter(t => !t.completed);
  }

  // 🚀 NUEVOS MÉTODOS DE EDICIÓN DE DESCRIPCIÓN

  // Verifica si la tarea actual está siendo editada
  isEditing(taskId: string | undefined): boolean {
    return taskId === this.editingTaskId;
  }

  // Activa/Desactiva el modo de edición
  toggleEditMode(taskId: string | undefined) {
    if (!taskId) return; 

    if (this.isEditing(taskId)) {
        // Si ya está editando, cancela y sale del modo de edición
        this.editingTaskId = null;
    } else {
        // Entra en modo de edición
        this.editingTaskId = taskId;
    }
  }

  // Guarda la descripción actualizada de la tarea
  saveDescription(task: Task) {
    if (!task._id) {
        this.toastService.showError('No se pudo guardar: ID de tarea inválido.', 'Error');
        return;
    }

    // 🚨 Llamamos a updateTask que envía el objeto completo de la tarea
    this.taskService.updateTask(task).subscribe({
        next: (updatedTask: Task) => {
            // Actualiza la tarea en el array local con la respuesta del servidor
            const index = this.tasks.findIndex(t => t._id === updatedTask._id);
            if (index > -1) {
                this.tasks[index] = updatedTask;
            }
            this.editingTaskId = null; // Sale del modo de edición
            this.toastService.showSuccess('Descripción guardada correctamente.', 'Éxito');
        },
        error: (error) => {
            console.error('Error al guardar descripción:', error);
            this.toastService.showError('Error al guardar la descripción.', 'Error de Edición');
            this.loadTasks(); // Recarga para asegurar la consistencia si falla
        }
    });
  }

  // 💥 MODIFICACIÓN: Usar createTask con título y descripción
  addTask() { 
    if (!this.newTaskTitle.trim()) { 
      this.toastService.showError('El título no puede estar vacío.', 'Error de Entrada');
      return; 
    } 

    const newTaskData: Partial<Task> = {
        title: this.newTaskTitle.trim(),
        description: this.newTaskDescription.trim() 
    };

    this.taskService.createTask(newTaskData).subscribe({ 
      next: (task) => { 
        this.tasks.unshift(task); // Agrega la nueva tarea al principio de la lista
        this.newTaskTitle = ''; 
        this.newTaskDescription = ''; 
        this.toastService.showSuccess('Tarea agregada correctamente.', 'Éxito');
      }, 
      error: (error) => { 
        console.error('Error al agregar tarea:', error); 
        this.toastService.showError('Error al agregar tarea.', 'Error');
      } 
    }); 
  }

  // 💥 MODIFICACIÓN: Usar updateTask con la tarea completa para el toggle
  toggleTaskCompletion(task: Task) {
    if (!task._id) return;

    // Clonamos la tarea y cambiamos el estado
    const updatedTask: Task = { ...task, completed: !task.completed };

    this.taskService.updateTask(updatedTask).subscribe({
        next: (responseTask) => {
            // Actualiza la tarea en la lista con la respuesta completa del servidor
            const index = this.tasks.findIndex(t => t._id === task._id);
            if (index !== -1) {
                this.tasks[index] = responseTask;
            }
        },
        error: (error) => {
            console.error('Error al actualizar la tarea:', error);
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
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  goToAdmin() {
    this.router.navigateByUrl('/admin');
  }
}