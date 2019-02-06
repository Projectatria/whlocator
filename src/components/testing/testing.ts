import { Component, Input } from '@angular/core';
import { AbstractControl } from "@angular/forms";

@Component({
  selector: 'testing',
  templateUrl: 'testing.html'
})
export class TestingComponent {

  text: string;
  @Input() messages:any[];
  @Input() control: AbstractControl;

  constructor() {
    console.log('Hello TestingComponent Component');
    this.text = 'Hello World';
  }

}