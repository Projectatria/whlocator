import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-beritaacarareceiving',
  templateUrl: 'beritaacarareceiving.html',
})
export class BeritaacarareceivingPage {

  public datenow: any;
  public po = [];
  public vendorname = [];
  public tipevendor = '';
  public receiving = [];
  public orderno = '';
  public sjl = '';
  public pl = '';
  public datereceived: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController) {
    this.po = this.navParams.get('po')
    this.sjl = this.navParams.get('sjl')
    this.pl = this.navParams.get('pl')
    this.orderno = this.po['order_no']
    console.log(this.po, this.orderno)
    if (this.po['vendor_status'] == 'FOREIGN') {
      this.tipevendor = 'IMPORT'
    }
    else {
      this.tipevendor = 'LOKAL'
    }
    this.doGetVendorDetail()
    this.doGetReceiving()
  }
  doGetVendorDetail() {
    this.api.get("tablenav", { params: { limit: 100, table: "CSB_LIVE$Vendor", filter: "[No_]=" + "'" + this.po['vendor_no'] + "'" } })
      .subscribe(val => {
        let data = val['data']
        this.vendorname = data[0].Name
      }, err => {
        this.doGetVendorDetail()
      });
  }
  doGetReceiving() {
    this.api.get('table/receiving', { params: { limit: 100, filter: "order_no=" + "'" + this.po['order_no'] + "'", sort: 'date DESC' } })
      .subscribe(val => {
        this.receiving = val['data']
        this.datereceived = moment(this.receiving[0].date).format('dddd, DD MMMM YYYY')
      }, err => {
        this.doGetReceiving()
      });
  }
  closeModal() {
    this.viewCtrl.dismiss();
  }
  doPrint() {
    window.print();
  }

}
