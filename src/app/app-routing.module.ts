// File: app-routing.module.ts

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard'; // 👈 Usamos la versión actualizada

const routes: Routes = [ 
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { 
    path: 'home',  
    loadChildren: () => 
      import('./home/home.module').then(m => 
        m.HomePageModule
      ),  
    canActivate: [authGuard] 
  }, 
  {  
    path: 'login',  
    loadChildren: () => 
      import('./login/login.module').then(m => 
        m.LoginPageModule
      )  
  },
  {
    path: 'register',
    loadComponent: () => 
      import('./register/register.page').then(m => 
        m.RegisterPage
      )
  },
  // -----------------------------------------------------------
  // 💥 ADMIN ROUTE
  // -----------------------------------------------------------
  {
    path: 'admin',
    loadComponent: () => 
      import('./admin/admin.page').then(m => 
        m.AdminPage
      ),
    canActivate: [authGuard]
  },
  // -----------------------------------------------------------
  // 🗑️ RUTA DE PAPELERA (TRASH) - Paso 9
  // -----------------------------------------------------------
  {
    path: 'trash', // La ruta de navegación será /trash
    loadComponent: () => 
      import('./trash/trash.page').then(m => // Carga el componente TrashPage
        m.TrashPage
      ),
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule{}