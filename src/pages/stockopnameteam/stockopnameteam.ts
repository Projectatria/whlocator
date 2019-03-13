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
  public teamresult = [];
  public users = [];
  public addshow: boolean = false;
  public listuser = [];
  public teamline = [];
  public idteam: any;
  public solist: any;
  public idteamresult: any;
  public teamlineresult = [];

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
    this.solist = 'list'
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
          this.doGetTeamResult()
        });
    });
  }
  doGetTeam() {
    this.api.get("table/stock_opname_team_header", { params: { limit: 10000, filter: "id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "' AND status='OPEN'", sort: 'id_team ASC' } })
      .subscribe(val => {
        this.team = val['data']
      });
  }
  doGetTeamResult() {
    this.api.get("table/stock_opname_team_header", { params: { limit: 10000, filter: "id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "' AND status='INPG'", sort: 'id_team ASC' } })
      .subscribe(val => {
        this.teamresult = val['data']
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
        this.api.get("table/user_role", { params: { limit: 10000, filter: "id_user=" + "'" + array[i].value + "'", sort: 'id_user ASC' } })
          .subscribe(val => {
            let datauser = val['data']
            this.listuser.push({ 'id_user': datauser[0].id_user, 'username': datauser[0].name })
          });
      }
    }
    else {
      let array: any = document.getElementsByName('listuser[]')
      for (let i = 0; i < array.length; i++) {
        array[i].checked = false;
        this.listuser = [];
      }
    }
  }
  doCheck(user) {
    let index = user.Row - 1
    let check: any = document.getElementsByName('listuser[]')[index]
    if (check.checked == true) {
      this.api.get("table/user_role", { params: { limit: 10000, filter: "id_user=" + "'" + check.value + "'", sort: 'id_user ASC' } })
        .subscribe(val => {
          let datauser = val['data']
          this.listuser.push({ 'id_user': datauser[0].id_user, 'username': datauser[0].name })
        });
    }
    else {
      let search = check.value
      for (var i = this.listuser.length - 1; i >= 0; i--) {
        if (this.listuser[i].id_user === search) {
          this.listuser.splice(i, 1);
        }
      }
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
    else {
      this.doGetTeamHeader()
    }
  }
  getNextNoTeamHeader() {
    return this.api.get('nextno/stock_opname_team_header/id')
  }
  getNextNoTeamLine() {
    return this.api.get('nextno/stock_opname_team_line/id')
  }
  doGetTeamHeader() {
    this.api.get("table/stock_opname_team_header", { params: { limit: 10000, filter: "id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "'", sort: 'id_team DESC' } })
      .subscribe(val => {
        let data = val['data']
        if (data.length == 0) {
          let idteam = 1
          this.doPostTeamHeader(idteam)
        }
        else {
          let idteam = parseInt(data[0].id_team) + 1
          this.doPostTeamHeader(idteam)
        }
      });
  }
  doPostTeamHeader(idteam) {
    this.getNextNoTeamHeader().subscribe(val => {
      let nextno = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      let date = moment().format('YYYY-MM-DD HH:mm');
      this.api.post("table/stock_opname_team_header",
        {
          "id": nextno,
          "id_team": idteam,
          "id_header": this.so.id,
          "location": this.rolecab,
          "datecutoff": this.so.date,
          "datetime": date,
          "user_create": this.userid,
          "status": 'OPEN'
        },
        { headers })
        .subscribe(val => {
          for (let i = 0; i < this.listuser.length; i++) {
            let line = this.listuser[i]
            this.doPostTeamLine(nextno, line, idteam)
          }
          this.doGetTeam()
          this.doOffAdd()
          this.listuser = [];
        }, err => {
          this.doPostTeamHeader(idteam)
        });
    }, err => {
      this.doPostTeamHeader(idteam)
    });
  }
  doPostTeamLine(nextno, line, idteam) {
    this.getNextNoTeamLine().subscribe(val => {
      let nextnoline = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      let date = moment().format('YYYY-MM-DD HH:mm');
      this.api.post("table/stock_opname_team_line",
        {
          "id": nextnoline,
          "id_team_header": nextno,
          "id_team": idteam,
          "id_header": this.so.id,
          "id_user": line.id_user,
          "username": line.username,
          "location": this.rolecab,
          "datetime": date
        },
        { headers })
        .subscribe(val => {
        }, err => {
          this.doPostTeamLine(nextno, line, idteam)
        });
    }, err => {
      this.doPostTeamLine(nextno, line, idteam)
    });
  }
  doGetTeamLine(tim) {
    this.idteam = tim.id
    this.api.get("table/stock_opname_team_line", { params: { limit: 10000, filter: "id_team_header=" + "'" + tim.id + "' AND id_team=" + "'" + tim.id_team + "' AND id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "'", sort: 'id_user ASC' } })
      .subscribe(val => {
        this.teamline = val['data']
      });
  }
  doHideGetTeamLine(tim) {
    this.teamline = [];
    this.idteam = '';
  }
  doGetTeamLineResult(tim) {
    this.idteamresult = tim.id
    this.api.get("table/stock_opname_team_line", { params: { limit: 10000, filter: "id_team_header=" + "'" + tim.id + "' AND id_team=" + "'" + tim.id_team + "' AND id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "'", sort: 'id_user ASC' } })
      .subscribe(val => {
        this.teamlineresult = val['data']
      });
  }
  doHideGetTeamLineResult(tim) {
    this.teamlineresult = [];
    this.idteamresult = '';
  }
  viewDetail(tim) {
    this.api.get("table/stock_opname_team_line", { params: { limit: 10000, filter: "id_team_header=" + "'" + tim.id + "' AND id_team=" + "'" + tim.id_team + "' AND id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "' AND id_user=" + "'" + this.userid + "'", sort: 'id_user ASC' } })
      .subscribe(val => {
        let data = val['data']
        if (data.length == 0) {
          let alert = this.alertCtrl.create({
            subTitle: 'Perhatian',
            message: 'Id User anda tidak ada dalam daftar list team.',
            buttons: ['OK']
          });
          alert.present();
        }
        else {
          this.navCtrl.push('StockopnamedetailPage', {
            so: this.so,
            tim: tim
          })
        }
      });
  }
  ionViewDidEnter() {
    this.doGetTeam()
  }
}
