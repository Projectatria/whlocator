import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TruckaddPage } from './truckadd';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  declarations: [
    TruckaddPage,
  ],
  imports: [
    IonicPageModule.forChild(TruckaddPage),ComponentsModule
  ],
})
export class TruckaddPageModule {}
