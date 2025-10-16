import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AdminService, User } from '../services/admin.service'; // 👈 NUEVA IMPORTACIÓN
import { ToastService } from '../services/toast.service'; // 👈 NUEVA IMPORTACIÓN

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AdminPage implements OnInit {
  
  users: User[] = []; 
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  constructor(
    private authService: AuthService, 
    private router: Router,
    private adminService: AdminService, // 👈 INYECTAR SERVICIO
    private toastService: ToastService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    // Protección de ruta (aunque el guard de Angular ya lo debería hacer)
    if (!this.authService.isAdmin()) {
      this.router.navigateByUrl('/home');
      return;
    }
    
    this.loadUsers();
  }
  
  loadUsers() {
    this.isLoading = true;
    this.errorMessage = null;

    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        // Ordenar por rol (admin primero)
        this.users = users.sort((a, b) => (a.role === 'admin' && b.role !== 'admin' ? -1 : 1));
        this.isLoading = false;
        this.toastService.showSuccess(`Se cargaron ${this.users.length} usuarios.`, 'Carga Exitosa');
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.errorMessage = 'Error al cargar la lista de usuarios. Asegúrate que el backend está corriendo y el endpoint está disponible.';
        this.isLoading = false;
        this.toastService.showError('Acceso denegado o error de red.', 'Error de API');
      }
    });
  }

  async deleteUser(user: User) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Está seguro que desea eliminar al usuario "${user.username}" (${user.role})?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar',
          cssClass: 'ion-color-danger',
          handler: () => {
            if (user.role === 'admin') {
              this.toastService.showError('No se puede eliminar un administrador desde el panel.', 'Restricción');
              return;
            }

            this.adminService.deleteUser(user._id).subscribe({
              next: () => {
                this.users = this.users.filter(u => u._id !== user._id);
                this.toastService.showSuccess(`Usuario ${user.username} eliminado.`, 'Eliminación Exitosa');
              },
              error: (error) => {
                console.error('Error al eliminar usuario:', error);
                this.toastService.showError('No se pudo eliminar el usuario.', 'Error de API');
              }
            });
          }
        },
      ],
    });

    await alert.present();
  }

  goBack() {
    this.router.navigateByUrl('/home');
  }
}