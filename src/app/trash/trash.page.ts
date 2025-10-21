import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { Task, TaskService } from '../services/task.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-trash',
  templateUrl: './trash.page.html',
  styleUrls: ['./trash.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class TrashPage implements OnInit {
  
  // 🗑️ Colección de tareas en la papelera
  trashedTasks$!: Observable<Task[]>;
  isLoading = true;

  constructor(
    private taskService: TaskService,
    private alertController: AlertController // Para confirmación de acciones
  ) { }

  ngOnInit() {
    this.loadTrashedTasks();
  }

  /**
   * Carga las tareas marcadas como isTrashed: true.
   */
  loadTrashedTasks() {
    this.isLoading = true;
    // Llama al nuevo método del servicio
    this.trashedTasks$ = this.taskService.getTrashedTasks();
    this.trashedTasks$.subscribe({
        next: () => this.isLoading = false,
        error: (err) => {
            console.error('Error loading trashed tasks:', err);
            this.isLoading = false;
        }
    });
  }
  
  /**
   * Muestra un diálogo de confirmación y restaura la tarea.
   * @param task La tarea a restaurar.
   */
  async presentRestoreConfirm(task: Task) {
    const alert = await this.alertController.create({
      header: 'Confirmar Restauración',
      message: `¿Estás seguro de que deseas restaurar la tarea: "${task.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Restaurar',
          handler: () => {
            this.restoreTask(task._id!);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Llama al servicio para restaurar la tarea.
   * @param taskId ID de la tarea
   */
  restoreTask(taskId: string) {
    this.taskService.restoreTask(taskId).subscribe({
      next: () => {
        // Recargar la lista para que la tarea restaurada desaparezca
        this.loadTrashedTasks(); 
        console.log(`Tarea ${taskId} restaurada correctamente.`);
      },
      error: (err) => {
        console.error('Error restoring task:', err);
        // Opcional: Mostrar Toast o Alert con el error
      }
    });
  }

  /**
   * Llama al servicio para eliminar permanentemente la tarea (Paso 11 opcional).
   * @param taskId ID de la tarea
   */
  async presentPermanentDeleteConfirm(task: Task) {
    const alert = await this.alertController.create({
      header: 'Eliminar PERMANENTEMENTE',
      message: `Esta acción no se puede deshacer. ¿Deseas eliminar permanentemente la tarea: "${task.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: () => {
            this.deleteTaskPermanent(task._id!);
          }
        }
      ]
    });

    await alert.present();
  }
  
  deleteTaskPermanent(taskId: string) {
    this.taskService.deleteTaskPermanent(taskId).subscribe({
      next: () => {
        // Recargar la lista para que la tarea eliminada desaparezca
        this.loadTrashedTasks(); 
        console.log(`Tarea ${taskId} eliminada permanentemente.`);
      },
      error: (err) => {
        console.error('Error permanently deleting task:', err);
        // Opcional: Mostrar Toast o Alert con el error
      }
    });
  }

}