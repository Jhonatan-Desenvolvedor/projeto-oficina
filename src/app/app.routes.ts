import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { authGuard } from './guards/auth-guard-guard';
import { Dashboard } from './components/dashboard/dashboard';
import { RegisterComponent } from './pages/register/register';
import { OsFormComponent } from './pages/cadastro-os/cadastro-os';
import { ClienteFormComponent } from './pages/cadastro-cliente/cadastro-cliente';
import { VeiculoFormComponent } from './pages/cadastro-veiculo/cadastro-veiculo';
import { ProdutoComponent } from './pages/cadastro-produto/cadastro-produto';
import { ListaOsComponent } from './pages/gerenciador-os/gerenciador-os';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: Dashboard, canActivate: [authGuard] },
  { path: 'cadastro-os', component: OsFormComponent, canActivate: [authGuard] },
  { path: 'cadastro-cliente', component: ClienteFormComponent, canActivate: [authGuard] },
  { path: 'cadastro-veiculo', component: VeiculoFormComponent, canActivate: [authGuard] },
  { path: 'produtos', component: ProdutoComponent, canActivate: [authGuard] },
  { path: 'gerenciador-os', component: ListaOsComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];