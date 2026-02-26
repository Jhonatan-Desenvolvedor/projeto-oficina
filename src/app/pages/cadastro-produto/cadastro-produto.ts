import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { RouterModule } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-produto-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cadastro-produto.html',
  styleUrls: ['./cadastro-produto.css']
})
export class ProdutoComponent implements OnInit {
  private dataService = inject(DataService);

  produtos = signal<any[]>([]);
  produtoAtual = signal<any>({ id: null, nomeProduto: '', precoProduto: 0, quantidadeEstoque: 0, descricao: '' });
  editando = signal(false);

  ngOnInit() {
    this.carregarProdutos();
  }

  carregarProdutos() {
    this.dataService.getProdutos().subscribe(res => {
      this.produtos.set(res);
    });
  }

  prepararNovo() {
    this.resetarDados();
    this.editando.set(false);
    this.abrirModal();
  }

  prepararEdicao(p: any) {
    // Clonamos o objeto para evitar que a alteração no modal reflita na tabela antes de salvar no banco
    this.produtoAtual.set({ ...p });
    this.editando.set(true);
    this.abrirModal();
  }

  salvar() {
    const p = this.produtoAtual();

    if (this.editando() && p.id !== null) {
      this.dataService.updateProduto(p.id, p).subscribe({
        next: () => this.sucesso('Produto atualizado com sucesso!'),
        error: (err) => alert('Erro ao atualizar produto.')
      });
    } else {
      this.dataService.saveProduto(p).subscribe({
        next: () => this.sucesso('Produto cadastrado com sucesso!'),
        error: (err) => alert('Erro ao cadastrar produto.')
      });
    }
  }

  excluir(id: number) {
    if (confirm('Deseja realmente excluir este produto?')) {
      this.dataService.deleteProduto(id).subscribe(() => this.carregarProdutos());
    }
  }

  private sucesso(mensagem: string) {
    this.fecharModal();
    this.carregarProdutos();
    // Um pequeno delay para o modal fechar antes do alerta
    setTimeout(() => alert(mensagem), 300);
  }

  // --- Lógica do Modal Bootstrap ---
  private abrirModal() {
    const modalElem = document.getElementById('modalProduto');
    if (modalElem) {
      const modal = new bootstrap.Modal(modalElem);
      modal.show();
    }
  }

  private fecharModal() {
    const modalElem = document.getElementById('modalProduto');
    if (modalElem) {
      const modal = bootstrap.Modal.getInstance(modalElem);
      modal?.hide();
    }
  }

  resetarDados() {
    this.produtoAtual.set({ id: null, nomeProduto: '', precoProduto: 0, quantidadeEstoque: 0, descricao: '' });
  }
}