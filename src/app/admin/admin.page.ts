// File: src/app/admin/admin.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { CreateTaskModalComponent } from './components/create-task-modal.component';
import { AdminService } from '../services/admin.service'; 
import { User } from '../interfaces/user.interface'; 
import { AuthService } from '../services/auth.service'; 
import { Router } from '@angular/router';
import { TaskService, Task } from '../services/task.service'; 
import { ToastService } from '../services/toast.service'; 

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AdminPage implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private taskService = inject(TaskService);
  private toastService = inject(ToastService); 
  private modalCtrl = inject(ModalController); 
  
  // ------------------------------------
  // PROPIEDADES DE ESTADO
  // ------------------------------------
  private _currentView: 'users' | 'tasks' = 'users'; 
  set currentView(value: 'users' | 'tasks') {
    this._currentView = value;
    // Carga las tareas globales la primera vez que se cambia al segmento 'tasks'
    if (value === 'tasks' && this.allTasks.length === 0) {
      this.loadAllTasks();
    }
  }
  get currentView(): 'users' | 'tasks' {
    return this._currentView;
  }
  
  users: User[] = [];
  isLoading: boolean = false; 
  allTasks: Task[] = [];
  isTasksLoading: boolean = false; 
  
  constructor() { }

  ngOnInit() {
    // Verificación de administrador al inicio
    if (!this.authService.isAdmin) {
      this.toastService.showError('Acceso no autorizado. Debe ser administrador.', 'Error');
      this.router.navigateByUrl('/home');
      return;
    }
    this.loadUsers();
  }

  // ------------------------------------
  // GESTIÓN DE USUARIOS
  // ------------------------------------
  
  loadUsers() {
    this.isLoading = true;
    this.adminService.getUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error al cargar usuarios:', error);
        this.toastService.showError('Error al cargar la lista de usuarios.', 'Error');
      }
    });
  }

  async deleteUser(userId: string) {
    const userToDelete = this.users.find(u => u._id === userId);

    if (userToDelete && userToDelete.role === 'ADMIN') {
        this.toastService.showError('No puedes eliminar una cuenta de administrador.', 'Advertencia');
        return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Está seguro que desea eliminar la cuenta de ${userToDelete?.username}? Se eliminarán TODAS sus tareas.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar', 
          cssClass: 'ion-color-danger',
          handler: () => {
            this.adminService.deleteUser(userId).subscribe({
              next: () => {
                this.users = this.users.filter(u => u._id !== userId);
                this.toastService.showSuccess(`Usuario eliminado con éxito y sus tareas asociadas.`, 'Éxito');
              },
              error: (error: any) => {
                console.error('Error al eliminar usuario:', error);
                this.toastService.showError(`Error al eliminar usuario: ${error.error?.error || 'Error desconocido'}`, 'Error');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
  
  // ------------------------------------
  // GESTIÓN DE TAREAS GLOBALES
  // ------------------------------------
  
  loadAllTasks() {
    this.isTasksLoading = true;
    // El 'true' pide al servicio que añada el parámetro 'all=true' para ver todas las tareas
    this.taskService.getTasks(true).subscribe({ 
      next: (tasks: Task[]) => {
        this.allTasks = tasks;
        this.isTasksLoading = false;
        // Sólo mostrará el toast si el array no estaba previamente cargado
        if(tasks.length > 0) {
            this.toastService.showSuccess(`Se cargaron ${tasks.length} tareas totales.`, 'Éxito');
        }
      },
      error: (error: any) => {
        this.isTasksLoading = false;
        console.error('Error al cargar todas las tareas:', error);
        this.toastService.showError(`Error al cargar tareas: ${error.error?.error || 'Error desconocido'}`, 'Error');
      }
    });
  }

// 🌟 NUEVA FUNCIONALIDAD: Crear tarea para usuario (USANDO MODAL)
async createTaskForUser() {
  if (this.users.length === 0) {
    this.toastService.showInfo('Cargando usuarios... Intente de nuevo en un momento.', 'Info');
    this.loadUsers();
    return;
  }

  const modal = await this.modalCtrl.create({
      component: CreateTaskModalComponent,
      // Pasamos la lista de usuarios al modal como un input
      componentProps: {
          users: this.users
      }
  });

  await modal.present();

  // Esperamos a que el modal se cierre
  const { data, role } = await modal.onWillDismiss();

  // Si el rol es 'created', significa que la tarea se creó con éxito
  if (role === 'created') {
      // La tarea ya fue enviada y el toast mostrado dentro del modal.
      // Solo necesitamos recargar la lista de tareas globales
      this.loadAllTasks(); 
  }
}

  async deleteAdminTask(task: Task) {
    const alert = await this.alertCtrl.create({
        header: 'Confirmar Eliminación de Tarea',
        message: `¿Está seguro que desea eliminar la tarea de ${task.user?.username || 'un usuario'} titulada \"${task.title}\"?`,
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            { 
                text: 'Eliminar', 
                cssClass: 'ion-color-danger',
                handler: () => {
                    // El servicio de tareas se encarga de usar el permiso de admin para borrar
                    this.taskService.deleteTask(task._id!).subscribe({
                        next: () => {
                            this.allTasks = this.allTasks.filter(t => t._id !== task._id);
                            this.toastService.showSuccess(`Tarea eliminada con éxito.`, 'Éxito');
                        },
                        error: (error: any) => {
                            console.error('Error al eliminar tarea:', error);
                            this.toastService.showError(`Error al eliminar tarea: ${error.error?.error || 'Error desconocido'}`, 'Error');
                        }
                    });
                }
            }
        ]
    });
    await alert.present();
  }

  // ------------------------------------
  // 💥 FUNCIÓN FALTANTE: LOGOUT
  // ------------------------------------
  logout() {
    this.authService.logout();
    this.toastService.showSuccess('Has cerrado sesión.', 'Adiós!');
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}