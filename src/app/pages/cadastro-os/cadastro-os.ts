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

  // Estado da Nova OS
  clienteId = signal<number | null>(null);
  veiculoId = signal<number | null>(null);

  // 1. AJUSTE: Produtos agora guardam nome e preco para o total funcionar
  produtosSelecionados = signal<{ nome: string, preco: number }[]>([]);
  servicosSelecionados = signal<{ nome: string, preco: number }[]>([]);

  // 2. REMOVIDO: total = signal<number>(0); (O erro estava aqui)

  constructor() {
    this.dataService.getClientes().subscribe(res => this.clientes.set(res));
    this.dataService.getProdutos().subscribe(res => this.produtosDB.set(res));
    this.dataService.getServicos().subscribe(res => this.servicosDB.set(res));
  }

  adicionarProduto(select: HTMLSelectElement) {
    const opt = select.selectedOptions[0];
    if (opt.value) {
      const nome = opt.getAttribute('data-nome')!;
      const preco = parseFloat(opt.getAttribute('data-preco')!);

      this.produtosSelecionados.update(p => [...p, { nome, preco }]);
      // O total atualizará sozinho via computed!
    }
  }

  adicionarServicoManual(descInput: HTMLInputElement, valorInput: HTMLInputElement) {
    const nome = descInput.value;
    const preco = parseFloat(valorInput.value);

    if (!nome || isNaN(preco) || preco <= 0) {
      alert('Informe a descrição e um valor válido para o serviço!');
      return;
    }

    this.servicosSelecionados.update(atual => [...atual, { nome, preco }]);
    descInput.value = '';
    valorInput.value = '';
  }

  // 3. COMPUTED: Calcula tudo automaticamente
  total = computed(() => {
    const pTotal = this.produtosSelecionados().reduce((acc, p) => acc + p.preco, 0);
    const sTotal = this.servicosSelecionados().reduce((acc, s) => acc + s.preco, 0);
    return pTotal + sTotal;
  });

  salvar() {
    const cid = this.clienteId();
    const vid = this.veiculoId();

    if (!cid || !vid) {
      alert('Por favor, selecione o Cliente e o Veículo!');
      return;
    }

    const payload: OrdemServico = {
      cliente: { id: cid },
      veiculo: { id: vid },

      // CONVERSÃO AQUI: Transformamos [{nome, preco}] em ["Nome - R$ Preco"]
      // Assim o Java recebe as strings conforme sua interface OrdemServico
      produtos: this.produtosSelecionados().map(p => `${p.nome} (R$ ${p.preco.toFixed(2)})`),
      servicos: this.servicosSelecionados().map(s => `${s.nome} (R$ ${s.preco.toFixed(2)})`),

      valorTotal: this.total(),
      status: StatusOs.ABERTO
    };

    this.dataService.saveOrdemServico(payload).subscribe({
      next: () => {
        alert('Ordem de Serviço salva com sucesso!');
        this.resetarForm();
      },
      error: (err) => {
        console.error('Erro ao salvar OS:', err);
        alert('Erro ao salvar. Verifique o console do servidor.');
      }
    });
  }
  // No topo, adicione o signal para armazenar os veículos do cliente selecionado
  veiculosFiltrados = signal<Veiculo[]>([]);

  // Função para buscar veículos sempre que um cliente for escolhido
  onClienteChange() {
    const id = Number(this.clienteId()); // Garante que é número

    if (id) {
      console.log('Buscando veículos para o cliente:', id);
      this.dataService.getVeiculosPorCliente(id).subscribe({
        next: (res) => {
          console.log('Veículos recebidos:', res);
          this.veiculosFiltrados.set(res);
        },
        error: (err) => {
          console.error('Erro ao buscar veículos:', err);
          this.veiculosFiltrados.set([]);
        }
      });
    } else {
      this.veiculosFiltrados.set([]);
    }
  }

  private resetarForm() {
    this.clienteId.set(null);
    this.veiculoId.set(null);
    this.produtosSelecionados.set([]);
    this.servicosSelecionados.set([]);
    // Não precisamos resetar o total(), ele volta a 0 automaticamente!
  }
}