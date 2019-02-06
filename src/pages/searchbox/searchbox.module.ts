import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchboxPage } from './searchbox';

@NgModule({
  declarations: [
    SearchboxPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchboxPage),
  ],
})
export class SearchboxPageModule {}
