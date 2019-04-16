import { Component } from '@angular/core';
import { LoadingController, ViewController, Platform, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpHeaders } from "@angular/common/http";
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { UUID } from 'angular2-uuid';

declare var $;

@IonicPage()
@Component({
  selector: 'page-documentprint',
  templateUrl: 'documentprint.html',
})
export class DocumentprintPage {

  private token: any;
  public loader: any;
  public userid: any;
  public name: any;
  public role = [];
  public roleid: any;
  public rolecab: any;
  private width: number;
  private height: number;
  public poshow: boolean = false;
  public poshowqc: boolean = false;
  public sjlshow: boolean = false;
  public po = '';
  public sjl = '';
  public pl = '';
  public receiptno = ''

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
    public loadingCtrl: LoadingController
  ) {
    this.loader = this.loadingCtrl.create({
      // cssClass: 'transparent',
      content: 'Loading Content...'
    });
    this.loader.present();
    this.poshow = false;
    this.poshowqc = false;
    this.sjlshow = false;
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
    this.loader.dismiss()
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
  doPrintBA() {
    this.poshow = true;
  }
  doClosePO() {
    this.poshow = false;
    this.po = '';
    this.sjl = '';
    this.pl = '';
  }
  doPrintBAQC() {
    this.poshowqc = true;
  }
  doClosePOQC() {
    this.poshowqc = false;
    this.po = '';
  }
  doPrintSJL() {
    this.sjlshow = true;
  }
  doCloseSJL() {
    this.sjlshow = false;
    this.receiptno = '';
  }
  doPrintReceiving() {
    this.api.get('table/purchasing_order', { params: { limit: 30, filter: "status='CLSD' AND order_no=" + "'" + this.po + "'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length == 0) {
          let alert = this.alertCtrl.create({
            title: 'Perhatian',
            subTitle: 'PO Tidak ada atau belum selesai di Receiving',
            buttons: ['OK']
          });
          alert.present();
        }
        else {
          this.navCtrl.push('BeritaacarareceivingPage', {
            po: data[0],
            sjl: this.sjl,
            pl: this.pl
          })
          this.doClosePO()
        }
      });
  }
  doPrintQC() {
    this.api.get('table/purchasing_order', { params: { limit: 30, filter: "status='CLSD' AND order_no=" + "'" + this.po + "'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length == 0) {
          let alert = this.alertCtrl.create({
            title: 'Perhatian',
            subTitle: 'PO Tidak ada atau belum selesai di Receiving',
            buttons: ['OK']
          });
          alert.present();
        }
        else {
          this.navCtrl.push('BeritaacaraqcPage', {
            po: data[0]
          })
          this.doClosePO()
        }
      });
  }
  doPrintSuratJalan() {
    this.api.get('table/delivery_order_header', { params: { limit: 30, filter: "receipt_no=" + "'" + this.receiptno + "'" } })
      .subscribe(val => {
        let data = val['data']
        if (data[0].sjl_no == '') {
          this.doGetSJLNo(data)
        }
        else {
          this.doGetAlamat(data)
        }
      }, err => {
        this.doPrintSuratJalan()
      });
  }
  doGetSJLNo(data) {
    this.api.get('table/surat_jalan_request', { params: { limit: 1, filter: 'location_code=' + "'" + data[0].store_from + "'" } }).subscribe(val => {
      let datano = val['data'];
      if (datano.length != 0) {
        let nourut = datano[0].code + (datano[0].last_no_used + 1)
        this.doUpdateSJLNo(datano, data)
      }
      else {
        let alert = this.alertCtrl.create({
          title: 'Error',
          subTitle: 'Data tidak ada',
          buttons: ['OK']
        });
        alert.present();
      }
    }, err => {
      this.doGetSJLNo(data)
    });
  }
  doUpdateSJLNo(datano, data) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let date = moment().format('YYYY-MM-DD')
    this.api.put("table/surat_jalan_request",
      {
        "location_code": data[0].store_from,
        "last_date_used": date,
        "last_no_used": datano[0].last_no_used + 1
      },
      { headers })
      .subscribe((val) => {
        this.doUpdateDOD(datano, data)
      }, err => {
        this.doUpdateSJLNo(datano, data)
      });
  }
  doUpdateDOD(datano, data) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let date = moment().format('YYYY-MM-DD')
    this.api.put("table/delivery_order_header",
      {
        "uuid": data[0].uuid,
        "sjl_no": datano[0].code + (datano[0].last_no_used + 1)
      },
      { headers })
      .subscribe((val) => {
        this.doGetAlamat(data)
      }, err => {
        this.doUpdateDOD(datano, data)
      });
  }
  doGetAlamat(data) {
    this.api.get('table/delivery_order_header', { params: { limit: 30, filter: "receipt_no=" + "'" + data[0].receipt_no + "'" } })
      .subscribe(val => {
        let datadod = val['data']
        if (data[0].type_doc == 'TO') {
          this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Location", filter: "[Code]=" + "'" + data[0].store_no + "'" } })
            .subscribe(val => {
              let detailsales = val['data']
              let sjlno = datadod[0].sjl_no
              let name = detailsales[0]['Name']
              let address = detailsales[0]['Address']
              let address1 = detailsales[0]['Address 2']
              let kota = detailsales[0]['City']
              let telp = detailsales[0]['Phone No_']
              let postcode = detailsales[0]['Post Code']
              let addressfull = detailsales[0]['Address'] + " " + detailsales[0]['Address 2'] + " " + detailsales[0]['City']
              this.navCtrl.push('SuratjalanPage', {
                data: data,
                name: name,
                addressfull: addressfull,
                kota: kota,
                telp: telp,
                sjlno: sjlno
              })
              this.doCloseSJL()
            }, err => {
              this.doGetAlamat(data)
            });
        }
        else {
          this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Sales Header Archive", filter: "[No_]=" + "'" + data[0].so_no + "'" } })
            .subscribe(val => {
              let detailsales = val['data']
              console.log(detailsales)
              let sjlno = datadod[0].sjl_no
              let name = detailsales[0]['Ship-to Name']
              let address = detailsales[0]['Ship-to Address']
              let address1 = detailsales[0]['Ship-to Address 2']
              let kota = detailsales[0]['Ship-to City']
              let telp = detailsales[0]['Ship-to Phone No_']
              let postcode = detailsales[0]['Ship-to Post Code']
              let addressfull = detailsales[0]['Ship-to Address'] + " " + detailsales[0]['Ship-to Address 2'] + " " + detailsales[0]['Ship-to City']
              this.navCtrl.push('SuratjalanPage', {
                data: data,
                name: name,
                addressfull: addressfull,
                kota: kota,
                telp: telp,
                sjlno: sjlno
              })
              this.doCloseSJL()
            }, err => {
              this.doGetAlamat(data)
            });
        }
      });
  }
}
