// src/app/register/register.page.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service'; 

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html', 
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class RegisterPage {
  username = '';
  password = '';
  // 💥 AÑADIDO: Campo para la validación del lado del cliente
  confirmPassword = ''; 
  // 💥 AÑADIDO: Controlar el estado de carga
  isLoading = false;

  // 💡 USANDO INJECT PARA CONSISTENCIA
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  
  constructor() { }

  register() {
    // 💥 VALIDACIÓN CRÍTICA: La contraseña debe coincidir con la confirmación
    if (this.password !== this.confirmPassword) {
      this.toastService.showError('Las contraseñas no coinciden. Por favor, revísalas.', 'Error de Validación');
      this.password = '';
      this.confirmPassword = '';
      return;
    }
    
    this.isLoading = true; // Inicia la carga
    
    this.authService.register(this.username, this.password)
      .subscribe({
        next: (response) => {
          this.isLoading = false; // Finaliza la carga
          this.toastService.showSuccess(
            '¡Registro exitoso! Ya puedes iniciar sesión.', 
            'Usuario Creado'
          );
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoading = false; // Finaliza la carga
          console.error('Registration Error:', error);
          
          let errorMessage = 'Error desconocido. Inténtalo de nuevo.';
          let errorTitle = 'Error de Registro';
          
          // Lógica de manejo de errores
          if (error.status === 409) {
             errorMessage = error.error?.error || 'El usuario ya existe.';
             errorTitle = 'Usuario Duplicado';
          } 
          else if (error.status === 400) {
             errorMessage = error.error?.error || 'Datos de registro inválidos.';
             errorTitle = 'Error de Validación';
          }
          else if (error.error?.error) {
             errorMessage = error.error.error;
             errorTitle = 'Error de Servidor';
          }
          
          this.toastService.showError(errorMessage, errorTitle);
          
          this.password = ''; 
          this.confirmPassword = '';
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}