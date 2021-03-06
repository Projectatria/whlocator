import { Component } from '@angular/core';
import { LoadingController, ViewController, Platform, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpHeaders } from "@angular/common/http";
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { UUID } from 'angular2-uuid';

declare var jQuery;

@IonicPage()
@Component({
  selector: 'page-printscanner',
  templateUrl: 'printscanner.html',
})
export class PrintscannerPage {

  private token: any;
  public loader: any;
  public userid: any;
  public name: any;
  public role = [];
  public roleid: any;
  public rolecab: any;
  private width: number;
  private height: number;
  public value = ''

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
    this.loader.present().then(() => {
      this.doGetUUID()
    })
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
  doGetUUID() {
    let barcodeno = UUID.UUID();
    jQuery('#qrcodeCanvas').qrcode({
      width: 480,
      height: 480,
      text: barcodeno
    });
    this.doGetAutoPrint(barcodeno)
  }
  doGetAutoPrint(barcodeno) {
    this.api.get("table/auto_printer_scanner", { params: { limit: 30, filter: "barcode_no=" + "'" + barcodeno + "' AND status='OPEN'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length == 0) {
          this.doGetAutoPrint(barcodeno)
        }
        else {

        }
      }, err => {
        this.doGetAutoPrint(barcodeno)
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
}
