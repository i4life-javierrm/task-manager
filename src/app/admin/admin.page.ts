import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { AdminService } from '../services/admin.service'; // 👈 Usamos la versión actualizada
import { User } from '../interfaces/user.interface'; // 👈 Importación correcta
import { AuthService } from '../services/auth.service'; // 👈 Usamos la versión actualizada
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AdminPage implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private router = inject(Router);

  users: User[] = [];
  isLoading: boolean = false; 

  constructor() { }

  ngOnInit() {
    // 💥 FIX 1: Usar 'isAdmin' como propiedad (sin paréntesis)
    if (!this.authService.isAdmin) {
      this.presentToast('Acceso no autorizado. Debe ser administrador.', 'danger');
      this.router.navigateByUrl('/home');
      return;
    }
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    // 💥 FIX 2: Usar 'getUsers()'
    this.adminService.getUsers().subscribe({
      // 💥 FIX 3: Tipado fuerte para 'users: User[]'
      next: (users: User[]) => {
        // Ordenar: Administradores primero (isAdmin: true)
        // 💥 FIX 4: Tipado fuerte para a y b, y usar 'isAdmin'
        this.users = users.sort((a: User, b: User) => {
          if (a.isAdmin === b.isAdmin) return 0;
          return a.isAdmin ? -1 : 1;
        });
        this.isLoading = false;
      },
      // 💥 FIX 5: Tipado fuerte para 'error: any'
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error al cargar usuarios:', error);
        this.presentToast(`Error al cargar usuarios: ${error.message || 'Error desconocido'}`, 'danger');
      }
    });
  }

  async deleteUser(userId: string) {
    const userToDelete = this.users.find(u => u._id === userId);

    if (userToDelete && userToDelete.isAdmin) {
        this.presentToast('No puedes eliminar una cuenta de administrador.', 'warning');
        return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Está seguro que desea eliminar la cuenta de ${userToDelete?.username}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar', 
          cssClass: 'ion-color-danger',
          handler: () => {
            this.adminService.deleteUser(userId).subscribe({
              next: () => {
                this.users = this.users.filter(u => u._id !== userId);
                this.presentToast(`Usuario eliminado con éxito.`, 'success');
              },
              error: (error: any) => {
                console.error('Error al eliminar usuario:', error);
                this.presentToast(`Error al eliminar usuario: ${error.error?.error || 'Error desconocido'}`, 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color: color
    });
    await toast.present();
  }
}