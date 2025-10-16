import { Component, OnInit } from '@angular/core'; 
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
  
  // 🚀 NUEVA PROPIEDAD: Para el control de visibilidad del botón de Admin
  isAdminUser: boolean = false; 

  constructor(
    private http: HttpClient, 
    private taskService: TaskService,
    private authService: AuthService, 
    private router: Router, 
    private toastService: ToastService,
    private alertController: AlertController 
  ) { } 
 
  ngOnInit() { 
    // 🚀 NUEVA LÓGICA: Verificar rol al inicio para mostrar el botón
    this.isAdminUser = this.authService.isAdmin();
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

  toggleTaskCompletion(task: Task) { // ⬅️ Renombrado de toggleTask a toggleTaskCompletion para claridad
    // No hay necesidad de un update optimista aquí ya que usamos Object.assign al final
    
    this.taskService.toggleTask(task._id!).subscribe({
      next: (updatedTask) => { 
        // Actualiza el objeto local con la respuesta del backend
        Object.assign(task, updatedTask); 
        
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

  // 🚀 NUEVO MÉTODO: Navegación al panel de administración
  goToAdmin() {
    this.router.navigateByUrl('/admin');
  }

  logout() { 
    this.authService.logout(); 
    this.toastService.showSuccess('Has cerrado sesión.', 'Adiós!');
    this.router.navigateByUrl('/login'); // Redirect to login
  }
}