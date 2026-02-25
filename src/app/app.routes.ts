import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { authGuard } from './guards/auth-guard-guard';
import { Dashboard } from './components/dashboard/dashboard';
import { RegisterComponent } from './pages/register/register';
import { OsFormComponent } from './pages/cadastro-os/cadastro-os';
import { ClienteFormComponent } from './pages/cadastro-cliente/cadastro-cliente';
import { VeiculoFormComponent } from './pages/cadastro-veiculo/cadastro-veiculo';
import { ProdutoComponent } from './pages/cadastro-produto/cadastro-produto';
import { GerenciadorOsComponent } from './pages/gerenciador-os/gerenciador-os';
import { GerenciadorClientesComponent } from './pages/gerenciador-cliente/gerenciador-cliente';
import { GerenciadorVeiculosComponent } from './pages/gerenciador-veiculo/gerenciador-veiculo';



export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'cadastro-os', component: OsFormComponent, canActivate: [authGuard] },
  { path: 'cadastro-cliente', component: ClienteFormComponent, canActivate: [authGuard] },
  { path: 'cadastro-veiculo', component: VeiculoFormComponent, canActivate: [authGuard] },
  { path: 'produtos', component: ProdutoComponent, canActivate: [authGuard] },
  { path: 'gerenciador-os', component: GerenciadorOsComponent, canActivate: [authGuard] },
  { path: 'gerenciador-cliente', component: GerenciadorClientesComponent, canActivate: [authGuard] },
  { path: 'gerenciador-veiculo', component: GerenciadorVeiculosComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];