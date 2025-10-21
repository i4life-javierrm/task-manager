// File: src/app/admin/admin.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';

// 💡 IMPORTANTE: Asegúrate de que esta ruta sea correcta en tu proyecto
import { CreateTaskModalComponent } from './components/create-task-modal.component'; 

import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { TaskService, Task } from '../services/task.service';
import { ToastService } from '../services/toast.service';
import { UserService, User } from '../services/user.service'; 

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AdminPage implements OnInit {
  // Inyecciones
  private userService = inject(UserService); 
  public authService = inject(AuthService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private taskService = inject(TaskService);
  private toastService = inject(ToastService);
  private modalCtrl = inject(ModalController); 

  // ------------------------------------
  // PROPIEDADES DE ESTADO
  // ------------------------------------
  // 🔄 ¡Añadido 'trashedTasks' a los posibles valores!
  currentView: 'users' | 'tasks' | 'trashedTasks' = 'users'; 
  
  users: User[] = []; 
  allTasks: Task[] = [];
  // 🗑️ Nueva propiedad para las tareas en la papelera
  trashedTasks: Task[] = []; 
  
  isLoadingUsers: boolean = true;
  isLoadingTasks: boolean = true;
  // 🗑️ Nueva propiedad de estado de carga
  isLoadingTrashedTasks: boolean = true;
  
  // ------------------------------------
  // LÓGICA GRUPAL: Función para obtener la lista de usuarios asignados
  // ------------------------------------
  /**
   * Convierte el array de objetos de usuario a un string legible.
   * Muestra hasta 3 nombres y el conteo restante si hay más.
   */
  getUserList(task: Task): string {
    if (task.users && task.users.length > 0) {
        const usernames = task.users.map(u => u.username);
        if (usernames.length > 3) {
            return usernames.slice(0, 3).join(', ') + ` y ${usernames.length - 3} más`;
        }
        return usernames.join(', ');
    }
    return '(Sin asignar)';
  }
  
  // ------------------------------------
  // LÓGICA DE CARGA DE DATOS
  // ------------------------------------
  ngOnInit() {
    this.loadUsers();
    this.loadAllTasks();
    this.loadTrashedTasks(); // 🗑️ Cargar tareas en papelera al inicio
  }

  loadUsers() {
    this.isLoadingUsers = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.toastService.showError('Error al cargar la lista de usuarios.', 'Error');
        this.isLoadingUsers = false;
      },
    });
  }

  loadAllTasks() {
    this.isLoadingTasks = true;
    // Carga tareas activas globales
    this.taskService.getTasks(true).subscribe({ 
      next: (tasks) => {
        this.allTasks = tasks;
        this.isLoadingTasks = false;
      },
      error: (error) => {
        console.error('Error al cargar tareas globales:', error);
        this.toastService.showError('Error al cargar tareas globales.', 'Error');
        this.isLoadingTasks = false;
      },
    });
  }
  
  /**
   * 🗑️ Carga todas las tareas que han sido movidas a la papelera (isTrashed: true).
   */
  loadTrashedTasks() {
    this.isLoadingTrashedTasks = true;
    this.taskService.getTrashedTasks(true).subscribe({
      next: (tasks) => {
        this.trashedTasks = tasks;
        this.isLoadingTrashedTasks = false;
      },
      error: (error) => {
        console.error('Error al cargar tareas en papelera:', error);
        this.toastService.showError('Error al cargar tareas de la papelera.', 'Error');
        this.isLoadingTrashedTasks = false;
      },
    });
  }
  
  // ------------------------------------
  // LÓGICA DE GESTIÓN (USUARIOS Y TAREAS)
  // ------------------------------------
  async deleteUser(user: User) {
    if (user.role === 'ADMIN') {
        this.toastService.showError('No se puede eliminar una cuenta de administrador.', 'Error de Permisos');
        return;
    }
    
    const alert = await this.alertCtrl.create({
        header: 'Confirmar Eliminación',
        message: `¿Está seguro que desea eliminar el usuario **${user.username}**? Se eliminará de todas las tareas a las que pertenezca y se borrarán sus tareas individuales.`,
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
                text: 'Eliminar',
                cssClass: 'ion-color-danger',
                handler: () => {
                    // Nota: Asumiendo que has añadido el método deleteUser en UserService
                    this.userService.deleteUser(user._id).subscribe({ 
                        next: () => {
                            this.users = this.users.filter((u) => u._id !== user._id);
                            this.loadAllTasks(); 
                            this.toastService.showSuccess(`Usuario ${user.username} eliminado.`, 'Éxito');
                        },
                        error: (error: any) => {
                            console.error('Error al eliminar usuario:', error);
                            this.toastService.showError(`Error: ${error.error?.error || 'Error desconocido'}`, 'Error');
                        },
                    });
                },
            },
        ],
    });
    await alert.present();
  }
  
  async deleteAdminTask(task: Task) {
    if (!task._id) return;

    const assignedUsers = this.getUserList(task); 

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      // Muestra la lista de usuarios asignados
      message: `¿Está seguro que desea mover la tarea de \"${assignedUsers}\" titulada \"${task.title}\" a la papelera?`, 
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Mover a Papelera',
          cssClass: 'ion-color-danger',
          handler: () => {
            this.taskService.moveToTrash(task._id!).subscribe({
              next: () => {
                this.allTasks = this.allTasks.filter((t) => t._id !== task._id);
                this.loadTrashedTasks(); // Recargar la papelera
                this.toastService.showSuccess(`Tarea movida a la papelera.`, 'Éxito');
              },
              error: (error: any) => {
                console.error('Error al mover tarea a papelera:', error);
                this.toastService.showError(
                  `Error al mover tarea: ${error.error?.error || 'Error desconocido'}`,
                  'Error'
                );
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  /**
   * 🗑️ Muestra un diálogo de confirmación y restaura la tarea desde la papelera.
   */
  async restoreTask(task: Task) {
    if (!task._id) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Restauración',
      message: `¿Está seguro que desea **restaurar** la tarea \"${task.title}\"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Restaurar',
          handler: () => {
            this.taskService.restoreTask(task._id!).subscribe({
              next: () => {
                this.trashedTasks = this.trashedTasks.filter((t) => t._id !== task._id);
                this.loadAllTasks(); // Recargar tareas activas
                this.toastService.showSuccess(`Tarea \"${task.title}\" restaurada con éxito.`, 'Éxito');
              },
              error: (error: any) => {
                console.error('Error al restaurar tarea:', error);
                this.toastService.showError(
                  `Error al restaurar tarea: ${error.error?.error || 'Error desconocido'}`,
                  'Error'
                );
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }
  
  /**
   * ❌ Muestra un diálogo de confirmación y elimina la tarea PERMANENTEMENTE.
   */
  async deleteTaskPermanent(task: Task) {
    if (!task._id) return;

    const alert = await this.alertCtrl.create({
      header: 'ELIMINACIÓN PERMANENTE',
      subHeader: `¡Esta acción no se puede deshacer!`,
      message: `¿Está **ABSOLUTAMENTE SEGURO** de que desea eliminar PERMANENTEMENTE la tarea \"${task.title}\"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar Permanentemente',
          cssClass: 'ion-color-danger',
          handler: () => {
            this.taskService.deleteTaskPermanent(task._id!).subscribe({
              next: () => {
                this.trashedTasks = this.trashedTasks.filter((t) => t._id !== task._id);
                this.toastService.showSuccess(`Tarea eliminada PERMANENTEMENTE.`, 'Éxito');
              },
              error: (error: any) => {
                console.error('Error al eliminar tarea permanentemente:', error);
                this.toastService.showError(
                  `Error al eliminar: ${error.error?.error || 'Error desconocido'}`,
                  'Error'
                );
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  // ------------------------------------
  // 🚀 FUNCIÓN DE MODAL
  // ------------------------------------
  async openCreateTaskModal() {
    const modal = await this.modalCtrl.create({
      // 💡 Asumimos que este componente existe y está importado
      component: CreateTaskModalComponent, 
      componentProps: {
        users: this.users 
      }
    });
    
    // Si el modal se cierra con el rol 'created', recarga las tareas
    modal.onDidDismiss().then((result) => {
      if (result.role === 'created') {
        this.loadAllTasks();
      }
    });
    
    return await modal.present();
  }
  
  // ------------------------------------
  // FUNCIÓN DE NAVEGACIÓN
  // ------------------------------------
  logout() {
    this.authService.logout();
    this.toastService.showSuccess('Has cerrado sesión.', 'Adiós!');
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}