import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PrintscannerPage } from './printscanner';
import { QRCodeModule } from 'angular2-qrcode';
import { NgxBarcodeModule } from 'ngx-barcode';

@NgModule({
  declarations: [
    PrintscannerPage,
  ],
  imports: [
    IonicPageModule.forChild(PrintscannerPage),
    QRCodeModule,
    NgxBarcodeModule
  ],
})
export class PrintscannerPageModule {}
