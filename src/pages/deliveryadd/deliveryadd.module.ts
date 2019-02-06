import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DeliveryaddPage } from './deliveryadd';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  declarations: [
    DeliveryaddPage,
  ],
  imports: [
    IonicPageModule.forChild(DeliveryaddPage),ComponentsModule
  ],
})
export class DeliveryaddPageModule {}

