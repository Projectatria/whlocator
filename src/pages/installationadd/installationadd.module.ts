import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InstallationaddPage } from './installationadd';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  declarations: [
    InstallationaddPage,
  ],
  imports: [
    IonicPageModule.forChild(InstallationaddPage), ComponentsModule
  ],
})
export class InstallationaddPageModule {}
