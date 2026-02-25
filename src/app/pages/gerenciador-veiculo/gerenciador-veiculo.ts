import { Component, OnInit, signal, computed } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Veiculo } from '../../models/Veiculo';
import { Cliente } from '../../models/Cliente';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-gerenciador-veiculos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gerenciador-veiculo.html',
  styleUrls: ['./gerenciador-veiculo.css']
})
export class GerenciadorVeiculosComponent implements OnInit {
  veiculos = signal<Veiculo[]>([]);
  clientes = signal<Cliente[]>([]);
  filtroPlaca = signal('');
  veiculoSelecionado = signal<any>(null);

  veiculosFiltrados = computed(() => {
    const busca = this.filtroPlaca().toUpperCase();
    return this.veiculos().filter(v => 
      v.placa.toUpperCase().includes(busca) || 
      v.modelo.toUpperCase().includes(busca)
    ).sort((a, b) => (b.id || 0) - (a.id || 0));
  });

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.dataService.getVeiculos().subscribe(v => this.veiculos.set(v));
    this.dataService.getClientes().subscribe(c => this.clientes.set(c));
  }

  prepararEdicao(veiculo: Veiculo) {
    this.veiculoSelecionado.set(JSON.parse(JSON.stringify(veiculo)));
    const modal = new bootstrap.Modal(document.getElementById('modalVeiculo'));
    modal.show();
  }

  salvarEdicao() {
    const v = this.veiculoSelecionado();
    if (v && v.id) {
      this.dataService.updateVeiculo(v.id, v).subscribe({
        next: () => {
          this.carregarDados();
          alert('Veículo atualizado!');
        },
        error: () => alert('Erro ao atualizar veículo no servidor.')
      });
    }
  }

  confirmarExclusao(id: number | undefined) {
    if (id && confirm('Deseja excluir este veículo? Esta ação não pode ser desfeita.')) {
      this.dataService.deleteVeiculo(id).subscribe(() => this.carregarDados());
    }
  }
}