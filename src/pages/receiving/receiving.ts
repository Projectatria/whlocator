import { Component } from '@angular/core';
import { LoadingController, ViewController, Platform, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpHeaders } from "@angular/common/http";
import { Storage } from '@ionic/storage';
import { BarcodeScanner, BarcodeScannerOptions } from "@ionic-native/barcode-scanner";
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-receiving',
  templateUrl: 'receiving.html',
})
export class ReceivingPage {
  myFormModal: FormGroup;
  private purchasing_order = [];
  private purchasing_order_history = [];
  searchpo: any;
  items = [];
  halaman = 0;
  halamanhistory = 0;
  totaldata: any;
  totaldatahistory: any;
  totaldataitem: any;
  public toggled: boolean = false;
  orderno = '';
  rcv: string = "receiving";
  private width: number;
  private height: number;
  private token: any;
  public loader: any;
  public userid: any;
  public name: any;
  public role = [];
  public roleid: any;
  public rolecab: any;

  constructor(
    public navCtrl: NavController,
    public api: ApiProvider,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public menu: MenuController,
    public modalCtrl: ModalController,
    public platform: Platform,
    public viewCtrl: ViewController,
    public storage: Storage,
    private barcodeScanner: BarcodeScanner,
    public loadingCtrl: LoadingController

  ) {
    this.loader = this.loadingCtrl.create({
      // cssClass: 'transparent',
      content: 'Loading Content...'
    });
    this.loader.present();
    this.rolecab = this.navParams.get('rolecab')
    this.getPO();
    this.getPOHistory();
    this.toggled = false;
    this.rcv = "receiving"
    platform.ready().then(() => {
      this.width = platform.width();
      this.height = platform.height();
      this.storage.get('name').then((val) => {
        this.name = val;
      });
      this.storage.get('userid').then((val) => {
        this.userid = val;
        this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
          .subscribe(val => {
            this.role = val['data']
            this.roleid = this.role[0].id_group
            this.rolecab = this.role[0].id_cab
          })
      });
    });
  }
  ngAfterViewInit() {
    this.loader.dismiss();
  }
  doProfile() {
    this.navCtrl.push('UseraccountPage');
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
  getPO() {
    return new Promise(resolve => {
      let offset = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/purchasing_order', { params: { limit: 30, offset: offset, filter: "status='INPG'" } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.purchasing_order.push(data[i]);
              this.totaldata = val['count'];
              this.searchpo = this.purchasing_order;
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            resolve();
          });
      }
    })

  }

  getPOHistory() {
    return new Promise(resolve => {
      let offset = 30 * this.halamanhistory
      if (this.halamanhistory == -1) {
        resolve();
      }
      else {
        this.halamanhistory++;
        this.api.get('table/purchasing_order', { params: { limit: 30, offset: offset, filter: "status='CLSD'" } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.purchasing_order_history.push(data[i]);
              this.totaldatahistory = val['count'];
            }
            if (data.length == 0) {
              this.halamanhistory = -1
            }
            resolve();
          });
      }
    })

  }

  getSearchPO(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.purchasing_order = this.searchpo.filter(po => {
        return po.order_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.purchasing_order = this.searchpo;
    }
  }
  menuShow() {
    this.menu.enable(true);
    this.menu.swipeEnable(true);
  };

  viewDetail(po) {
    this.navCtrl.push('ReceivingdetailPage', {
      orderno: po.order_no,
      batchno: po.batch_no,
      locationcode: po.location_code,
      expectedreceiptdate: po.expected_receipt_date,
      rolecab: this.rolecab
    });
  }

  doInfinite(infiniteScroll) {
    this.getPO().then(response => {
      infiniteScroll.complete();

    })
  }
  doInfiniteHistory(infiniteScroll) {
    this.getPOHistory().then(response => {
      infiniteScroll.complete();

    })
  }
  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }

  doRefresh(refresher) {
    this.api.get("table/purchasing_order", { params: { limit: 30, filter: "status='INPG'" } }).subscribe(val => {
      this.purchasing_order = val['data'];
      this.totaldata = val['count'];
      this.searchpo = this.purchasing_order;
      refresher.complete();
    });
  }

  doRefreshHistory(refresher) {
    this.api.get("table/purchasing_order", { params: { limit: 30, filter: "status='CLSD'" } }).subscribe(val => {
      this.purchasing_order_history = val['data'];
      this.totaldatahistory = val['count'];
      refresher.complete();
    });
  }

  doPostingPO(po) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Posting',
      message: 'Do you want to Posting?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'Posting',
          handler: () => {
            const headers = new HttpHeaders()
              .set("Content-Type", "application/json");
            this.api.put("table/purchasing_order",
              {
                "po_id": po.po_id,
                "status": 'ready',
                "user_id": ''
              },
              { headers })
              .subscribe(
                (val) => {
                  let alert = this.alertCtrl.create({
                    title: 'Sukses',
                    subTitle: 'Posting Sukses',
                    buttons: ['OK']
                  });
                  alert.present();
                  this.api.get("table/purchasing_order", { params: { limit: 30, filter: "status='INPG'" } }).subscribe(val => {
                    this.purchasing_order = val['data'];
                    this.totaldata = val['count'];
                    this.searchpo = this.purchasing_order;
                  });

                },
                response => {

                },
                () => {

                });
          }
        }
      ]
    });
    alert.present();
  }
  doOpenScanner(po) {
    this.barcodeScanner.scan().then(barcodeData => {
      var barcodeno = barcodeData.text;
      this.doPostAutoPrinter(barcodeno, po)
    });
  }
  doPostAutoPrinter(barcodeno, po) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("table/auto_printer_scanner",
      {
        "type_doc": po.po_id,
        "doc_no": po.order_no,
        "barcode_no": barcodeno,
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "id_user": this.userid,
        "status": 'OPEN'
      },
      { headers })
      .subscribe(
        (val) => {
          this.loader = this.loadingCtrl.create({
            // cssClass: 'transparent',
            content: 'Please Wait...'
          });
          this.loader.present().then(() => {
            this.doGetAutoPrinter(barcodeno)
          })
        }, err => {
          this.doPostAutoPrinter(barcodeno, po)
        });
  }
  doGetAutoPrinter(barcodeno) {
    this.api.get("table/auto_printer_scanner", { params: { limit: 30, filter: "barcode_no=" + "'" + barcodeno + "' AND status='INPG'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length == 0) {
          this.doGetAutoPrinter(barcodeno)
        }
        else {
          let alert = this.alertCtrl.create({
            title: 'Sukses',
            subTitle: 'Print Document Sukses',
            buttons: ['OK']
          });
          alert.present();
          this.loader.dismiss()
        }
      }, err => {
        this.doGetAutoPrinter(barcodeno)
      });
  }

}