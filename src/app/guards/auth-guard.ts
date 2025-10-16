import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // 👈 Usamos la versión actualizada
import { ToastController } from '@ionic/angular';

// Helper function to display toasts (since we cannot inject ToastController in a pure function)
const presentToast = async (toastCtrl: ToastController, message: string, color: string) => {
  const toast = await toastCtrl.create({
    message,
    duration: 3000,
    position: 'top',
    color: color,
  });
  await toast.present();
};

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastCtrl = inject(ToastController);

  // 💥 FIX: Usar getToken() del servicio
  const token = authService.getToken();

  if (token) {
    return true;
  } else {
    // User is not authenticated
    await presentToast(toastCtrl, 'Debes iniciar sesión para acceder a esta página.', 'warning');
    return router.createUrlTree(['/login']);
  }
};