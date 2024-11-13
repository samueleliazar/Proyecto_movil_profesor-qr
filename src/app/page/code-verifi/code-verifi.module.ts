import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CodeVerifiPageRoutingModule } from './code-verifi-routing.module';
import { CodeVerifiPage } from './code-verifi.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CodeVerifiPageRoutingModule,
    SharedModule,
  ],
  declarations: [CodeVerifiPage]
})
export class CodeVerifiPageModule {}
