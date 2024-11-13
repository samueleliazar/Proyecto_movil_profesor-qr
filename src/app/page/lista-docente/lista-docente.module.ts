import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { IonicModule } from '@ionic/angular';
import { ListaDocentePageRoutingModule } from './lista-docente-routing.module';
import { ListaDocentePage } from './lista-docente.page';
import { FilterListPipe } from './filtro-piper.pipe';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaDocentePageRoutingModule,
    SharedModule
  ],
  declarations: [ListaDocentePage, FilterListPipe]
})
export class ListaDocentePageModule {}
