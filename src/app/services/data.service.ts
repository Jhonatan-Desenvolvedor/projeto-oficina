import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cliente } from '../models/Cliente';
import { Produto } from '../models/Produto';
import { Servico } from '../models/Servico';
import { OrdemServico } from '../models/Os';
import { Veiculo } from '../models/Veiculo';


@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api';


  //produtos
  getProdutos() { return this.http.get<any[]>(`${this.API_URL}/produtos`, { withCredentials: true }); }
  saveProduto(p: any) { return this.http.post(`${this.API_URL}/produtos`, p, { withCredentials: true }); }
  updateProduto(id: number, p: any) { return this.http.put(`${this.API_URL}/produtos/${id}`, p, { withCredentials: true }); }
  deleteProduto(id: number) { return this.http.delete(`${this.API_URL}/produtos/${id}`, { withCredentials: true }); }

  //veiculos
  getVeiculos() { return this.http.get<Veiculo[]>(`${this.API_URL}/veiculos`, { withCredentials: true }); }
  saveVeiculo(veiculo: Veiculo) { return this.http.post(`${this.API_URL}/veiculos`, veiculo, { withCredentials: true }); }
  updateVeiculo(id: number, veiculo: Veiculo) { return this.http.put(`${this.API_URL}/veiculos/${id}`, veiculo, { withCredentials: true }); }
  deleteVeiculo(id: number) { return this.http.delete(`${this.API_URL}/veiculos/${id}`, { withCredentials: true }); }

  //clientes
  getClientes() { return this.http.get<Cliente[]>(`${this.API_URL}/clientes`, { withCredentials: true }); }
  saveCliente(cliente: Cliente) {
    return this.http.post(`${this.API_URL}/clientes`, cliente, {
      withCredentials: true // ISSO É VITAL PARA O JWT EM COOKIES
    });
  }
  updateCliente(id: number, cliente: Cliente) { return this.http.put(`${this.API_URL}/clientes/${id}`, cliente, { withCredentials: true }); }
  deleteCliente(id: number) { return this.http.delete(`${this.API_URL}/clientes/${id}`, { withCredentials: true }); }

  //servicos
  getServicos() { return this.http.get<Servico[]>(`${this.API_URL}/servicos`, { withCredentials: true }); }

  //ordens de servico
  getOrdensServico() { return this.http.get<OrdemServico[]>(`${this.API_URL}/ordens-servico`, { withCredentials: true }); }
  saveOrdemServico(os: OrdemServico) {
    return this.http.post<OrdemServico>(`${this.API_URL}/ordens-servico`, os, { withCredentials: true });
  }
  updateOrdemServico(id: number, os: OrdemServico) { return this.http.put(`${this.API_URL}/ordens-servico/${id}`, os, { withCredentials: true }); }
  deleteOrdemServico(id: number) { return this.http.delete(`${this.API_URL}/ordens-servico/${id}`, { withCredentials: true }); }


  getDespesas() { return this.http.get<any[]>(`${this.API_URL}/despesas`, { withCredentials: true }); }
  saveDespesa(d: any) { return this.http.post(`${this.API_URL}/despesas`, d, { withCredentials: true }); }
  deleteDespesa(id: number) { return this.http.delete(`${this.API_URL}/despesas/${id}`, { withCredentials: true }); }



  saveVeiculoComCliente(clienteId: number, veiculo: Veiculo) {
    // Bate exatamente com: @PostMapping("/cliente/{clienteId}")
    return this.http.post<Veiculo>(
      `${this.API_URL}/veiculos/cliente/${clienteId}`,
      veiculo,
      { withCredentials: true }
    );
  }





  getVeiculosPorCliente(clienteId: number) {
    return this.http.get<Veiculo[]>(`${this.API_URL}/veiculos/cliente/${clienteId}`, { withCredentials: true });
  }



  getFaturamentoTotal(inicio?: string, fim?: string) {
    let url = `${this.API_URL}/ordens-servico/faturamento`;

    // Se houver datas, adiciona os parâmetros ?inicio=...&fim=...
    if (inicio && fim) {
      url += `?inicio=${inicio}&fim=${fim}`;
    }

    return this.http.get<number>(url, { withCredentials: true });
  }

  // No seu auth.service.ts ou data.service.ts
  limparTokenESair() {
    // 1. Remove qualquer dado de usuário do localStorage/sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // 2. Opcional: Se você não estiver usando HttpOnly, pode tentar limpar via JS:
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // 3. Redireciona para o login para forçar uma nova autenticação
    alert('Sessão encerrada ou token inválido. Por favor, faça login novamente.');
    window.location.href = '/login';
  }
}