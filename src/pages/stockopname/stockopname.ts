import { Component } from '@angular/core';
import { LoadingController, FabContainer, ActionSheetController, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { UUID } from 'angular2-uuid';
import { BarcodeScanner, BarcodeScannerOptions } from "@ionic-native/barcode-scanner";
import moment from 'moment';
import { Storage } from '@ionic/storage';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from "@angular/common/http";

@IonicPage()
@Component({
  selector: 'page-stockopname',
  templateUrl: 'stockopname.html',
})
export class StockopnamePage {

  public so: any;
  public date: any;
  public soheaderlength: any;
  public name: any;
  public userid: any;
  public role = [];
  public roleid: any;
  public rolegroup: any;
  public rolecab: any;
  public roleiddetail = [];
  public rolenamedetail: any;
  public stockopname = [];

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
    private http: HttpClient,
    public loadingCtrl: LoadingController
  ) {
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
          this.doGetStockAll()
          this.doGetStockLength()
          if (this.rolegroup != 'STAFF') {
            this.so = 'co'
          }
          else {
            this.so = 'list'
          }
        });
    });
    this.date = moment().format('dddd DD MM YYYY HH:mm:ss');
    var self = this;
    setInterval(function () {
      self.date = moment().format('dddd DD MM YYYY HH:mm:ss');
    }, 1000);
  }
  doProses() {
    let alert = this.alertCtrl.create({
      title: 'Stock Opname',
      message: 'Proses cut off ' + moment(this.date).format('dddd DD MM YYYY HH:mm') + '?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'Proses',
          handler: () => {
            this.doGetStock()
          }
        }
      ]
    });
    alert.present();
  }
  doGetStockAll() {
    this.api.get("table/stock_opname_header", { params: { limit: 10000, filter: "status='OPEN' AND location=" + "'" + this.rolecab + "'" } })
      .subscribe(val => {
        this.stockopname = val['data']
      });
  }
  doGetStockLength() {
    this.api.get("table/stock_opname_header", { params: { limit: 10000, filter: 'date=' + "'" + moment().format('YYYY-MM-DD') + "' AND location=" + "'" + this.rolecab + "' AND status='OPEN'" } })
      .subscribe(val => {
        this.soheaderlength = val['data'].length
      });
  }
  doGetStock() {
    this.api.get("table/stock", { params: { limit: 10000, filter: 'location=' + "'" + this.rolecab + "'", sort: 'sub_location ASC' } })
      .subscribe(val => {
        let datastok = val['data']
        this.doGetSOHeader(datastok)
      }, err => {
        this.doGetStock()
      });
  }
  doGetSOHeader(datastok) {
    this.api.get("table/stock_opname_header", { params: { limit: 10000, filter: 'date=' + "'" + moment().format('YYYY-MM-DD') + "' AND location=" + "'" + this.rolecab + "' AND status='OPEN'" } })
      .subscribe(val => {
        let soheader = val['data']
        if (soheader.length == 0) {
          this.doPostSOHeader(datastok)
        }
      }, err => {
        this.doGetSOHeader(datastok)
      });
  }
  getNextNoSOHeader() {
    return this.api.get('nextno/stock_opname_header/id')
  }
  getNextNoSOLine() {
    return this.api.get('nextno/stock_opname_line/id')
  }
  doPostSOHeader(datastok) {
    this.getNextNoSOHeader().subscribe(val => {
      let nextnoheader = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      this.api.post("table/stock_opname_header",
        {
          "id": nextnoheader,
          "location": this.rolecab,
          "pic": this.userid,
          "date": moment().format('YYYY-MM-DD'),
          "datetime": moment().format('YYYY-MM-DD HH:mm'),
          "status": 'OPEN'
        },
        { headers })
        .subscribe(val => {
          let loading = this.loadingCtrl.create({
            content: 'Please wait...'
          });

          loading.present();
          this.doGetStockLength()
          for (let i = 0; i < datastok.length; i++) {
            let stok = datastok[i]
            this.doPostSOLine(nextnoheader, stok)
          }
          this.doGetStockAll()
          loading.dismiss()
        }, err => {
          this.doPostSOHeader(datastok)
        });
    }, err => {
      this.doPostSOHeader(datastok)
    });
  }
  doPostSOLine(nextnoheader, stok) {
    this.getNextNoSOLine().subscribe(val => {
      let nextnoline = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      this.api.post("table/stock_opname_line",
        {
          "id": nextnoline,
          "id_header": nextnoheader,
          "location": this.rolecab,
          "sub_location": stok.sub_location,
          "batch_no": stok.batch_no,
          "item_no": stok.item_no,
          "qty": stok.qty,
          "datetime": moment().format('YYYY-MM-DD HH:mm'),
          "status": 'OPEN'
        },
        { headers })
        .subscribe(val => {
        }, err => {
          this.doPostSOLine(nextnoheader, stok)
        });
    }, err => {
      this.doPostSOLine(nextnoheader, stok)
    });
  }
  viewDetail(so) {
    this.navCtrl.push('StockopnameteamPage', {
      so: so
    })
  }
}
