import { Component } from '@angular/core';
import { ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormBuilder } from "@angular/forms";
import { HttpHeaders } from "@angular/common/http";
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-pickingdetail',
  templateUrl: 'pickingdetail.html',
})
export class PickingdetailPage {
  private picking_detail = [];
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
  pickingdetail: string = "pickingdetailitem";
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
    this.pickingdetail = "pickingdetailitem"
    this.receiptno = navParams.get('receiptno');
    this.batchno = navParams.get('batchno');
    this.locationcode = navParams.get('locationcode');
    this.expectedreceiptdate = navParams.get('expectedreceiptdate');
    this.getSOD();
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
  getSOD() {
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Delivery Management Line", filter: "[Receipt No_]=" + "'" + this.receiptno + "'"} }).subscribe(val => {
      this.picking_detail = val['data'];
      this.totaldata = val['count'];
    })
  }
  getSODetail() {
    return new Promise(resolve => {
      let offset = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get("tablenav", { params: { limit: 30, offset: offset, table: "CSB_LIVE$Purchase Line", filter: "[Document No_]=" + "'" + this.receiptno + "'"} })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.picking_detail.push(data[i]);
              this.totaldata = val['count'];
              this.searchpodetail = this.picking_detail;
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            resolve();
          });
      }
    })

  }
  getSearchPODetail(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.picking_detail = this.searchpodetail.filter(detailpo => {
        return detailpo.item_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.picking_detail = this.searchpodetail;
    }
  }
  menuShow() {
    this.menu.enable(true);
    this.menu.swipeEnable(true);
  };
  doInfinite(infiniteScroll) {
    this.getSODetail().then(response => {
      infiniteScroll.complete();

    })
  }
  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }
  doRefresh(refresher) {
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Purchase Line", filter: "[Document No_]=" + "'" + this.receiptno + "'"} }).subscribe(val => {
      this.picking_detail = val['data'];
      this.totaldata = val['count'];
      this.searchpodetail = this.picking_detail;
      refresher.complete();
    });
  }
  ionViewDidLoad() {
    this.getSODetail();
  }
}