import { Component, ViewChild, ElementRef } from '@angular/core';
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
  selector: 'page-stockopnameteam',
  templateUrl: 'stockopnameteam.html',
})
export class StockopnameteamPage {
  public so: any;
  public name: any;
  public userid: any;
  public role = [];
  public roleid: any;
  public rolegroup: any;
  public rolecab: any;
  public roleiddetail = [];
  public rolenamedetail: any;
  public team = [];
  public users = [];
  public addshow: boolean = false;
  public listuser = [];

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
    this.so = this.navParams.get('so')
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
          this.doGetTeam()
        });
    });
  }
  doGetTeam() {
    this.api.get("table/stock_opname_team_header", { params: { limit: 10000, filter: "id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "' AND status='OPEN'", sort: 'id_team ASC' } })
      .subscribe(val => {
        this.team = val['data']
      });
  }
  doOffAdd() {
    this.addshow = false;
    document.getElementById('content').style.display = 'block'
    document.getElementById('footer').style.display = 'block'
  }
  doAdd() {
    this.addshow = true;
    document.getElementById('content').style.display = 'none'
    document.getElementById('footer').style.display = 'none'
    this.doGetUsers()
  }
  closeModal() {
    this.navCtrl.pop()
  }
  doGetUsers() {
    this.api.get("table/user_role", { params: { limit: 10000, filter: "id_cab=" + "'" + this.rolecab + "'", sort: 'id_user ASC' } })
      .subscribe(val => {
        this.users = val['data']
      });
  }
  doCheckAll() {
    let checkall: any = document.getElementsByName('listuserall[]')
    if (checkall[0].checked == true) {
      let array: any = document.getElementsByName('listuser[]')
      for (let i = 0; i < array.length; i++) {
        array[i].checked = true;
        this.listuser.push(array[i].value)
      }
      console.log(this.listuser)
    }
    else {
      let array: any = document.getElementsByName('listuser[]')
      for (let i = 0; i < array.length; i++) {
        array[i].checked = false;
        this.listuser = [];
      }
      console.log(this.listuser)
    }
  }
  doCheck(user) {
    let index = user.Row - 1
    let check: any = document.getElementsByName('listuser[]')[index]
    if (check.checked == true) {
      this.listuser.push(check.value)
      console.log(this.listuser)
    }
    else {
      let search = check.value
      for (var i = this.listuser.length - 1; i >= 0; i--) {
        if (this.listuser[i] === search) {
          this.listuser.splice(i, 1);
        }
      }
      console.log(this.listuser)
    }
  }
  doSubmit() {
    if (this.listuser.length == 0) {
      let alert = this.alertCtrl.create({
        subTitle: 'Perhatian',
        message: 'User belum dipilih !!',
        buttons: ['OK']
      });
      alert.present();
    }
  }
}
