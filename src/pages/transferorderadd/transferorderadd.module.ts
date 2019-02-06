import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TransferorderaddPage } from './transferorderadd';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    TransferorderaddPage,
  ],
  imports: [
    IonicPageModule.forChild(TransferorderaddPage), ComponentsModule
  ],
})
export class TransferorderaddPageModule {}
