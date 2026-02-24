// src/app/pages/lista-os/lista-os.component.ts
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { OrdemServico } from '../../models/Os';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-os',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciador-os.html',
  styleUrls: ['./gerenciador-os.css']
})
export class ListaOsComponent {
  private dataService = inject(DataService);

  ordens = signal<OrdemServico[]>([]);
  carregando = signal<boolean>(true);
  erro = signal<string | null>(null);

  constructor() {
    this.carregarOrdens();
  }

  carregarOrdens() {
    this.carregando.set(true);
    this.erro.set(null);

    this.dataService.getOrdensServico().subscribe({
      next: (res) => {
        this.ordens.set(res);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao listar OS:', err);
        this.erro.set('Não foi possível carregar as ordens de serviço.');
        this.carregando.set(false);
      }
    });
  }
  

  excluirOs(os: OrdemServico) {
    if (!os.id) return;

    const mensagem = `Tem certeza que deseja EXCLUIR a OS #${os.id}?\n` +
                     `Cliente: ${os.cliente?.nome || 'Não informado'}\n` +
                     `Valor: R$ ${os.valorTotal?.toFixed(2) || '0.00'}\n` +
                     `Status: ${os.status || 'N/D'}`;

    if (!confirm(mensagem)) return;

    this.dataService.deleteOrdemServico(os.id).subscribe({
      next: () => {
        this.ordens.update(lista => lista.filter(item => item.id !== os.id));
        alert('Ordem de Serviço excluída com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao excluir OS:', err);
        alert('Não foi possível excluir esta OS.');
      }
    });
  }

  editarOs(os: OrdemServico) {
    // Por enquanto só um alert
    // Depois você pode navegar para uma página de edição: this.router.navigate(['/editar-os', os.id]);
    alert(
      `Editar OS #${os.id}\n` +
      `Cliente: ${os.cliente?.nome || 'N/D'}\n` +
      `Veículo: ${os.veiculo?.placa || 'N/D'}\n` +
      `Valor total: R$ ${os.valorTotal?.toFixed(2) || '0.00'}\n` +
      `Status: ${os.status || 'N/D'}`
    );
  }

  // No topo, adicione o signal
osSelecionada = signal<OrdemServico | null>(null);

// Método para abrir o modal
updateOrdemServico(os: OrdemServico) {
  // Criamos uma cópia para não alterar a tabela antes de salvar no banco
  this.osSelecionada.set({ ...os });
}

fecharModal() {
  this.osSelecionada.set(null);
}

salvarEdicao(event: Event) {
  event.preventDefault();
  const osParaSalvar = this.osSelecionada();
  
  if (osParaSalvar) {
    this.dataService.saveOrdemServico(osParaSalvar).subscribe({
      next: () => {
        alert('OS atualizada com sucesso!');
        this.fecharModal();
        this.carregarOrdens(); // Atualiza a lista
      },
      error: (err) => console.error('Erro ao atualizar:', err)
    });
  }
}
}