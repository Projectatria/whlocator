import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QcinPage } from './qcin';

@NgModule({
  declarations: [
    QcinPage,
  ],
  imports: [
    IonicPageModule.forChild(QcinPage),
  ],
})
export class QcinPageModule {}
