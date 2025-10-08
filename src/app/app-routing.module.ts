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
  // -----------------------------------------------------------
  // Fix 1: LoginPage is loaded via an NgModule, so load it with 'loadChildren' 
  // -----------------------------------------------------------
  {  
    path: 'login',  
    loadChildren: () => 
      import('./login/login.module').then(m => 
        m.LoginPageModule // LoginPageModule is likely an NgModule
      )  
  },
  // -----------------------------------------------------------
  // Fix 2: RegisterPage is a Standalone Component, so load it with 'loadComponent'
  // -----------------------------------------------------------
  {
    path: 'register',
    // CHANGE: Use loadComponent instead of loadChildren
    loadComponent: () => 
      import('./register/register.page').then(m => 
        m.RegisterPage // RegisterPage is the Standalone Component class
      )
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }