import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  private dataService = inject(DataService);

  faturamentoTotal = signal<number>(0);
  dataInicio = signal<string>('');
  dataFim = signal<string>('');

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    // Note que passamos os valores dos signals para o service
    this.dataService.getFaturamentoTotal(this.dataInicio(), this.dataFim()).subscribe({
      next: (valor) => this.faturamentoTotal.set(valor),
      error: (err) => console.error('Erro ao buscar faturamento:', err)
    });
  }

  limparFiltros() {
    this.dataInicio.set('');
    this.dataFim.set('');
    this.carregarDados();
  }

  logout() {
    this.dataService.limparTokenESair();
  }
}