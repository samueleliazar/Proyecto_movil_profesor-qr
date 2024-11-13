import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { IonicModule } from '@ionic/angular';

import { CrearRamoPageRoutingModule } from './crear-ramo-routing.module';

import { CrearRamoPage } from './crear-ramo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearRamoPageRoutingModule,
    SharedModule,
  ],
  declarations: [CrearRamoPage]
})
export class CrearRamoPageModule {}
