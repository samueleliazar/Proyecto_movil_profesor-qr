import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearRamoPage } from './crear-ramo.page';

const routes: Routes = [
  {
    path: '',
    component: CrearRamoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearRamoPageRoutingModule {}
