// File: admin.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { AdminService } from '../services/admin.service'; 
import { User } from '../interfaces/user.interface'; 
import { AuthService } from '../services/auth.service'; 
import { Router } from '@angular/router';
// 🚀 NUEVAS IMPORTACIONES
import { TaskService, Task } from '../services/task.service'; 
import { ToastService } from '../services/toast.service'; 
 
// 💡 Tipo para el valor del segmento
type AdminView = 'users' | 'tasks';

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
  
  // 🚀 INYECCIONES ADICIONALES
  private taskService = inject(TaskService);
  private toastService = inject(ToastService); 
  
  // 🚀 NUEVAS PROPIEDADES DE ESTADO
  currentView: AdminView = 'users'; // Define la vista actual
  users: User[] = [];
  isLoading: boolean = false; // Para la carga de usuarios
  allTasks: Task[] = [];
  isTasksLoading: boolean = false; // Para la carga de tareas

  constructor() { }

  ngOnInit() {
    if (!this.authService.isAdmin) {
      this.presentToast('Acceso no autorizado. Debe ser administrador.', 'danger');
      this.router.navigateByUrl('/home');
      return;
    }
    this.loadUsers();
  }

  // 🚀 CORRECCIÓN: El parámetro puede ser SegmentValue | undefined. 
  // Lo casteamos a AdminView y comprobamos que sea un valor válido.
  switchView(value: any) {
    const view = value as AdminView;
    if (view === 'users' || view === 'tasks') {
        this.currentView = view;

        // Carga los datos si la vista es nueva y la lista está vacía
        if (view === 'tasks' && this.allTasks.length === 0) {
          this.loadAllTasks();
        } else if (view === 'users' && this.users.length === 0) {
          this.loadUsers();
        }
    }
  }

  loadUsers() {
    this.isLoading = true;
    this.adminService.getUsers().subscribe({
      next: (users: User[]) => {
        // ... (lógica de ordenación y carga de usuarios)
        this.users = users.sort((a: User, b: User) => {
          if (a.isAdmin === b.isAdmin) return 0;
          return a.isAdmin ? -1 : 1;
        });
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error al cargar usuarios:', error);
        this.presentToast(`Error al cargar usuarios: ${error.message || 'Error desconocido'}`, 'danger');
      }
    });
  }

  // 🚀 NUEVO MÉTODO: Para cargar todas las tareas
  loadAllTasks() {
    this.isTasksLoading = true;
    // Llamada al TaskService con el flag 'true' para obtener todas las tareas
    this.taskService.getTasks(true).subscribe({ 
      next: (tasks: Task[]) => {
        this.allTasks = tasks;
        this.isTasksLoading = false;
        this.presentToast(`Se cargaron ${tasks.length} tareas totales.`, 'success');
      },
      error: (error: any) => {
        this.isTasksLoading = false;
        console.error('Error al cargar todas las tareas:', error);
        this.presentToast(`Error al cargar todas las tareas: ${error.message || 'Error desconocido'}`, 'danger');
      }
    });
  }

  async deleteUser(userId: string) {
    // ... (lógica de eliminación de usuario)
    const userToDelete = this.users.find(u => u._id === userId);

    if (userToDelete && userToDelete.isAdmin) {
        this.presentToast('No puedes eliminar una cuenta de administrador.', 'warning');
        return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Está seguro que desea eliminar la cuenta de ${userToDelete?.username}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar', 
          cssClass: 'ion-color-danger',
          handler: () => {
            this.adminService.deleteUser(userId).subscribe({
              next: () => {
                this.users = this.users.filter(u => u._id !== userId);
                this.presentToast(`Usuario eliminado con éxito.`, 'success');
              },
              error: (error: any) => {
                console.error('Error al eliminar usuario:', error);
                this.presentToast(`Error al eliminar usuario: ${error.error?.error || 'Error desconocido'}`, 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // 🚀 NUEVO MÉTODO: Para eliminar cualquier tarea (solo admin)
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
                    this.taskService.deleteTask(task._id!).subscribe({
                        next: () => {
                            this.allTasks = this.allTasks.filter(t => t._id !== task._id);
                            this.presentToast(`Tarea eliminada con éxito.`, 'success');
                        },
                        error: (error: any) => {
                            console.error('Error al eliminar tarea:', error);
                            this.presentToast(`Error al eliminar tarea: ${error.error?.error || 'Error desconocido'}`, 'danger');
                        }
                    });
                }
            }
        ]
    });
    await alert.present();
  }

  async presentToast(message: string, color: string) {
    // Usamos el ToastService global para consistencia
    if (color === 'danger') {
        this.toastService.showError(message, 'Error');
    } else if (color === 'warning') {
        // Debes añadir 'showWarning' a toast.service.ts si aún no lo has hecho.
        // Asumo que lo tienes de conversaciones anteriores, si no, fallará aquí.
        // Si no existe, usa 'showError' temporalmente.
        this.toastService.showWarning(message, 'Advertencia'); 
    } else if (color === 'success') {
        this.toastService.showSuccess(message, 'Éxito');
    }
  }
}