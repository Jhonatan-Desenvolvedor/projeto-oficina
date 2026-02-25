import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { RouterModule } from '@angular/router';

// A declaração DEVE ficar fora da classe
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
  produtoAtual = signal({ id: null, nomeProduto: '', precoProduto: 0, quantidadeEstoque: 0, descricao: '' });
  editando = signal(false);

  ngOnInit() {
    this.carregarProdutos();
  }

  carregarProdutos() {
    this.dataService.getProdutos().subscribe(res => this.produtos.set(res));
  }

  prepararNovo() {
    this.resetarDados();
    this.editando.set(false);
    this.abrirModal();
  }

  prepararEdicao(p: any) {
    // Criamos uma cópia para não alterar a linha da tabela em tempo real
    this.produtoAtual.set({ ...p });
    this.editando.set(true);
    this.abrirModal();
  }

  salvar() {
    const p = this.produtoAtual();

    if (this.editando() && p.id !== null) {
      this.dataService.updateProduto(p.id, p).subscribe({
        next: () => {
          this.sucesso('Produto atualizado!');
        },
        error: (err) => console.error(err)
      });
    } else {
      this.dataService.saveProduto(p).subscribe({
        next: () => {
          this.sucesso('Produto cadastrado!');
        },
        error: (err) => console.error(err)
      });
    }
  }

  private sucesso(mensagem: string) {
    alert(mensagem);
    this.fecharModal();
    this.resetarDados();
    this.carregarProdutos();
  }

  excluir(id: number) {
    if (confirm('Deseja realmente excluir este produto?')) {
      this.dataService.deleteProduto(id).subscribe(() => this.carregarProdutos());
    }
  }

  // Métodos do Modal
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