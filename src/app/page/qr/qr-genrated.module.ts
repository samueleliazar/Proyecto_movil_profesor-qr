import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QrGenratedPageRoutingModule } from './qr-genrated-routing.module';
import { QrGenratedPage } from './qr-genrated.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { QrCodeModule } from 'ng-qrcode';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QrGenratedPageRoutingModule,
    SharedModule,
    QrCodeModule
  ],
  declarations: [QrGenratedPage]
})
export class QrGenratedPageModule {}
