import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceivingdetailPage } from './receivingdetail';
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome'

@NgModule({
  declarations: [
    ReceivingdetailPage,
  ],
  imports: [
    IonicPageModule.forChild(ReceivingdetailPage),
    Angular2FontawesomeModule
  ],
})
export class ReceivingdetailPageModule {}
