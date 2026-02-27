import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { OrdemServico } from '../../models/Os';
import { RouterModule } from '@angular/router';

interface Despesa {
  descricao: string;
  valor: number;
  data: string; // yyyy-MM-dd
}

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './financeiro.html',
  styleUrls: ['./financeiro.css'],
})
export class FinanceiroComponent implements OnInit {
  ordens = signal<OrdemServico[]>([]);
  despesas = signal<Despesa[]>([]);

  filtroInicioOs = signal('');
  filtroFimOs = signal('');
  filtroInicioDesp = signal('');
  filtroFimDesp = signal('');

  novaDespesa = signal<Despesa>({ descricao: '', valor: 0, data: this.hojeBr() });

  totalOsFechadas = computed(() =>
    this.ordensFiltradasFechadas().reduce((s, os) => s + (os.valorTotal || 0), 0)
  );

  totalDespesas = computed(() =>
    this.despesasFiltradas().reduce((s, d) => s + (d.valor || 0), 0)
  );

  saldo = computed(() => this.totalOsFechadas() - this.totalDespesas());

  constructor(private data: DataService) {}

  ngOnInit() {
    this.carregarOs();
    this.carregarDespesas();
  }

  private carregarOs() {
    this.data.getOrdensServico().subscribe((os) => this.ordens.set(os));
  }

  private carregarDespesas() {
  this.data.getDespesas().subscribe(res => this.despesas.set(res));
}

  private salvarDespesasLocal() {
    localStorage.setItem('despesas', JSON.stringify(this.despesas()));
  }

  adicionarDespesa() {
  const d = this.novaDespesa();
  // ... validações ...
  this.data.saveDespesa(d).subscribe(() => {
    this.carregarDespesas(); // Recarrega a lista do banco
    this.novaDespesa.set({ descricao: '', valor: 0, data: this.hojeBr() });
  });
}

removerDespesa(id: number) { // Agora passamos o ID do banco, não o index
  this.data.deleteDespesa(id).subscribe(() => this.carregarDespesas());
}

  ordensFiltradasFechadas() {
    const ini = this.filtroInicioOs();
    const fim = this.filtroFimOs();
    return this.ordens().filter((os) => {
      const statusOk = String(os.status) === 'FECHADO';
      const data = (os.data || '').split('T')[0];
      const iniOk = !ini || data >= ini;
      const fimOk = !fim || data <= fim;
      return statusOk && iniOk && fimOk;
    });
  }

  despesasFiltradas() {
    const ini = this.filtroInicioDesp();
    const fim = this.filtroFimDesp();
    return this.despesas().filter((d) => {
      const iniOk = !ini || d.data >= ini;
      const fimOk = !fim || d.data <= fim;
      return iniOk && fimOk;
    });
  }

  private hojeBr(): string {
    return new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).split(' ')[0];
  }
}
