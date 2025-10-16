import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

// Definición de una interfaz simple para la lista de usuarios del backend
interface User {
  _id: string;
  username: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AdminPage implements OnInit {
  
  // Lista temporal de usuarios. Se llenará desde el backend.
  users: User[] = []; 
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  // Asumiendo que tendrás un servicio AdminService para las peticiones
  // private adminService: AdminService, 

  constructor(
    private authService: AuthService, 
    private router: Router
  ) { }

  ngOnInit() {
    // ⚠️ Importante: Protección de ruta
    // El canActivate de las rutas ya debería manejar esto, pero es buena práctica.
    if (!this.authService.isAdmin()) {
      this.router.navigateByUrl('/home');
      return;
    }
    
    this.loadUsers();
  }
  
  loadUsers() {
    this.isLoading = true;
    this.errorMessage = null;

    // 🔴 NOTA: Aquí iría la llamada al AdminService
    // Ejemplo de llamada (descomentar y usar un servicio real cuando exista):
    /*
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar la lista de usuarios. Verifica el endpoint /api/admin/users.';
        this.isLoading = false;
      }
    });
    */

    // Simulando carga de datos mientras el backend no existe
    setTimeout(() => {
        this.users = [
            { _id: 'user123', username: 'admin_test', role: 'admin', createdAt: new Date() },
            { _id: 'user456', username: 'usuario_normal', role: 'user', createdAt: new Date() },
        ];
        this.isLoading = false;
    }, 1000);
  }

  goBack() {
    this.router.navigateByUrl('/home');
  }

  // 🔴 NOTA: Método para eliminar un usuario (requiere endpoint en el backend)
  deleteUser(userId: string) {
    console.log(`Eliminar usuario: ${userId}`);
    // Implementación del servicio de eliminación aquí
  }
}