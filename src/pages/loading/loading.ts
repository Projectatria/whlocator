import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { LoadingaddPage } from "../loadingadd/loadingadd";

@IonicPage()
@Component({
  selector: 'page-loading',
  templateUrl: 'loading.html',
})
export class LoadingPage {

  private loadings = [];
  private loading1 = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: ApiProvider, private modal: ModalController) {
    this.api.get('table/loading').subscribe(val => {
      this.loadings = val['data'];
      this.loading1 = val['data'];
    })

  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoadingPage');
  }
  addLoading(){
    let addLoading = this.modal.create('LoadingaddPage', this.modal, {cssClass: "modal-fullscreen"});
    addLoading.present();
  }
  getSearchLoading(ev: any) {
    console.log(ev)
    let val = ev.target.value;

    if (val && val.trim() != '') {
      this.loadings = this.loading1.filter(loading => {
        return loading.loading_no.toLowerCase().indexOf(val.toLowerCase()) > -1 || loading.invoice_no.toLowerCase().indexOf(val.toLowerCase()) > -1 || loading.state.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.loadings = this.loading1;
    }
  }

}
