import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DashboardtaskPage } from './dashboardtask';

@NgModule({
  declarations: [
    DashboardtaskPage,
  ],
  imports: [
    IonicPageModule.forChild(DashboardtaskPage),
  ],
})
export class DashboardtaskPageModule {}
