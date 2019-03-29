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
  selector: 'page-slotdelivery',
  templateUrl: 'slotdelivery.html',
})
export class SlotdeliveryPage {

  private token: any;
  public loader: any;
  public loaderproses: any;
  public userid: any;
  public name: any;
  public role = [];
  public roleid: any;
  public rolecab: any;
  private width: number;
  private height: number;
  public calendar = [];
  public slotterpakai = 0;
  public slotdata = [];
  public historyslot = [];
  public slotterpakaiall = [];

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
    this.calendar = this.navParams.get('calendar')
    this.slotterpakai = this.calendar['slot_total'] - this.calendar['slot_available']
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
            this.doGetSlot()
            this.doGetSlotHistory()
            this.doGetSlotTerpakai()
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
  doGetSlot() {
    this.api.get('table/slot_delivery', { params: { filter: "date_delivery=" + "'" + this.calendar['fulldate'] + "'", sort: 'slot_no DESC' } })
      .subscribe(val => {
        this.slotdata = val['data']
        console.log(this.slotdata)
      });
  }
  doAddSlot() {
    let alert = this.alertCtrl.create({
      title: 'Add Slot',
      subTitle: 'Berapa slot yang ingin anda tambah?',
      inputs: [
        {
          name: 'slot',
          placeholder: 'Slot'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {

          }
        },
        {
          text: 'OK',
          handler: data => {
            this.doConfirmation(data)
          }
        }
      ]
    });
    alert.present();
  }
  doConfirmation(data) {
    let alert = this.alertCtrl.create({
      title: 'Add Slot',
      message: 'Yakin ingin menambah ' + data.slot + ' slot?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'Submit',
          handler: () => {
            this.loaderproses = this.loadingCtrl.create({
              // cssClass: 'transparent',
              content: 'Loading Content...'
            });
            this.loaderproses.present().then(() => {
              this.doGetNextNo(data)
            })
          }
        }
      ]
    });
    alert.present();
  }
  getNextNo() {
    return this.api.get('nextno/slot_create_delivery/slot_id_create')
  }
  doGetNextNo(data) {
    this.getNextNo().subscribe(val => {
      let nextno = val['nextno'];
      this.doAddCreateSlot(nextno, data)
    }, err => {
      this.doGetNextNo(data)
    });
  }
  doAddCreateSlot(nextno, data) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("table/slot_create_delivery",
      {
        "slot_id_create": nextno,
        "total_slot": data.slot,
        "date_delivery": this.calendar['fulldate'],
        "pic_create": this.userid,
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": UUID.UUID()
      },
      { headers })
      .subscribe(
        (val) => {
          this.doGetCalendar(data)
          this.doLoopSlot(data)
        }, err => {
          this.doAddCreateSlot(nextno, data)
        });
  }
  doGetCalendar(data) {
    this.api.get('table/calendar', { params: { filter: "fulldate=" + "'" + this.calendar['fulldate'] + "'" } })
      .subscribe(val => {
        let datacalendar = val['data'][0]
        this.doUpdateCalendar(data, datacalendar)
      }, err => {
        this.doGetCalendar(data)
      });
  }
  doUpdateCalendar(data, datacalendar) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/calendar",
      {
        "fulldate": this.calendar['fulldate'],
        "slot_total": parseInt(datacalendar.slot_total) + parseInt(data.slot),
        "slot_available": parseInt(datacalendar.slot_available) + parseInt(data.slot)
      },
      { headers })
      .subscribe(
        (val) => {
        }, err => {
          this.doUpdateCalendar(data, datacalendar)
        });
  }
  doLoopSlot(data) {
    for (let i = 0; i < data.slot; i++) {
      this.doCreateSlot(data)
    }
    this.doGetSlot()
    this.loaderproses.dismiss()
    this.navCtrl.pop()
  }
  doCreateSlot(data) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("table/slot_delivery",
      {
        "request_no": '',
        "location_request": '',
        "group_delivery_no": '',
        "date_delivery": this.calendar['fulldate'],
        "receipt_no": '',
        "customer_no": '',
        "from_address": '',
        "from_address_1": '',
        "from_code_post": '',
        "from_city": '',
        "from_lat": '',
        "from_lng": '',
        "to_address": '',
        "to_address_1": '',
        "to_code_post": '',
        "to_city": '',
        "to_lat": '',
        "to_lng": '',
        "to_name": '',
        "to_telp": '',
        "to_description": '',
        "diff_time": '',
        "diff_distance": '',
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "status": 'OPEN',
        "pic_create": this.userid,
        "pic_request": '',
        "pic_group_delivery": '',
        "uuid": UUID.UUID()
      },
      { headers })
      .subscribe(
        (val) => {
        }, err => {
          this.doCreateSlot(data)
        });
  }
  doGetSlotHistory() {
    this.api.get('table/slot_create_delivery', { params: { limit: 100 ,filter: "date_delivery=" + "'" + this.calendar['fulldate'] + "'", sort: 'date_delivery DESC' } })
      .subscribe(val => {
        this.historyslot = val['data']
      }, err => {
        this.doGetSlotHistory()
      });
  }
  doGetSlotTerpakai() {
    this.api.get('table/slot_delivery', { params: { limit: 1000 ,filter: "date_delivery=" + "'" + this.calendar['fulldate'] + "' AND receipt_no != ''", sort: 'datetime DESC' } })
      .subscribe(val => {
        this.slotterpakaiall = val['data']
      }, err => {
        this.doGetSlotTerpakai()
      });
  }

}
