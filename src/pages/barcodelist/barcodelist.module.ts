import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BarcodelistPage } from './barcodelist';
import { QRCodeModule } from 'angular2-qrcode';
import { NgxBarcodeModule } from 'ngx-barcode';

@NgModule({
  declarations: [
    BarcodelistPage,
  ],
  imports: [
    IonicPageModule.forChild(BarcodelistPage),
    QRCodeModule,
    NgxBarcodeModule

  ],
})
export class BarcodelistPageModule {}
