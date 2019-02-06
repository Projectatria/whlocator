import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetailpoupdatePage } from './detailpoupdate';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    DetailpoupdatePage,
  ],
  imports: [
    IonicPageModule.forChild(DetailpoupdatePage), ComponentsModule
  ],
})
export class DetailpoupdatePageModule {}
