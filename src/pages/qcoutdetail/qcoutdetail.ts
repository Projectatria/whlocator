import { Component } from '@angular/core';
import { ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormBuilder } from "@angular/forms";
import { HttpHeaders } from "@angular/common/http";
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-qcoutdetail',
  templateUrl: 'qcoutdetail.html',
})
export class QcoutdetailPage {
  private trans_sales_detail = [];
  searchpodetail: any;
  items = [];
  halaman = 0;
  totaldata: any;
  public toggled: boolean = false;
  receiptno = '';
  docno = ''
  batchno = '';
  locationcode = '';
  expectedreceiptdate = '';
  detailpo: string = "detailpoitem";
  private token:any;

  constructor(
    public navCtrl: NavController,
    public api: ApiProvider,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public menu: MenuController,
    public modalCtrl: ModalController,
    public storage: Storage
  ) {
    this.toggled = false;
    this.detailpo = "detailpoitem"
    this.receiptno = navParams.get('receiptno');
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Delivery Management Line", filter: "[Receipt No_]=" + "'" + this.receiptno + "'"} })
    .subscribe(val => {
      this.trans_sales_detail = val['data'];
      this.totaldata = val['count'];
    })
    this.getPOD();
  }
  ionViewCanEnter() {
    this.storage.get('token').then((val) => {
      this.token = val;
      if (this.token != null) {
        return true;
      }
      else {
        return false;
      }
    });
  }
  getPOD() {
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Delivery Management Line", filter: "[Receipt No_]=" + "'" + this.receiptno + "'"} })
    .subscribe(val => {
      this.trans_sales_detail = val['data'];
      this.totaldata = val['count'];
    })
  }
  getSearchPODetail(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.trans_sales_detail = this.searchpodetail.filter(detailpo => {
        return detailpo.item_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.trans_sales_detail = this.searchpodetail;
    }
  }
  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }
  doRefresh(refresher) {
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Delivery Management Line", filter: "[Receipt No_]=" + "'" + this.receiptno + "'"} })
    .subscribe(val => {
      this.trans_sales_detail = val['data'];
      this.totaldata = val['count'];
      this.searchpodetail = this.trans_sales_detail;
      refresher.complete();
    });
  }
  ionViewDidLoad() {
  }
}