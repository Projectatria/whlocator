import { Component } from '@angular/core';
import { LoadingController, ViewController, Platform, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpHeaders } from "@angular/common/http";
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { UUID } from 'angular2-uuid';

@IonicPage()
@Component({
  selector: 'page-route',
  templateUrl: 'route.html',
})
export class RoutePage {

  public calendar = [];
  private token: any;
  public loader: any;
  public userid: any;
  public name: any;
  public role = [];
  public roleid: any;
  public rolecab: any;
  private width: number;
  private height: number;
  public dateselect = [];
  public slot: any;
  public vehicleshow: boolean = false;
  public showdriver: boolean = false;
  public tipegroupselect: boolean = false;
  public listdriver: boolean = false;
  public listinstaller: boolean = false;
  public listinstaller2: boolean = false;
  public vehicleall = [];
  public driverall = [];
  public installerall = [];
  public routeall = [];
  public iduser: any;
  public vehicle = [];
  public userselect: any;
  public tipegroup = 'Pilih Tipe Group';
  public driver = 'Pilih Driver';
  public installer = 'Pilih Installer';
  public installerother = 'Pilih Installer 2';
  public namadriver = '';
  public namainstaller = '';
  public namainstaller2 = '';
  public platno = ''

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
    this.vehicleshow = false;
    this.showdriver = false;
    this.tipegroupselect = false;
    this.listdriver = false;
    this.tipegroup = 'Pilih Tipe Group'
    this.driver = 'Pilih Driver'
    this.installer = 'Pilih Installer'
    this.installerother = 'Pilih Installer 2'
    this.rolecab = this.navParams.get('rolecab')
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
  ionViewDidEnter() {
    this.doGetAllCalendar()
  }
  doGetAllCalendar() {
    this.api.get("table/calendar", { params: { limit: 31, filter: "fulldate >=" + "'" + moment().format('YYYY-MM-DD') + "'", sort: 'week ASC, year ASC, month ASC, date ASC' } })
      .subscribe(val => {
        this.calendar = val['data']
        this.loader.dismiss();
      }, err => {
        this.doGetAllCalendar()
      });
  }
  doGetSlot(date) {
    this.dateselect = date
    this.loader = this.loadingCtrl.create({
      // cssClass: 'transparent',
      content: 'Loading Kendaraan...'
    });
    this.loader.present().then(() => {
      this.doGetRoute(date)
    })
    this.slot = date.fulldate
  }
  doHideSlot() {
    this.slot = ''
    this.routeall = [];
  }
  doGetRoute(date) {
    this.api.get('table/route_header', { params: { filter: "date_delivery=" + "'" + date.fulldate + "'" } })
      .subscribe(val => {
        this.routeall = val['data']
        this.loader.dismiss()
      }, err => {
        this.doGetRoute(date)
      });
  }
  doCreateVehicle(date) {
    this.dateselect = date
    this.doGetVehicle()
    this.vehicleshow = true;
  }
  doHideVehicle() {
    this.vehicleshow = false;
  }
  doGetVehicle() {
    this.api.get("table/kendaraan", { params: { limit: 100, filter: "status='OPEN'", sort: 'no_plat ASC' } })
      .subscribe(val => {
        this.vehicleall = val['data']
      }, err => {
        this.doGetVehicle()
      });
  }
  getSearch(ev: any) {
    // set val to the value of the searchbar
    let value = ev.target.value;
    // if the value is an empty string don't filter the items
    if (value && value.trim() != '') {
      this.api.get("table/kendaraan", { params: { limit: 100, filter: "status='OPEN' AND no_plat LIKE " + "'%" + value + "%'", sort: 'no_plat ASC' } })
        .subscribe(val => {
          let data = val['data']
          this.vehicleall = data.filter(vehicle => {
            return vehicle.no_plat.toLowerCase().indexOf(value.toLowerCase()) > -1;
          })
        });
    }
    else {
      this.vehicleall = [];
      this.doGetVehicle()
    }
  }
  doSelectVehicle(vehicle) {
    this.tipegroup = 'Pilih Tipe Group'
    this.driver = 'Pilih Driver'
    this.installer = 'Pilih Installer'
    this.installerother = 'Pilih Installer 2'
    this.vehicle = vehicle
    this.doGetDriver()
    this.showdriver = true;
  }
  doCloseDriver() {
    this.showdriver = false;
  }
  doGetDriver() {
    this.api.get("table/user_role", { params: { limit: 1000, filter: "id_role='DRIVER'", sort: 'id_user ASC' } })
      .subscribe(val => {
        this.driverall = val['data']
      }, err => {
        this.doGetDriver()
      });
  }
  doGetInstaller() {
    this.api.get("table/user_role", { params: { limit: 1000, filter: "id_role='INSTALLER'", sort: 'id_user ASC' } })
      .subscribe(val => {
        this.installerall = val['data']
      }, err => {
        this.doGetInstaller()
      });
  }
  doSelect(user) {
    this.userselect = this.iduser
  }
  doSelectTipeGroup() {
    this.tipegroupselect = true;
  }
  doCloseSelectTipeGroup() {
    this.tipegroupselect = false;
  }
  doSelectDriver() {
    this.doGetDriver()
    this.listdriver = true;
  }
  doCloseSelectDriver() {
    this.listdriver = false;
  }
  selectDriver(driver) {
    this.driver = driver.id_user
    this.namadriver = driver.name
    this.doCloseSelectDriver()
  }
  doSelectInstaller() {
    this.doGetInstaller()
    this.listinstaller = true;
  }
  doCloseSelectInstaller() {
    this.listinstaller = false;
  }
  selectInstaller(installer) {
    this.installer = installer.id_user
    this.namainstaller = installer.name
    this.doCloseSelectInstaller()
  }
  doSelectInstaller2() {
    this.doGetInstaller()
    this.listinstaller2 = true;
  }
  doCloseSelectInstaller2() {
    this.listinstaller2 = false;
  }
  selectInstaller2(installer) {
    this.installerother = installer.id_user
    this.namainstaller2 = installer.name
    this.doCloseSelectInstaller2()
  }
  selectTipeGroup(val) {
    if (val == 'DI') {
      this.tipegroup = 'Delivery & Installation'
    }
    else if (val == 'D') {
      this.tipegroup = 'Delivery'
    }
    else if (val == 'I') {
      this.tipegroup = 'Installation'
    }
    this.doCloseSelectTipeGroup()
  }
  getNextNo() {
    return this.api.get('nextno/route_header/group_route_no')
  }
  doGetNextNo() {
    if (this.tipegroup == 'Delivery & Installation') {
      if (this.driver == 'Pilih Driver' || this.installer == 'Pilih Installer') {
        let alert = this.alertCtrl.create({
          title: 'Perhatian',
          subTitle: 'Silahkan Pilih Driver dan Installer terlebih dahulu',
          buttons: ['OK']
        });
        alert.present();
      }
      else {
        this.getNextNo().subscribe(val => {
          let nextno = val['nextno'];
          this.doAddRoute(nextno)
        }, err => {
          this.doGetNextNo()
        });
      }
    }
    else if (this.tipegroup == 'Delivery') {
      if (this.driver == 'Pilih Driver') {
        let alert = this.alertCtrl.create({
          title: 'Perhatian',
          subTitle: 'Silahkan Pilih Driver terlebih dahulu',
          buttons: ['OK']
        });
        alert.present();
      }
      else {
        this.getNextNo().subscribe(val => {
          let nextno = val['nextno'];
          this.doAddRoute(nextno)
        }, err => {
          this.doGetNextNo()
        });
      }
    }
    else if (this.tipegroup == 'Installation') {
      if (this.installer == 'Pilih Installer') {
        let alert = this.alertCtrl.create({
          title: 'Perhatian',
          subTitle: 'Silahkan Installer terlebih dahulu',
          buttons: ['OK']
        });
        alert.present();
      }
      else {
        this.getNextNo().subscribe(val => {
          let nextno = val['nextno'];
          this.doAddRoute(nextno)
        }, err => {
          this.doGetNextNo()
        });
      }
    }
    else {
      let alert = this.alertCtrl.create({
        title: 'Perhatian',
        subTitle: 'Silahkan Pilih Tipe Group terlebih dahulu',
        buttons: ['OK']
      });
      alert.present();
    }
  }
  doAddRoute(nextno) {
    if (this.driver == 'Pilih Driver') {
      this.driver = ''
      this.namadriver = ''
    }
    if (this.installer == 'Pilih Installer') {
      this.installer = ''
      this.namainstaller = ''
    }
    if (this.installerother == 'Pilih Installer 2') {
      this.installerother = ''
      this.namainstaller2 = ''
    }
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("table/route_header",
      {
        "type": this.tipegroup,
        "type_vehicle": this.vehicle['type'],
        "group_route_no": nextno,
        "plat_no": this.vehicle['no_plat'],
        "id_driver": this.driver,
        "nama_driver": this.namadriver,
        "id_installer": this.installer,
        "nama_installer": this.namainstaller,
        "id_installer_2": this.installerother,
        "nama_installer_2": this.namainstaller2,
        "date_delivery": this.dateselect['fulldate'],
        "status": 'OPEN',
        "pic_create": this.userid,
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": UUID.UUID()
      },
      { headers })
      .subscribe(
        (val) => {
          this.loader = this.loadingCtrl.create({
            // cssClass: 'transparent',
            content: 'Loading Content...'
          });
          this.loader.present().then(() => {
            this.doGetCalendar()
          })
        }, err => {
          this.doAddRoute(nextno)
        });
  }
  doGetCalendar() {
    this.api.get('table/calendar', { params: { filter: "fulldate=" + "'" + this.dateselect['fulldate'] + "'" } })
      .subscribe(val => {
        let datacalendar = val['data'][0]
        this.doUpdateCalendar(datacalendar)
      }, err => {
        this.doGetCalendar()
      });
  }
  doUpdateCalendar(datacalendar) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/calendar",
      {
        "fulldate": this.dateselect['fulldate'],
        "total_vehicle": parseInt(datacalendar.total_vehicle) + 1,
      },
      { headers })
      .subscribe(
        (val) => {
          this.doClearSelect()
        }, err => {
          this.doUpdateCalendar(datacalendar)
        });
  }
  doClearSelect() {
    this.doHideVehicle()
    this.doCloseDriver()
    this.doCloseSelectTipeGroup()
    this.doCloseSelectDriver()
    this.doCloseSelectInstaller()
    this.doCloseSelectInstaller2()
    this.driver = ''
    this.namadriver = ''
    this.installer = ''
    this.namainstaller = ''
    this.namainstaller2 = ''
    this.doGetAllCalendar()
  }
  doGetSlotRoute(route) {
    this.platno = route.plat_no
  }
  doHideSlotRoute() {
    this.platno = ''
  }
}

