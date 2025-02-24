import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'solicitacao',
    loadComponent: () => import('./features/solicitacao/solicitacao.component').then(m => m.SolicitacaoComponent),
  },
  {
    path: 'aprovacao_gestor',
    loadComponent: () =>
      import('./features/aprovacao-gestor/aprovacao-gestor.component').then(m => m.AprovacaoGestorComponent),
  },
  {
    path: 'revisao',
    loadComponent: () => import('./features/revisao/revisao.component').then(m => m.RevisaoComponent),
  },
  {
    path: 'aprovacao',
    loadComponent: () => import('./features/aprovacao/aprovacao.component').then(m => m.AprovacaoComponent),
  },
  {
    path: 'validacao_infra',
    loadComponent: () =>
      import('./features/validacao-infra/validacao-infra.component').then(m => m.ValidacaoInfraComponent),
  },
  {
    path: 'validacao_suporte',
    loadComponent: () =>
      import('./features/validacao-suporte/validacao-suporte.component').then(m => m.ValidacaoSuporteComponent),
  },
  {
    path: 'validacao_sistemas',
    loadComponent: () =>
      import('./features/validacao-sistemas/validacao-sistemas.component').then(m => m.ValidacaoSistemasComponent),
  },
  {
    path: 'detalhes',
    loadComponent: () => import('./features/detalhes/detalhes.component').then(m => m.DetalhesComponent),
  },
];
