import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
// 💡 Import the Toast Service
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

  // 💡 Inject the ToastService
  constructor(
    private authService: AuthService, 
    private router: Router, 
    private toastService: ToastService // <--- Injection
  ) { }

  register() {
    this.authService.register(this.username, this.password)
      .subscribe({
        next: (response) => {
          // Success case (201 Created): Redirect and show success toast
          this.toastService.showSuccess(
            '¡Registro exitoso! Ya puedes iniciar sesión.', 
            'Usuario Creado'
          );
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Registration Error:', error);
          
          let errorMessage = 'Error desconocido. Inténtalo de nuevo.';
          let errorTitle = 'Error de Registro';
          
          // --- Error Handling Logic ---
          
          // 409 Conflict: Username already exists (from auth.routes.js)
          if (error.status === 409) {
             errorMessage = error.error?.error || 'El usuario ya existe.';
             errorTitle = 'Usuario Duplicado';
          } 
          // 400 Bad Request: Validation error (email/password format)
          else if (error.status === 400) {
             // Backend sends a detailed message for validation errors
             errorMessage = error.error?.error || 'Datos de registro inválidos.';
             errorTitle = 'Error de Validación';
          }
          // Default server error
          else if (error.error?.error) {
             errorMessage = error.error.error;
             errorTitle = 'Error de Servidor';
          }
          
          this.toastService.showError(errorMessage, errorTitle);
          
          // Clear the password field for security/UX
          this.password = ''; 
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}