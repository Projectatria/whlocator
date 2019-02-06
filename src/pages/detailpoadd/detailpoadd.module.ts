import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetailpoaddPage } from './detailpoadd';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    DetailpoaddPage,
  ],
  imports: [
    IonicPageModule.forChild(DetailpoaddPage), ComponentsModule
  ],
})
export class DetailpoaddPageModule {}
