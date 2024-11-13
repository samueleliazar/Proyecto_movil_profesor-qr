import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AsignaturaQrPageRoutingModule } from './asignatura-qr-routing.module';

import { AsignaturaQrPage } from './asignatura-qr.page';
import { SharedModule } from 'src/app/shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AsignaturaQrPageRoutingModule,
    SharedModule
  ],
  declarations: [AsignaturaQrPage]
})
export class AsignaturaQrPageModule {}
