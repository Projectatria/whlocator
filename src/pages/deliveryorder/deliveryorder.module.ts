import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DeliveryorderPage } from './deliveryorder';

@NgModule({
  declarations: [
    DeliveryorderPage,
  ],
  imports: [
    IonicPageModule.forChild(DeliveryorderPage),
  ],
})
export class DeliveryorderPageModule {}
