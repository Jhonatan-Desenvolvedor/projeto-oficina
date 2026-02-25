import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Cliente } from '../../models/Cliente';
import { RouterModule } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-gerenciador-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gerenciador-cliente.html',
  styleUrls: ['./gerenciador-cliente.css']
})
export class GerenciadorClientesComponent implements OnInit {
  clientes = signal<Cliente[]>([]);
  filtroNome = signal('');
  clienteSelecionado = signal<any>(null);

  // Inputs para novo veículo dentro do modal
  novoVeiculo = { marca: '', modelo: '', placa: '', ano: null };

  clientesFiltrados = computed(() => {
    const busca = this.filtroNome().toLowerCase();
    return this.clientes().filter(c => c.nome.toLowerCase().includes(busca));
  });

  constructor(private dataService: DataService) {}

  ngOnInit() { this.carregarClientes(); }

  carregarClientes() {
    this.dataService.getClientes().subscribe(dados => this.clientes.set(dados));
  }

  prepararEdicao(cliente: Cliente) {
    this.clienteSelecionado.set(JSON.parse(JSON.stringify(cliente)));
    const modal = new bootstrap.Modal(document.getElementById('modalCliente'));
    modal.show();
  }

  // Adiciona veículo à lista local do cliente antes de salvar no banco
  adicionarVeiculo() {
    const cliente = this.clienteSelecionado();
    if (this.novoVeiculo.modelo && this.novoVeiculo.placa) {
      if (!cliente.veiculos) cliente.veiculos = [];
      
      // Adicionamos o veículo (o Java tratará o vínculo pelo cascade)
      cliente.veiculos.push({ ...this.novoVeiculo });
      
      // Reseta form de veículo
      this.novoVeiculo = { marca: '', modelo: '', placa: '', ano: null };
      this.clienteSelecionado.set({ ...cliente });
    }
  }

  removerVeiculo(index: number) {
    const cliente = this.clienteSelecionado();
    cliente.veiculos.splice(index, 1);
    this.clienteSelecionado.set({ ...cliente });
  }

  salvarEdicao() {
    const cliente = this.clienteSelecionado();
    if (cliente && cliente.id) {
      this.dataService.updateCliente(cliente.id, cliente).subscribe({
        next: () => {
          this.carregarClientes();
          alert('Dados e frota atualizados com sucesso!');
        },
        error: (err) => console.error("Erro ao salvar:", err)
      });
    }
  }

  excluirCliente(id: number) {
    if (confirm('Atenção: Excluir o cliente também excluirá todos os seus veículos. Confirmar?')) {
      this.dataService.deleteCliente(id).subscribe(() => this.carregarClientes());
    }
  }
}