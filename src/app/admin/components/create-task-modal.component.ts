// File: src/app/admin/components/create-task-modal/create-task-modal.component.ts

import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

import { User } from 'src/app/interfaces/user.interface'; // Asegúrate de ajustar la ruta si es necesario
import { TaskService, Task } from 'src/app/services/task.service'; // Asegúrate de ajustar la ruta si es necesario
import { ToastService } from 'src/app/services/toast.service'; // Asegúrate de ajustar la ruta si es necesario

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

  constructor() { }

  ngOnInit() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      // 💡 Aseguramos que se seleccione un usuario, usando el ID del primer usuario como valor por defecto.
      assignedUserId: [this.users[0]?._id || '', [Validators.required]] ,
      tagsInput: [''],
    });
  }

  /**
   * Cierra el modal, devolviendo 'false' como rol (cancelado).
   */
  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  /**
   * Crea la tarea y cierra el modal con éxito.
   */
  createTask() {
    if (this.taskForm.invalid) {
      this.toastService.showError('Revise el formulario. Faltan datos obligatorios.', 'Advertencia');
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const { title, description, assignedUserId, tagsInput } = this.taskForm.value;

    const tagsArray = tagsInput
      ? tagsInput.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
      : [];

    const newTask: Partial<Task> = {
      title: title,
      description: description,
      tags: tagsArray,
      completed: false // Por defecto, es false
    };

    // Buscamos el nombre del usuario para el mensaje de éxito
    const selectedUserName = this.users.find(u => u._id === assignedUserId)?.username;

    this.taskService.createTask(newTask, assignedUserId).subscribe({
      next: (task) => {
        this.isSaving = false;
        this.toastService.showSuccess(`Tarea creada y asignada a ${selectedUserName}.`, 'Éxito');
        // Cierra el modal y devuelve la tarea creada
        this.modalCtrl.dismiss(task, 'created'); 
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error al crear tarea:', error);
        this.toastService.showError(`Error al crear tarea: ${error.error?.error || 'Error desconocido'}`, 'Error');
        // No cerramos el modal si hay error para que el usuario pueda corregir
      }
    });
  }
}