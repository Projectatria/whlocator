import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MovementPage } from './movement';

@NgModule({
  declarations: [
    MovementPage,
  ],
  imports: [
    IonicPageModule.forChild(MovementPage),
  ],
})
export class MovementPageModule {}
