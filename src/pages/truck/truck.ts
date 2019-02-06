import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { TruckaddPage } from '../truckadd/truckadd';

@IonicPage()
@Component({
  selector: 'page-truck',
  templateUrl: 'truck.html',
})
export class TruckPage {

  private trucks = [];
  private truck1=[];

  constructor(public navCtrl: NavController, public api: ApiProvider, public navParams: NavParams, private modal: ModalController) {
    this.api.get('table/truck', {params: {limit: 30}}).subscribe(val => {
      this.trucks = val['data'];
      this.truck1 = val['data'];
    })


  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TruckPage');
  }
  getSearchTruck(ev: any) {
    console.log(ev)
    let val = ev.target.value;

    if (val && val.trim() != '') {
      this.trucks = this.truck1.filter(truck => {
        return truck.truck_no.toLowerCase().indexOf(val.toLowerCase()) > -1 || truck.staff_name.toLowerCase().indexOf(val.toLowerCase()) > -1 || truck.state.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.trucks = this.truck1;
    }
  }

  addTruck(){
    let addTruck = this.modal.create('TruckaddPage', this.modal, { cssClass: "modal-fullscreen" });
    addTruck.present();
  }

}
