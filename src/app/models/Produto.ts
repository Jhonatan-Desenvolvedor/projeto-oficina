export interface Produto {
  id?: number;
  nomeProduto: string;
  precoProduto: number; // No TS, number cobre double e int
  quantidadeEstoque: number;
  descricao: string;
}