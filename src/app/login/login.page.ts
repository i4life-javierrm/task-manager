// src/app/login/login.page.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})

export class LoginPage {
  username = '';
  password = '';
  // 💥 AÑADIDO: Controlar el estado de carga del botón
  isLoading = false; 
  
  // 💡 USANDO INJECT PARA CONSISTENCIA
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  
  constructor() { } 
  
  login() {
    this.isLoading = true; // Inicia la carga
    
    this.authService.login(this.username, this.password)
      .subscribe({
        next: () => {
          this.isLoading = false; // Finaliza la carga
          this.toastService.showSuccess('¡Inicio de sesión exitoso!', 'Bienvenido');
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isLoading = false; // Finaliza la carga
          console.error('Login Error:', error);
          
          let errorMessage = 'Error de servidor. Por favor, inténtalo de nuevo.';
          let errorTitle = 'Error';
          
          // Lógica de manejo de errores
          if (error.status === 401) {
             errorMessage = error.error?.error || 'Credenciales incorrectas.';
             errorTitle = 'Error de Autenticación';
          } else if (error.error?.error) {
             errorMessage = error.error.error;
             errorTitle = 'Error de Solicitud';
          }
          
          this.toastService.showError(errorMessage, errorTitle);
          this.password = ''; // Limpiar la contraseña
        }
      });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}