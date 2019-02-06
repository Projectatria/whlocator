import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InstallationPage } from './installation';

@NgModule({
  declarations: [
    InstallationPage,
  ],
  imports: [
    IonicPageModule.forChild(InstallationPage),
  ],
})
export class InstallationPageModule {}
