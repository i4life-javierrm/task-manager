// File: src/app/admin/components/create-task-modal/create-task-modal.component.ts

import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

// Asegúrate de que estas rutas son correctas en tu proyecto
import { User } from 'src/app/services/user.service'; // Asumiendo que User se exporta desde UserService
import { TaskService, Task } from 'src/app/services/task.service'; 
import { ToastService } from 'src/app/services/toast.service'; 

@Component({
  selector: 'app-create-task-modal',
  templateUrl: './create-task-modal.component.html',
  styleUrls: ['./create-task-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class CreateTaskModalComponent implements OnInit {
  // 💡 INPUT: Lista de usuarios pasados desde AdminPage
  @Input() users: User[] = [];

  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private toastService = inject(ToastService);
  
  taskForm!: FormGroup;
  isSaving: boolean = false;

  ngOnInit() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      // 💥 CORREGIDO: Usamos 'assignedUserIds' (Array de strings)
      assignedUserIds: [[], [Validators.required]], 
      tagsInput: ['']
    });
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  /**
   * Crea la tarea y la asigna al array de usuarios seleccionado.
   */
  createTask() {
    if (this.taskForm.invalid) {
      this.toastService.showError('Revise el formulario. Faltan datos obligatorios.', 'Advertencia');
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    // 💥 CORREGIDO: Capturamos el array de IDs
    const { title, description, assignedUserIds, tagsInput } = this.taskForm.value;

    const tagsArray = tagsInput
      ? tagsInput.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
      : [];

    const newTask: Partial<Task> = {
      title: title,
      description: description,
      tags: tagsArray,
      completed: false 
    };

    // 💡 Preparamos el mensaje de éxito para varios usuarios
    const selectedUsernames = this.users
        .filter(u => assignedUserIds.includes(u._id))
        .map(u => u.username)
        .join(', ');
    
    const successMessage = `Tarea creada y asignada a: ${selectedUsernames}`;

    // 💥 CORREGIDO: Pasamos el array de IDs al TaskService (que ya acepta arrays)
    this.taskService.createTask(newTask, assignedUserIds).subscribe({
      next: (task) => {
        this.isSaving = false;
        this.toastService.showSuccess(successMessage, 'Éxito');
        this.modalCtrl.dismiss(task, 'created'); 
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error al crear tarea:', error);
        this.toastService.showError(`Error: ${error.error?.error || 'Error desconocido'}`, 'Error de Creación');
      },
    });
  }
}