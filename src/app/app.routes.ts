import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { authGuard } from './guards/auth-guard-guard';
import { Dashboard } from './components/dashboard/dashboard';
import { RegisterComponent } from './pages/register/register';
import { ProdutoComponent } from './pages/cadastro-produto/cadastro-produto';
import { GerenciadorOsComponent } from './pages/gerenciador-os/gerenciador-os';
import { GerenciadorClientesComponent } from './pages/gerenciador-cliente/gerenciador-cliente';
import { GerenciadorVeiculosComponent } from './pages/gerenciador-veiculo/gerenciador-veiculo';
import { FinanceiroComponent } from './pages/financeiro/financeiro';



export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: Dashboard, 
    canActivate: [authGuard],
    children: [
      // As rotas abaixo agora são relativas a /dashboard/
      { path: 'produtos', component: ProdutoComponent },
      { path: 'gerenciador-os', component: GerenciadorOsComponent },
      { path: 'gerenciador-cliente', component: GerenciadorClientesComponent },
      { path: 'gerenciador-veiculo', component: GerenciadorVeiculosComponent },
      { path: 'financeiro', component: FinanceiroComponent },
      // Rota inicial quando entrar no dashboard
      { path: '', redirectTo: 'gerenciador-os', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
