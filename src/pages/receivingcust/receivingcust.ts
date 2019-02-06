import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { ApiProvider } from "../../providers/api/api";

@IonicPage()
@Component({
  selector: 'page-receivingcust',
  templateUrl: 'receivingcust.html',
})
export class ReceivingcustPage {

  private receivingcusts=[];
  private receivingcust1=[];

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: ApiProvider, private modal: ModalController) {
    this.api.get('table/receivingcust').subscribe(val => {
      this.receivingcusts = val['data'];
      this.receivingcust1 = val['data'];
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReceivingPage');
  }

  getSearchReceivingcust(ev: any) {
    console.log(ev)
    let val = ev.target.value;

    if (val && val.trim() != '') {
      this.receivingcusts = this.receivingcust1.filter(receivingcust => {
        return receivingcust.receivingcust_no.toLowerCase().indexOf(val.toLowerCase()) > -1 || receivingcust.invoice_no.toLowerCase().indexOf(val.toLowerCase()) > -1 || receivingcust.state.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.receivingcusts = this.receivingcust1;
    }
  }

  addReceiving(){
    let addReceiving = this.modal.create('ReceivingcustaddPage', this.modal, { cssClass: "modal-fullscreen" });
    addReceiving.present();
  }

}
