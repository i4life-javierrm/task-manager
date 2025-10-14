// src/app/login/login.page.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service'; // 💡 Inject this

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
  
  constructor(
    private authService: AuthService, 
    private router: Router, 
    private toastService: ToastService // 💡 Injection is now safe
  ) { }
  
  login() {
    this.authService.login(this.username, this.password)
      .subscribe({
        next: () => {
          this.toastService.showSuccess('¡Inicio de sesión exitoso!', 'Bienvenido');
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Login Error:', error);
          
          let errorMessage = 'Error de servidor. Por favor, inténtalo de nuevo.';
          let errorTitle = 'Error';
          
          // --- Error Handling Logic ---
          if (error.status === 401) {
             // Catches the specific 401 message: {"error": "Credenciales incorrectas"}
             errorMessage = error.error?.error || 'Credenciales incorrectas.';
             errorTitle = 'Error de Autenticación';
          } else if (error.error?.error) {
             // Catches 400 validation errors (e.g., in /register)
             errorMessage = error.error.error;
             errorTitle = 'Error de Solicitud';
          }
          
          this.toastService.showError(errorMessage, errorTitle);
          this.password = ''; 
        }
      });
  }
  
  goToRegister() {
    this.router.navigate(['/register']);
  }
}