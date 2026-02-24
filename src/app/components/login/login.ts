import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './login.html'
})
export class LoginComponent {

  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    if (!this.username || !this.password) {
      alert('Preencha usuário e senha');
      return;
    }

    this.authService.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        if (res?.token) {
          this.authService.saveToken(res.token);
          this.router.navigate(['/home']);
        } else {
          alert('Resposta inválida do servidor');
        }
      },
      error: (err) => {
        console.error('Erro no login:', err); // esse pode ficar, ajuda no debug
        alert(err.error?.message || 'Usuário ou senha inválidos');
      }
    });
  }
}