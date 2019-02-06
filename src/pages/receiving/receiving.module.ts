import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceivingPage } from './receiving';

@NgModule({
  declarations: [
    ReceivingPage,
  ],
  imports: [
    IonicPageModule.forChild(ReceivingPage),
  ],
})
export class ReceivingPageModule {}
