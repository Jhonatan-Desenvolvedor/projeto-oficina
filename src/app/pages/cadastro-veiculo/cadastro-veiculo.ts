import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Cliente } from '../../models/Cliente';
import { Veiculo } from '../../models/Veiculo';

@Component({
  selector: 'app-veiculo-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-veiculo.html',
  styleUrls: ['./cadastro-veiculo.css']
})
export class VeiculoFormComponent {
  private dataService = inject(DataService);

  // Signals para a lista de clientes e seleção
  clientesDisponiveis = signal<Cliente[]>([]);
  clienteSelecionadoId = signal<number | null>(null);

  // Signal para os dados do veículo
  veiculo = signal<Veiculo>({
    marca: '',
    modelo: '',
    placa: '',
    cor: '',
    ano: 2026
  });

  constructor() {
    // Carrega os clientes para o dropdown
    this.dataService.getClientes().subscribe(res => this.clientesDisponiveis.set(res));
  }

  salvarVeiculo() {
    const cid = this.clienteSelecionadoId();
    const v = this.veiculo();

    if (!cid) {
      alert('Selecione um cliente!');
      return;
    }

    // Chamamos o serviço passando o ID separadamente para a URL
    this.dataService.saveVeiculoComCliente(cid, v).subscribe({
      next: () => {
        alert('Veículo cadastrado com sucesso!');
        this.resetar();
      },
      error: (err) => console.error(err)
    });
  }

  private resetar() {
    this.veiculo.set({ marca: '', modelo: '', placa: '', cor: '', ano: 2026 });
    this.clienteSelecionadoId.set(null);
  }
}