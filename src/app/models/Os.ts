import { Cliente } from "./Cliente";
import { StatusOs } from "./StatusOs";
import { Veiculo } from "./Veiculo";

export interface OrdemServico {
  id?: number;
  cliente: Partial<Cliente>;
  veiculo: Partial<Veiculo>;
  servicos: string[]; // Versão simplificada que fizemos no Java
  produtos: string[];
  valorTotal: number;
  status: StatusOs;
  dataAbertura?: string;
}