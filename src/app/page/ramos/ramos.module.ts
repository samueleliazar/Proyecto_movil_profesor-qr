import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RamosPageRoutingModule } from './ramos-routing.module';
import { RamosPage } from './ramos';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RamosPageRoutingModule,
    SharedModule
  ],
  declarations: [RamosPage]
})
export class RamosPageModule {}
