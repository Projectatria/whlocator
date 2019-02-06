import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QcoutPage } from './qcout';
import { IonicImageViewerModule } from 'ionic-img-viewer';

@NgModule({
  declarations: [
    QcoutPage,
  ],
  imports: [
    IonicPageModule.forChild(QcoutPage),
    IonicImageViewerModule
  ],
})
export class QcoutPageModule {}
