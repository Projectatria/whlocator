import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TransferorderPage } from './transferorder';

@NgModule({
  declarations: [
    TransferorderPage,
  ],
  imports: [
    IonicPageModule.forChild(TransferorderPage),
  ],
})
export class TransferorderPageModule {}
