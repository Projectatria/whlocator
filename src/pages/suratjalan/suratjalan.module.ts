import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SuratjalanPage } from './suratjalan';
import { SortPipe } from '../../pipes/sort/sort';

@NgModule({
  declarations: [
    SuratjalanPage,
    SortPipe
  ],
  imports: [
    IonicPageModule.forChild(SuratjalanPage),
  ],
})
export class SuratjalanPageModule {}
