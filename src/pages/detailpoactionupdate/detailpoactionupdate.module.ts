import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetailpoactionupdatePage } from './detailpoactionupdate';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    DetailpoactionupdatePage,
  ],
  imports: [
    IonicPageModule.forChild(DetailpoactionupdatePage), ComponentsModule
  ],
})
export class DetailpoactionupdatePageModule {}
