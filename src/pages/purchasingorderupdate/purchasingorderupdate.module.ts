import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PurchasingorderupdatePage } from './purchasingorderupdate';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    PurchasingorderupdatePage,
  ],
  imports: [
    IonicPageModule.forChild(PurchasingorderupdatePage), ComponentsModule
  ],
})
export class PurchasingorderupdatePageModule {}
