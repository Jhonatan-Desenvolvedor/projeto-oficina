import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service'; 
import { OrdemServico } from '../../models/Os';

// Declaração para o TypeScript não reclamar do Bootstrap global
declare var bootstrap: any;

@Component({
  selector: 'app-gerenciador-os',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gerenciador-os.html',
  styleUrls: ['./gerenciador-os.css']
})
export class GerenciadorOsComponent implements OnInit {
  protected readonly String = String;

  ordens = signal<OrdemServico[]>([]);
  carregando = signal(false);
  osSelecionada = signal<OrdemServico | null>(null);

  // Filtros
  filtroNome = signal('');
  filtroStatus = signal('todos');
  dataInicio = signal('');
  dataFim = signal('');

  // Itens Temporários para o Modal
  novoServico = signal('');
  valorNovoServico = signal<number | null>(null);
  novoProduto = signal('');
  valorNovoProduto = signal<number | null>(null);

  ordensFiltradas = computed(() => {
  const lista = this.ordens().filter(os => {
    const busca = this.filtroNome().toLowerCase();
    const nomeMatch = !busca || 
      (os.cliente?.nome || '').toLowerCase().includes(busca) ||
      (os.veiculo?.placa || '').toLowerCase().includes(busca);

    const statusMatch = this.filtroStatus() === 'todos' || String(os.status) === this.filtroStatus();

    const dataOs = os.data ? new Date(os.data).toISOString().split('T')[0] : '';
    const inicio = this.dataInicio();
    const fim = this.dataFim();

    let dataMatch = true;
    if (inicio && fim) dataMatch = dataOs >= inicio && dataOs <= fim;
    else if (inicio) dataMatch = dataOs >= inicio;
    else if (fim) dataMatch = dataOs <= fim;

    return nomeMatch && statusMatch && dataMatch;
  });

  // ADICIONE ESTA LINHA: Ordenação decrescente por ID
  return lista.sort((a, b) => (b.id || 0) - (a.id || 0));
});

  constructor(private dataService: DataService) { }

  ngOnInit() { this.carregarOrdens(); }

  carregarOrdens() {
    this.carregando.set(true);
    this.dataService.getOrdensServico().subscribe({
      next: (dados) => { this.ordens.set(dados); this.carregando.set(false); },
      error: () => this.carregando.set(false)
    });
  }

  limparFiltros() {
    this.filtroNome.set('');
    this.filtroStatus.set('todos');
    this.dataInicio.set('');
    this.dataFim.set('');
  }

  prepararEdicao(os: OrdemServico) {
    // 1. Criar uma cópia profunda para evitar alteração direta na tabela antes de salvar
    this.osSelecionada.set(JSON.parse(JSON.stringify(os)));

    // 2. Abrir o modal via JavaScript
    const modalElem = document.getElementById('modalEditar');
    if (modalElem) {
      const modal = new bootstrap.Modal(modalElem);
      modal.show();
    } else {
      console.error("Elemento modalEditar não encontrado no DOM");
    }
  }

  adicionarServico() {
    const nome = this.novoServico().trim();
    const valor = this.valorNovoServico();
    const os = this.osSelecionada();
    if (nome && valor !== null && os) {
      const item = `${nome} - R$ ${valor.toFixed(2)}`;
      const lista = os.servicos ? [...os.servicos, item] : [item];
      this.osSelecionada.set({ ...os, servicos: lista, valorTotal: (os.valorTotal || 0) + valor });
      this.novoServico.set('');
      this.valorNovoServico.set(null);
    }
  }

  adicionarProduto() {
    const nome = this.novoProduto().trim();
    const valor = this.valorNovoProduto();
    const os = this.osSelecionada();
    if (nome && valor !== null && os) {
      const item = `${nome} - R$ ${valor.toFixed(2)}`;
      const lista = os.produtos ? [...os.produtos, item] : [item];
      this.osSelecionada.set({ ...os, produtos: lista, valorTotal: (os.valorTotal || 0) + valor });
      this.novoProduto.set('');
      this.valorNovoProduto.set(null);
    }
  }

  removerItem(lista: 'servicos' | 'produtos', index: number) {
    const os = this.osSelecionada();
    if (os && os[lista]) {
      const itemString = os[lista]![index];
      const valorStr = itemString.split('R$ ')[1];
      const valorExtraido = parseFloat(valorStr) || 0;
      
      const novaLista = [...os[lista]!];
      novaLista.splice(index, 1);
      
      this.osSelecionada.set({ 
        ...os, 
        [lista]: novaLista, 
        valorTotal: Math.max(0, (os.valorTotal || 0) - valorExtraido) 
      });
    }
  }

  confirmarUpdate() {
    const os = this.osSelecionada();
    if (os && os.id) {
      this.dataService.updateOrdemServico(os.id, os).subscribe({
        next: () => { 
          this.carregarOrdens(); 
          this.osSelecionada.set(null);
          alert("Ordem de serviço atualizada com sucesso!");
        },
        error: (err) => {
          console.error(err);
          alert("Erro ao salvar no servidor (500). Verifique o terminal Java.");
        }
      });
    }
  }
}