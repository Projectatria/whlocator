import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api'

@IonicPage()
@Component({
  selector: 'page-statusdetail',
  templateUrl: 'statusdetail.html',
})
export class StatusdetailPage {

  items = [];
  invoice = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: ApiProvider) {
    this.invoice = navParams.get('param');
    this.getStatusdetail();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StatusdetailPage');
  }
  getStatusdetail() {
    this.api.get('table/status',{params:{filter:'invoice_no='+ "'" + this.invoice + "'"}}).subscribe(val => {
      this.items = val['data'];
    });
  }

}
