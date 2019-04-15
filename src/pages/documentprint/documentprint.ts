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
  public po = '';

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
            po: data[0]
          })
          this.doClosePO()
        }
      });
  }

}
