import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-produto-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-produto.html',
  styleUrls: ['./cadastro-produto.css']
})
export class ProdutoComponent {
  private dataService = inject(DataService);
  
  produtos = signal<any[]>([]);
  produtoAtual = signal({ id: null, nomeProduto: '', precoProduto: 0, quantidadeEstoque: 0, descricao: '' });
  editando = signal(false);

  constructor() {
    this.carregarProdutos();
  }

  carregarProdutos() {
    this.dataService.getProdutos().subscribe(res => this.produtos.set(res));
  }

  salvar() {
  const p = this.produtoAtual();

  if (this.editando() && p.id !== null) {
    // Verificamos se o id não é null antes de passar para o service
    if (p.id !== null) {
      this.dataService.updateProduto(p.id, p).subscribe({
        next: () => {
          alert('Produto atualizado com sucesso!');
          this.resetar();
        },
        error: (err) => console.error(err)
      });
    } else {
      alert('Erro: ID do produto não encontrado para edição.');
    }
  } else {
    // Cadastro de novo produto (ID costuma ser null aqui, e o banco gera um novo)
    this.dataService.saveProduto(p).subscribe({
      next: () => {
        alert('Produto cadastrado com sucesso!');
        this.resetar();
      }
    });
  }
}

  prepararEdicao(p: any) {
    this.produtoAtual.set({ ...p });
    this.editando.set(true);
  }

  excluir(id: number) {
    if (confirm('Deseja excluir este produto?')) {
      this.dataService.deleteProduto(id).subscribe(() => this.carregarProdutos());
    }
  }

  resetar() {
    this.produtoAtual.set({ id: null, nomeProduto: '', precoProduto: 0, quantidadeEstoque: 0, descricao: '' });
    this.editando.set(false);
    this.carregarProdutos();
  }
}