import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TransferorderdetailaddPage } from './transferorderdetailadd';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    TransferorderdetailaddPage,
  ],
  imports: [
    IonicPageModule.forChild(TransferorderdetailaddPage), ComponentsModule
  ],
})
export class TransferorderdetailaddPageModule {}
