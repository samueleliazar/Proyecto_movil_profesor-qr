import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QrGenratedPage } from './qr-genrated.page';

const routes: Routes = [
  {
    path: '',
    component: QrGenratedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QrGenratedPageRoutingModule {}
