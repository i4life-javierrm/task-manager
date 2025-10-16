// File: app-routing.module.ts

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard'; 

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
  // 🚀 NUEVA RUTA: AdminPage (asumiendo que será un módulo standalone)
  {
    path: 'admin',
    loadComponent: () => 
      import('./admin/admin.page').then(m => 
        m.AdminPage
      ),
    canActivate: [authGuard] // Proteger esta ruta también
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }