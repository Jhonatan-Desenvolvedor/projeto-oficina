import { Veiculo } from "./Veiculo";

export interface Cliente {
  id?: number;
  nome: string;
  endereco: string;
  telefone: string;
  veiculos?: Veiculo[];
}