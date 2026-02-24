import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Veiculo } from '../../models/Veiculo';
import { Cliente } from '../../models/Cliente';


@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-cliente.html',
  styleUrls: ['./cadastro-cliente.css']
})
export class ClienteFormComponent {
  private dataService = inject(DataService);

  // Dados do Cliente (Signals)
  nome = signal('');
  endereco = signal('');
  telefone = signal('');

  // Dados do Veículo temporário (para o formulário de adição)
  veiculoTemp = signal<Veiculo>({ marca: '', modelo: '', placa: '', cor: '', ano: 2024 });

  // Lista de veículos adicionados ao cliente
  listaVeiculos = signal<Veiculo[]>([]);

  addVeiculo() {
    const v = this.veiculoTemp();
    if (v.marca && v.placa) {
      this.listaVeiculos.update(list => [...list, { ...v }]);
      // Limpa campos do veículo
      this.veiculoTemp.set({ marca: '', modelo: '', placa: '', cor: '', ano: 2024 });
    } else {
      alert('Preencha ao menos Marca e Placa do veículo!');
    }
  }

  removerVeiculo(index: number) {
    this.listaVeiculos.update(list => list.filter((_, i) => i !== index));
  }

  salvarCliente() {
    if (!this.nome() || !this.telefone()) {
      alert('Nome e Telefone são obrigatórios!');
      return;
    }

    const novoCliente: Cliente = {
      nome: this.nome(),
      endereco: this.endereco(),
      telefone: this.telefone(),
      veiculos: this.listaVeiculos() // Envia a lista para o back-end (CascadeType.ALL)
    };

    this.dataService.saveCliente(novoCliente).subscribe({
      next: () => {
        alert('Cliente e Veículos cadastrados com sucesso!');
        this.limparTudo();
      },
      error: (err) => alert('Erro ao salvar cliente.')
    });
  }

  private limparTudo() {
    this.nome.set('');
    this.endereco.set('');
    this.telefone.set('');
    this.listaVeiculos.set([]);
  }
}