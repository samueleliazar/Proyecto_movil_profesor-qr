import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaDocentePage } from './lista-docente.page';

const routes: Routes = [
  {
    path: '',
    component: ListaDocentePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaDocentePageRoutingModule {}
