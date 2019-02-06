import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceivingdetailupdatePage } from './receivingdetailupdate';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    ReceivingdetailupdatePage,
  ],
  imports: [
    IonicPageModule.forChild(ReceivingdetailupdatePage), ComponentsModule
  ],
})
export class ReceivingdetailupdatePageModule {}
