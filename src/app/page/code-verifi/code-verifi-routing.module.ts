import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CodeVerifiPage } from './code-verifi.page';

const routes: Routes = [
  {
    path: '',
    component: CodeVerifiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CodeVerifiPageRoutingModule {}
