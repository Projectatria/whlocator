import { Component } from '@angular/core';
import { LoadingController, ViewController, Platform, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpHeaders } from "@angular/common/http";
import { Storage } from '@ionic/storage';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-scheduledelivery',
  templateUrl: 'scheduledelivery.html',
})
export class ScheduledeliveryPage {

  public calendar = [];
  public slotall = [];
  private token: any;
  public loader: any;
  public userid: any;
  public name: any;
  public role = [];
  public roleid: any;
  public rolecab: any;
  private width: number;
  private height: number;
  public slot: any;
  public invoiceshow: boolean = false;
  public deliveryorder = [];
  public slotselect = [];
  public dateselect = [];
  public loaderproses: any;

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
    this.invoiceshow = false;
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
      content: 'Loading Content...'
    });
    this.loader.present();
    this.slot = date.fulldate
    this.api.get("table/slot_delivery", { params: { limit: 1000, filter: "date_delivery =" + "'" + date.fulldate + "'", sort: 'receipt_no ASC' } })
      .subscribe(val => {
        this.slotall = val['data']
        this.loader.dismiss()
      }, err => {
        this.doGetSlot(date)
      });
  }
  doHideSlot() {
    this.slot = ''
    this.slotall = [];
  }
  doSlot(date) {
    this.navCtrl.push('SlotdeliveryPage', {
      calendar: date
    })
  }
  slideChanged() {
    this.doHideSlot()
  }
  doSearchInvoice(slot) {
    this.slotselect = slot
    this.doGetDeliveryOrder()
    this.invoiceshow = true;
  }
  doCloseInvoice() {
    this.invoiceshow = false;
  }
  doGetDeliveryOrder() {
    this.api.get("table/delivery_order_header", { params: { limit: 100, filter: "store_no=" + "'" + this.rolecab + "' AND (delivery_booking= '' OR delivery_booking IS NULL)", sort: 'receipt_date ASC' } })
      .subscribe(val => {
        this.deliveryorder = val['data']
      }, err => {
        this.doGetDeliveryOrder()
      });
  }
  getSearch(ev: any) {
    // set val to the value of the searchbar
    let value = ev.target.value;
    // if the value is an empty string don't filter the items
    if (value && value.trim() != '') {
      this.api.get("table/delivery_order_header", { params: { limit: 10, filter: "store_no=" + "'" + this.rolecab + "' AND receipt_no LIKE" + "'%" + value + "%'  AND (delivery_booking= '' OR delivery_booking IS NULL)", sort: 'receipt_date ASC' } })
        .subscribe(val => {
          let data = val['data']
          this.deliveryorder = data.filter(delivery => {
            return delivery.receipt_no.toLowerCase().indexOf(value.toLowerCase()) > -1;
          })
        });
    }
    else {
      this.deliveryorder = [];
      this.doGetDeliveryOrder()
    }
  }
  doSelectDeliveryOrder(dod) {
    let alert = this.alertCtrl.create({
      title: 'Request Slot',
      message: 'Booking slot pada Hari ' + this.dateselect['day_id'] + ' Tanggal ' + this.dateselect['date'] + '-' + this.dateselect['month_description'] + '-' + this.dateselect['year'] + ' Untuk Invoice ' + dod.receipt_no + ' ?',
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
              content: 'Proses Booking...'
            });
            this.loaderproses.present().then(() => {
              this.doGetDetailAlamat(dod)
            })
          }
        }
      ]
    });
    alert.present()
  }
  readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState === 4) {
        callback(rawFile.responseText);
      }
    }
    rawFile.send(null);
  }
  doGetDetailAlamat(dod) {
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Sales Header Archive", filter: "[No_]=" + "'" + dod.so_no + "'" } })
      .subscribe(val => {
        let detailsales = val['data']
        let name = detailsales[0]['Ship-to Name']
        let address = detailsales[0]['Ship-to Address']
        let address1 = detailsales[0]['Ship-to Address 2']
        let kota = detailsales[0]['Ship-to City']
        let telp = detailsales[0]['Ship-to Phone No_']
        let postcode = detailsales[0]['Ship-to Post Code']
        let addressfull = detailsales[0]['Ship-to Address'] + " " + detailsales[0]['Ship-to Address 2'] + " " + detailsales[0]['Ship-to City']
        let dataurl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + addressfull + '&key=AIzaSyCyS0sAM18a1JhzYSwZEBkfyE5--qFoN1U'
        var self = this;
        this.readTextFile(dataurl, function (text) {
          var datalatlon = JSON.parse(text);
          let latitude = datalatlon.results[0].geometry.location.lat
          let longitude = datalatlon.results[0].geometry.location.lng
          self.doGetNextNo(dod, name, address, address1, kota, telp, postcode, latitude, longitude)
        });
      }, err => {
        this.doGetDetailAlamat(dod)
      });
  }
  getNextNo() {
    return this.api.get('nextno/slot_delivery/request_no')
  }
  doGetNextNo(dod, name, address, address1, kota, telp, postcode, latitude, longitude) {
    this.getNextNo().subscribe(val => {
      let nextno = val['nextno'];
      this.doUpdateSlotDelivery(nextno, dod, name, address, address1, kota, telp, postcode, latitude, longitude)
    }, err => {
      this.doGetNextNo(dod, name, address, address1, kota, telp, postcode, latitude, longitude)
    });
  }
  doUpdateSlotDelivery(nextno, dod, name, address, address1, kota, telp, postcode, latitude, longitude) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/slot_delivery",
      {
        "uuid": this.slotselect['uuid'],
        "request_no": nextno,
        "pic_request": this.userid,
        "location_request": dod.store_no,
        "receipt_no": dod.receipt_no,
        "customer_no": dod.customer_code,
        "to_address": address,
        "to_address_1": address1,
        "to_code_post": postcode,
        "to_city": kota,
        "to_lat": latitude,
        "to_lng": longitude,
        "to_name": name,
        "to_telp": telp,
        "to_description": '',
        "datetime": moment().format('YYYY-MM-DD HH:mm')
      },
      { headers })
      .subscribe(
        (val) => {
          this.doUpdateDeliveryOrderHeader(dod, nextno)
        }, err => {
          this.doUpdateSlotDelivery(nextno, dod, name, address, address1, kota, telp, postcode, latitude, longitude)
        });
  }
  doUpdateDeliveryOrderHeader(dod, nextno) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/delivery_order_header",
      {
        "uuid": dod.uuid,
        "delivery_date": this.dateselect['fulldate'],
        "delivery_booking": nextno
      },
      { headers })
      .subscribe(
        (val) => {
          this.doGetCalendar()
        }, err => {
          this.doUpdateDeliveryOrderHeader(dod, nextno)
        });
  }
  doGetCalendar() {
    this.api.get("table/calendar", { params: { limit: 10, filter: "fulldate=" + "'" + this.dateselect['fulldate'] + "'" } })
      .subscribe(val => {
        let data = val['data']
        let slotavailable = data[0].slot_available
        this.doUpdateCalendar(slotavailable)
      }, err => {
        this.doGetCalendar()
      });
  }
  doUpdateCalendar(slotavailable) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/calendar",
      {
        "fulldate": this.dateselect['fulldate'],
        "slot_available": parseInt(slotavailable) - 1
      },
      { headers })
      .subscribe(
        (val) => {
          this.doGetCalendarAfterUpdate()
        }, err => {
          this.doUpdateCalendar(slotavailable)
        });
  }
  doGetCalendarAfterUpdate() {
    this.api.get("table/calendar", { params: { limit: 31, filter: "fulldate >=" + "'" + moment().format('YYYY-MM-DD') + "'", sort: 'week ASC, year ASC, month ASC, date ASC' } })
      .subscribe(val => {
        this.calendar = val['data']
        this.dateselect = [];
        this.slotselect = [];
        this.loaderproses.dismiss()
        this.doCloseInvoice()
        this.doHideSlot()
      }, err => {
        this.doGetCalendarAfterUpdate()
      });
  }

}
