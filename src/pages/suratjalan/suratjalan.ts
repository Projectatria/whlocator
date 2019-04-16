import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import moment from 'moment';
import { Storage } from '@ionic/storage';

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
  public items = [];
  public itemsall = [];
  public totalqtyitem = 0;
  public totalqtypart = 0;
  public column = 'title';
  public descending: boolean = true;
  public order = 0;
  public userid = ''
  public role = [];
  public rolearea = '';
  public rolegroup = '';
  public rolecab = '';
  public date: any;
  public namepengirim = '';
  public address = '';
  public address1 = '';
  public kotapengirim = '';
  public telppengirim = '';
  public postcode = '';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public alertCtrl: AlertController,
    public storage: Storage,
    public viewCtrl: ViewController) {
    this.storage.get('userid').then((val) => {
      this.userid = val;
      this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
        .subscribe(val => {
          this.role = val['data']
          if (this.role.length != 0) {
            this.rolearea = this.role[0].id_area
            this.rolegroup = this.role[0].id_group
            this.rolecab = this.role[0].id_cab
            this.doGetAlamatPengirim()
          }
        })
    });
    this.date = moment().format('DD-MM-YYYY')
    this.column = 'item_no';
    this.order = this.descending ? 1 : -1;
    this.data = this.navParams.get('data')
    this.name = this.navParams.get('name')
    this.addressfull = this.navParams.get('addressfull')
    this.kota = this.navParams.get('kota')
    this.telp = this.navParams.get('telp')
    this.sjlno = this.navParams.get('sjlno')
    this.doGetItem()
    this.doGetPart()
    this.doGetTotalPart()
  }
  doGetAlamatPengirim() {
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Location", filter: "[Code]=" + "'" + this.rolecab + "'" } })
      .subscribe(val => {
        let detailsales = val['data']
        this.namepengirim = detailsales[0]['Name']
        this.address = detailsales[0]['Address']
        this.address1 = detailsales[0]['Address 2']
        this.kotapengirim = detailsales[0]['City']
        this.telppengirim = detailsales[0]['Phone No_']
        this.postcode = detailsales[0]['Post Code']
        console.log(this.namepengirim)
      }, err => {
        this.doGetAlamatPengirim()
      });
  }
  doGetItem() {
    this.api.get("table/delivery_order_line", { params: { limit: 100, filter: "receipt_no='" + this.data[0].receipt_no + "'", group: 'item_no' } })
      .subscribe(val => {
        let items = val['data']
        for (let i = 0; i < items.length; i++) {
          this.api.get("table/delivery_order_line", { params: { limit: 100, filter: "receipt_no='" + this.data[0].receipt_no + "' AND item_no=" + "'" + items[i].item_no + "'" } })
            .subscribe(val => {
              let data = val['data']
              data[0].Row = i + 1
              this.items.push(data[0])
              this.totalqtyitem = this.totalqtyitem + data[0].item_qty
            });
        }
      });
  }
  doGetPart() {
    this.api.get("table/delivery_order_line", { params: { limit: 100, filter: "receipt_no='" + this.data[0].receipt_no + "'", sort: "line_no ASC, part_no ASC" } })
      .subscribe(val => {
        this.itemsall = val['data']
      });
  }
  doGetTotalPart() {
    this.api.get("table/delivery_order_line", { params: { limit: 100, filter: "receipt_no='" + this.data[0].receipt_no + "'", group: 'receipt_no', groupSummary: "sum (part_qty) as qtysum" } })
      .subscribe(val => {
        this.totalqtypart = val['data'][0].qtysum
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
