import { NgModule } from '@angular/core';
import { TestingComponent } from './testing/testing';
import { IonicModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';

@NgModule({
	declarations: [TestingComponent],
	imports: [CommonModule, IonicModule],
	exports: [TestingComponent]
})
export class ComponentsModule {}
