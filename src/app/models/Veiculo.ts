import { Cliente } from "./Cliente";

export interface Veiculo {
  id?: number;
  marca: string;
  modelo: string;
  placa: string;
  cor: string;
  ano: number;
  cliente?: Cliente;
}