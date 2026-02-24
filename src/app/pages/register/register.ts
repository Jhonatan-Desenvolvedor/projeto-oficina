import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html'
})
export class RegisterComponent {

  username = '';
  password = '';
  confirmPassword = '';


  constructor(private http: HttpClient, private router: Router) {}

  register() {
  if (this.password !== this.confirmPassword) {
    alert('As senhas não conferem!');
    return;
  }

  const payload = {
    username: this.username,
    password: this.password,

  };

    this.http.post<any>('http://localhost:8080/auth/register', payload)
      .subscribe({
        next: (res) => {
          console.log('Resposta do backend:', res);

          // Se o backend retornar token no registro, você pode salvar:
          if (res.token) {
            localStorage.setItem('token', res.token);
          }

          alert('Conta criada com sucesso!');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Erro ao registrar:', err);
          if (err.status === 400) {
            alert('Usuário já existe');
          } else {
            alert('Erro ao criar a conta. Tente novamente.');
          }
        }
      });
  }
}