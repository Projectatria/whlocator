import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReceivingcustaddPage } from './receivingcustadd';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  declarations: [
    ReceivingcustaddPage,
  ],
  imports: [
    IonicPageModule.forChild(ReceivingcustaddPage), ComponentsModule
  ],
})
export class ReceivingcustaddPageModule {}
