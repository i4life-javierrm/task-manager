import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Assuming AuthService is accessible

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'], // You can create a register.page.scss too
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class RegisterPage {
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) { }

  register() {
    this.authService.register(this.username,
      this.password).subscribe(() => {
      // Redirect to login after successful registration
      this.router.navigate(['/login']);
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}