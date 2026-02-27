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
  veiculoNovo = signal<{ clienteId: number | null; marca: string; modelo: string; placa: string; ano: number; cor: string }>({
    clienteId: null,
    marca: '',
    modelo: '',
    placa: '',
    ano: new Date().getFullYear(),
    cor: ''
  });

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

  abrirModalNovo() {
    this.resetNovoVeiculo();
    const modal = new bootstrap.Modal(document.getElementById('modalNovoVeiculo'));
    modal.show();
  }

  salvarNovoVeiculo() {
    const novo = this.veiculoNovo();
    if (!novo.clienteId) {
      alert('Selecione um cliente para vincular.');
      return;
    }

    const payload: Veiculo = {
      marca: novo.marca,
      modelo: novo.modelo,
      placa: (novo.placa || '').toUpperCase(),
      ano: Number(novo.ano),
      cor: novo.cor
    };

    this.dataService.saveVeiculoComCliente(novo.clienteId, payload).subscribe({
      next: () => {
        this.carregarDados();
        this.resetNovoVeiculo();
        alert('Veículo cadastrado!');
      },
      error: () => alert('Erro ao cadastrar veículo.')
    });
  }

  private resetNovoVeiculo() {
    this.veiculoNovo.set({
      clienteId: null,
      marca: '',
      modelo: '',
      placa: '',
      ano: new Date().getFullYear(),
      cor: ''
    });
  }

  prepararEdicao(veiculo: Veiculo) {
    const copia = JSON.parse(JSON.stringify(veiculo));
    // garante campo clienteId simples para o payload
    copia.clienteId = veiculo.cliente?.id ?? (veiculo as any).clienteId ?? null;
    this.veiculoSelecionado.set(copia);
    const modal = new bootstrap.Modal(document.getElementById('modalVeiculo'));
    modal.show();
  }

  salvarEdicao() {
    const v = this.veiculoSelecionado();
    if (v && v.id) {
      const payload: any = {
        marca: v.marca,
        modelo: v.modelo,
        placa: (v.placa || '').toUpperCase(),
        ano: Number(v.ano),
        cor: v.cor
      };
      if (v.clienteId || v.cliente?.id) {
        payload.clienteId = v.clienteId || v.cliente?.id;
      }
      this.dataService.updateVeiculo(v.id, payload).subscribe({
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
