import { Component, OnInit, inject } from '@angular/core'; 
import { TaskService, Task } from '../services/task.service'; 
import { IonicModule, AlertController } from '@ionic/angular'; 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router'; 
import { ToastService } from '../services/toast.service'; 

// 🆕 NUEVO: Importar el servicio de usuarios y la interfaz de Usuario (asumiendo services/user.service.ts)
import { UserService, User } from '../services/user.service'; // <--- ASUMIMOS ESTA RUTA
 
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
  
  // Propiedades del formulario de nueva tarea
  newTaskTitle: string = ''; 
  newTaskDescription: string = '';
  newTaskTagsInput: string = ''; 
  
  // 🚀 NUEVA PROPIEDAD: Lista de usuarios disponibles para asignar (solo si es admin)
  availableUsers: User[] = []; 
  // 🚀 NUEVA PROPIEDAD: IDs de usuario seleccionados en el formulario
  selectedUserIds: string[] = []; 

  isAdminUser: boolean = false; 
  
  selectedTags: string[] = []; 
  editingTaskId: string | null = null; 

  private taskService = inject(TaskService);
  // 🆕 NUEVO: Inyección del servicio de usuarios
  private userService = inject(UserService); 
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private alertController = inject(AlertController);

  constructor() { } 
 
  ngOnInit() { 
    this.isAdminUser = this.authService.isAdmin; 
    this.loadTasks(); 
    
    // 🚀 LÓGICA GRUPAL: Solo si el usuario es administrador, carga la lista de usuarios
    if (this.isAdminUser) {
        this.loadUsers();
    }
  } 
 
  // 🆕 NUEVO MÉTODO: Cargar usuarios (solo para admins)
  loadUsers() {
    this.userService.getAllUsers().subscribe({
        next: (users) => {
            // Filtra el usuario 'admin' o el usuario actual si no quieres que se auto-asigne dos veces
            this.availableUsers = users.filter(u => u.username.toLowerCase() !== 'admin');
        },
        error: (error) => {
            console.error('Error al cargar usuarios:', error);
            this.toastService.showError('Error al cargar la lista de usuarios.', 'Error');
        }
    });
  }

  loadTasks() { 
    this.taskService.getTasks().subscribe({ 
      next: (tasks) => { 
        // 💡 Importante: La interfaz Task ahora espera un array de 'users'
        this.tasks = tasks; 
      }, 
      error: (error) => { 
        console.error('Error al cargar tareas:', error); 
        this.toastService.showError('Error al cargar tareas.', 'Error');
      } 
    }); 
  }

  // ... (El resto de getters y métodos de filtrado se mantienen igual) ...

  get availableTags(): string[] {
    const nestedTags: string[][] = this.tasks
      .map(task => task.tags || []); 
    
    const allTags: string[] = nestedTags
      .reduce((acc: string[], val: string[]) => acc.concat(val), [])
      .filter((tag: string) => tag && tag.trim().length > 0); 
  
    return [...new Set(allTags)].sort(); 
  }

  get filteredTasks(): Task[] {
    if (this.selectedTags.length === 0) {
      return this.tasks;
    }

    return this.tasks.filter(task => {
      if (!task.tags || task.tags.length === 0) {
        return false;
      }
      
      return this.selectedTags.some(selectedTag => 
        task.tags.some(taskTag => taskTag.toLowerCase() === selectedTag.toLowerCase())
      );
    });
  }

  get pendingTasks(): Task[] {
    return this.filteredTasks.filter(t => !t.completed);
  }

  toggleTagFilter(tag: string) {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  clearTagFilter() {
    this.selectedTags = [];
  }

  isEditing(taskId: string | undefined): boolean {
    return taskId === this.editingTaskId;
  }

  toggleEditMode(taskId: string | undefined) {
    if (!taskId) return; 

    if (this.isEditing(taskId)) {
        this.editingTaskId = null;
    } else {
        this.editingTaskId = taskId;
    }
  }

  saveDescription(task: Task) {
    if (!task._id) {
        this.toastService.showError('No se pudo guardar: ID de tarea inválido.', 'Error');
        return;
    }

    this.taskService.updateTask(task).subscribe({
        next: (updatedTask: Task) => {
            const index = this.tasks.findIndex(t => t._id === updatedTask._id);
            if (index > -1) {
                this.tasks[index] = updatedTask;
            }
            this.editingTaskId = null; 
            this.toastService.showSuccess('Descripción guardada correctamente.', 'Éxito');
        },
        error: (error) => {
            console.error('Error al guardar descripción:', error);
            this.toastService.showError('Error al guardar la descripción.', 'Error de Edición');
            this.loadTasks(); 
        }
    });
  }

  // 🚀 LÓGICA GRUPAL: Método addTask modificado para aceptar un array de IDs
  async addTask() { 
    if (!this.newTaskTitle.trim()) { 
      this.toastService.showError('El título no puede estar vacío.', 'Error de Entrada');
      return; 
    } 

    const tagsArray = this.newTaskTagsInput 
      ? this.newTaskTagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];
      
    const newTaskData: Partial<Task> = {
        title: this.newTaskTitle.trim(),
        description: this.newTaskDescription.trim(),
        tags: tagsArray 
    };

    // 💡 Lógica de Asignación Grupal
    let userIdsToAssign: string[] | undefined;

    if (this.isAdminUser) {
      // Si es administrador, enviamos los IDs seleccionados.
      // Si el admin no seleccionó a nadie (selectedUserIds está vacío), 
      // el array enviado es [], y el backend debería no asignar a nadie, 
      // O: el backend debe forzar la asignación al creador si el array está vacío (¡lo haremos en el backend para seguridad!)
      userIdsToAssign = this.selectedUserIds.length > 0 ? this.selectedUserIds : undefined;
      // 🚨 NOTA: Para permitir que el admin cree una tarea SIN asignarla a sí mismo,
      // simplemente no debe seleccionarse en el formulario.
    }


    // 💡 CAMBIO CLAVE: Enviamos el array de IDs seleccionados
    this.taskService.createTask(newTaskData, userIdsToAssign).subscribe({ 
      next: (task) => { 
        this.tasks.unshift(task); 
        this.newTaskTitle = ''; 
        this.newTaskDescription = ''; 
        this.newTaskTagsInput = ''; 
        // 💡 Limpiamos la selección de usuarios después de crear
        this.selectedUserIds = []; 
        this.loadTasks();
        this.toastService.showSuccess('Tarea agregada correctamente.', 'Éxito');
      }, 
      error: (error) => { 
        console.error('Error al agregar tarea:', error); 
        this.toastService.showError('Error al agregar tarea.', 'Error');
      } 
    }); 
  }

  toggleTaskCompletion(task: Task) {
    if (!task._id) return;

    const updatedTask: Task = { ...task, completed: !task.completed };

    this.taskService.updateTask(updatedTask).subscribe({
        next: (responseTask) => {
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

  /**
 * Convierte el array de objetos de usuario a un string separado por comas (ej: "Juan, Maria, Pedro")
 * @param task La tarea de la que se obtendrán los nombres de usuario.
 * @returns Un string con los nombres de usuario o '(Sin asignar)'
 */
getUserList(task: Task): string {
  // 💡 SOLUCIÓN TS: Verificamos si 'users' existe y tiene elementos antes de llamar a map()
  if (task.users && task.users.length > 0) {
      // Utilizamos el operador Elvis opcional '?' para mayor seguridad si Task fuera undefined
      return task.users.map(u => u.username).join(', ');
  }
  return '(Sin asignar)';
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