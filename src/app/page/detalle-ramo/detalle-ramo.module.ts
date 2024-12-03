import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleRamoPageRoutingModule } from './detalle-ramo-routing.module';

import { DetalleRamoPage } from './detalle-ramo.page';
import { SharedModule } from 'src/app/shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleRamoPageRoutingModule,
    SharedModule
  ],
  declarations: [DetalleRamoPage]
})
export class DetalleRamoPageModule {}
