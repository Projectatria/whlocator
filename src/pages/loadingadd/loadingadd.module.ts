import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoadingaddPage } from './loadingadd';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  declarations: [
    LoadingaddPage,
  ],
  imports: [
    IonicPageModule.forChild(LoadingaddPage), ComponentsModule
  ],
})
export class LoadingaddPageModule {}
