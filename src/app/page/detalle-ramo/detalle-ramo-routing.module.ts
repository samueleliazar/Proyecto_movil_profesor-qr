import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleRamoPage } from './detalle-ramo.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleRamoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleRamoPageRoutingModule {}
