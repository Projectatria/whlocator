import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';

@IonicPage()
@Component({
  selector: 'page-viewitem',
  templateUrl: 'viewitem.html',
})
export class ViewitemPage {
  private rcv = '';
  private items = [];
  private images = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: ApiProvider) {
    this.rcv = navParams.get('param');
    this.getItems();
    this.getItemsImage();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ViewitemPage');
    console.log(this.rcv);
    console.log(this.items);
    console.log(this.images);
  }
  getItems() {
    this.api.get('table/items',{params:{filter:'item_no='+ "'" + this.rcv + "'"}}).subscribe(val => {
      this.items = val['data'];
    });
  }

  getItemsImage() {
    this.api.get('table/items_image',{params:{filter:'item_no='+ "'" + this.rcv + "'"}}).subscribe(val => {
      this.images = val['data'];
    });
  }
}
