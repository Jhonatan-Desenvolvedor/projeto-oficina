import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { DataService } from '../../services/data.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private dataService = inject(DataService);

  // Signals para os dados
  faturamentoTotal = signal<number>(0);
  quantidadeOsFechadas = signal<number>(0);

  constructor() {
    this.carregarDados();
  }

  carregarDados() {
    this.dataService.getFaturamentoTotal().subscribe(valor => {
      this.faturamentoTotal.set(valor);
    });
  }

  logout() {
    this.dataService.limparTokenESair();
  }
}
