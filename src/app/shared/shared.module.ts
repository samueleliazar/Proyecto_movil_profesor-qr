import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EncabezadoComponent } from './components/encabezado/encabezado.component';

@NgModule({
  declarations: [EncabezadoComponent],
  imports: [CommonModule, IonicModule],
  exports: [EncabezadoComponent]
})
export class SharedModule { }
