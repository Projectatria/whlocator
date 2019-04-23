import { Component } from '@angular/core';
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
  selector: 'page-picking',
  templateUrl: 'picking.html',
})
export class PickingPage {
  myFormModal: FormGroup;
  private location_master = [];
  private division = [];
  private picking = [];
  private pickingrelease = [];
  private putawaytemp = [];
  private getputawaylist = [];
  private location = [];
  private listpicking = [];
  private listpickingdetail = [];
  private putawayfound = [];
  private usertoken = [];
  private users = [];
  public datastok = []
  searchrcv: any;
  searchloc: any;
  searchpicking = [];
  halaman = 0;
  totaldata: any;
  totaldatapicking: any;
  totaldatapickingdetail: any;
  totaldatalistpicking: any;
  divisioncode = '';
  divdesc = '';
  setdiv = '';
  docno = '';
  receiptno = '';
  batchno = '';
  itemno = '';
  locationcode = '';
  position = '';
  divisionno = '';
  qty = '';
  qtyprevious = '';
  putawayno = '';
  unit = '';
  rcvlist = '';
  barcodeno = '';
  rackno = '';
  sortPICK = '';
  filter = '';
  public totalqty: any;
  private nextno = '';
  public toggled: boolean = false;
  public detailpick: boolean = false;
  public detailpicklist: boolean = false;
  pick: string = "picking";
  public buttonText: string;
  public loading: boolean;
  option: BarcodeScannerOptions;
  data = {};
  groupby = '';
  search = '';
  itemnolist = '';
  invoicelist = '';
  roomlist = '';
  private token: any;
  public userid = [];
  public role = [];
  public rolearea = '';
  public rolegroup = '';
  public roleid = '';
  public userpic = '';
  public loader: any;
  public uuid: any;
  public name: any;
  public pickingreleasesearch = [];
  public listpickingsearch = [];
  public totaldatalistpickingsearch: any;
  public rolecab = '';

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
    this.loader = this.loadingCtrl.create({
      // cssClass: 'transparent',
      content: 'Loading Content...'
    });
    this.loader.present();
    this.myFormModal = formBuilder.group({
      pic: ['', Validators.compose([Validators.required])],
    })
    this.storage.get('name').then((val) => {
      this.name = val;
    });
    this.storage.get('userid').then((val) => {
      this.userid = val;
      this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
        .subscribe(val => {
          this.role = val['data']
          if (this.role.length != 0) {
            this.rolearea = this.role[0].id_area
            this.rolegroup = this.role[0].id_group
            this.roleid = this.role[0].id_role
            this.rolecab = this.role[0].id_cab
            if (this.rolegroup == "STAFF") {
              this.pick = "picking"
            }
            else {
              this.pick = "listpicking"
            }
          }
        })
    });
    this.toggled = false;
    this.groupby = ""
    this.search = 'invoice_no';
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
  ionViewDidEnter() {
    this.halaman = 0;
    this.listpicking = [];
    this.getpicking()
    this.doListPickingDetail()
  }
  getpicking() {
    return new Promise(resolve => {
      let offsetpicking = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get("table/delivery_order_header", { params: { limit: 30, offset: offsetpicking, filter: "Status='OPEN'", sort: "delivery_date DESC " } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.listpicking.push(data[i]);
              this.searchpicking.push(data[i]);
              this.totaldatalistpicking = val['count'];
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            resolve();
          });
      }
    });
  }
  getPickingSearch() {

  }
  /*getSetGroupBy(groupby) {
    this.api.get('table/picking_list', { params: { limit: 30, filter: "status='OPEN'", group: groupby, groupSummary: "sum (qty) as qtysum" } })
      .subscribe(val => {
        this.listpicking = val['data'];
        this.totaldatalistpicking = val['count'];
        this.searchpicking = this.listpicking;
      });
  }
  getDetailGroupByInvoice(listpick) {
    this.listpickingdetail = [];
    this.detailpicklist = this.detailpicklist ? false : true
    this.invoicelist = listpick.invoice_no
    this.api.get('table/picking_list', { params: { limit: 30, filter: "status='OPEN'" + " AND " + "invoice_no=" + "'" + listpick.invoice_no + "'" } })
      .subscribe(val => {
        this.listpickingdetail = val['data'];
        this.totaldatapickingdetail = val['count'];
      });
  }
  getDetailGroupByItems(listpick) {
    this.listpickingdetail = [];
    this.detailpicklist = this.detailpicklist ? false : true
    this.itemnolist = listpick.item_no
    this.api.get('table/picking_list', { params: { limit: 30, filter: "status='OPEN'" + " AND " + "item_no=" + "'" + listpick.item_no + "'" } })
      .subscribe(val => {
        this.listpickingdetail = val['data'];
        this.totaldatapickingdetail = val['count'];
      });
  }
  getDetailGroupByRoom(listpick) {
    this.listpickingdetail = [];
    this.detailpicklist = this.detailpicklist ? false : true
    this.roomlist = listpick.room
    this.api.get('table/picking_list', { params: { limit: 30, filter: "status='OPEN'" + " AND " + "room=" + "'" + listpick.room + "'" } })
      .subscribe(val => {
        this.listpickingdetail = val['data'];
        this.totaldatapickingdetail = val['count'];
      });
  }
  getSearchInvoice(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listpicking = this.searchpicking.filter(pick => {
        return pick.invoice_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listpicking = this.listpicking;
    }
  }
  getSearchItems(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listpicking = this.searchpicking.filter(pick => {
        return pick.item_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listpicking = this.listpicking;
    }
  }
  getSearchRoom(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listpicking = this.searchpicking.filter(pick => {
        return pick.room.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listpicking = this.searchpicking;
    }
  }*/
  getSearchGroupInvoice(ev: any) {
    // set val to the value of the searchbar
    let value = ev.target.value;
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Delivery Management Header", filter: "Status=0 AND [Receipt No_] LIKE '%" + value + "%'", sort: "[Expected Receipt Date]" + " DESC " } })
      .subscribe(val => {
        let data = val['data'];
        if (value && value.trim() != '') {
          this.listpicking = data.filter(pick => {
            return pick["Receipt No_"].toLowerCase().indexOf(value.toLowerCase()) > -1;
          })
        } else {
          this.listpicking = this.searchpicking;
        }
      });
    // if the value is an empty string don't filter the items
  }
  /*getSearchGroupItems(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listpicking = this.searchpicking.filter(pick => {
        return pick.item_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listpicking = this.searchpicking;
    }
  }
  getSearchGroupRoom(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listpicking = this.searchpicking.filter(pick => {
        return pick.room.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listpicking = this.searchpicking;
    }
  }*/
  menuShow() {
    this.menu.enable(true);
    this.menu.swipeEnable(true);
  };

  doInfinite(infiniteScroll) {
    this.getpicking().then(response => {
      infiniteScroll.complete();
    })
  }
  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }

  doRefreshpicking(refresher) {
    this.listpicking = [];
    this.halaman = 0;
    this.getpicking().then(response => {
      refresher.complete();
    })
  }
  doRefreshpickingDetail(refresher) {
    this.api.get('table/picking_list', { params: { limit: 30, filter: "status='INP1'" } })
      .subscribe(val => {
        this.listpickingdetail = val['data'];
        this.totaldatapickingdetail = val['count'];
        refresher.complete();
      });
  }

  doSortPICK(filter) {
    if (this.sortPICK == 'ASC') {
      this.sortPICK = 'DESC'
    }
    else {
      this.sortPICK = 'ASC'
    }
    this.api.get("table/picking_list", { params: { filter: "status='OPEN'", sort: filter + " " + this.sortPICK + " " } }).subscribe(val => {
      this.listpicking = val['data'];
      this.totaldatalistpicking = val['count'];
      this.filter = filter
    });
  }
  doSortPICKDetail(filter, listpick) {

  }
  getUsers() {
    this.api.get('table/user_role', { params: { filter: "id_area='INBOUND' AND id_group='STAFF'" } }).subscribe(val => {
      this.users = val['data'];
    });
  }
  onChange(user) {
    this.userpic = user.id_user;
  }
  doOffToPIC() {
    document.getElementById("myModalPic").style.display = "none";
    this.myFormModal.reset()
  }
  doOpenToPIC(listpick) {
    this.getUsers();
    this.getInfoPIC(listpick)
    document.getElementById("myModalPic").style.display = "block";
    this.receiptno = listpick.receipt_no
  }
  getInfoPIC(listpick) {
    this.api.get("table/picking_list", { params: { filter: "receipt_no=" + "'" + listpick.receipt_no + "'" } })
      .subscribe(val => {
        this.pickingrelease = val['data'];
        if (this.pickingrelease.length == 0) {
        }
        else if (this.pickingrelease.length != 0) {
          if (this.pickingrelease[0].status == 'OPEN') {
            this.myFormModal.get('pic').setValue(this.pickingrelease[0].pic);
          }
        }
      });
  }
  doSendToPic() {
    this.api.get("table/picking_list", { params: { filter: "receipt_no=" + "'" + this.receiptno + "'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length == 0) {
          this.doPostSendToPic()
        }
        else {
          this.doPutSendToPic()
        }
      });
  }
  doPostSendToPic() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let uuid = UUID.UUID();
    this.uuid = uuid;
    this.api.post("table/picking_list",
      {
        "receipt_no": this.receiptno,
        "pic": this.myFormModal.value.pic,
        "status": 'OPEN',
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": this.uuid
      },
      { headers })
      .subscribe(
        (val) => {
          document.getElementById("myModalPic").style.display = "none";
          this.myFormModal.reset()
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
          this.listpicking = [];
          this.halaman = 0;
          this.getpicking()
        });
  }
  doPutSendToPic() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let uuid = UUID.UUID();
    this.uuid = uuid;
    this.api.put("table/picking_list",
      {
        "receipt_no": this.receiptno,
        "pic": this.myFormModal.value.pic,
        "status": 'OPEN',
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": this.uuid
      },
      { headers })
      .subscribe(
        (val) => {
          document.getElementById("myModalPic").style.display = "none";
          this.myFormModal.reset()
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
          this.listpicking = [];
          this.halaman = 0;
          this.getpicking()
        });
  }
  doSendNotificationPic(listpick) {
    this.api.get("table/picking_list", { params: { filter: "receipt_no=" + "'" + listpick.receipt_no + "'" } })
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
                    let alert = this.alertCtrl.create({
                      title: 'Sukses',
                      subTitle: 'Pekerjaan Picking Sukses di kirim',
                      buttons: ['OK']
                    });
                    alert.present();
                    const headers = new HttpHeaders()
                      .set("Content-Type", "application/json");
                    this.api.put("table/picking_list",
                      {
                        "receipt_no": listpick.receipt_no,
                        "receipt_date": listpick.receipt_date,
                        "expected_receipt_date": listpick.delivery_date,
                        "store_no": listpick.store_no,
                        "so_no": listpick.so_no,
                        "datetime": moment().format('YYYY-MM-DD HH:mm'),
                        "status": 'INP1'
                      },
                      { headers })
                      .subscribe(val => {
                        var self = this;
                        this.doUpdateDOHeader(listpick)
                        this.doListPickingDetail();
                        this.api.get("table/delivery_order_line", { params: { limit: 1000, filter: "receipt_no=" + "'" + listpick.receipt_no + "' AND part_line_no='10000'", sort: "line_no ASC, part_line_no ASC " } })
                          .subscribe(val => {
                            let data = val['data'];
                            for (let i = 0, a: any = Promise.resolve(); i < data.length; i++) {
                              a = a.then(_ => new Promise(resolve =>
                                setTimeout(function () {
                                  self.doPostPickingListDetail(data, i)
                                  resolve();
                                }, Math.random() * 1000)
                              ));
                            }
                          });
                      });
                  }, (e) => {
                  });
              });
          }
        }
      });

  }
  doUpdateDOHeader(listpick) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/delivery_order_header",
      {
        "uuid": listpick.uuid,
        "status": 'PICKING'
      },
      { headers })
      .subscribe(val => {
        this.ionViewDidEnter()
      });
  }
  doPostPickingListDetail(data, i) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let uuid = UUID.UUID();
    this.uuid = uuid;
    this.api.post("table/picking_list_detail",
      {
        "id": data[i].receipt_no + data[i].line_no,
        "receipt_no": data[i].receipt_no,
        "item_no": data[i].item_no,
        "description": data[i].item_description,
        "qty": data[i].item_qty,
        "sent_by": data[i].sent_by,
        "sjl_from": data[i].sjl_from,
        "UOM": 'SET',
        "retail_so_no": data[i].so_no,
        "status": 'OPEN',
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": this.uuid
      },
      { headers })
      .subscribe(val => {
        this.doGetPart(data, i)
        /*var self = this;
        this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Item", filter: "[No_]=" + "'" + data[i].item_no + "'" } })
          .subscribe(val => {
            let dataitem = val['data']
            this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Production BOM Line", filter: "[Production BOM No_]=" + "'" + dataitem[0]["Production BOM No_"] + "'" } }).subscribe(val => {
              let datapart = val['data']
              if (datapart.length == 0) {
                this.api.get("table/stock", { params: { limit: 100, filter: "item_no=" + "'" + data[i].item_no + "' AND location=" + "'" + this.rolecab + "' AND sub_location !='Staging Out' AND sub_location != 'STAGINGIN'", group: 'item_no', groupSummary: "sum (qty) as qtysum" } })
                  .subscribe(val => {
                    let totalqty = val['data'][0].qtysum
                    if (data[i].item_qty <= totalqty) {
                      for (let k = 0, b: any = Promise.resolve(); k < data[i].item_qty; k++) {
                        b = b.then(_ => new Promise(resolve =>
                          setTimeout(function () {
                            self.api.get("table/stock", { params: { limit: 100, filter: "item_no=" + "'" + data[i].item_no + "' AND location=" + "'" + self.rolecab + "' AND sub_location !='Staging Out' AND sub_location != 'STAGINGIN' AND qty >= " + 1, sort: 'batch_no ASC, sub_location ASC' } })
                              .subscribe(val => {
                                let datapickingresult = val['data']
                                if (datapickingresult.length != 0) {
                                  let datai = data[i]
                                  let datapicking = datapickingresult[0]
                                  self.doPostPickingListDetailPartNullInsert(datai, datapicking)
                                }
                                else {
                                  let datai = data[i]
                                  let datapicking = { 'batch_no': 'NOT FOUND', 'location': 'NOT FOUND', 'sub_location': 'NOT FOUND' }
                                  self.doPostPickingListDetailPartNullInsert(datai, datapicking)
                                }
                              });
                            resolve();
                          }, Math.random() * 1000)
                        ));
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
                for (let j = 0, c: any = Promise.resolve(); j < datapart.length; j++) {
                  c = c.then(_ => new Promise(resolve =>
                    setTimeout(function () {
                      self.api.get("table/stock", { params: { limit: 100, filter: "item_no=" + "'" + datapart[j].No_ + "' AND location=" + "'" + self.rolecab + "' AND sub_location !='Staging Out' AND sub_location != 'STAGINGIN'", group: 'item_no', groupSummary: "sum (qty) as qtysum" } })
                        .subscribe(val => {
                          let totalqty = val['data'][0].qtysum
                          if (data[i].item_qty <= totalqty) {
                            for (let k = 0, d: any = Promise.resolve(); k < data[i].item_qty; k++) {
                              d = d.then(_ => new Promise(resolve =>
                                setTimeout(function () {
                                  self.api.get("table/stock", { params: { limit: 100, filter: "item_no=" + "'" + datapart[j].No_ + "' AND location=" + "'" + self.rolecab + "' AND sub_location !='Staging Out' AND sub_location != 'STAGINGIN' AND qty >=" + datapart[j].Quantity, sort: 'batch_no ASC, sub_location ASC' } })
                                    .subscribe(val => {
                                      let datapickingresult = val['data']
                                      if (datapickingresult.length != 0) {
                                        let datai = data[i]
                                        let dataj = datapart[j]
                                        let datapicking = datapickingresult[0]
                                        self.doPostPickingListDetailPartInsert(datai, dataj, datapicking)
                                      }
                                      else {
                                        let datai = data[i]
                                        let dataj = datapart[j]
                                        let datapicking = { 'batch_no': 'NOT FOUND', 'location': 'NOT FOUND', 'sub_location': 'NOT FOUND' }
                                        self.doPostPickingListDetailPartInsert(datai, dataj, datapicking)
                                      }
                                    });
                                  resolve();
                                }, Math.random() * 1000)
                              ));
                            }
                          }
                          else {
                            let alert = self.alertCtrl.create({
                              title: 'Perhatian',
                              subTitle: 'Stok tidak cukup',
                              buttons: ['OK']
                            });
                            alert.present();
                          }
                        });
                      resolve();
                    }, Math.random() * 1000)
                  ));
                }
              }
            });
          })*/
      }, err => {
        this.doPostPickingListDetail(data, i)
      });
  }
  doGetPart(data, i) {
    var self = this;
    this.api.get("table/delivery_order_line", { params: { limit: 1000, filter: "receipt_no=" + "'" + data[i].receipt_no + "' AND item_no=" + "'" + data[i].item_no + "'", sort: "line_no ASC, part_line_no ASC " } })
      .subscribe(val => {
        let datapart = val['data']
        for (let j = 0, c: any = Promise.resolve(); j < datapart.length; j++) {
          c = c.then(_ => new Promise(resolve =>
            setTimeout(function () {
              self.api.get("table/stock", { params: { limit: 100, filter: "item_no=" + "'" + datapart[j].part_no + "' AND location=" + "'" + self.rolecab + "' AND sub_location !='Staging Out' AND sub_location != 'STAGINGIN'", group: 'item_no', groupSummary: "sum (qty) as qtysum" } })
                .subscribe(val => {
                  let totalqty = val['data'][0].qtysum
                  if (data[i].item_qty <= totalqty) {
                    for (let k = 0, d: any = Promise.resolve(); k < data[i].item_qty; k++) {
                      d = d.then(_ => new Promise(resolve =>
                        setTimeout(function () {
                          self.api.get("table/stock", { params: { limit: 100, filter: "item_no=" + "'" + datapart[j].part_no + "' AND location=" + "'" + self.rolecab + "' AND sub_location !='Staging Out' AND sub_location != 'STAGINGIN' AND qty >=" + 1, sort: 'batch_no ASC, sub_location ASC' } })
                            .subscribe(val => {
                              let datapickingresult = val['data']
                              if (datapickingresult.length != 0) {
                                let datai = data[i]
                                let dataj = datapart[j]
                                let datapicking = datapickingresult[0]
                                self.doPostPickingListDetailPartInsert(datai, dataj, datapicking)
                              }
                              else {
                                let datai = data[i]
                                let dataj = datapart[j]
                                let datapicking = { 'batch_no': 'NOT FOUND', 'location': 'NOT FOUND', 'sub_location': 'NOT FOUND' }
                                self.doPostPickingListDetailPartInsert(datai, dataj, datapicking)
                              }
                            });
                          resolve();
                        }, Math.random() * 1000)
                      ));
                    }
                  }
                  else {
                    let alert = self.alertCtrl.create({
                      title: 'Perhatian',
                      subTitle: 'Stok tidak cukup',
                      buttons: ['OK']
                    });
                    alert.present();
                  }
                }, err => {
                  self.doGetPart(data, i)
                });
              resolve();
            }, Math.random() * 1000)
          ));
        }
      }, err => {
        this.doGetPart(data, i)
      });
  }
  doPrint(listpick) {
    let locationModal = this.modalCtrl.create('PickingnotePage', {
      receiptno: listpick["Receipt No_"]
    },
      { cssClass: "modal-fullscreen" });
    locationModal.present();
  }
  viewDetail(listpick) {
    this.navCtrl.push('PickingdetailPage', {
      receiptno: listpick.receipt_no
    });
  }
  viewDetailPicking(listpickdetail) {
    this.navCtrl.push('PickingdetailpartPage', {
      receiptno: listpickdetail.receipt_no
    });
  }
  doListPickingDetail() {
    this.api.get('table/picking_list', { params: { limit: 30, filter: "status='INP1'" } })
      .subscribe(val => {
        this.listpickingdetail = val['data'];
      });
  }
  doUpdateDOD(dataj, datapicking) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/delivery_order_line",
      {
        "uuid": dataj.uuid,
        "batch_no": datapicking.batch_no
      },
      { headers })
      .subscribe(val => {
      }, err => {
        this.doUpdateDOD(dataj, datapicking)
      });
  }
  doPostPickingListDetailPartInsert(datai, dataj, datapicking) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("table/picking_list_detail_part",
      {
        "id": datai.receipt_no + datai.line_no,
        "batch_no": datapicking.batch_no,
        "receipt_no": datai.receipt_no,
        "item_no": datai.item_no,
        "bom_no": 'B-' + datai.item_no,
        "part_no": dataj.part_no,
        "line_no": dataj.part_line_no,
        "description": dataj.part_description,
        "qty": 1,
        "location": datapicking.location,
        "sub_location": datapicking.sub_location,
        "UOM": dataj.UOM,
        "retail_so_no": datai.so_no,
        "status": 'OPEN',
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": UUID.UUID()
      },
      { headers })
      .subscribe(val => {
        this.doGetStock(datai, dataj, datapicking)
      }, err => {
        this.doPostPickingListDetailPartInsert(datai, dataj, datapicking)
      });
  }
  /*doPostPickingListDetailPartUpdate(datai, dataj, datapicking, dataupd) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/picking_list_detail_part",
      {
        "id": dataupd[0].id,
        "batch_no": datapicking.batch_no,
        "receipt_no": datai.receipt_no,
        "item_no": datai.item_no,
        "bom_no": dataj["Production BOM No_"],
        "part_no": dataj.No_,
        "line_no": dataj["Line No_"],
        "description": dataj.Description,
        "qty": parseInt(dataupd[0].qty) + parseInt(dataj.Quantity),
        "location": datapicking.location,
        "sub_location": datapicking.sub_location,
        "UOM": dataj["Unit of Measure Code"],
        "retail_so_no": datai.so_no,
        "status": 'OPEN',
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": dataupd[0].uuid
      },
      { headers })
      .subscribe(val => {
        this.doUpdateDOD(datai, datapicking)
        let qtytotal = dataj.Quantity
        this.doGetStock(datai, dataj, datapicking)
      }, err => {
        this.doPostPickingListDetailPartUpdate(datai, dataj, datapicking, dataupd)
      });
  }
  doPostPickingListDetailPart(k, datai, dataj, datapicking) {
    this.api.get("table/picking_list_detail_part", { params: { limit: 100, filter: "receipt_no=" + "'" + datai.receipt_no + "' AND item_no=" + "'" + datai.item_no + "' AND part_no=" + "'" + dataj.No_ + "'" } })
      .subscribe(val => {
        let dataupd = val['data']
        if (dataupd.length != 0) {
          this.doPostPickingListDetailPartUpdate(datai, dataj, datapicking, dataupd)
        }
        else {
          if (k > 0) {
            this.doPostPickingListDetailPart(k, datai, dataj, datapicking)
          }
          else {
            this.doPostPickingListDetailPartInsert(datai, dataj, datapicking)
          }
        }
      }, err => {
        this.doPostPickingListDetailPart(k, datai, dataj, datapicking)
      });
  }
  doPostPickingListDetailPartNullInsert(datai, datapicking) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("table/picking_list_detail_part",
      {
        "id": datai.receipt_no + datai.line_no,
        "batch_no": datapicking.batch_no,
        "receipt_no": datai.receipt_no,
        "item_no": datai.item_no,
        "bom_no": 'NOT FOUND',
        "part_no": datai.item_no,
        "line_no": '10000',
        "description": datai.item_description,
        "qty": 1,
        "location": datapicking.location,
        "sub_location": datapicking.sub_location,
        "UOM": datai.UOM,
        "retail_so_no": datai.so_no,
        "status": 'OPEN',
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": UUID.UUID()
      },
      { headers })
      .subscribe(val => {
        this.doUpdateDOD(datai, datapicking)
        let dataj = { 'Quantity': 1 }
        let qtytotal = 1
        this.doGetStock(datai, dataj, datapicking)
      }, err => {
        this.doPostPickingListDetailPartNullInsert(datai, datapicking)
      });
  }
  doPostPickingListDetailPartNullUpdate(datai, datapicking, dataupd) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/picking_list_detail_part",
      {
        "id": dataupd[0].id,
        "batch_no": datapicking.batch_no,
        "receipt_no": datai.receipt_no,
        "item_no": datai.item_no,
        "bom_no": 'NOT FOUND',
        "part_no": datai.item_no,
        "line_no": '10000',
        "description": datai.item_description,
        "qty": parseInt(dataupd[0].qty) + 1,
        "location": datapicking.location,
        "sub_location": datapicking.sub_location,
        "UOM": datai.UOM,
        "retail_so_no": datai.so_no,
        "status": 'OPEN',
        "datetime": moment().format('YYYY-MM-DD HH:mm'),
        "uuid": dataupd[0].uuid
      },
      { headers })
      .subscribe(val => {
        this.doUpdateDOD(datai, datapicking)
        let dataj = { 'Quantity': 1 }
        let qtytotal = 1
        this.doGetStock(datai, dataj, datapicking)
      }, err => {
        this.doPostPickingListDetailPartNullUpdate(datai, datapicking, dataupd)
      });
  }
  doPostPickingListDetailPartNull(k, datai, datapicking) {
    this.api.get("table/picking_list_detail_part", { params: { limit: 100, filter: "receipt_no=" + "'" + datai.receipt_no + "' AND batch_no=" + "'" + datapicking.batch_no + "' AND item_no=" + "'" + datai.item_no + "' AND part_no=" + "'" + datai.item_no + "' AND line_no=" + "'10000'" } })
      .subscribe(val => {
        let dataupd = val['data']
        if (dataupd.length != 0) {
          this.doPostPickingListDetailPartNullUpdate(datai, datapicking, dataupd)
        }
        else {
          if (k > 0) {
            this.doPostPickingListDetailPartNull(k, datai, datapicking)
          }
          else {
            this.doPostPickingListDetailPartNullInsert(datai, datapicking)
          }
        }
      }, err => {
        this.doPostPickingListDetailPartNull(k, datai, datapicking)
      });
  }*/
  doGetStock(datai, dataj, datapicking) {
    this.api.get("table/stock", { params: { limit: 100, filter: "id=" + "'" + datapicking.id + "'" } })
      .subscribe(val => {
        let datastok = val['data']
        if (datastok.length == 0) {
          this.doGetStock(datai, dataj, datapicking)
        }
        else {
          this.doUpdateStock(datai, dataj, datapicking, datastok)
        }
      }, err => {
        this.doGetStock(datai, dataj, datapicking)
      });
  }
  doUpdateStock(datai, dataj, datapicking, datastok) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let date = moment().format('YYYY-MM-DD HH:mm');
    this.api.put("table/stock",
      {
        "id": datapicking.id,
        "qty": parseInt(datastok[0].qty) - 1,
        "qty_booking": parseInt(datastok[0].qty_booking) + 1,
        "datetime": date
      },
      { headers })
      .subscribe(val => {
        this.doUpdateDOD(dataj, datapicking)
      }, err => {
        this.doUpdateStock(datai, dataj, datapicking, datastok)
      });
  }
}
