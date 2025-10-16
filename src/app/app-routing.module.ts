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
  // 💥 ADMIN ROUTE: Referencia al nuevo AdminPage_v2
  // -----------------------------------------------------------
  {
    path: 'admin',
    loadComponent: () => 
      import('./admin/admin.page').then(m => 
        m.AdminPage // El nombre de la clase sigue siendo AdminPage
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
export class App{}