import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
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
  
  // New method for navigation
  goToRegister() {
    this.router.navigate(['/register']);
  }
}