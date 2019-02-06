import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiProvider } from "../../providers/api/api";
import { HttpHeaders } from "@angular/common/http";

@IonicPage()
@Component({
  selector: 'page-delivery',
  templateUrl: 'delivery.html',
})
export class DeliveryPage {

  private deliverys = [];
  private delivery1

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: ApiProvider, private modal: ModalController) {
    this.api.get('table/delivery').subscribe(val => {
      this.deliverys = val['data'];
      this.delivery1 = val['data'];
    })

  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DeliveryPage');
  }
  getSearchDelivery(ev: any) {
    console.log(ev)
    let val = ev.target.value;

    if (val && val.trim() != '') {
      this.deliverys = this.delivery1.filter(delivery => {
        return delivery.delivery_no.toLowerCase().indexOf(val.toLowerCase()) > -1 || delivery.invoice_no.toLowerCase().indexOf(val.toLowerCase()) > -1 || delivery.state.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.deliverys = this.delivery1;
    }
  }

  addDelivery() {
    let addDelivery = this.modal.create('DeliveryaddPage', this.modal, { cssClass: "modal-fullscreen" });
    addDelivery.present();
  }
}
