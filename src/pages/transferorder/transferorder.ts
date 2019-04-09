import { Component } from '@angular/core';
import { Events, LoadingController, ActionSheetController, Platform, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { UUID } from 'angular2-uuid';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from "@angular/common/http";


@IonicPage()
@Component({
  selector: 'page-transferorder',
  templateUrl: 'transferorder.html',
})
export class TransferorderPage {
  myFormModalPic: FormGroup;
  halamanto = 0;
  searchto: any;
  private transferorder = [];
  totaldatato: any;
  filter = '';
  sortTO = '';
  halamantolist = 0;
  searchtolist: any;
  private transferorderlist = [];
  halamantoreceiving = 0;
  searchtoreceiving: any;
  private transferorderreceiving = [];
  totaldatatolist: any;
  totaldatatoreceiving: any;
  sortTOList = '';
  sortTOReceiving = '';
  to: string;
  private width: number;
  private height: number;
  public name: any;
  public users = [];
  public userpic: any;
  public receiptno: any;
  public pickingrelease = [];
  public uuid: any;
  public listpicking = [];
  public totaldatalistpicking: any;
  public usertoken = [];
  public searchpicking = [];
  public rolecab: any;
  public userid: any;
  public datastok = [];
  public qtytemp = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public platform: Platform,
    public modalCtrl: ModalController,
    public storage: Storage,
    private http: HttpClient,
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController) {
    this.myFormModalPic = formBuilder.group({
      pic: ['', Validators.compose([Validators.required])],
    })
    this.rolecab = this.navParams.get('rolecab')
    this.userid = this.navParams.get('userid')
    platform.ready().then(() => {
      this.width = platform.width();
      this.height = platform.height();
      this.to = 'transferorder'
      this.storage.get('name').then((val) => {
        this.name = val;
      });
      this.api.get('table/transfer_order', { params: { limit: 30, filter: "status='OPEN' AND to_location=" + "'" + this.rolecab + "'" } }).subscribe(val => {
        this.transferorder = val['data']
      });
      this.api.get('table/transfer_order', { params: { limit: 30, filter: "status='INPG' AND from_location=" + "'" + this.rolecab + "'" } }).subscribe(val => {
        this.transferorderlist = val['data']
      });
      this.api.get('table/transfer_order', { params: { limit: 30, filter: "status='CLS1' AND to_location=" + "'" + this.rolecab + "'" } }).subscribe(val => {
        this.transferorderreceiving = val['data']
      });
    })
    this.getUsers()
  }
  doProfile() {
    this.navCtrl.push('UseraccountPage');
  }
  ionViewDidEnter() {
    this.halamanto = 0;
    this.halamantolist = 0;
    this.halamantoreceiving = 0;
    this.transferorder = [];
    this.transferorderlist = [];
    this.transferorderreceiving = [];
    this.getTO()
    this.getTOList()
    this.getTOReceiving()
  }
  getTO() {
    return new Promise(resolve => {
      let offsetprepare = 30 * this.halamanto
      if (this.halamanto == -1) {
        resolve();
      }
      else {
        this.halamanto++;
        this.api.get('table/transfer_order', {
          params: {
            limit: 30, offset: offsetprepare, filter: "status='OPEN' AND to_location=" + "'" + this.rolecab + "'"
          }
        })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.transferorder.push(data[i]);
              this.totaldatato = val['count'];
              this.searchto = this.transferorder;
            }
            if (data.length == 0) {
              this.halamanto = -1
            }
            resolve();
          });
      }
    })

  }
  getSearchTO(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.transferorder = this.searchto.filter(to => {
        return to.to_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.transferorder = this.searchto;
    }
  }
  doInfiniteTO(infiniteScroll) {
    this.getTO().then(response => {
      infiniteScroll.complete();

    })
  }
  doRefreshTO(refresher) {
    this.halamanto = 0;
    this.transferorder = [];
    this.getTO().then(response => {
      refresher.complete();
    })
  }
  doSortTO(filter) {
    if (this.sortTO == 'ASC') {
      this.sortTO = 'DESC'
    }
    else {
      this.sortTO = 'ASC'
    }
    this.api.get("table/transfer_order", { params: { filter: "status='OPEN' AND to_location=" + "'" + this.rolecab + "'", sort: filter + " " + this.sortTO + " " } }).subscribe(val => {
      this.transferorder = val['data'];
      this.totaldatato = val['count'];
      this.filter = filter
    });
  }
  doAddTO() {
    this.navCtrl.push('TransferorderaddPage', {
      rolecab: this.rolecab,
      userid: this.userid
    })
  }
  viewDetailTO(to) {
    this.navCtrl.push('TransferorderdetailPage', {
      tono: to.to_no,
      from: to.from_location,
      to: to.to_location,
      transferdate: to.transfer_date,
      status: to.status,
      rolecab: this.rolecab,
      userid: this.userid
    });
  }
  doPostingTO(to) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Posting',
      message: 'Do you want to posting  ' + to.to_no + ' ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'Posting',
          handler: () => {
            const headers = new HttpHeaders()
              .set("Content-Type", "application/json");
            this.api.put("table/transfer_order",
              {
                "to_no": to.to_no,
                "status": 'INPG'
              },
              { headers })
              .subscribe(
                (val) => {
                  let alert = this.alertCtrl.create({
                    title: 'Sukses',
                    subTitle: 'Posting Sukses',
                    buttons: ['OK']
                  });
                  alert.present();
                  this.ionViewDidEnter()
                },
                response => {

                },
                () => {

                });
          }
        }
      ]
    });
    alert.present();
  }
  getTOList() {
    return new Promise(resolve => {
      let offsetprepare = 30 * this.halamantolist
      if (this.halamantolist == -1) {
        resolve();
      }
      else {
        this.halamantolist++;
        this.api.get('table/transfer_order', {
          params: {
            limit: 30, offset: offsetprepare, filter: "status='INPG' AND (from_location=" + "'" + this.rolecab + "' OR to_location=" + "'" + this.rolecab + "')"
          }
        })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.transferorderlist.push(data[i]);
              this.totaldatatolist = val['count'];
              this.searchtolist = this.transferorderlist;
            }
            if (data.length == 0) {
              this.halamantolist = -1
            }
            resolve();
          });
      }
    })

  }
  getSearchTOList(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.transferorderlist = this.searchto.filter(tolist => {
        return tolist.to_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.transferorderlist = this.searchtolist;
    }
  }
  doInfiniteTOList(infiniteScroll) {
    this.getTOList().then(response => {
      infiniteScroll.complete();

    })
  }
  doRefreshTOList(refresher) {
    this.halamantolist = 0;
    this.transferorderlist = [];
    this.getTOList().then(response => {
      refresher.complete();
    })
  }
  doSortTOList(filter) {
    if (this.sortTOList == 'ASC') {
      this.sortTOList = 'DESC'
    }
    else {
      this.sortTOList = 'ASC'
    }
    this.api.get("table/transfer_order", { params: { filter: "status='INPG' AND from_location=" + "'" + this.rolecab + "'", sort: filter + " " + this.sortTOList + " " } }).subscribe(val => {
      this.transferorderlist = val['data'];
      this.totaldatatolist = val['count'];
      this.filter = filter
    });
  }
  viewDetailTOList(tolist) {
    this.navCtrl.push('TransferorderdetailPage', {
      tono: tolist.to_no,
      locationcode: tolist.location_code,
      transferdate: tolist.transfer_date,
      status: tolist.status,
      rolecab: this.rolecab,
      userid: this.userid
    });
  }
  doPostingTOList(tolist) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Posting',
      message: 'Do you want to posting  ' + tolist.to_no + ' ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'Posting',
          handler: () => {
            this.doPostTOCLS1(tolist)
          }
        }
      ]
    });
    alert.present();
  }
  doPostTOCLS1(tolist) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/transfer_order",
      {
        "to_no": tolist.to_no,
        "status": 'CLS1'
      },
      { headers })
      .subscribe(
        (val) => {
          this.doPostDeliveryOrderHeader(tolist)
        }, err => {
          this.doPostTOCLS1(tolist)
        });
  }
  doPostDeliveryOrderHeader(tolist) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("table/delivery_order_header",
      {
        "receipt_no": tolist.to_no,
        "receipt_date": '',
        "type_doc": 'TO',
        "store_no": tolist.from_location,
        "delivery_date": '',
        "installation_date": '',
        "delivery_booking": '',
        "installation_booking": '',
        "group_delivery_no": '',
        "group_installation_no": '',
        "sjl_no": '',
        "customer_code": '',
        "return": 0,
        "print_count": 0,
        "so_no": '',
        "status": 'OPEN',
        "date": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": UUID.UUID()
      },
      { headers })
      .subscribe(
        (val) => {
          this.doGetTODetail(tolist)
        }, err => {
          this.doPostDeliveryOrderHeader(tolist)
        });
  }
  doGetTODetail(tolist) {
    this.api.get("table/transfer_order_detail", { params: { filter: "to_no=" + "'" + tolist.to_no + "'", sort: 'item_no ASC, line_no ASC' } })
      .subscribe(val => {
        let data = val['data']
        for (let i = 0; i < data.length; i++) {
          this.doGetPart(data, i)
        }
      }, err => {
        this.doGetTODetail(tolist)
      });
  }
  doGetPart(data, i) {
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Production BOM Line", filter: "[Production BOM No_]=" + "'B-" + data[i].item_no + "'" } })
      .subscribe(val => {
        let datapart = val['data']
        if (datapart.length == 0) {
          this.doPostDeliveryOrderLinePartNull(data, i)
        }
        else {
          for (let j = 0; j < datapart.length; j++) {
            this.doPostDeliveryOrderLinePart(data, i, datapart, j)
          }
        }
      }, err => {
        this.doGetPart(data, i)
      });
  }
  doPostDeliveryOrderLinePartNull(data, i) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("table/delivery_order_line",
      {
        "line_no": data[i].line_no,
        "receipt_no": data[i].to_no,
        "item_no": data[i].item_no,
        "item_description": data[i].description,
        "item_qty": data[i].qty,
        "part_line_no": data[i].line_no,
        "part_no": data[i].item_no,
        "part_description": data[i].description,
        "part_qty": data[i].qty,
        "check_loading": 0,
        "sent_by": data[i].location_current_code,
        "sjl_from": data[i].location_previous_code,
        "UOM": data[i].unit,
        "so_no": '',
        "return_so_no": '',
        "status": 'OPEN',
        "date": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": UUID.UUID()
      },
      { headers })
      .subscribe(
        (val) => {
          let alert = this.alertCtrl.create({
            title: 'Sukses',
            subTitle: 'Posting Sukses',
            buttons: ['OK']
          });
          alert.present();
          this.doGoToSlotDelivery()
        }, err => {
          this.doPostDeliveryOrderLinePartNull(data, i)
        });
  }
  doPostDeliveryOrderLinePart(data, i, datapart, j) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("table/delivery_order_line",
      {
        "line_no": data[i].line_no,
        "receipt_no": data[i].to_no,
        "item_no": data[i].item_no,
        "item_description": data[i].description,
        "item_qty": data[i].qty,
        "part_line_no": datapart[j]["Line No_"],
        "part_no": datapart[j].No_,
        "part_description": datapart[j].Description,
        "part_qty": datapart[j].Quantity,
        "check_loading": 0,
        "sent_by": data[i].location_current_code,
        "sjl_from": data[i].location_previous_code,
        "UOM": datapart[j]["Unit of Measure Code"],
        "so_no": '',
        "return_so_no": '',
        "status": 'OPEN',
        "date": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": UUID.UUID()
      },
      { headers })
      .subscribe(
        (val) => {
          let alert = this.alertCtrl.create({
            title: 'Sukses',
            subTitle: 'Posting Sukses',
            buttons: ['OK']
          });
          alert.present();
          this.doGoToSlotDelivery()
        }, err => {
          this.doPostDeliveryOrderLinePart(data, i, datapart, j)
        });
  }
  getTOReceiving() {
    return new Promise(resolve => {
      let offsetprepare = 30 * this.halamantoreceiving
      if (this.halamantoreceiving == -1) {
        resolve();
      }
      else {
        this.halamantoreceiving++;
        this.api.get('table/transfer_order', {
          params: {
            limit: 30, offset: offsetprepare, filter: "status='CLS1' AND to_location=" + "'" + this.rolecab + "'"
          }
        })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.transferorderreceiving.push(data[i]);
              this.totaldatatoreceiving = val['count'];
              this.searchtoreceiving = this.transferorderreceiving;
            }
            if (data.length == 0) {
              this.halamantoreceiving = -1
            }
            resolve();
          });
      }
    })

  }
  getSearchTOReceiving(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.transferorderreceiving = this.searchto.filter(toreceiving => {
        return toreceiving.to_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.transferorderreceiving = this.searchtoreceiving;
    }
  }
  doInfiniteTOReceiving(infiniteScroll) {
    this.getTOReceiving().then(response => {
      infiniteScroll.complete();

    })
  }
  doRefreshTOReceiving(refresher) {
    this.halamantoreceiving = 0;
    this.transferorderreceiving = [];
    this.getTOReceiving().then(response => {
      refresher.complete();
    })
  }
  doSortTOReceiving(filter) {
    if (this.sortTOReceiving == 'ASC') {
      this.sortTOReceiving = 'DESC'
    }
    else {
      this.sortTOReceiving = 'ASC'
    }
    this.api.get("table/transfer_order", { params: { filter: "status='CLS1' AND to_location=" + "'" + this.rolecab + "'", sort: filter + " " + this.sortTOReceiving + " " } }).subscribe(val => {
      this.transferorderreceiving = val['data'];
      this.totaldatatoreceiving = val['count'];
      this.filter = filter
    });
  }
  viewDetailTOReceiving(tolist) {
    this.navCtrl.push('TransferorderdetailPage', {
      tono: tolist.to_no,
      locationcode: tolist.location_code,
      transferdate: tolist.transfer_date,
      status: tolist.status,
      rolecab: this.rolecab,
      userid: this.userid
    });
  }
  doPostingTOReceiving(tolist) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Posting',
      message: 'Do you want to posting  ' + tolist.to_no + ' ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'Posting',
          handler: () => {
            const headers = new HttpHeaders()
              .set("Content-Type", "application/json");
            this.api.put("table/transfer_order",
              {
                "to_no": tolist.to_no,
                "status": 'CLSD'
              },
              { headers })
              .subscribe(
                (val) => {
                  let alert = this.alertCtrl.create({
                    title: 'Sukses',
                    subTitle: 'Posting Sukses',
                    buttons: ['OK']
                  });
                  alert.present();
                  this.ionViewDidEnter()
                },
                response => {

                },
                () => {

                });
          }
        }
      ]
    });
    alert.present();
  }
  getUsers() {
    this.api.get('table/user_role', { params: { filter: "((id_area='INBOUND' AND id_group='STAFF') OR (id_area='SHOWROOM' AND id_group='TL')) AND id_cab=" + "'" + this.rolecab + "'" } }).subscribe(val => {
      this.users = val['data'];
    });
  }
  onChange(user) {
    this.userpic = user.id_user;
  }
  doOffToPIC() {
    document.getElementById("myModalPic").style.display = "none";
    this.myFormModalPic.reset()
  }
  doOpenToPIC(tolist) {
    this.getUsers();
    this.getInfoPIC(tolist)
    this.receiptno = tolist.to_no
  }
  getInfoPIC(tolist) {
    this.api.get("table/picking_list", { params: { filter: "receipt_no=" + "'" + tolist.to_no + "'" } })
      .subscribe(val => {
        this.pickingrelease = val['data'];
        if (this.pickingrelease.length == 0) {
          document.getElementById("myModalPic").style.display = "block";
        }
        else if (this.pickingrelease.length != 0) {
          if (this.pickingrelease[0].status == 'OPEN') {
            this.myFormModalPic.get('pic').setValue(this.pickingrelease[0].pic);
            document.getElementById("myModalPic").style.display = "block";
          }
          else {
            let alert = this.alertCtrl.create({
              title: 'Perhatian',
              subTitle: 'TO Ini sedang dalam proses',
              buttons: ['OK']
            });
            alert.present();
          }
        }
      });
  }
  doSendToPic() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let uuid = UUID.UUID();
    this.uuid = uuid;
    this.api.post("table/picking_list",
      {
        "receipt_no": this.receiptno,
        "pic": this.myFormModalPic.value.pic,
        "status": 'OPEN',
        "uuid": this.uuid
      },
      { headers })
      .subscribe(
        (val) => {
          document.getElementById("myModalPic").style.display = "none";
          this.myFormModalPic.reset()
          let alert = this.alertCtrl.create({
            title: 'Sukses',
            subTitle: 'Save Sukses',
            buttons: ['OK']
          });
          alert.present();
          this.api.get("table/picking_list", { params: { filter: "receipt_no=" + "'" + this.receiptno + "'" } })
            .subscribe(val => {
              this.pickingrelease = val['data'];
            });
        });
  }
  doSendNotificationPic(tolist) {
    this.api.get("table/picking_list", { params: { filter: "receipt_no=" + "'" + tolist.to_no + "'" } })
      .subscribe(val => {
        this.pickingrelease = val['data'];
        if (this.pickingrelease.length == 0) {
          let alert = this.alertCtrl.create({
            title: 'Error',
            subTitle: 'Pic belum diisi',
            buttons: ['OK']
          });
          alert.present();
        }
        else if (this.pickingrelease.length != 0) {
          if (this.pickingrelease[0].pic == '') {
            let alert = this.alertCtrl.create({
              title: 'Error',
              subTitle: 'Pic belum diisi',
              buttons: ['OK']
            });
            alert.present();
          }
          else if (this.pickingrelease[0].status != 'OPEN') {
            let alert = this.alertCtrl.create({
              title: 'Perhatian',
              subTitle: 'TO Ini sedang dalam proses',
              buttons: ['OK']
            });
            alert.present();
          }
          else {
            this.api.get("table/user", { params: { filter: "id_user=" + "'" + this.pickingrelease[0].pic + "'" } })
              .subscribe(val => {
                this.usertoken = val['data'];
                const headers = new HttpHeaders({
                  "Content-Type": "application/json",
                  "Authorization": "key=AAAAtsHtkUc:APA91bF8isugU-XkNTVVYVC-eQQJxn1UI4wBqUcbuXNvh2yUAS3CfDCxDB8himPNr4wJx8f5KPezZpY_jpTr8_WegNEiJ1McJAriwYJZ5iOv0Q1X6CXnDn_xZeGbWX-V6DnPk7XImX5L"
                })
                this.http.post("https://fcm.googleapis.com/fcm/send",
                  {
                    "to": this.usertoken[0].token,
                    "notification": {
                      "body": this.usertoken[0].name + ", You have new job ",
                      "title": "Atria Warehouse",
                      "content_available": true,
                      "priority": 2,
                      "sound": "default",
                      "click_action": "FCM_PLUGIN_ACTIVITY",
                      "color": "#FFFFFF",
                      "icon": "atria"
                    },
                    "data": {
                      "body": this.usertoken[0].name + ", You have new job ",
                      "title": "Atria Warehouse",
                      "param": "PICKING"
                    }
                  },
                  { headers })
                  .subscribe(data => {
                    this.api.get("table/transfer_order_detail", { params: { filter: "to_no=" + "'" + tolist.to_no + "'" } })
                      .subscribe(val => {
                        let data = val['data'];
                        for (let i = 0; i < data.length; i++) {
                          this.doPostPickingListDetail(tolist, data, i)
                        }
                        this.doUpdateTOPicking(tolist)
                      });
                  }, (e) => {
                  });
              });
          }
        }
      });

  }
  doPostPickingListDetail(tolist, data, i) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let uuid = UUID.UUID();
    this.uuid = uuid;
    this.api.post("table/picking_list_detail",
      {
        "id": data[i].to_no + data[i].line_no,
        "receipt_no": data[i].to_no,
        "item_no": data[i].item_no,
        "description": data[i].description,
        "qty": data[i].qty,
        "sent_by": data[i].location_current_code,
        "sjl_from": data[i].location_previous_code,
        "UOM": 'SET',
        "retail_so_no": '',
        "status": 'OPEN',
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": this.uuid
      },
      { headers })
      .subscribe(val => {
        this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Item", filter: "[No_]=" + "'" + data[i].item_no + "'" } }).subscribe(val => {
          let dataitem = val['data']
          this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Production BOM Line", filter: "[Production BOM No_]=" + "'" + dataitem[0]["Production BOM No_"] + "'" } }).subscribe(val => {
            let datapart = val['data']
            if (datapart.length == 0) {
              this.api.get("table/stock", { params: { limit: 100, filter: "item_no=" + "'" + data[i].item_no + "' AND location=" + "'" + this.rolecab + "'", group: 'item_no', groupSummary: "sum (qty) as qtysum" } })
                .subscribe(val => {
                  let totalqty = val['data'][0].qtysum
                  if (data[i].qty <= totalqty) {
                    for (let k = 0; k < data[i].qty; k++) {
                      this.api.get("table/stock", { params: { limit: 100, filter: "item_no=" + "'" + data[i].item_no + "' AND location=" + "'" + this.rolecab + "' AND qty >= " + 1, sort: 'batch_no ASC, sub_location ASC' } })
                        .subscribe(val => {
                          let datapickingresult = val['data']
                          if (datapickingresult.length != 0) {
                            let datai = data[i]
                            let datapicking = datapickingresult[0]
                            this.doPostPickingListDetailPartNull(k, tolist, datai, datapicking)
                          }
                          else {
                            let datai = data[i]
                            let datapicking = { 'batch_no': 'NOT FOUND', 'location': 'NOT FOUND', 'sub_location': 'NOT FOUND' }
                            this.doPostPickingListDetailPartNull(k, tolist, datai, datapicking)
                          }
                        });
                    }
                  }
                  else {
                    let alert = this.alertCtrl.create({
                      title: 'Perhatian',
                      subTitle: 'Stok tidak cukup',
                      buttons: ['OK']
                    });
                    alert.present();
                  }
                });
            }
            else {
              for (let j = 0; j < datapart.length; j++) {
                this.api.get("table/stock", { params: { limit: 100, filter: "item_no=" + "'" + datapart[j].No_ + "' AND location=" + "'" + this.rolecab + "'", group: 'item_no', groupSummary: "sum (qty) as qtysum" } })
                  .subscribe(val => {
                    let totalqty = val['data'][0].qtysum
                    if (data[i].qty <= totalqty) {
                      for (let k = 0; k < data[i].qty; k++) {
                        this.api.get("table/stock", { params: { limit: 100, filter: "item_no=" + "'" + datapart[j].No_ + "' AND location=" + "'" + this.rolecab + "' AND qty >=" + datapart[j].Quantity, sort: 'batch_no ASC, sub_location ASC' } })
                          .subscribe(val => {
                            let datapickingresult = val['data']
                            if (datapickingresult.length != 0) {
                              let datai = data[i]
                              let dataj = datapart[j]
                              let datapicking = datapickingresult[0]
                              this.doPostPickingListDetailPart(tolist, k, datai, dataj, datapicking)
                            }
                            else {
                              let datai = data[i]
                              let dataj = datapart[j]
                              let datapicking = { 'batch_no': 'NOT FOUND', 'location': 'NOT FOUND', 'sub_location': 'NOT FOUND' }
                              this.doPostPickingListDetailPart(tolist, k, datai, dataj, datapicking)
                            }
                          });
                      }
                    }
                    else {
                      let alert = this.alertCtrl.create({
                        title: 'Perhatian',
                        subTitle: 'Stok tidak cukup',
                        buttons: ['OK']
                      });
                      alert.present();
                    }
                  });
              }
            }
          });
        })
      }, err => {
        this.doPostPickingListDetail(tolist, data, i)
      });
  }
  doPostPickingListDetailPartInsert(tolist, datai, dataj, datapicking) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("table/picking_list_detail_part",
      {
        "id": datai.to_no + datai.line_no,
        "batch_no": datapicking.batch_no,
        "receipt_no": datai.to_no,
        "item_no": datai.item_no,
        "bom_no": dataj["Production BOM No_"],
        "part_no": dataj.No_,
        "line_no": dataj["Line No_"],
        "description": dataj.Description,
        "qty": dataj.Quantity,
        "location": datapicking.location,
        "sub_location": datapicking.sub_location,
        "UOM": dataj["Unit of Measure Code"],
        "retail_so_no": '',
        "status": 'OPEN',
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": UUID.UUID()
      },
      { headers })
      .subscribe(val => {
        let qtytotal = dataj.Quantity
        this.doGetStock(tolist, datai, dataj, datapicking, qtytotal)
      }, err => {
        this.doPostPickingListDetailPartInsert(tolist, datai, dataj, datapicking)
      });
  }
  doPostPickingListDetailPartUpdate(tolist, datai, dataj, datapicking, dataupd) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/picking_list_detail_part",
      {
        "id": dataupd[0].id,
        "batch_no": datapicking.batch_no,
        "receipt_no": datai.to_no,
        "item_no": datai.item_no,
        "bom_no": dataj["Production BOM No_"],
        "part_no": dataj.No_,
        "line_no": dataj["Line No_"],
        "description": dataj.Description,
        "qty": parseInt(dataupd[0].qty) + parseInt(dataj.Quantity),
        "location": datapicking.location,
        "sub_location": datapicking.sub_location,
        "UOM": dataj["Unit of Measure Code"],
        "retail_so_no": '',
        "status": 'OPEN',
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": dataupd[0].uuid
      },
      { headers })
      .subscribe(val => {
        let qtytotal = dataj.Quantity
        this.doGetStock(tolist, datai, dataj, datapicking, qtytotal)
      }, err => {
        this.doPostPickingListDetailPartUpdate(tolist, datai, dataj, datapicking, dataupd)
      });
  }
  doPostPickingListDetailPart(tolist, k, datai, dataj, datapicking) {
    this.api.get("table/picking_list_detail_part", { params: { limit: 100, filter: "receipt_no=" + "'" + datai.to_no + "' AND item_no=" + "'" + datai.item_no + "' AND part_no=" + "'" + dataj.No_ + "'" } })
      .subscribe(val => {
        let dataupd = val['data']
        if (dataupd.length != 0) {
          this.doPostPickingListDetailPartUpdate(tolist, datai, dataj, datapicking, dataupd)
        }
        else {
          if (k > 0) {
            this.doPostPickingListDetailPart(tolist, k, datai, dataj, datapicking)
          }
          else {
            this.doPostPickingListDetailPartInsert(tolist, datai, dataj, datapicking)
          }
        }
      }, err => {
        this.doPostPickingListDetailPart(tolist, k, datai, dataj, datapicking)
      });
  }
  doPostPickingListDetailPartNullInsert(tolist, datai, datapicking, dataupd) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("table/picking_list_detail_part",
      {
        "id": datai.to_no + datai.line_no,
        "batch_no": datapicking.batch_no,
        "receipt_no": datai.to_no,
        "item_no": datai.item_no,
        "bom_no": 'NOT FOUND',
        "part_no": datai.item_no,
        "line_no": '10000',
        "description": datai.description,
        "qty": 1,
        "location": datapicking.location,
        "sub_location": datapicking.sub_location,
        "UOM": datai.UOM,
        "retail_so_no": '',
        "status": 'OPEN',
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": UUID.UUID()
      },
      { headers })
      .subscribe(val => {
        let dataj = { 'Quantity': 1 }
        let qtytotal = 1
        this.doGetStock(tolist, datai, dataj, datapicking, qtytotal)
      }, err => {
        this.doPostPickingListDetailPartNullInsert(tolist, datai, datapicking, dataupd)
      });
  }
  doPostPickingListDetailPartNullUpdate(tolist, datai, datapicking, dataupd) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/picking_list_detail_part",
      {
        "id": dataupd[0].id,
        "batch_no": datapicking.batch_no,
        "receipt_no": datai.to_no,
        "item_no": datai.item_no,
        "bom_no": 'NOT FOUND',
        "part_no": datai.item_no,
        "line_no": '10000',
        "description": datai.description,
        "qty": parseInt(dataupd[0].qty) + 1,
        "location": datapicking.location,
        "sub_location": datapicking.sub_location,
        "UOM": datai.UOM,
        "retail_so_no": '',
        "status": 'OPEN',
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": dataupd[0].uuid
      },
      { headers })
      .subscribe(val => {
        let dataj = { 'Quantity': 1 }
        let qtytotal = 1
        this.qtytemp = dataupd[0].qty
        this.doGetStock(tolist, datai, dataj, datapicking, qtytotal)
      }, err => {
        this.doPostPickingListDetailPartNullUpdate(tolist, datai, datapicking, dataupd)
      });
  }
  doPostPickingListDetailPartNull(k, tolist, datai, datapicking) {
    this.api.get("table/picking_list_detail_part", { params: { limit: 100, filter: "receipt_no=" + "'" + datai.to_no + "' AND batch_no=" + "'" + datapicking.batch_no + "' AND item_no=" + "'" + datai.item_no + "' AND part_no=" + "'" + datai.item_no + "' AND line_no=" + "'10000'" } })
      .subscribe(val => {
        let dataupd = val['data']
        if (dataupd.length != 0) {
          this.doPostPickingListDetailPartNullUpdate(tolist, datai, datapicking, dataupd)
        }
        else {
          if (k > 0) {
            this.doPostPickingListDetailPartNull(k, tolist, datai, datapicking)
          }
          else {
            this.doPostPickingListDetailPartNullInsert(tolist, datai, datapicking, dataupd)
          }
        }
      }, err => {
        this.doPostPickingListDetailPartNull(k, tolist, datai, datapicking)
      });
  }
  doGetStock(tolist, datai, dataj, datapicking, qtytotal) {
    this.api.get("table/stock", { params: { limit: 100, filter: "id=" + "'" + datapicking.id + "'" } })
      .subscribe(val => {
        this.datastok = val['data']
        if (this.datastok.length == 0) {
          this.doGetStock(tolist, datai, dataj, datapicking, qtytotal)
        }
        else {
          this.doUpdateStock(tolist, datai, dataj, datapicking, qtytotal)
        }
      }, err => {
        this.doGetStock(tolist, datai, dataj, datapicking, qtytotal)
      });
  }
  doUpdateStock(tolist, datai, dataj, datapicking, qtytotal) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let date = moment().format('YYYY-MM-DD HH:mm');
    this.api.put("table/stock",
      {
        "id": datapicking.id,
        "qty": parseInt(this.datastok[0].qty) - parseInt(qtytotal),
        "qty_booking": parseInt(this.datastok[0].qty_booking) + parseInt(qtytotal),
        "datetime": date
      },
      { headers })
      .subscribe(val => {
        this.datastok = [];
      }, err => {
        this.doUpdateStock(tolist, datai, dataj, datapicking, qtytotal)
      });
  }
  doUpdateTOPicking(tolist) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/transfer_order",
      {
        "to_no": tolist.to_no,
        "status_picking": '1',
      },
      { headers })
      .subscribe(val => {
        this.doUpdateTO(tolist)
      }, err => {
        this.doUpdateTOPicking(tolist)
      });
  }
  doUpdateTO(tolist) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/picking_list",
      {
        "receipt_no": tolist.to_no,
        "receipt_date": tolist.transfer_date,
        "expected_receipt_date": tolist.transfer_date,
        "store_no": tolist.from_location,
        "so_no": '',
        "status": 'INP1'
      },
      { headers })
      .subscribe(val => {
        let alert = this.alertCtrl.create({
          title: 'Sukses',
          subTitle: 'Pekerjaan Picking Sukses di kirim',
          buttons: ['OK']
        });
        alert.present();
      }, err => {
        this.doUpdateTO(tolist)
      });
  }
  doPrint(tolist) {
    let locationModal = this.modalCtrl.create('PickingnotePage', {
      receiptno: tolist.to_no
    },
      { cssClass: "modal-fullscreen" });
    locationModal.present();
  }
  doGoToSlotDelivery() {
    this.navCtrl.push('ScheduledeliveryPage', {
      rolecab: this.rolecab,
      userid: this.userid
    });
  }

}
