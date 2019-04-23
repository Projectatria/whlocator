import { Component } from '@angular/core';
import { App, Events, MenuController, Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { FCM } from '@ionic-native/fcm';
import { ApiProvider } from '../providers/api/api';
import { HttpHeaders } from "@angular/common/http";
import moment from 'moment';
import { Storage } from '@ionic/storage';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;
  private token = '';
  public userid = [];
  public role = [];
  private rolearea = '';
  private rolegroup = '';
  public rolecab = '';
  public preparation = [];
  public receiving = [];
  public users = [];

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public menu: MenuController,
    public alertCtrl: AlertController,
    public push: Push,
    private fcm: FCM,
    public appCtrl: App,
    public api: ApiProvider,
    private storage: Storage,
    public events: Events) {
    platform.ready().then(() => {
      events.subscribe('user:login', (role, time) => {
        this.rolearea = role[0].id_area;
        this.rolegroup = role[0].id_group;
        this.rolecab = role[0].id_cab;
        this.userid = role[0].id_user;
        if (role.length != 0) {
          this.rolearea = role[0].id_area
          this.rolegroup = role[0].id_group
          this.rolecab = role[0].id_cab
          this.userid = role[0].id_user;
          this.doGetTaskPO()
        }
      });
      this.storage.get('token').then((val) => {
        this.token = val;
        if (this.token == null) {
          this.appCtrl.getRootNav().setRoot(LoginPage);
        }
        else {
          this.storage.get('userid').then((val) => {
            this.userid = val;
          });
        }
      });
      this.storage.get('userid').then((val) => {
        this.userid = val;
        this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
          .subscribe(val => {
            this.role = val['data']
            if (this.role.length != 0) {
              this.rolearea = this.role[0].id_area
              this.rolegroup = this.role[0].id_group
              this.rolecab = this.role[0].id_cab
              this.doGetTaskPO()
            }
          })
      });
      this.fcm.getToken().then(token => {
        this.storage.set('tokennotification', token);
        let date = moment().format('YYYY-MM-DD h:mm:ss');
        const headers = new HttpHeaders()
          .set("Content-Type", "application/json");
        this.api.post("table/token_notification",
          {
            "token": token,
            "date": date
          },
          { headers })
          .subscribe()
        this.fcm.onNotification().subscribe(data => {
          if (data.wasTapped) {
            this.appCtrl.getRootNav().setRoot('TaskPage');
          } else {
            let alert = this.alertCtrl.create({
              subTitle: data.title,
              message: data.body,
              buttons: ['OK']
            });
            alert.present();
            this.appCtrl.getRootNav().setRoot('TaskPage');
          };
        });
      }, (e) => {
      });
    });
  }
  doGetTaskPO() {
    this.api.get('table/purchasing_order', {
      params: {
        limit: 30, filter: "(status='INP2'" + " AND " +
          "((pic=" + "'" + this.userid + "')" +
          " OR " +
          "(pic_lokasi=" + "'" + this.userid + "'" + " AND status_location ='')" +
          " OR " +
          "(pic_barcode=" + "'" + this.userid + "'" + " AND status_barcode ='')))"
      }
    })
      .subscribe(val => {
        this.preparation = val['data'];
        if (this.preparation.length == 0) {
          this.doGetTaskReceving()
        }
        else {
          let alert = this.alertCtrl.create({
            subTitle: 'Notification',
            message: 'Anda mempunyai pekerjaan yang belum diselesaikan',
            buttons: ['OK']
          });
          alert.present();
          this.appCtrl.getRootNav().setRoot('TaskPage');
        }
      }, err => {
        this.doGetTaskPO()
      });
  }
  doGetTaskReceving() {
    this.api.get('table/purchasing_order', { params: { filter: "pic=" + "'" + this.userid + "' AND status='INPG'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length == 0) {
          this.doGetTaskQCIn()
        }
        else {
          let alert = this.alertCtrl.create({
            subTitle: 'Notification',
            message: 'Anda mempunyai pekerjaan yang belum diselesaikan',
            buttons: ['OK']
          });
          alert.present();
          this.appCtrl.getRootNav().setRoot('TaskPage');
        }
      }, err => {
        this.doGetTaskReceving()
      });
  }
  doGetTaskQCIn() {
    this.api.get('table/qc_in', { params: { filter: "pic=" + "'" + this.userid + "' AND status='OPEN'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length == 0) {
          this.doGetTaskQCOut()
        }
        else {
          let alert = this.alertCtrl.create({
            subTitle: 'Notification',
            message: 'Anda mempunyai pekerjaan yang belum diselesaikan',
            buttons: ['OK']
          });
          alert.present();
          this.appCtrl.getRootNav().setRoot('TaskPage');
        }
      }, err => {
        this.doGetTaskQCIn()
      });
  }
  doGetTaskQCOut() {
    this.api.get('table/qc_out', { params: { filter: "pic=" + "'" + this.userid + "' AND status='OPEN'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length == 0) {
          this.doGetTaskPicking()
        }
        else {
          let alert = this.alertCtrl.create({
            subTitle: 'Notification',
            message: 'Anda mempunyai pekerjaan yang belum diselesaikan',
            buttons: ['OK']
          });
          alert.present();
          this.appCtrl.getRootNav().setRoot('TaskPage');
        }
      }, err => {
        this.doGetTaskQCOut()
      });
  }
  doGetTaskPicking() {
    this.api.get('table/picking_list', { params: { filter: "pic=" + "'" + this.userid + "' AND status='INP1'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length == 0) {
          this.doGetTaskTransferOrder()
        }
        else {
          let alert = this.alertCtrl.create({
            subTitle: 'Notification',
            message: 'Anda mempunyai pekerjaan yang belum diselesaikan',
            buttons: ['OK']
          });
          alert.present();
          this.appCtrl.getRootNav().setRoot('TaskPage');
        }
      }, err => {
        this.doGetTaskPicking()
      });
  }
  doGetTaskTransferOrder() {
    this.api.get('table/transfer_order', { params: { limit: 30, filter: "((from_location=" + "'" + this.rolecab + "'" + " AND " + "status='INPG') OR (to_location=" + "'" + this.rolecab + "'" + " AND " + "status='OPEN') OR (to_location=" + "'" + this.rolecab + "'" + " AND " + "status='CLS1'))" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length == 0) {
          this.appCtrl.getRootNav().setRoot(HomePage);
        }
        else {
          let alert = this.alertCtrl.create({
            subTitle: 'Notification',
            message: 'Anda mempunyai pekerjaan yang belum diselesaikan',
            buttons: ['OK']
          });
          alert.present();
          this.appCtrl.getRootNav().setRoot('TaskPage');
        }
      }, err => {
        this.doGetTaskTransferOrder()
      });
  }
  open(pageName) {
    this.appCtrl.getRootNav().setRoot(pageName);
  };
  doHome() {
    this.appCtrl.getRootNav().setRoot(HomePage);
  }
  doLogout() {
    this.api.get('table/user', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
      .subscribe(val => {
        this.users = val['data'];
        const headers = new HttpHeaders()
          .set("Content-Type", "application/json");
        this.api.put("table/user",
          {
            "id_user": this.userid,
            "token": ''
          },
          { headers })
          .subscribe(val => {
            this.storage.remove('token');
            this.storage.remove('userid');
            this.storage.remove('name')
            this.appCtrl.getRootNav().setRoot(LoginPage);
          })
      });
  }
}

