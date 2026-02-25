import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Cliente } from '../../models/Cliente';
import { Produto } from '../../models/Produto';
import { Servico } from '../../models/Servico';
import { StatusOs } from '../../models/StatusOs';
import { OrdemServico } from '../../models/Os';
import { Veiculo } from '../../models/Veiculo';

@Component({
  selector: 'app-os-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-os.html',
  styleUrls: ['./cadastro-os.css']
})
export class OsFormComponent {
  private dataService = inject(DataService);

  // Listas vindas do servidor
  clientes = signal<Cliente[]>([]);
  produtosDB = signal<Produto[]>([]);
  servicosDB = signal<Servico[]>([]);
  veiculosFiltrados = signal<Veiculo[]>([]);

  // Estado da Nova OS
  clienteId = signal<number | null>(null);
  veiculoId = signal<number | null>(null);

  // Itens Selecionados
  produtosSelecionados = signal<{ nome: string, preco: number }[]>([]);
  servicosSelecionados = signal<{ nome: string, preco: number }[]>([]);

  // CÁLCULO AUTOMÁTICO: O total observa as mudanças nas listas acima
  total = computed(() => {
    const pTotal = this.produtosSelecionados().reduce((acc, p) => acc + p.preco, 0);
    const sTotal = this.servicosSelecionados().reduce((acc, s) => acc + s.preco, 0);
    return pTotal + sTotal;
  });

  constructor() {
    this.dataService.getClientes().subscribe(res => this.clientes.set(res));
    this.dataService.getProdutos().subscribe(res => this.produtosDB.set(res));
    this.dataService.getServicos().subscribe(res => this.servicosDB.set(res));
  }

  // Busca veículos quando o cliente é alterado
  onClienteChange() {
    const id = Number(this.clienteId());
    if (id) {
      this.dataService.getVeiculosPorCliente(id).subscribe({
        next: (res) => this.veiculosFiltrados.set(res),
        error: () => this.veiculosFiltrados.set([])
      });
    } else {
      this.veiculosFiltrados.set([]);
    }
  }

  // Adicionar produto da lista (Banco de Dados)
  adicionarProduto(select: HTMLSelectElement) {
    const opt = select.selectedOptions[0];
    if (opt && opt.value) {
      const nome = opt.getAttribute('data-nome')!;
      const preco = parseFloat(opt.getAttribute('data-preco')!);
      this.produtosSelecionados.update(p => [...p, { nome, preco }]);
      select.value = ""; // Reseta o select
    }
  }

  // Adicionar produto manualmente
  adicionarProdutoManual(descInput: HTMLInputElement, valorInput: HTMLInputElement) {
    const nome = descInput.value;
    const preco = parseFloat(valorInput.value);

    if (nome && !isNaN(preco) && preco > 0) {
      this.produtosSelecionados.update(list => [...list, { nome, preco }]);
      descInput.value = '';
      valorInput.value = '';
    } else {
      alert('Preencha nome e preço da peça corretamente!');
    }
  }

  // Adicionar serviço manualmente
  adicionarServicoManual(descInput: HTMLInputElement, valorInput: HTMLInputElement) {
    const nome = descInput.value;
    const preco = parseFloat(valorInput.value);

    if (nome && !isNaN(preco) && preco > 0) {
      this.servicosSelecionados.update(list => [...list, { nome, preco }]);
      descInput.value = '';
      valorInput.value = '';
    } else {
      alert('Informe a descrição e um valor válido para o serviço!');
    }
  }

  // Remover item da lista
  removerItem(tipo: 'p' | 's', index: number) {
    if (tipo === 'p') {
      this.produtosSelecionados.update(list => list.filter((_, i) => i !== index));
    } else {
      this.servicosSelecionados.update(list => list.filter((_, i) => i !== index));
    }
  }

  salvar() {
    const cid = this.clienteId();
    const vid = this.veiculoId();

    if (!cid || !vid || this.total() <= 0) {
      alert('Preencha Cliente, Veículo e adicione ao menos um item!');
      return;
    }

    const payload: any = {
      cliente: { id: cid },
      veiculo: { id: vid },
      produtos: this.produtosSelecionados().map(p => `${p.nome} (R$ ${p.preco.toFixed(2)})`),
      servicos: this.servicosSelecionados().map(s => `${s.nome} (R$ ${s.preco.toFixed(2)})`),
      valorTotal: this.total(),
      status: "ABERTO" // Ajuste conforme seu Enum
    };

    this.dataService.saveOrdemServico(payload).subscribe({
      next: () => {
        alert('Ordem de Serviço salva com sucesso!');
        this.resetarForm();
      },
      error: (err) => alert('Erro ao salvar no servidor.')
    });
  }

  private resetarForm() {
    this.clienteId.set(null);
    this.veiculoId.set(null);
    this.produtosSelecionados.set([]);
    this.servicosSelecionados.set([]);
    this.veiculosFiltrados.set([]);
  }
}