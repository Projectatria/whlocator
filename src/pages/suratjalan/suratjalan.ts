import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-suratjalan',
  templateUrl: 'suratjalan.html',
})
export class SuratjalanPage {

  public data = [];
  public name = '';
  public addressfull = '';
  public kota = '';
  public telp = '';
  public sjlno = '';
  public itemsall = [];
  public totalqtyitem = 0;
  public totalqtypart = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController) {
    this.data = this.navParams.get('data')
    this.name = this.navParams.get('name')
    this.addressfull = this.navParams.get('addressfull')
    this.kota = this.navParams.get('kota')
    this.telp = this.navParams.get('telp')
    this.sjlno = this.navParams.get('sjlno')
    this.doGetItem()
    this.doGetTotalItem()
    this.doGetTotalPart()
  }
  doGetItem() {
    this.api.get("table/delivery_order_line", { params: { limit: 100, filter: "receipt_no='" + this.data[0].receipt_no + "'", sort: "line_no ASC, part_no ASC" } })
      .subscribe(val => {
        this.itemsall = val['data']
      });
  }
  doGetTotalItem() {
    this.api.get("table/delivery_order_line", { params: { limit: 100, filter: "receipt_no='" + this.data[0].receipt_no + "'", group: 'item_no', groupSummary: "sum (item_qty) as qtysum" } })
      .subscribe(val => {
        this.totalqtyitem = val['data'][0].qtysum
        console.log(this.totalqtyitem)
      });
  }
  doGetTotalPart() {
    this.api.get("table/delivery_order_line", { params: { limit: 100, filter: "receipt_no='" + this.data[0].receipt_no + "'", group: 'part_no', groupSummary: "sum (part_qty) as qtysum" } })
      .subscribe(val => {
        this.totalqtypart = val['data'][0].qtysum
        console.log(this.totalqtypart)
      });
  }
  closeModal() {
    this.viewCtrl.dismiss();
  }
  doPrint() {
    var divContents = document.getElementById("printarea").innerHTML;
    var printWindow = window.open();
    printWindow.document.write('<html><head><title>Surat Jalan</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('.table-border {border: 1px solid black;border-collapse: collapse;padding: 5px;text-align: center;}')
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div style="margin-top:10px;text-align:center;border:1px solid;border-color:transparent">');
    printWindow.document.write(divContents);
    printWindow.document.write('</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  }
}
