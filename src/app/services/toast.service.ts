// src/app/services/toast.service.ts
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastr: ToastrService) { }

  /**
   * Displays an error toast.
   * @param message The main content of the toast.
   * @param title The title of the toast (e.g., 'Error de autenticación').
   */
  showError(message: string, title: string = 'Error') {
    this.toastr.error(message, title, {
      timeOut: 5000,
      closeButton: true,
      progressBar: true,
      // You can customize more options here
    });
  }

  /**
   * Displays a success toast.
   * @param message The main content of the toast.
   * @param title The title of the toast (e.g., 'Éxito').
   */
  showSuccess(message: string, title: string = 'Éxito') {
    this.toastr.success(message, title, {
      timeOut: 3000
    });
  }
}