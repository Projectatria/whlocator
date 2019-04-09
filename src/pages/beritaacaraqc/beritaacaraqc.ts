import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-beritaacaraqc',
  templateUrl: 'beritaacaraqc.html',
})
export class BeritaacaraqcPage {

  public myqc = [];
  public qtysampling = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController) {
    this.myqc = this.navParams.get('myqc')
    this.doGetQcResultPassed()
  }
  ionViewDidLeave() {
    this.myqc = [];
  }
  doGetQcResultPassed() {
    this.api.get('table/qc_in_result', { params: { limit: 100, filter: "qc_no=" + "'" + this.myqc['qc_no'] + "' AND qc_status='PASSED'" } })
      .subscribe(val => {
        let data = val['data']
        this.myqc["passed"] = data.length
        this.doGetQcResultReject()
      }, err => {
        this.doGetQcResultPassed()
      });
  }
  doGetQcResultReject() {
    this.api.get('table/qc_in_result', { params: { limit: 100, filter: "qc_no=" + "'" + this.myqc['qc_no'] + "' AND qc_status='REJECT'" } })
      .subscribe(val => {
        let data = val['data']
        this.myqc["reject"] = data.length
        this.myqc["qty_receiving"] = data[0].qty_receiving
        this.myqc["checkingdate"] = data[0].date_finish
        this.doGetReceiving()
      }, err => {
        this.doGetQcResultReject()
      });
  }
  doGetReceiving() {
    this.api.get('table/receiving', { params: { limit: 100, filter: "receiving_no=" + "'" + this.myqc['receiving_no'] + "'" } })
      .subscribe(val => {
        let data = val['data']
        this.myqc["description"] = data[0].description
        this.myqc["vendorno"] = data[0].vendor_no
        if (data[0].vendor_status == 'FOREIGN') {
          this.myqc["vendorstatus"] = 'IMPORT'
        }
        else {
          this.myqc["vendorstatus"] = 'LOKAL'
        }
        this.myqc['receiveddate'] = moment(data[0].date).format('YYYY-MM-DD')
        this.doGetVendor()
      }, err => {
        this.doGetReceiving()
      });
  }
  doGetVendor() {
    this.api.get("tablenav", { params: { limit: 100, table: "CSB_LIVE$Vendor", filter: "[No_]=" + "'" + this.myqc["vendorno"] + "'" } })
      .subscribe(val => {
        let data = val['data']
        this.myqc["vendorname"] = data[0].Name
        this.qtysampling = this.myqc['passed'] + this.myqc['reject']
        console.log(this.myqc)
      });
  }
  closeModal() {
    this.viewCtrl.dismiss();
  }
  doPrint() {
    window.print();
  }

}
