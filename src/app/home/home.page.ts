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
  newTaskTagsInput: string = ''; 
  isAdminUser: boolean = false; 

  // 💥 ELIMINADO: filterTagInput (reemplazado por selectedTags)
  
  // 🚀 NUEVA PROPIEDAD: Los tags seleccionados para filtrar
  selectedTags: string[] = []; 

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

  // 🚀 NUEVA PROPIEDAD CALCULADA: Genera una lista de todos los tags únicos
  get availableTags(): string[] {
    const nestedTags: string[][] = this.tasks
      .map(task => task.tags || []); // Obtiene arrays de tags (string[][])
  
    // Solución TS2550: Usa reduce en lugar de flat() para aplanar el array.
    // Solución TS7006/TS2322: Añade tipado explícito a las funciones.
    const allTags: string[] = nestedTags
      .reduce((acc: string[], val: string[]) => acc.concat(val), [])
      // Solución TS7006: Tipado explícito para 'tag'
      .filter((tag: string) => tag && tag.trim().length > 0); 
  
    // Usa un Set para obtener solo los valores únicos y luego los ordena.
    // El tipado previo garantiza que el resultado sea string[]
    return [...new Set(allTags)].sort(); 
  }

  // 🚀 PROPIEDAD CALCULADA: Tareas filtradas (LÓGICA DE FILTRADO MÚLTIPLE)
  get filteredTasks(): Task[] {
    // Si no hay tags seleccionados, devuelve todas las tareas
    if (this.selectedTags.length === 0) {
      return this.tasks;
    }

    // Filtra las tareas cuya lista de tags incluya TODOS los selectedTags (AND logic)
    return this.tasks.filter(task => {
      // Si la tarea no tiene tags, no puede contener los seleccionados
      if (!task.tags || task.tags.length === 0) {
        return false;
      }
      
      // Comprobamos si TODOS los selectedTags están presentes en task.tags
      // 💥 CAMBIO CLAVE: Usamos .some() en lugar de .every() para la lógica OR.
      return this.selectedTags.some(selectedTag => 
        task.tags.some(taskTag => taskTag.toLowerCase() === selectedTag.toLowerCase())
      );
    });
  }

  // 🚀 PROPIEDAD CALCULADA: Tareas pendientes (basada en filteredTasks)
  get pendingTasks(): Task[] {
    return this.filteredTasks.filter(t => !t.completed);
  }

  // 🚀 NUEVO MÉTODO: Alterna la selección de un tag
  toggleTagFilter(tag: string) {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      // El tag ya está seleccionado, lo quitamos
      this.selectedTags.splice(index, 1);
    } else {
      // El tag no está seleccionado, lo añadimos
      this.selectedTags.push(tag);
    }
  }

  // 🚀 NUEVO MÉTODO: Comprueba si un tag está seleccionado
  isTagSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  // 🚀 NUEVO MÉTODO: Limpia el filtro
  clearTagFilter() {
    this.selectedTags = [];
  }

  // --------------------------------------------------------------------------------
  // El resto de métodos se mantienen igual...
  // --------------------------------------------------------------------------------

  // Verifica si la tarea actual está siendo editada
  isEditing(taskId: string | undefined): boolean {
    return taskId === this.editingTaskId;
  }

  // Activa/Desactiva el modo de edición
  toggleEditMode(taskId: string | undefined) {
    if (!taskId) return; 

    if (this.isEditing(taskId)) {
        this.editingTaskId = null;
    } else {
        this.editingTaskId = taskId;
    }
  }

  // Guarda la descripción actualizada de la tarea
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

  addTask() { 
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

    this.taskService.createTask(newTaskData).subscribe({ 
      next: (task) => { 
        // 💡 Importante: Se añade a 'tasks' para que el filtro y 'availableTags' se actualicen
        this.tasks.unshift(task); 
        this.newTaskTitle = ''; 
        this.newTaskDescription = ''; 
        this.newTaskTagsInput = ''; 
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