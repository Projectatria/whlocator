import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { ApiProvider } from "../../providers/api/api";

@IonicPage()
@Component({
  selector: 'page-installation',
  templateUrl: 'installation.html',
})
export class InstallationPage {

  private installations = [];
  private installation1 = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: ApiProvider, private modal: ModalController) {
    this.api.get('table/installation').subscribe(val => {
      this.installations = val['data'];
      this.installation1 = val['data'];
    })
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad InstallationPage');
  }
  addInstallation(){
    let addInstallation = this.modal.create('InstallationaddPage', this.modal, { cssClass: "modal-fullscreen"});
    addInstallation.present();
  }
  getSearchInstallation(ev: any) {
    console.log(ev)
    let val = ev.target.value;

    if (val && val.trim() != '') {
      this.installations = this.installation1.filter(installation => {
        return installation.installation_no.toLowerCase().indexOf(val.toLowerCase()) > -1 || installation.state.toLowerCase().indexOf(val.toLowerCase()) > -1 || installation.staff_name.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.installations = this.installation1;
    }
  }

}
