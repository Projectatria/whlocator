import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QcinPage } from './qcin';
import { IonicImageViewerModule } from 'ionic-img-viewer';

@NgModule({
  declarations: [
    QcinPage,
  ],
  imports: [
    IonicPageModule.forChild(QcinPage),
    IonicImageViewerModule
  ],
})
export class QcinPageModule {}
