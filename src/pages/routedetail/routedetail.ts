import { Component } from '@angular/core';
import { LoadingController, ViewController, Platform, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpHeaders } from "@angular/common/http";
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { UUID } from 'angular2-uuid';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-routedetail',
  templateUrl: 'routedetail.html',
})
export class RoutedetailPage {

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
  public route = [];
  public slotdata = [];
  public doshow: boolean = false;
  public installationshow: boolean = false;
  public showroute: boolean = false;
  public slotdo = 'Pilih Slot Delivery';
  public slotinstallation = 'Pilih Slot Installation';
  public doslot = [];
  public installationslot = [];
  public datain = [];
  public routeline = [];
  public showdetail: boolean = false;
  public namecust = ''
  public address = ''
  public address1 = ''
  public kota = ''
  public telp = ''
  public postcode = ''
  public addressfull = ''
  public itemsall = [];
  public showroom = '';
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
    this.route = this.navParams.get('route')
    this.doshow = false;
    this.installationshow = false;
    this.showroute = false;
    this.showdetail = false;
    this.slotdo = 'Pilih Slot Delivery';
    this.slotinstallation = 'Pilih Slot Installation';
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
  ionViewDidEnter() {
    this.doGetLine()
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
  doGetRouteLine() {
    if (this.slotdo == 'Pilih Slot Delivery' && this.slotinstallation == 'Pilih Slot Installation') {
      let alert = this.alertCtrl.create({
        title: 'Perhatian',
        subTitle: 'Silahkan Pilih Slot Delivery atau Slot Installation terlebih dahulu',
        buttons: ['OK']
      });
      alert.present();
    }
    else {
      this.loader = this.loadingCtrl.create({
        // cssClass: 'transparent',
        content: 'Loading Content...'
      });
      this.loader.present();
      var self = this;
      this.api.get('table/route_line', { params: { filter: "date_route=" + "'" + this.route['date_delivery'] + "'", sort: 'no_urut_group DESC' } })
        .subscribe(val => {
          this.slotdata = val['data']
          if (this.slotdata.length == 0) {
            let nourut = 1
            let slotinstallation = ''
            let address = 'JL. DAAN MOGOT KM. 14 BARAT RT.9/RW.3'
            let address2 = 'CENGKARENG TIMUR, CENGKARENG'
            let postcode = '11730'
            let city = 'KOTA JAKARTA BARAT, DAERAH KHUSUS IBUKOTA JAKARTA, INDONESIA'
            let lat = -6.172764
            let lng = 106.753104
            let fulladdress = address + " " + address2 + " " + city

            if (self.route['type'] == 'Delivery & Installation' || self.route['type'] == 'Delivery') {
              let directionsService = new google.maps.DirectionsService;
              let directionsDisplay = new google.maps.DirectionsRenderer;
              directionsService.route({
                origin: { lat: -6.172764, lng: 106.753104 },
                destination: { lat: parseFloat(self.doslot[0].to_lat), lng: parseFloat(self.doslot[0].to_lng) },
                travelMode: 'DRIVING'
              }, (response, status) => {
                if (status === 'OK') {
                  let jaraktempuh = response.routes[0].legs[0].distance.text
                  let waktuperjalanan = response.routes[0].legs[0].duration.text
                  let slotdelivery = self.doslot[0].request_no
                  if (self.datain.length != 0) {
                    let uuid = self.datain[0].uuid
                    let receiptno = self.datain[0].receipt_no
                    slotinstallation = self.datain[0].request_no
                    let groupdelivery = self.route['group_route_no']
                    let groupinstallation = self.route['group_route_no']
                    self.doGetDeliveryOrderHeader(receiptno, groupdelivery, groupinstallation)
                    self.doUpdateSlotDelivery(nourut, address, address2, city, postcode, lat, lng, jaraktempuh, waktuperjalanan)
                    self.doUpdateSlotInstallation(uuid, nourut, address, address2, city, postcode, lat, lng, jaraktempuh, waktuperjalanan)
                  }
                  else {
                    slotinstallation = ''
                    let receiptno = self.doslot[0].receipt_no
                    let groupdelivery = ''
                    let groupinstallation = self.route['group_route_no']
                    self.doGetDeliveryOrderHeader(receiptno, groupdelivery, groupinstallation)
                    self.doUpdateSlotDelivery(nourut, address, address2, city, postcode, lat, lng, jaraktempuh, waktuperjalanan)
                  }
                  self.doPostRouteLineDriver(nourut, slotdelivery, slotinstallation)
                }
              });
            }
            else if (self.route['Installation']) {
              let directionsService = new google.maps.DirectionsService;
              let directionsDisplay = new google.maps.DirectionsRenderer;
              directionsService.route({
                origin: { lat: -6.172764, lng: 106.753104 },
                destination: { lat: parseFloat(self.installationslot[0].to_lat), lng: parseFloat(self.installationslot[0].to_lng) },
                travelMode: 'DRIVING'
              }, (response, status) => {
                if (status === 'OK') {
                  let jaraktempuh = response.routes[0].legs[0].distance.text
                  let waktuperjalanan = response.routes[0].legs[0].duration.text
                  let slotdelivery = ''
                  let slotinstallation = self.installationslot[0].request_no
                  let uuid = self.installationslot[0].uuid
                  let receiptno = self.installationslot[0].receipt_no
                  let groupdelivery = ''
                  let groupinstallation = self.route['group_route_no']
                  self.doGetDeliveryOrderHeader(receiptno, groupdelivery, groupinstallation)
                  self.doUpdateSlotInstallation(uuid, nourut, address, address2, city, postcode, lat, lng, jaraktempuh, waktuperjalanan)
                  self.doPostRouteLineDriver(nourut, slotdelivery, slotinstallation)
                }
              })
            }
          }
          else {
            if (this.slotdata[0].slot_delivery != '') {
              this.api.get('table/slot_delivery', { params: { filter: "request_no=" + "'" + this.slotdata[0].slot_delivery + "'" } })
                .subscribe(val => {
                  let data = val['data']
                  let nourut = this.slotdata[0].no_urut_group + 1
                  let slotinstallation = ''
                  let address = data[0].to_address
                  let address2 = data[0].to_address_1
                  let postcode = data[0].to_code_post
                  let city = data[0].to_city
                  let lat = parseFloat(data[0].to_lat)
                  let lng = parseFloat(data[0].to_lng)
                  let latdes = parseFloat(this.doslot[0].to_lat)
                  let lngdes = parseFloat(this.doslot[0].to_lng)
                  let slotdelivery = this.doslot[0].request_no
                  let fulladdress = address + " " + address2 + " " + city
                  if (this.route['type'] == 'Delivery & Installation' || this.route['type'] == 'Delivery') {
                    let directionsService = new google.maps.DirectionsService;
                    let directionsDisplay = new google.maps.DirectionsRenderer;
                    directionsService.route({
                      origin: { lat: lat, lng: lng },
                      destination: { lat: latdes, lng: lngdes },
                      travelMode: 'DRIVING'
                    }, (response, status) => {
                      if (status === 'OK') {
                        let jaraktempuh = response.routes[0].legs[0].distance.text
                        let waktuperjalanan = response.routes[0].legs[0].duration.text
                        if (self.datain.length != 0) {
                          let uuid = self.datain[0].uuid
                          slotinstallation = self.datain[0].request_no
                          let receiptno = self.datain[0].receipt_no
                          let groupdelivery = self.route['group_route_no']
                          let groupinstallation = self.route['group_route_no']
                          self.doGetDeliveryOrderHeader(receiptno, groupdelivery, groupinstallation)
                          self.doUpdateSlotDelivery(nourut, address, address2, city, postcode, lat, lng, jaraktempuh, waktuperjalanan)
                          self.doUpdateSlotInstallation(uuid, nourut, address, address2, city, postcode, lat, lng, jaraktempuh, waktuperjalanan)
                        }
                        else {
                          slotinstallation = ''
                          let receiptno = self.doslot[0].receipt_no
                          let groupdelivery = ''
                          let groupinstallation = self.route['group_route_no']
                          self.doGetDeliveryOrderHeader(receiptno, groupdelivery, groupinstallation)
                          self.doUpdateSlotDelivery(nourut, address, address2, city, postcode, lat, lng, jaraktempuh, waktuperjalanan)
                        }
                        self.doPostRouteLineDriver(nourut, slotdelivery, slotinstallation)
                      }
                    })
                  }
                  else if (this.route['Installation']) {

                    let directionsService = new google.maps.DirectionsService;
                    let directionsDisplay = new google.maps.DirectionsRenderer;
                    directionsService.route({
                      origin: { lat: lat, lng: lng },
                      destination: { lat: parseFloat(self.installationslot[0].to_lat), lng: parseFloat(self.installationslot[0].to_lng) },
                      travelMode: 'DRIVING'
                    }, (response, status) => {
                      if (status === 'OK') {
                        let jaraktempuh = response.routes[0].legs[0].distance.text
                        let waktuperjalanan = response.routes[0].legs[0].duration.text
                        let slotdelivery = ''
                        let slotinstallation = self.installationslot[0].request_no
                        let uuid = self.installationslot[0].uuid
                        let receiptno = self.installationslot[0].receipt_no
                        let groupdelivery = ''
                        let groupinstallation = self.route['group_route_no']
                        self.doGetDeliveryOrderHeader(receiptno, groupdelivery, groupinstallation)
                        self.doUpdateSlotInstallation(uuid, nourut, address, address2, city, postcode, lat, lng, jaraktempuh, waktuperjalanan)
                        self.doPostRouteLineDriver(nourut, slotdelivery, slotinstallation)
                      }
                    })
                  }
                });
            }
            else if (this.slotdata[0].slot_installation != '') {
              this.api.get('table/slot_installation', { params: { filter: "request_no=" + "'" + this.slotdata[0].slot_installation + "'" } })
                .subscribe(val => {
                  let data = val['data']
                  let nourut = this.slotdata[0].no_urut_group + 1
                  let slotinstallation = ''
                  let address = data[0].to_address
                  let address2 = data[0].to_address_1
                  let postcode = data[0].to_code_post
                  let city = data[0].to_city
                  let lat = parseFloat(data[0].to_lat)
                  let lng = parseFloat(data[0].to_lng)
                  let fulladdress = address + " " + address2 + " " + city
                  if (this.route['type'] == 'Delivery & Installation' || this.route['type'] == 'Delivery') {
                    let directionsService = new google.maps.DirectionsService;
                    let directionsDisplay = new google.maps.DirectionsRenderer;

                    directionsService.route({
                      origin: { lat: lat, lng: lng },
                      destination: { lat: parseFloat(self.doslot[0].to_lat), lng: parseFloat(self.doslot[0].to_lng) },
                      travelMode: 'DRIVING'
                    }, (response, status) => {
                      if (status === 'OK') {
                        let jaraktempuh = response.routes[0].legs[0].distance.text
                        let waktuperjalanan = response.routes[0].legs[0].duration.text
                        let slotdelivery = self.doslot[0].request_no
                        if (self.datain.length != 0) {
                          let uuid = self.datain[0].uuid
                          slotinstallation = self.datain[0].request_no
                          let receiptno = self.datain[0].receipt_no
                          let groupdelivery = self.route['group_route_no']
                          let groupinstallation = self.route['group_route_no']
                          self.doGetDeliveryOrderHeader(receiptno, groupdelivery, groupinstallation)
                          self.doUpdateSlotDelivery(nourut, address, address2, city, postcode, lat, lng, jaraktempuh, waktuperjalanan)
                          self.doUpdateSlotInstallation(uuid, nourut, address, address2, city, postcode, lat, lng, jaraktempuh, waktuperjalanan)
                        }
                        else {
                          slotinstallation = ''
                          let receiptno = self.doslot[0].receipt_no
                          let groupdelivery = ''
                          let groupinstallation = self.route['group_route_no']
                          self.doGetDeliveryOrderHeader(receiptno, groupdelivery, groupinstallation)
                          self.doUpdateSlotDelivery(nourut, address, address2, city, postcode, lat, lng, jaraktempuh, waktuperjalanan)
                        }
                        self.doPostRouteLineDriver(nourut, slotdelivery, slotinstallation)
                      }
                    })
                  }
                  else if (this.route['Installation']) {
                    let directionsService = new google.maps.DirectionsService;
                    let directionsDisplay = new google.maps.DirectionsRenderer;

                    navigator.geolocation.getCurrentPosition(function (position) {
                      directionsService.route({
                        origin: { lat: lat, lng: lng },
                        destination: { lat: parseFloat(self.installationslot[0].to_lat), lng: parseFloat(self.installationslot[0].to_lng) },
                        travelMode: 'DRIVING'
                      }, (response, status) => {
                        if (status === 'OK') {
                          let jaraktempuh = response.routes[0].legs[0].distance.text
                          let waktuperjalanan = response.routes[0].legs[0].duration.text
                          let slotdelivery = ''
                          let slotinstallation = self.installationslot[0].request_no
                          let uuid = self.installationslot[0].uuid
                          let receiptno = self.installationslot[0].receipt_no
                          let groupdelivery = ''
                          let groupinstallation = self.route['group_route_no']
                          self.doGetDeliveryOrderHeader(receiptno, groupdelivery, groupinstallation)
                          self.doUpdateSlotInstallation(uuid, nourut, address, address2, city, postcode, lat, lng, jaraktempuh, waktuperjalanan)
                          self.doPostRouteLineDriver(nourut, slotdelivery, slotinstallation)
                        }
                      })
                    });
                  }
                });
            }
          }
        }, err => {
          this.doGetRouteLine()
        });
    }
  }
  doPostRouteLineDriver(nourut, slotdelivery, slotinstallation) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("table/route_line",
      {
        "group_route_no": this.route['group_route_no'],
        "no_urut_group": nourut,
        "slot_delivery": slotdelivery,
        "slot_installation": slotinstallation,
        "plat_no": this.route['plat_no'],
        "id_driver": this.route['id_driver'],
        "nama_driver": this.route['nama_driver'],
        "id_installer": this.route['id_installer'],
        "nama_installer": this.route['nama_installer'],
        "id_installer_2": this.route['id_installer_2'],
        "nama_installer_2": this.route['nama_installer_2'],
        "date_route": this.route['date_delivery'],
        "pic_create": this.userid,
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "status": 'OPEN',
        "uuid": UUID.UUID()
      },
      { headers })
      .subscribe(
        (val) => {
          this.doGetRouteHeader()
        }, err => {
          this.doPostRouteLineDriver(nourut, slotdelivery, slotinstallation)
        });
  }
  doGetRouteHeader() {
    this.api.get('table/route_header', { params: { filter: "date_delivery=" + "'" + this.route['date_delivery'] + "' AND plat_no=" + "'" + this.route['plat_no'] + "'" } })
      .subscribe(val => {
        let data = val['data']
        this.doUpdateRouteHeader(data)
      }, err => {
        this.doGetRouteHeader()
      });
  }
  doUpdateRouteHeader(data) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/route_header",
      {
        "uuid": data[0].uuid,
        "total_route": data[0].total_route + 1
      },
      { headers })
      .subscribe(
        (val) => {
          this.doHideCreateRoute()
          this.slotdo = 'Pilih Slot Delivery';
          this.slotinstallation = 'Pilih Slot Installation';
          this.loader.dismiss()
          this.navCtrl.pop()
        }, err => {
          this.doUpdateRouteHeader(data)
        });
  }
  doGetDeliveryOrderHeader(receiptno, groupdelivery, groupinstallation) {
    this.api.get('table/delivery_order_header', { params: { filter: "receipt_no=" + "'" + receiptno + "'" } })
      .subscribe(val => {
        let data = val['data']
        this.doUpdateDeliveryOrderHeader(data, groupdelivery, groupinstallation)
      }, err => {
        this.doGetDeliveryOrderHeader(receiptno, groupdelivery, groupinstallation)
      });
  }
  doUpdateDeliveryOrderHeader(data, groupdelivery, groupinstallation) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/delivery_order_header",
      {
        "uuid": data[0].uuid,
        "group_delivery_no": groupdelivery,
        "group_installation_no": groupinstallation
      },
      { headers })
      .subscribe(
        (val) => {
        }, err => {
          this.doUpdateDeliveryOrderHeader(data, groupdelivery, groupinstallation)
        });
  }
  doUpdateSlotDelivery(nourut, address, address2, city, postcode, lat, lng, jaraktempuh, waktuperjalanan) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/slot_delivery",
      {
        "uuid": this.doslot[0].uuid,
        "group_delivery_no": this.route['group_route_no'],
        "no_urut_group": nourut,
        "plat_no": this.route['plat_no'],
        "from_address": address,
        "from_address_1": address2,
        "from_code_post": postcode,
        "from_city": city,
        "from_lat": lat,
        "from_lng": lng,
        "diff_time": jaraktempuh,
        "diff_distance": waktuperjalanan,
        "pic_group_delivery": this.userid
      },
      { headers })
      .subscribe(
        (val) => {
        }, err => {
          this.doUpdateSlotDelivery(nourut, address, address2, city, postcode, lat, lng, jaraktempuh, waktuperjalanan)
        });
  }
  doUpdateSlotInstallation(uuid, nourut, address, address2, city, postcode, lat, lng, jaraktempuh, waktuperjalanan) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/slot_installation",
      {
        "uuid": uuid,
        "group_delivery_no": this.route['group_route_no'],
        "no_urut_group": nourut,
        "plat_no": this.route['plat_no'],
        "from_address": address,
        "from_address_1": address2,
        "from_code_post": postcode,
        "from_city": city,
        "from_lat": lat,
        "from_lng": lng,
        "diff_time": jaraktempuh,
        "diff_distance": waktuperjalanan,
        "pic_group_delivery": this.userid
      },
      { headers })
      .subscribe(
        (val) => {
        }, err => {
          this.doUpdateSlotInstallation(uuid, nourut, address, address2, city, postcode, lat, lng, jaraktempuh, waktuperjalanan)
        });
  }
  doShowCreateRoute() {
    this.showroute = true;
  }
  doHideCreateRoute() {
    this.showroute = false;
  }
  doShowDO() {
    this.doGetSlotDO()
    this.showroute = false;
    this.doshow = true;
  }
  doHideDO() {
    this.showroute = true;
    this.doshow = false;
  }
  doShowIN() {
    this.doGetSlotIN()
    this.showroute = false;
    this.installationshow = true;
  }
  doHideIN() {
    this.showroute = true;
    this.installationshow = false;
  }
  doSelectDO(dod) {
    this.doGetSlotINfromDO(dod)
    this.doshow = false;
    this.showroute = true
    this.slotdo = dod.request_no
  }
  doGetSlotINfromDO(dod) {
    this.api.get('table/slot_installation', { params: { limit: 1000, filter: "date_installation=" + "'" + dod.date_delivery + "' AND receipt_no=" + "'" + dod.receipt_no + "'" } })
      .subscribe(val => {
        this.datain = val['data']
        if (this.datain.length != 0) {
          this.slotinstallation = this.datain[0].request_no
        }
      }, err => {
        this.doGetSlotINfromDO(dod)
      });
  }
  doGetSlotDO() {
    this.api.get('table/slot_delivery', { params: { limit: 1000, filter: "date_delivery=" + "'" + this.route['date_delivery'] + "' AND status='OPEN' AND receipt_no != '' AND group_delivery_no = ''", sort: 'to_code_post ASC' } })
      .subscribe(val => {
        this.doslot = val['data']
        console.log(this.doslot)
      }, err => {
        this.doGetSlotDO()
      });
  }
  doGetSlotIN() {
    this.api.get('table/slot_installation', { params: { limit: 1000, filter: "date_installation=" + "'" + this.route['date_delivery'] + "' AND status='OPEN' AND receipt_no != '' AND group_delivery_no = ''", sort: 'to_code_post ASC' } })
      .subscribe(val => {
        this.installationslot = val['data']
      }, err => {
        this.doGetSlotIN()
      });
  }
  doGetLine() {
    this.api.get('table/route_line', { params: { filter: "date_route=" + "'" + this.route['date_delivery'] + "' AND group_route_no=" + "'" + this.route['group_route_no'] + "'", sort: 'no_urut_group ASC' } })
      .subscribe(val => {
        this.routeline = val['data']
      });
  }
  doViewDetail(dod) {
    this.showroom = dod.location_request
    this.receiptno = dod.receipt_no
    this.namecust = dod.to_name
    this.address = dod.to_address
    this.address1 = dod.to_address_1
    this.kota = dod.to_to_city
    this.telp = dod.to_telp
    this.postcode = dod.to_code_post
    this.doGetItemsFromSlot(dod)
    this.showdetail = true;
  }
  doCloseDetail() {
    this.showdetail = false;
  }
  doGetItemsFromSlot(dod) {
    this.api.get("table/delivery_order_line", { params: { limit: 100, filter: "receipt_no='" + dod.receipt_no + "'", sort: "part_no" + " ASC " } })
      .subscribe(val => {
        this.itemsall = val['data']
      });
  }
  doViewDetailSlotRoute(route) {
    if (route.slot_delivery != '') {
      this.api.get('table/slot_delivery', { params: { filter: "request_no=" + "'" + route.slot_delivery + "'" } })
        .subscribe(val => {
          let data = val['data']
          this.showroom = data[0].location_request
          this.receiptno = data[0].receipt_no
          this.namecust = data[0].to_name
          this.address = data[0].to_address
          this.address1 = data[0].to_address_1
          this.kota = data[0].to_to_city
          this.telp = data[0].to_telp
          this.postcode = data[0].to_code_post
          let dod = data[0]
          this.doGetItemsFromSlot(dod)
          this.showdetail = true;
        });
    }
    else {
      this.api.get('table/slot_installation', { params: { filter: "request_no=" + "'" + route.slot_installation + "'" } })
        .subscribe(val => {
          let data = val['data']
          this.showroom = data[0].location_request
          this.receiptno = data[0].receipt_no
          this.namecust = data[0].to_name
          this.address = data[0].to_address
          this.address1 = data[0].to_address_1
          this.kota = data[0].to_to_city
          this.telp = data[0].to_telp
          this.postcode = data[0].to_code_post
          let dod = data[0]
          this.doGetItemsFromSlot(dod)
          this.showdetail = true;
        });
    }
  }
}
