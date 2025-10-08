import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular'; // <-- 1. Import IonicModule
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true, // <-- Confirms it's a standalone component
  imports: [         // <-- 2. Add imports array
    CommonModule,
    FormsModule,
    IonicModule      // <-- 3. Include IonicModule here
  ]
})

export class LoginPage { 
  username = ''; 
  password = ''; 
  constructor(private authService: AuthService, private router: Router) { } 
  login() { 
  this.authService.login(this.username, 
  this.password).subscribe(() => { 
  this.router.navigate(['/home']);  
  }); 
  } 
  register(){
    this.authService.register(this.username, 
      this.password).subscribe(() => { 
      this.router.navigate(['/login']);  
      }); 
  }
  }