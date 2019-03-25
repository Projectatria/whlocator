import { Component, trigger } from '@angular/core';
import { LoadingController, FabContainer, ActionSheetController, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { HttpHeaders } from "@angular/common/http";
import { UUID } from 'angular2-uuid';
import { BarcodeScanner, BarcodeScannerOptions } from "@ionic-native/barcode-scanner";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-cekstock',
  templateUrl: 'cekstock.html',
})
export class CekstockPage {

  public stock = [];
  public name: any;
  public userid: any;
  public role = [];
  public roleid: any;
  public rolegroup: any;
  public rolecab: any;
  public roleiddetail = [];
  public rolenamedetail: any;

  constructor(
    public navCtrl: NavController,
    public api: ApiProvider,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public menu: MenuController,
    public modalCtrl: ModalController,
    private barcodeScanner: BarcodeScanner,
    public actionSheetCtrl: ActionSheetController,
    public storage: Storage,
    public loadingCtrl: LoadingController) {
    this.storage.get('name').then((val) => {
      this.name = val;
    });
    this.storage.get('userid').then((val) => {
      this.userid = val;
      this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
        .subscribe(val => {
          this.role = val['data'];
          this.roleid = this.role[0].id_role;
          this.rolegroup = this.role[0].id_group;
          this.rolecab = this.role[0].id_cab;
          this.api.get('table/role', { params: { filter: "id_role=" + "'" + this.roleid + "'" } })
            .subscribe(val => {
              this.roleiddetail = val['data'];
              this.rolenamedetail = this.roleiddetail[0].name;
            });
          this.doGetStock()
        });
    });
  }
  doGetStock() {
    this.api.get('table/stock', { params: { limit: 100, filter: "qty !=0 AND location=" + "'" + this.rolecab + "'" } })
      .subscribe(val => {
        this.stock = val['data']
      });
  }
  getSearchBatchNo(ev: any) {
    let value = ev;
    // if the value is an empty string don't filter the items
    if (value && value.trim() != '') {
      this.api.get('table/stock', { params: { limit: 30, filter: "qty !=0 AND batch_no LIKE " + "'%" + value + "%' AND location=" + "'" + this.rolecab + "'" } })
        .subscribe(val => {
          let datastock = val['data'];
          this.stock = datastock.filter(stock => {
            return stock.batch_no.toLowerCase().indexOf(value.toLowerCase()) > -1;
          })
        });
    }
    else {
      this.stock = [];
      this.doGetStock()
    }
  }
  getSearchItemNo(ev: any) {
    let value = ev;
    // if the value is an empty string don't filter the items
    if (value && value.trim() != '') {
      this.api.get('table/stock', { params: { limit: 30, filter: "qty !=0 AND item_no LIKE " + "'%" + value + "%' AND location=" + "'" + this.rolecab + "'" } })
        .subscribe(val => {
          let datastock = val['data'];
          this.stock = datastock.filter(stock => {
            return stock.item_no.toLowerCase().indexOf(value.toLowerCase()) > -1;
          })
        });
    }
    else {
      this.stock = [];
      this.doGetStock()
    }
  }
  getSearchLocation(ev: any) {
    let value = ev;
    // if the value is an empty string don't filter the items
    if (value && value.trim() != '') {
      this.api.get('table/stock', { params: { limit: 30, filter: "qty !=0 AND location LIKE " + "'%" + value + "%' AND location=" + "'" + this.rolecab + "'" } })
        .subscribe(val => {
          let datastock = val['data'];
          this.stock = datastock.filter(stock => {
            return stock.location.toLowerCase().indexOf(value.toLowerCase()) > -1;
          })
        });
    }
    else {
      this.stock = [];
      this.doGetStock()
    }
  }
  getSearchSubLocation(ev: any) {
    let value = ev;
    // if the value is an empty string don't filter the items
    if (value && value.trim() != '') {
      this.api.get('table/stock', { params: { limit: 30, filter: "qty !=0 AND sub_location LIKE " + "'%" + value + "%' AND location=" + "'" + this.rolecab + "'" } })
        .subscribe(val => {
          let datastock = val['data'];
          this.stock = datastock.filter(stock => {
            return stock.sub_location.toLowerCase().indexOf(value.toLowerCase()) > -1;
          })
        });
    }
    else {
      this.stock = [];
      this.doGetStock()
    }
  }
}
