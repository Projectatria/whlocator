import { Component } from '@angular/core';

/**
 * Generated class for the UsertableComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'usertable',
  templateUrl: 'usertable.html'
})
export class UsertableComponent {

  text: string;

  constructor() {
    console.log('Hello UsertableComponent Component');
    this.text = 'Hello World';
  }

}
