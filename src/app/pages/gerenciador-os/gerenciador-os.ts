import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service'; 
import { OrdemServico } from '../../models/Os';
import { Cliente } from '../../models/Cliente';
import { Veiculo } from '../../models/Veiculo';

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
  clientes = signal<Cliente[]>([]);
  veiculos = signal<Veiculo[]>([]);
  veiculosCliente = signal<Veiculo[]>([]);
  carregando = signal(false);
  osSelecionada = signal<OrdemServico | null>(null);

  // Filtros com padrão ABERTO
  filtroNome = signal('');
  filtroStatus = signal('ABERTO');
  dataInicio = signal('');
  dataFim = signal('');

  // Itens Temporários para o Modal
  novoServico = signal('');
  valorNovoServico = signal<number | null>(null);
  novoProduto = signal('');
  valorNovoProduto = signal<number | null>(null);

  // Criação de nova O.S.
  novaOs = signal({
    clienteId: null as number | null,
    veiculoId: null as number | null,
    data: new Date().toISOString().split('T')[0],
    status: 'ABERTO',
    valorTotal: 0,
    servicos: [] as string[],
    produtos: [] as string[],
  });
  novoServicoDesc = signal('');
  novoServicoValor = signal<number | null>(null);
  novoProdutoDesc = signal('');
  novoProdutoValor = signal<number | null>(null);

  // Lógica de Filtro e Ordenação Decrescente
  ordensFiltradas = computed(() => {
    const lista = this.ordens().filter(os => {
      const busca = this.filtroNome().toLowerCase();
      const nomeMatch = !busca || 
        (os.cliente?.nome || '').toLowerCase().includes(busca) ||
        (os.veiculo?.placa || '').toLowerCase().includes(busca);

      const statusMatch = this.filtroStatus() === 'TODOS' || String(os.status) === this.filtroStatus();

      const dataOs = os.data ? new Date(os.data).toISOString().split('T')[0] : '';
      const inicio = this.dataInicio();
      const fim = this.dataFim();

      let dataMatch = true;
      if (inicio && fim) dataMatch = dataOs >= inicio && dataOs <= fim;
      else if (inicio) dataMatch = dataOs >= inicio;
      else if (fim) dataMatch = dataOs <= fim;

      return nomeMatch && statusMatch && dataMatch;
    });

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
    this.dataService.getClientes().subscribe((c) => this.clientes.set(c));
    this.dataService.getVeiculos().subscribe((v) => this.veiculos.set(v));
  }

  limparFiltros() {
    this.filtroNome.set('');
    this.filtroStatus.set('ABERTO');
    this.dataInicio.set('');
    this.dataFim.set('');
  }

  prepararEdicao(os: OrdemServico) {
    this.osSelecionada.set(JSON.parse(JSON.stringify(os)));
    const modalElem = document.getElementById('modalEditar');
    if (modalElem) {
      const modal = new bootstrap.Modal(modalElem);
      modal.show();
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
      this.osSelecionada.set({ ...os, [lista]: novaLista, valorTotal: Math.max(0, (os.valorTotal || 0) - valorExtraido) });
    }
  }

  confirmarUpdate() {
    const os = this.osSelecionada();
    if (os?.id) {
      const payload: OrdemServico = {
        id: os.id,
        cliente: { id: os.cliente?.id } as any,
        veiculo: { id: os.veiculo?.id } as any,
        servicos: os.servicos || [],
        produtos: os.produtos || [],
        valorTotal: Number(os.valorTotal) || 0,
        status: os.status,
        data: this.formatDateTime(os.data)
      };

      this.dataService.updateOrdemServico(os.id, payload).subscribe({
        next: () => { 
          this.carregarOrdens(); 
          this.osSelecionada.set(null);
          alert("O.S. Atualizada!");
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao atualizar O.S. no servidor.');
        }
      });
    }
  }

  confirmarExclusao(id: number | undefined) {
    if (!id) return;
    const ok = confirm('Deseja realmente excluir esta O.S.? Esta ação não pode ser desfeita.');
    if (ok) {
      this.dataService.deleteOrdemServico(Number(id)).subscribe({
        next: () => this.carregarOrdens(),
        error: (err) => {
          console.error('Erro ao excluir OS', err);
          const msg = err?.error?.message || err?.message || 'Erro ao excluir O.S.';
          alert(msg);
        }
      });
    }
  }

  abrirModalNova() {
    this.resetNovaOs();
    const modalElem = document.getElementById('modalNovaOs');
    if (modalElem) {
      const modal = new bootstrap.Modal(modalElem);
      modal.show();
    }
  }

  onClienteChange(id: number | null) {
    const atual = this.novaOs();
    this.novaOs.set({ ...atual, clienteId: id, veiculoId: null });
    this.veiculosCliente.set([]);
    if (id) {
      this.dataService.getVeiculosPorCliente(id).subscribe((vs) => this.veiculosCliente.set(vs));
    }
  }

  adicionarServicoNovo() {
    const desc = this.novoServicoDesc().trim();
    const valor = this.novoServicoValor();
    if (!desc || valor === null) return;
    const item = `${desc} - R$ ${valor.toFixed(2)}`;
    const atual = this.novaOs();
    this.novaOs.set({
      ...atual,
      servicos: [...atual.servicos, item],
      valorTotal: Number(atual.valorTotal) + Number(valor)
    });
    this.novoServicoDesc.set('');
    this.novoServicoValor.set(null);
  }

  adicionarProdutoNovo() {
    const desc = this.novoProdutoDesc().trim();
    const valor = this.novoProdutoValor();
    if (!desc || valor === null) return;
    const item = `${desc} - R$ ${valor.toFixed(2)}`;
    const atual = this.novaOs();
    this.novaOs.set({
      ...atual,
      produtos: [...atual.produtos, item],
      valorTotal: Number(atual.valorTotal) + Number(valor)
    });
    this.novoProdutoDesc.set('');
    this.novoProdutoValor.set(null);
  }

  removerItemNovo(lista: 'servicos' | 'produtos', index: number) {
    const atual = this.novaOs();
    const arr = [...atual[lista]];
    const itemString = arr[index];
    const valorStr = itemString.split('R$ ')[1];
    const valorExtraido = parseFloat(valorStr) || 0;
    arr.splice(index, 1);
    this.novaOs.set({
      ...atual,
      [lista]: arr,
      valorTotal: Math.max(0, Number(atual.valorTotal) - valorExtraido)
    });
  }

  salvarNovaOs() {
    const dados = this.novaOs();
    if (!dados.clienteId || !dados.veiculoId) {
      alert('Selecione cliente e veículo.');
      return;
    }

    const payload: OrdemServico = {
      cliente: { id: dados.clienteId } as any,
      veiculo: { id: dados.veiculoId } as any,
      servicos: dados.servicos || [],
      produtos: dados.produtos || [],
      valorTotal: Number(dados.valorTotal) || 0,
      status: (dados.status as any) || 'ABERTO',
      data: this.formatDateTime(dados.data)
    };

    this.dataService.saveOrdemServico(payload).subscribe({
      next: () => {
        this.carregarOrdens();
        this.resetNovaOs();
        alert('O.S. criada!');
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao salvar O.S.');
      }
    });
  }

  private resetNovaOs() {
    this.novaOs.set({
      clienteId: null,
      veiculoId: null,
      data: this.dataHojeBrasilia(),
      status: 'ABERTO',
      valorTotal: 0,
      servicos: [],
      produtos: []
    });
    this.veiculosCliente.set([]);
    this.novoServicoDesc.set('');
    this.novoServicoValor.set(null);
    this.novoProdutoDesc.set('');
    this.novoProdutoValor.set(null);
  }

  private formatDateTime(date: string | undefined): string | undefined {
    if (!date) return undefined;
    // Se vier só yyyy-MM-dd, adiciona meia-noite
    if (date.length === 10) return `${date}T00:00:00`;
    return date;
  }

  private dataHojeBrasilia(): string {
    // Usa locale ISO-like (sv-SE) para evitar inversão de dia/mês
    const str = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' });
    // str vem como 'YYYY-MM-DD HH:mm:ss'; pegamos só a parte da data
    return str.split(' ')[0];
  }

  // --- NOVAS FUNÇÕES COM TRATAMENTO DE 'UNDEFINED' ---

  gerarRelatorio() {
    const os = this.osSelecionada();
    if (!os || !os.cliente || !os.veiculo) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>O.S. #${os.id}</title>
            <style>
              body { font-family: sans-serif; padding: 30px; line-height: 1.5; color: #333; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 15px; background: #f9f9f9; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background: #eee; }
              .total { text-align: right; font-size: 1.4em; font-weight: bold; margin-top: 20px; color: #007bff; }
            </style>
          </head>
          <body>
            <div class="header"><h1>ORDEM DE SERVIÇO #${os.id}</h1></div>
            <div class="box">
              <strong>CLIENTE:</strong> ${os.cliente.nome} | <strong>TEL:</strong> ${os.cliente.telefone || 'N/A'}<br>
              <strong>VEÍCULO:</strong> ${os.veiculo.modelo} (${os.veiculo.placa})
            </div>
            <table>
              <thead><tr><th>DESCRIÇÃO</th><th>PREÇO</th></tr></thead>
              <tbody>
                ${(os.servicos || []).map(s => `<tr><td>[SERV] ${s.split(' - R$')[0]}</td><td>R$ ${s.split('R$ ')[1]}</td></tr>`).join('')}
                ${(os.produtos || []).map(p => `<tr><td>[PEÇA] ${p.split(' - R$')[0]}</td><td>R$ ${p.split('R$ ')[1]}</td></tr>`).join('')}
              </tbody>
            </table>
            <div class="total">TOTAL: R$ ${os.valorTotal?.toFixed(2)}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  enviarWhatsApp() {
    const os = this.osSelecionada();
    // Validação rigorosa para evitar erro de 'undefined'
    if (!os || !os.cliente?.telefone) {
      alert("Erro: Dados do cliente ou telefone ausentes.");
      return;
    }

    const fone = String(os.cliente.telefone).replace(/\D/g, '');
    const mensagem = encodeURIComponent(
      `🏁 *O.S. #${os.id}*\n` +
      `Olá, *${os.cliente.nome}*!\n` +
      `Resumo do veículo *${os.veiculo?.modelo}*:\n` +
      `💰 *Total:* R$ ${os.valorTotal?.toFixed(2)}\n` +
      `✅ *Status:* ${os.status}`
    );

    window.open(`https://api.whatsapp.com/send?phone=55${fone}&text=${mensagem}`, '_blank');
  }
}
