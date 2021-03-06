import { Component } from '@angular/core';
import { LoadingController, FabContainer, ActionSheetController, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { HttpHeaders } from "@angular/common/http";
import { UUID } from 'angular2-uuid';
import { BarcodeScanner, BarcodeScannerOptions } from "@ionic-native/barcode-scanner";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { Storage } from '@ionic/storage';

declare var window;
declare var Honeywell;

@IonicPage()
@Component({
  selector: 'page-putaway',
  templateUrl: 'putaway.html',
})
export class PutawayPage {
  myForm: FormGroup;
  myFormModal: FormGroup;
  private receiving = [];
  private location_master = [];
  private division = [];
  private putaway = [];
  private putawaylist = [];
  private putawaytemp = [];
  private putawaytempdetail = [];
  private receivingputawaylist = [];
  private getputawaylist = [];
  private location = [];
  private listputaway = [];
  private listputawaydetail = [];
  private putawayfound = [];
  searchrcv: any;
  searchloc: any;
  searchputaway: any;
  halaman = 0;
  totaldata: any;
  totaldataputaway: any;
  totaldataputawaydetail: any;
  totaldatalistputaway: any;
  divisioncode = '';
  divdesc = '';
  setdiv = '';
  receivingno = '';
  docno = '';
  orderno = '';
  batchno = '';
  itemno = '';
  locationcode = '';
  position = '';
  divisionno = '';
  qty = '';
  qtyprevious = '';
  putawayno = '';
  qtyreceiving = '';
  unit = '';
  rcvlist = '';
  barcodeno = '';
  rackno = '';
  sortPUT = '';
  filter = '';
  public totalqty: any;
  private nextno = '';
  public toggled: boolean = false;
  public detailput: boolean = false;
  public detailputlist: boolean = false;
  put: string = "qcin";
  public buttonText: string;
  public loading: boolean;
  option: BarcodeScannerOptions;
  data = {};
  groupby = '';
  search = '';
  itemnolist = '';
  batchnolist = '';
  locationlist = '';
  private token: any;
  public loader: any;
  public name: any;
  public nextnostockbalance: any;
  public userid: any;
  public role = [];
  public roleid: any;
  public rolecab: any;
  public stagingno: any;
  public buttonscan: boolean = false;

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
    public loadingCtrl: LoadingController
  ) {
    this.loader = this.loadingCtrl.create({
      // cssClass: 'transparent',
      content: 'Loading Content...'
    });
    this.loader.present();
    this.myForm = formBuilder.group({
      rackno: ['', Validators.compose([Validators.required])],
      barcodeno: [''],
    })
    this.myFormModal = formBuilder.group({
      qty: ['', Validators.compose([Validators.required])],
      location: ['', Validators.compose([Validators.required])],
    })
    this.storage.get('name').then((val) => {
      this.name = val;
    });
    this.getrcv();
    this.api.get('table/putaway', { params: { limit: 30, filter: "status='OPEN'" } })
      .subscribe(val => {
        this.listputaway = val['data'];
        this.totaldataputaway = val['count'];
        this.searchputaway = this.listputaway;
      });
    this.toggled = false;
    this.put = "qcin"
    this.groupby = ""
    this.search = 'item_no';
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
  ionViewDidLoad() {
  }
  getrcv() {
    return new Promise(resolve => {
      let offsetinforcv = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/staging_in', { params: { limit: 30, offset: offsetinforcv, filter: "qty_putaway!=0" } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.receiving.push(data[i]);
              this.totaldata = val['count'];
              this.searchrcv = this.receiving;
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            resolve();
          });
      }
    });
  }
  getputaway() {
    return new Promise(resolve => {
      let offsetputaway = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/putaway', { params: { limit: 30, offset: offsetputaway, filter: "status='OPEN'" } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.listputaway.push(data[i]);
              this.totaldatalistputaway = val['count'];
              this.searchputaway = this.listputaway;
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            resolve();
          });
      }
    });
  }
  getSetGroupBy(groupby) {
    this.api.get('table/putaway', { params: { limit: 30, filter: "status='OPEN'", group: groupby, groupSummary: "sum (qty) as qtysum" } })
      .subscribe(val => {
        this.listputaway = val['data'];
        this.totaldataputaway = val['count'];
        this.searchputaway = this.listputaway;
      });
  }
  getDetailGroupByItems(listpu) {
    this.listputawaydetail = [];
    this.detailputlist = this.detailputlist ? false : true
    this.itemnolist = listpu.item_no
    this.api.get('table/putaway', { params: { limit: 30, filter: "status='OPEN'" + " AND " + "item_no=" + "'" + listpu.item_no + "'" } })
      .subscribe(val => {
        this.listputawaydetail = val['data'];
        this.totaldataputawaydetail = val['count'];
      });
  }
  getDetailGroupByBatchno(listpu) {
    this.listputawaydetail = [];
    this.detailputlist = this.detailputlist ? false : true
    this.batchnolist = listpu.batch_no
    this.api.get('table/putaway', { params: { limit: 30, filter: "status='OPEN'" + " AND " + "batch_no=" + "'" + listpu.batch_no + "'" } })
      .subscribe(val => {
        this.listputawaydetail = val['data'];
        this.totaldataputawaydetail = val['count'];
      });
  }
  getDetailGroupByLocation(listpu) {
    this.listputawaydetail = [];
    this.detailputlist = this.detailputlist ? false : true
    this.locationlist = listpu.location_position
    this.api.get('table/putaway', { params: { limit: 30, filter: "status='OPEN'" + " AND " + "location_position=" + "'" + listpu.location_position + "'" } })
      .subscribe(val => {
        this.listputawaydetail = val['data'];
        this.totaldataputawaydetail = val['count'];
      });
  }
  getSearchItems(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listputaway = this.searchputaway.filter(put => {
        return put.item_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listputaway = this.searchputaway;
    }
  }
  getSearchbatch(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listputaway = this.searchputaway.filter(put => {
        return put.batch_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listputaway = this.searchputaway;
    }
  }
  getSearchlocations(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listputaway = this.searchputaway.filter(put => {
        return put.location_position.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listputaway = this.searchputaway;
    }
  }
  getSearchGroupItems(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listputaway = this.searchputaway.filter(put => {
        return put.item_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listputaway = this.searchputaway;
    }
  }
  getSearchGroupbatch(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listputaway = this.searchputaway.filter(put => {
        return put.batch_no.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listputaway = this.searchputaway;
    }
  }
  getSearchGrouplocations(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.listputaway = this.searchputaway.filter(put => {
        return put.location_position.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.listputaway = this.searchputaway;
    }
  }
  menuShow() {
    this.menu.enable(true);
    this.menu.swipeEnable(true);
  };

  doInfinite(infiniteScroll) {
    this.getrcv().then(response => {
      infiniteScroll.complete();

    })
  }
  toggleSearch() {
    this.toggled = this.toggled ? false : true;
  }
  viewDetail(rcv) {
    this.api.get('table/putaway', { params: { limit: 30, filter: "receiving_no=" + rcv.receiving_no } })
      .subscribe(val => {
        this.putaway = val['data'];
        this.rcvlist = rcv.receiving_no;
        this.totaldataputaway = val['count'];
        this.detailput = this.detailput ? false : true;
      });
  }

  doRefresh(refresher) {
    this.api.get('table/staging_in', { params: { limit: 30, filter: "qty_putaway!=0" } })
      .subscribe(val => {
        this.receiving = val['data'];
        this.totaldata = val['count'];
        this.searchrcv = this.receiving;
        refresher.complete();
      });
  }
  doRefreshputaway(refresher) {
    this.api.get('table/putaway', { params: { limit: 30, filter: "status='OPEN'" } })
      .subscribe(val => {
        this.listputaway = val['data'];
        this.totaldataputaway = val['count'];
        this.searchputaway = this.listputaway;
        refresher.complete();
      });
  }
  doOpenListPutaway() {
    console.log(this.buttonscan)
    this.myForm.reset();
    if (document.getElementById("myListPutaway").style.display == "none" && document.getElementById("myHeader").style.display == "block") {
      document.getElementById("myListPutaway").style.display = "block";
      document.getElementById("myHeader").style.display = "none";
      this.buttonscan = true
      this.getPutawayTemp();
      this.getPutawayTempDetail();
    }
    else if (document.getElementById("myListPutaway").style.display == "" && document.getElementById("myHeader").style.display == "") {
      document.getElementById("myListPutaway").style.display = "block";
      document.getElementById("myHeader").style.display = "none";
      this.buttonscan = true
      this.getPutawayTemp();
      this.getPutawayTempDetail();
    }
    else {
      document.getElementById("myListPutaway").style.display = "none";
      document.getElementById("myHeader").style.display = "block";
      this.buttonscan = false
      this.putawaytemp = [];
    }
  }
  doOpenQty() {
    var self = this;
    var batchno = self.myForm.value.barcodeno.substring(0, 4);
    var itemno = self.myForm.value.barcodeno.substring(4, 20);
    let rackno = self.myForm.value.rackno
    if (rackno == '') {
      let alert = self.alertCtrl.create({
        title: 'Error ',
        subTitle: 'Rack Number Must Be Fill',
        buttons: ['OK']
      });
      alert.present();
    }
    else {
      self.api.get('table/staging_in', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "'" + ' AND ' + "qty_putaway!=0 AND staging=" + "'" + rackno + "'" } })
        .subscribe(val => {
          self.receivingputawaylist = val['data'];
          if (self.receivingputawaylist.length != 0) {
            let alert = self.alertCtrl.create({
              title: 'Qty',
              inputs: [
                {
                  name: 'qty',
                  placeholder: 'Qty'
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
                    if (self.receivingputawaylist[0].qty_putaway < data.qty) {
                      let alert = self.alertCtrl.create({
                        title: 'Error ',
                        subTitle: 'Qty does not exist',
                        buttons: ['OK']
                      });
                      alert.present();
                    }
                    else {
                      self.api.get('table/putawaylist_temp', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "'" } })
                        .subscribe(val => {
                          self.getputawaylist = val['data'];
                          if (self.getputawaylist.length) {
                            const headers = new HttpHeaders()
                              .set("Content-Type", "application/json");
                            let date = moment().format('YYYY-MM-DD');
                            self.api.put("table/putawaylist_temp",
                              {
                                "putawaylisttemp_no": self.getputawaylist[0].putawaylisttemp_no,
                                "qty": parseInt(self.getputawaylist[0].qty) + parseInt(data.qty),
                                "date": date,
                                "pic": self.userid
                              },
                              { headers })
                              .subscribe(val => {
                                self.getPutawayTemp();
                                self.myForm.get('barcodeno').setValue('')
                                let alert = self.alertCtrl.create({
                                  title: 'Sukses ',
                                  subTitle: 'Update Item Sukses',
                                  buttons: ['OK']
                                });
                                alert.present();
                              })
                          }
                          else {
                            const headers = new HttpHeaders()
                              .set("Content-Type", "application/json");
                            self.getNextNoPUTemp().subscribe(val => {
                              self.nextno = val['nextno'];
                              let date = moment().format('YYYY-MM-DD');
                              self.api.post("table/putawaylist_temp",
                                {
                                  "putawaylisttemp_no": self.nextno,
                                  "receiving_no": self.receivingputawaylist[0].receiving_no,
                                  "doc_no": self.receivingputawaylist[0].doc_no,
                                  "order_no": self.receivingputawaylist[0].order_no,
                                  "batch_no": self.receivingputawaylist[0].batch_no,
                                  "item_no": self.receivingputawaylist[0].item_no,
                                  "posting_date": date,
                                  "location_code": self.receivingputawaylist[0].location_code,
                                  "location_position": self.receivingputawaylist[0].position,
                                  "division": self.receivingputawaylist[0].division,
                                  "qty": data.qty,
                                  "qty_receiving": self.receivingputawaylist[0].qty_receiving,
                                  "unit": self.receivingputawaylist[0].unit,
                                  "flag": '',
                                  "pic": self.userid,
                                  "status": 'OPEN',
                                  "chronology_no": '',
                                  "uuid": UUID.UUID()
                                },
                                { headers })
                                .subscribe(val => {
                                  self.getPutawayTemp();
                                  self.myForm.get('barcodeno').setValue('')
                                  let alert = self.alertCtrl.create({
                                    title: 'Sukses ',
                                    subTitle: 'Add Item Sukses',
                                    buttons: ['OK']
                                  });
                                  alert.present();
                                })
                            });
                          }
                        });
                    }
                  }
                }
              ]
            });
            alert.present();
          }
          else {
            let alert = self.alertCtrl.create({
              title: 'Error ',
              subTitle: 'Barcode Not Found',
              buttons: ['OK']
            });
            alert.present();
          }

        });
    }

  }
  doOpenQtyDetail() {
    var self = this;
    var batchno = self.myForm.value.barcodeno.substring(0, 4);
    var itemno = self.myForm.value.barcodeno.substring(4, 20);
    self.api.get('table/putawaylist_temp', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "' AND pic=" + "'" + self.userid + "'" } })
      .subscribe(val => {
        self.receivingputawaylist = val['data'];
        if (self.receivingputawaylist.length != 0) {
          let alert = self.alertCtrl.create({
            title: 'Qty',
            inputs: [
              {
                name: 'qty',
                placeholder: 'Qty'
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
                  if (self.receivingputawaylist[0].qty < data.qty) {
                    let alert = self.alertCtrl.create({
                      title: 'Error ',
                      subTitle: 'Qty does not exist',
                      buttons: ['OK']
                    });
                    alert.present();
                  }
                  else {
                    self.api.get('table/putawaylist_temp_detail', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "' AND pic=" + "'" + self.userid + "'" } })
                      .subscribe(val => {
                        self.getputawaylist = val['data'];
                        if (self.getputawaylist.length) {
                          const headers = new HttpHeaders()
                            .set("Content-Type", "application/json");
                          let date = moment().format('YYYY-MM-DD');
                          self.api.put("table/putawaylist_temp_detail",
                            {
                              "putawaylisttemp_no": self.getputawaylist[0].putawaylisttemp_no,
                              "qty": parseInt(self.getputawaylist[0].qty) + parseInt(data.qty),
                              "date": date,
                              "pic": self.userid
                            },
                            { headers })
                            .subscribe(val => {
                              const headers = new HttpHeaders()
                                .set("Content-Type", "application/json");
                              let date = moment().format('YYYY-MM-DD');
                              self.api.put("table/putawaylist_temp",
                                {
                                  "putawaylisttemp_no": self.receivingputawaylist[0].putawaylisttemp_no,
                                  "qty": parseInt(self.receivingputawaylist[0].qty) - parseInt(data.qty),
                                  "date": date,
                                  "pic": self.userid
                                },
                                { headers })
                                .subscribe(val => {
                                  if (self.receivingputawaylist[0].qty == data.qty) {
                                    self.api.delete("table/putawaylist_temp", { params: { filter: 'putawaylisttemp_no=' + "'" + self.receivingputawaylist[0].putawaylisttemp_no + "'" }, headers })
                                      .subscribe(
                                        (val) => {
                                          self.getPutawayTemp();
                                          self.getPutawayTempDetail();
                                        });
                                  }
                                  self.getPutawayTemp();
                                  self.getPutawayTempDetail();
                                  self.myForm.get('barcodeno').setValue('')
                                  let alert = self.alertCtrl.create({
                                    title: 'Sukses ',
                                    subTitle: 'Update Item Sukses',
                                    buttons: ['OK']
                                  });
                                  alert.present();
                                });
                            })
                        }
                        else {
                          const headers = new HttpHeaders()
                            .set("Content-Type", "application/json");
                          self.getNextNoPUTempDetail().subscribe(val => {
                            self.nextno = val['nextno'];
                            let date = moment().format('YYYY-MM-DD');
                            self.api.post("table/putawaylist_temp_detail",
                              {
                                "putawaylisttemp_no": self.nextno,
                                "receiving_no": self.receivingputawaylist[0].receiving_no,
                                "doc_no": self.receivingputawaylist[0].doc_no,
                                "order_no": self.receivingputawaylist[0].order_no,
                                "batch_no": self.receivingputawaylist[0].batch_no,
                                "item_no": self.receivingputawaylist[0].item_no,
                                "posting_date": date,
                                "location_code": self.receivingputawaylist[0].location_code,
                                "location_position": self.receivingputawaylist[0].location_position,
                                "division": self.receivingputawaylist[0].division,
                                "qty": data.qty,
                                "qty_receiving": self.receivingputawaylist[0].qty_receiving,
                                "unit": self.receivingputawaylist[0].unit,
                                "flag": '',
                                "pic": self.userid,
                                "status": 'OPEN',
                                "chronology_no": '',
                                "uuid": UUID.UUID()
                              },
                              { headers })
                              .subscribe(val => {
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                let date = moment().format('YYYY-MM-DD');
                                self.api.put("table/putawaylist_temp",
                                  {
                                    "putawaylisttemp_no": self.receivingputawaylist[0].putawaylisttemp_no,
                                    "qty": parseInt(self.receivingputawaylist[0].qty) - parseInt(data.qty),
                                    "date": date,
                                    "pic": self.userid
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    if (self.receivingputawaylist[0].qty == data.qty) {
                                      self.api.delete("table/putawaylist_temp", { params: { filter: 'putawaylisttemp_no=' + "'" + self.receivingputawaylist[0].putawaylisttemp_no + "'" }, headers })
                                        .subscribe(
                                          (val) => {
                                            self.getPutawayTemp();
                                            self.getPutawayTempDetail();
                                          });
                                    }
                                    self.getPutawayTemp();
                                    self.getPutawayTempDetail();
                                    self.myForm.get('barcodeno').setValue('')
                                    let alert = self.alertCtrl.create({
                                      title: 'Sukses ',
                                      subTitle: 'Add Item Sukses',
                                      buttons: ['OK']
                                    });
                                    alert.present();
                                  });
                              })
                          });
                        }
                      });
                  }
                }
              }
            ]
          });
          alert.present();
        }
        else {
          let alert = self.alertCtrl.create({
            title: 'Error ',
            subTitle: 'Barcode Not Found',
            buttons: ['OK']
          });
          alert.present();
        }

      });
  }
  doSavelistToPutaway() {
    this.api.get('table/putawaylist_temp_detail', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" } })
      .subscribe(val => {
        this.getputawaylist = val['data'];
        this.api.get('table/putaway', { params: { limit: 30, filter: "receiving_no=" + this.getputawaylist[0].receiving_no + " AND " + "location_position=" + "'" + this.myForm.value.rackno + "'" } })
          .subscribe(val => {
            this.putawayfound = val['data'];
            if (this.putawayfound.length == 0) {
              const headers = new HttpHeaders()
                .set("Content-Type", "application/json");
              this.api.get('nextno/putaway/putaway_no').subscribe(val => {
                this.nextno = val['nextno'];
                let date = moment().format('YYYY-MM-DD');
                this.api.post("table/putaway",
                  {
                    "putaway_no": this.nextno,
                    "receiving_no": this.getputawaylist[0].receiving_no,
                    "doc_no": this.getputawaylist[0].doc_no,
                    "order_no": this.getputawaylist[0].order_no,
                    "batch_no": this.getputawaylist[0].batch_no,
                    "item_no": this.getputawaylist[0].item_no,
                    "posting_date": date,
                    "location_code": this.getputawaylist[0].location_code,
                    "location_position": this.myForm.value.rackno,
                    "division": this.getputawaylist[0].division,
                    "qty": this.getputawaylist[0].qty,
                    "qty_receiving": this.getputawaylist[0].qty_receiving,
                    "unit": this.getputawaylist[0].unit,
                    "flag": '',
                    "pic": this.userid,
                    "status": 'OPEN',
                    "chronology_no": '',
                    "uuid": UUID.UUID()
                  },
                  { headers })
                  .subscribe(val => {
                    this.api.get('table/staging_in', { params: { limit: 30, filter: "receiving_no=" + "'" + this.getputawaylist[0].receiving_no + "'" } })
                      .subscribe(val => {
                        let data = val['data']
                        console.log(data, this.getputawaylist[0].qty)
                        const headers = new HttpHeaders()
                          .set("Content-Type", "application/json");
                        this.api.put("table/staging_in",
                          {
                            "staging_no": data[0].staging_no,
                            "qty_putaway": parseInt(data[0].qty_putaway) - parseInt(this.getputawaylist[0].qty)
                          },
                          { headers })
                          .subscribe(val => {
                            this.receiving = [];
                            this.halaman = 0;
                            this.getrcv()
                          });
                        let datatemp = data[0]
                        this.doPostStockBalanceInScan(datatemp)
                      })
                    const headers = new HttpHeaders()
                      .set("Content-Type", "application/json");
                    this.api.delete("table/putawaylist_temp_detail", { params: { filter: "putawaylisttemp_no=" + "'" + this.getputawaylist[0].putawaylisttemp_no + "'" }, headers })
                      .subscribe(val => {
                        this.putawayfound = [];
                        this.api.get('table/putawaylist_temp_detail', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" } })
                          .subscribe(val => {
                            this.getputawaylist = val['data'];
                            if (this.getputawaylist.length != 0) {
                              this.doSavelistToPutaway();
                            }
                            else {
                              let alert = this.alertCtrl.create({
                                title: 'Sukses ',
                                subTitle: 'Save Item To Rack Sukses',
                                buttons: ['OK']
                              });
                              this.myForm.reset()
                              alert.present();
                              this.getPutawayTempDetail();
                            }
                          });
                      })
                  });
              });
            }
            else {
              const headers = new HttpHeaders()
                .set("Content-Type", "application/json");
              let date = moment().format('YYYY-MM-DD');
              this.api.put("table/putaway",
                {
                  "putaway_no": this.putawayfound[0].putaway_no,
                  "qty": parseInt(this.putawayfound[0].qty) + parseInt(this.getputawaylist[0].qty)
                },
                { headers })
                .subscribe(val => {
                  this.api.get('table/staging_in', { params: { limit: 30, filter: "receiving_no=" + "'" + this.getputawaylist[0].receiving_no + "'" } })
                    .subscribe(val => {
                      let data = val['data']
                      console.log(data, this.getputawaylist[0].qty)
                      const headers = new HttpHeaders()
                        .set("Content-Type", "application/json");
                      this.api.put("table/staging_in",
                        {
                          "staging_no": data[0].staging_no,
                          "qty_putaway": parseInt(data[0].qty_putaway) - parseInt(this.getputawaylist[0].qty)
                        },
                        { headers })
                        .subscribe(val => {
                          this.receiving = [];
                          this.halaman = 0;
                          this.getrcv()
                        });
                      let datatemp = data[0]
                      this.doPostStockBalanceInMan(datatemp)
                    })
                  const headers = new HttpHeaders()
                    .set("Content-Type", "application/json");
                  this.api.delete("table/putawaylist_temp_detail", { params: { filter: "putawaylisttemp_no=" + "'" + this.getputawaylist[0].putawaylisttemp_no + "'" }, headers })
                    .subscribe(val => {
                      this.api.get('table/putawaylist_temp_detail', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" } })
                        .subscribe(val => {
                          this.getputawaylist = val['data'];
                          let alert = this.alertCtrl.create({
                            title: 'Sukses ',
                            subTitle: 'Save Item To Rack Sukses',
                            buttons: ['OK']
                          });
                          this.myForm.reset()
                          alert.present();
                          this.getPutawayTempDetail();
                        });
                    })
                });
            }
          });
      });
  }
  doSaveToPutaway() {
    this.api.get('table/putawaylist_temp_detail', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" } })
      .subscribe(val => {
        this.getputawaylist = val['data'];
        this.api.get('table/location_master', { params: { filter: "location_alocation=" + "'" + this.myForm.value.rackno + "'" } })
          .subscribe(val => {
            this.location = val['data'];
            if (this.getputawaylist.length == 0) {
              let alert = this.alertCtrl.create({
                title: 'Error ',
                subTitle: 'List Putway Must Be Fill',
                buttons: ['OK']
              });
              alert.present();
            }
            else if (this.myForm.value.rackno == '') {
              let alert = this.alertCtrl.create({
                title: 'Error ',
                subTitle: 'Rack Number Must Be Fill',
                buttons: ['OK']
              });
              alert.present();
            }
            else if (this.location.length == 0) {
              let alert = this.alertCtrl.create({
                title: 'Error ',
                subTitle: 'Rack Number Not Found',
                buttons: ['OK']
              });
              alert.present();
            }
            else {
              let alert = this.alertCtrl.create({
                title: 'Confirm Save',
                message: 'Do you want to Save this list?',
                buttons: [
                  {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {

                    }
                  },
                  {
                    text: 'Save',
                    handler: () => {
                      this.doSavelistToPutaway();
                    }
                  }
                ]
              });
              alert.present();
            }
          });

      });
  }
  doPutaway(rcv) {
    this.api.get('table/putaway', { params: { limit: 30, filter: "receiving_no=" + rcv.receiving_no } })
      .subscribe(val => {
        this.putaway = val['data'];
        /*this.totalqty = this.putaway.reduce(function (prev, cur) {
          return prev + cur.qty;
        }, 0);*/
        if (rcv.qty_putaway == 0) {
          let alert = this.alertCtrl.create({
            title: 'Error ',
            subTitle: 'Qty does not exist',
            buttons: ['OK']
          });
          alert.present();
        }
        else {
          //this.myFormModal.reset();
          this.myFormModal.get('location').setValue('')
          document.getElementById("myModal").style.display = "block";
          this.myFormModal.get('location').setValue(rcv.location)
          this.myFormModal.get('qty').setValue(rcv.qty_putaway)
          this.receivingno = rcv.receiving_no;
          this.docno = rcv.doc_no;
          this.orderno = rcv.order_no;
          this.batchno = rcv.batch_no;
          this.itemno = rcv.item_no;
          this.locationcode = '81003';
          this.position = rcv.position;
          this.divisionno = rcv.division;
          this.qty = rcv.qty_putaway;
          this.qtyreceiving = rcv.qty
          this.unit = rcv.unit;
          this.stagingno = rcv.staging
          console.log(rcv)
        }
      });

  }
  doUpdatePutaway(put) {
    //this.myFormModal.reset();
    document.getElementById("myModal").style.display = "block";
    this.myFormModal.get('location').setValue(put.staging)
    this.myFormModal.get('qty').setValue(put.qty_putaway)
    this.receivingno = put.receiving_no
    this.qtyprevious = put.qty_putaway
    this.putawayno = put.putaway_no
    this.qtyreceiving = put.qty
    this.stagingno = put.location_position
  }
  doOffPutaway() {
    //this.myFormModal.reset();
    document.getElementById("myModal").style.display = "none";
  }
  doOpenLocation() {
    this.location_master = [];
    return new Promise(resolve => {
      this.api.get('table/division', { params: { limit: 1000, sort: 'description ASC' } }).subscribe(val => {
        this.division = val['data'];
        this.divisioncode = this.division[14].description
        return new Promise(resolve => {
          this.api.get('table/location_master', { params: { limit: 1000, filter: 'division=' + "'" + this.division[14].code + "'" } }).subscribe(val => {
            this.location_master = val['data'];
            this.searchloc = this.location_master;
            document.getElementById("myLocations").style.display = "block";
            document.getElementById("myHeader").style.display = "none";
            resolve();
          })
        });
      });
    });
  }
  doOffLocations() {
    document.getElementById("myLocations").style.display = "none";
    document.getElementById("myHeader").style.display = "block";
    this.divdesc = '';
  }

  doSetLoc(div) {
    this.setdiv = div.code;
  }
  doLocation() {
    this.api.get('table/location_master', { params: { limit: 1000, filter: 'division=' + "'" + this.setdiv + "'" } }).subscribe(val => {
      this.location_master = val['data'];
      this.searchloc = this.location_master;
    });
  }
  doSelectLoc(locmst) {
    this.myFormModal.get('location').setValue(locmst.location_alocation);
    this.doOffLocations();
  }
  doInsertPutaway(data) {
    this.getNextNoStockBalance().subscribe(val => {
      let nextnostockbalance = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      let date = moment().format('YYYY-MM-DD');
      this.api.post("table/stock_balance",
        {
          "id": nextnostockbalance,
          "receiving_no": data[0].receiving_no,
          "batch_no": data[0].batch_no,
          "item_no": data[0].item_no,
          "qty_in": this.myFormModal.value.qty,
          "qty_out": 0,
          "location": '81003',
          "sub_location": this.myFormModal.value.location,
          "description": 'Putaway',
          "status": 'OPEN',
          "datetime": date,
          "uuid": UUID.UUID()
        },
        { headers })
        .subscribe(val => {

        }, err => {
          this.doInsertPutaway(data)
        })
    });
  }
  doSavePutaway() {
    console.log(this.stagingno, this.myFormModal.value.location)
    if (this.stagingno == this.myFormModal.value.location) {
      let alert = this.alertCtrl.create({
        title: 'Perhatian',
        subTitle: 'Lokasi tujuan tidak boleh sama dengan lokasi asal !!',
        buttons: ['OK']
      });
      alert.present();
    }
    else {
      this.api.get('table/putaway', { params: { limit: 30, filter: "receiving_no=" + "'" + this.receivingno + "'" } })
      .subscribe(val => {
        this.putaway = val['data'];
        this.api.get('table/staging_in', { params: { limit: 30, filter: "receiving_no=" + "'" + this.receivingno + "'" } })
        .subscribe(val => {
          let datastagingin = val['data']
          console.log(this.qty, datastagingin[0].qty_putaway)
          if (this.myFormModal.value.qty > datastagingin[0].qty_putaway) {
            let alert = this.alertCtrl.create({
              title: 'Error ',
              subTitle: 'Qty does not exist',
              buttons: ['OK']
            });
            alert.present();
            this.receivingno = '';
            this.qtyprevious = '';
            this.putawayno = '';
            this.doOffPutaway()
            this.receiving = [];
            this.halaman = 0;
            this.getrcv()
          }
          else {
            if (this.qtyprevious == '') {
              this.api.get('table/putaway', { params: { limit: 30, filter: "receiving_no=" + "'" + this.receivingno + "'" + " AND " + "location_position=" + "'" + this.myFormModal.value.location + "'" } })
                .subscribe(val => {
                  this.putawaylist = val['data'];
                  if (this.putawaylist.length != 0 && (this.putawaylist[0].location_position == this.myFormModal.value.location)) {
                    const headers = new HttpHeaders()
                      .set("Content-Type", "application/json");
                    let date = moment().format('YYYY-MM-DD');
                    this.api.put("table/putaway",
                      {
                        "putaway_no": this.putawaylist[0].putaway_no,
                        "qty": parseInt(this.putawaylist[0].qty) + parseInt(this.myFormModal.value.qty)
                      },
                      { headers })
                      .subscribe(val => {
                        this.api.get('table/staging_in', { params: { limit: 30, filter: "receiving_no=" + "'" + this.receivingno + "'" } })
                          .subscribe(val => {
                            let data = val['data']
                            console.log(data, this.myFormModal.value.qty)
                            const headers = new HttpHeaders()
                              .set("Content-Type", "application/json");
                            this.api.put("table/staging_in",
                              {
                                "staging_no": data[0].staging_no,
                                "qty_putaway": parseInt(data[0].qty_putaway) - parseInt(this.myFormModal.value.qty)
                              },
                              { headers })
                              .subscribe(val => {
                                this.receiving = [];
                                this.halaman = 0;
                                this.getrcv()
                              });
                            let datatemp = data[0]
                            this.doPostStockBalanceOut(datatemp, data)
                          })
                        this.api.get('table/putaway', { params: { limit: 30, filter: "receiving_no=" + this.receivingno } })
                          .subscribe(val => {
                            this.putaway = val['data'];
                            this.rcvlist = this.receivingno;
                            this.totaldataputaway = val['count'];
                            let alert = this.alertCtrl.create({
                              title: 'Sukses',
                              subTitle: 'Save Sukses',
                              buttons: ['OK']
                            });
                            alert.present();
                            this.doOffPutaway();
                            this.receivingno = '';
                            this.qtyprevious = '';
                          });
                      });
                  }
                  else {
                    const headers = new HttpHeaders()
                      .set("Content-Type", "application/json");
                    this.getNextNo().subscribe(val => {
                      this.nextno = val['nextno'];
                      let date = moment().format('YYYY-MM-DD');
                      this.api.post("table/putaway",
                        {
                          "putaway_no": this.nextno,
                          "receiving_no": this.receivingno,
                          "doc_no": this.docno,
                          "order_no": this.orderno,
                          "batch_no": this.batchno,
                          "item_no": this.itemno,
                          "posting_date": date,
                          "location_code": '81003',
                          "location_position": this.myFormModal.value.location,
                          "division": this.divisionno,
                          "qty": this.myFormModal.value.qty,
                          "qty_receiving": this.qtyreceiving,
                          "unit": this.unit,
                          "flag": '',
                          "pic": this.userid,
                          "status": 'OPEN',
                          "chronology_no": '',
                          "uuid": UUID.UUID()
                        },
                        { headers })
                        .subscribe(val => {
                          this.api.get('table/staging_in', { params: { limit: 30, filter: "receiving_no=" + "'" + this.receivingno + "'" } })
                            .subscribe(val => {
                              let data = val['data']
                              console.log(data, this.myFormModal.value.qty)
                              const headers = new HttpHeaders()
                                .set("Content-Type", "application/json");
                              this.api.put("table/staging_in",
                                {
                                  "staging_no": data[0].staging_no,
                                  "qty_putaway": parseInt(data[0].qty_putaway) - parseInt(this.myFormModal.value.qty)
                                },
                                { headers })
                                .subscribe(val => {
                                  this.receiving = [];
                                  this.halaman = 0;
                                  this.getrcv()
                                });
                              let datatemp = data[0]
                              this.doPostStockBalanceOut(datatemp, data)
                            })
                          this.api.get('table/putaway', { params: { limit: 30, filter: "receiving_no=" + this.receivingno } })
                            .subscribe(val => {
                              if (this.myFormModal.value.qty == this.qty) {
                                var position = this.myFormModal.value.location.substring(0, 2);
                                this.api.put("table/receiving",
                                  {
                                    "receiving_no": this.receivingno,
                                    "staging": 'RACK',
                                    "position": position
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    this.api.get('table/staging_in', { params: { limit: 30, filter: "qty_putaway!=0" } })
                                      .subscribe(val => {
                                        this.receiving = val['data'];
                                      });
                                  });
                              }
                              this.putaway = val['data'];
                              this.rcvlist = this.receivingno;
                              this.totaldataputaway = val['count'];
                              this.detailput = this.detailput ? false : true;
                              let alert = this.alertCtrl.create({
                                title: 'Sukses',
                                subTitle: 'Save Sukses',
                                buttons: ['OK']
                              });
                              alert.present();
                              this.doOffPutaway();
                              this.receivingno = '';
                              this.qtyprevious = '';
                            });
                        });
                    });
                  }
                });
            }
            else {
              if (((parseInt(this.totalqty) - parseInt(this.qtyprevious)) + parseInt(this.myFormModal.value.qty)) > parseInt(this.qtyreceiving)) {
                let alert = this.alertCtrl.create({
                  title: 'Error ',
                  subTitle: 'Qty does not exist',
                  buttons: ['OK']
                });
                alert.present();
              }
              else {
                const headers = new HttpHeaders()
                  .set("Content-Type", "application/json");
                this.api.put("table/putaway",
                  {
                    "putaway_no": this.putawayno,
                    "location_position": this.myFormModal.value.location,
                    "qty": this.myFormModal.value.qty
                  },
                  { headers })
                  .subscribe(val => {
                    this.api.get('table/staging_in', { params: { limit: 30, filter: "receiving_no=" + "'" + this.receivingno + "'" } })
                      .subscribe(val => {
                        let data = val['data']
                        console.log(data, this.myFormModal.value.qty)
                        const headers = new HttpHeaders()
                          .set("Content-Type", "application/json");
                        this.api.put("table/staging_in",
                          {
                            "staging_no": data[0].staging_no,
                            "qty_putaway": parseInt(data[0].qty_putaway) - parseInt(this.myFormModal.value.qty)
                          },
                          { headers })
                          .subscribe(val => {
                            this.receiving = [];
                            this.halaman = 0;
                            this.getrcv()
                          });
                        let datatemp = data[0]
                        this.doPostStockBalanceInMan(datatemp)
                      })
                    this.api.get('table/putaway', { params: { limit: 30, filter: "receiving_no=" + this.receivingno } })
                      .subscribe(val => {
                        this.putaway = val['data'];
                        this.rcvlist = this.receivingno;
                        this.totaldataputaway = val['count'];
                        let alert = this.alertCtrl.create({
                          title: 'Sukses',
                          subTitle: 'Save Sukses',
                          buttons: ['OK']
                        });
                        alert.present();
                        this.doOffPutaway();
                        this.receivingno = '';
                        this.qtyprevious = '';
                      });
                  });
              }
            }
  
          }
        });
      });
    }
  }
  doDeletePutawayList(putemp) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete  ' + putemp.item_no + ' ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'Delete',
          handler: () => {
            const headers = new HttpHeaders()
              .set("Content-Type", "application/json");

            this.api.delete("table/putawaylist_temp", { params: { filter: 'putawaylisttemp_no=' + "'" + putemp.putawaylisttemp_no + "'" }, headers })
              .subscribe(
                (val) => {
                  this.getPutawayTemp();
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
  doDeletePutawayListDetail(putemp) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete  ' + putemp.item_no + ' ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'Delete',
          handler: () => {
            this.api.get('table/putawaylist_temp', { params: { limit: 30, filter: "batch_no=" + "'" + putemp.batch_no + "'" + ' AND ' + "item_no=" + "'" + putemp.item_no + "' AND pic=" + "'" + this.userid + "'" } })
              .subscribe(val => {
                let movetemp = val['data']
                if (movetemp.length == 0) {
                  const headers = new HttpHeaders()
                    .set("Content-Type", "application/json");
                  this.getNextNoPUTemp().subscribe(val => {
                    let nextno = val['nextno'];
                    let datetime = moment().format('YYYY-MM-DD');
                    this.api.post("table/putawaylist_temp",
                      {
                        "putawaylisttemp_no": putemp.putawaylisttemp_no,
                        "receiving_no": putemp.receiving_no,
                        "doc_no": putemp.doc_no,
                        "order_no": putemp.order_no,
                        "batch_no": putemp.batch_no,
                        "item_no": putemp.item_no,
                        "posting_date": datetime,
                        "location_code": putemp.location_code,
                        "location_position": putemp.position,
                        "division": putemp.division,
                        "qty": putemp.qty,
                        "qty_receiving": putemp.qty_receiving,
                        "unit": putemp.unit,
                        "flag": '',
                        "pic": this.userid,
                        "status": 'OPEN',
                        "chronology_no": '',
                        "uuid": UUID.UUID()
                      },
                      { headers })
                      .subscribe(val => {
                        const headers = new HttpHeaders()
                          .set("Content-Type", "application/json");
                        this.api.delete("table/putawaylist_temp_detail", { params: { filter: 'putawaylisttemp_no=' + "'" + putemp.putawaylisttemp_no + "'" }, headers })
                          .subscribe(
                            (val) => {
                              this.getPutawayTemp();
                              this.getPutawayTempDetail();
                            });
                      })
                  });
                }
                else {
                  const headers = new HttpHeaders()
                    .set("Content-Type", "application/json");
                  let datetime = moment().format('YYYY-MM-DD HH:mm');
                  this.api.put("table/putawaylist_temp",
                    {
                      "putawaylisttemp_no": movetemp[0].putawaylisttemp_no,
                      "qty": parseInt(movetemp[0].qty) + parseInt(putemp.qty),
                      "status": 'OPEN',
                      "datetime": datetime,
                      "pic": this.userid
                    },
                    { headers })
                    .subscribe(val => {
                      const headers = new HttpHeaders()
                        .set("Content-Type", "application/json");
                      this.api.delete("table/putawaylist_temp_detail", { params: { filter: 'putawaylisttemp_no=' + "'" + putemp.putawaylisttemp_no + "'" }, headers })
                        .subscribe(
                          (val) => {
                            this.getPutawayTemp();
                            this.getPutawayTempDetail();
                          });
                    })
                }
              });
          }
        }
      ]
    });
    alert.present();
  }
  doScanBarcodeItem() {
    var self = this
    Honeywell.barcodeReaderPressSoftwareTrigger(function () {
      Honeywell.onBarcodeEvent(function (data) {
        let rackno = self.myForm.value.rackno
        var barcodeno = data.barcodeData;
        var batchno = barcodeno.substring(0, 4);
        var itemno = barcodeno.substring(4, 20);
        if (rackno == '') {
          let alert = self.alertCtrl.create({
            title: 'Error ',
            subTitle: 'Rack Number Must Be Fill',
            buttons: ['OK']
          });
          alert.present();
        }
        else {
          self.api.get('table/staging_in', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "'" + ' AND ' + "qty_putaway!=0 AND staging=" + "'" + rackno + "'" } })
            .subscribe(val => {
              self.receivingputawaylist = val['data'];
              if (self.receivingputawaylist.length != 0) {
                let alert = self.alertCtrl.create({
                  title: 'Qty',
                  inputs: [
                    {
                      name: 'qty',
                      placeholder: 'Qty'
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
                        if (self.receivingputawaylist[0].qty_putaway < data.qty) {
                          let alert = self.alertCtrl.create({
                            title: 'Error ',
                            subTitle: 'Qty does not exist',
                            buttons: ['OK']
                          });
                          alert.present();
                        }
                        else {
                          self.api.get('table/putawaylist_temp', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "'" } })
                            .subscribe(val => {
                              self.getputawaylist = val['data'];
                              if (self.getputawaylist.length) {
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                let date = moment().format('YYYY-MM-DD');
                                self.api.put("table/putawaylist_temp",
                                  {
                                    "putawaylisttemp_no": self.getputawaylist[0].putawaylisttemp_no,
                                    "qty": parseInt(self.getputawaylist[0].qty) + parseInt(data.qty),
                                    "date": date,
                                    "pic": self.userid
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    self.getPutawayTemp();
                                    self.myForm.get('barcodeno').setValue('')
                                    let alert = self.alertCtrl.create({
                                      title: 'Sukses ',
                                      subTitle: 'Update Item Sukses',
                                      buttons: ['OK']
                                    });
                                    alert.present();
                                  })
                              }
                              else {
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                self.getNextNoPUTemp().subscribe(val => {
                                  self.nextno = val['nextno'];
                                  let date = moment().format('YYYY-MM-DD');
                                  self.api.post("table/putawaylist_temp",
                                    {
                                      "putawaylisttemp_no": self.nextno,
                                      "receiving_no": self.receivingputawaylist[0].receiving_no,
                                      "doc_no": self.receivingputawaylist[0].doc_no,
                                      "order_no": self.receivingputawaylist[0].order_no,
                                      "batch_no": self.receivingputawaylist[0].batch_no,
                                      "item_no": self.receivingputawaylist[0].item_no,
                                      "posting_date": date,
                                      "location_code": self.receivingputawaylist[0].location_code,
                                      "location_position": self.receivingputawaylist[0].position,
                                      "division": self.receivingputawaylist[0].division,
                                      "qty": data.qty,
                                      "qty_receiving": self.receivingputawaylist[0].qty_receiving,
                                      "unit": self.receivingputawaylist[0].unit,
                                      "flag": '',
                                      "pic": self.userid,
                                      "status": 'OPEN',
                                      "chronology_no": '',
                                      "uuid": UUID.UUID()
                                    },
                                    { headers })
                                    .subscribe(val => {
                                      self.getPutawayTemp();
                                      self.myForm.get('barcodeno').setValue('')
                                      let alert = self.alertCtrl.create({
                                        title: 'Sukses ',
                                        subTitle: 'Add Item Sukses',
                                        buttons: ['OK']
                                      });
                                      alert.present();
                                    })
                                });
                              }
                            });
                        }
                      }
                    }
                  ]
                });
                alert.present();
              }
              else {
                let alert = self.alertCtrl.create({
                  title: 'Error ',
                  subTitle: 'Barcode Not Found',
                  buttons: ['OK']
                });
                alert.present();
              }

            });
        }
      }, function (reason) {
        alert(reason + '1');
      });
    }, function (reason) {
      self.barcodeScanner.scan().then(barcodeData => {
        let rackno = self.myForm.value.rackno
        var barcodeno = barcodeData.text;
        var batchno = barcodeno.substring(0, 4);
        var itemno = barcodeno.substring(4, 20);
        if (rackno == '') {
          let alert = self.alertCtrl.create({
            title: 'Error ',
            subTitle: 'Rack Number Must Be Fill',
            buttons: ['OK']
          });
          alert.present();
        }
        else {
          self.api.get('table/staging_in', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "'" + ' AND ' + "qty_putaway!=0 AND staging=" + "'" + rackno + "'" } })
            .subscribe(val => {
              self.receivingputawaylist = val['data'];
              if (self.receivingputawaylist.length != 0) {
                let alert = self.alertCtrl.create({
                  title: 'Qty',
                  inputs: [
                    {
                      name: 'qty',
                      placeholder: 'Qty'
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
                        if (self.receivingputawaylist[0].qty_putaway < data.qty) {
                          let alert = self.alertCtrl.create({
                            title: 'Error ',
                            subTitle: 'Qty does not exist',
                            buttons: ['OK']
                          });
                          alert.present();
                        }
                        else {
                          self.api.get('table/putawaylist_temp', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "'" } })
                            .subscribe(val => {
                              self.getputawaylist = val['data'];
                              if (self.getputawaylist.length) {
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                let date = moment().format('YYYY-MM-DD');
                                self.api.put("table/putawaylist_temp",
                                  {
                                    "putawaylisttemp_no": self.getputawaylist[0].putawaylisttemp_no,
                                    "qty": parseInt(self.getputawaylist[0].qty) + parseInt(data.qty),
                                    "date": date,
                                    "pic": self.userid
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    self.getPutawayTemp();
                                    self.myForm.get('barcodeno').setValue('')
                                    let alert = self.alertCtrl.create({
                                      title: 'Sukses ',
                                      subTitle: 'Update Item Sukses',
                                      buttons: ['OK']
                                    });
                                    alert.present();
                                  })
                              }
                              else {
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                self.getNextNoPUTemp().subscribe(val => {
                                  self.nextno = val['nextno'];
                                  let date = moment().format('YYYY-MM-DD');
                                  self.api.post("table/putawaylist_temp",
                                    {
                                      "putawaylisttemp_no": self.nextno,
                                      "receiving_no": self.receivingputawaylist[0].receiving_no,
                                      "doc_no": self.receivingputawaylist[0].doc_no,
                                      "order_no": self.receivingputawaylist[0].order_no,
                                      "batch_no": self.receivingputawaylist[0].batch_no,
                                      "item_no": self.receivingputawaylist[0].item_no,
                                      "posting_date": date,
                                      "location_code": self.receivingputawaylist[0].location_code,
                                      "location_position": self.receivingputawaylist[0].position,
                                      "division": self.receivingputawaylist[0].division,
                                      "qty": data.qty,
                                      "qty_receiving": self.receivingputawaylist[0].qty_receiving,
                                      "unit": self.receivingputawaylist[0].unit,
                                      "flag": '',
                                      "pic": self.userid,
                                      "status": 'OPEN',
                                      "chronology_no": '',
                                      "uuid": UUID.UUID()
                                    },
                                    { headers })
                                    .subscribe(val => {
                                      self.getPutawayTemp();
                                      self.myForm.get('barcodeno').setValue('')
                                      let alert = self.alertCtrl.create({
                                        title: 'Sukses ',
                                        subTitle: 'Add Item Sukses',
                                        buttons: ['OK']
                                      });
                                      alert.present();
                                    })
                                });
                              }
                            });
                        }
                      }
                    }
                  ]
                });
                alert.present();
              }
              else {
                let alert = self.alertCtrl.create({
                  title: 'Error ',
                  subTitle: 'Barcode Not Found',
                  buttons: ['OK']
                });
                alert.present();
              }

            });
        }
      }).catch(err => {
        console.log('Error', err);
      });
    }, {
        press: true
      });
  }
  doScanBarcodeItemDetail() {
    var self = this
    Honeywell.barcodeReaderPressSoftwareTrigger(function () {
      Honeywell.onBarcodeEvent(function (data) {
        var barcodeno = data.barcodeData;
        var batchno = barcodeno.substring(0, 4);
        var itemno = barcodeno.substring(4, 20);
        self.api.get('table/putawaylist_temp', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "' AND pic=" + "'" + self.userid + "'" } })
          .subscribe(val => {
            self.receivingputawaylist = val['data'];
            if (self.receivingputawaylist.length != 0) {
              let alert = self.alertCtrl.create({
                title: 'Qty',
                inputs: [
                  {
                    name: 'qty',
                    placeholder: 'Qty'
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
                      if (self.receivingputawaylist[0].qty < data.qty) {
                        let alert = self.alertCtrl.create({
                          title: 'Error ',
                          subTitle: 'Qty does not exist',
                          buttons: ['OK']
                        });
                        alert.present();
                      }
                      else {
                        self.api.get('table/putawaylist_temp_detail', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "' AND pic=" + "'" + self.userid + "'" } })
                          .subscribe(val => {
                            self.getputawaylist = val['data'];
                            if (self.getputawaylist.length) {
                              const headers = new HttpHeaders()
                                .set("Content-Type", "application/json");
                              let date = moment().format('YYYY-MM-DD');
                              self.api.put("table/putawaylist_temp_detail",
                                {
                                  "putawaylisttemp_no": self.getputawaylist[0].putawaylisttemp_no,
                                  "qty": parseInt(self.getputawaylist[0].qty) + parseInt(data.qty),
                                  "date": date,
                                  "pic": self.userid
                                },
                                { headers })
                                .subscribe(val => {
                                  const headers = new HttpHeaders()
                                    .set("Content-Type", "application/json");
                                  let date = moment().format('YYYY-MM-DD');
                                  self.api.put("table/putawaylist_temp",
                                    {
                                      "putawaylisttemp_no": self.receivingputawaylist[0].putawaylisttemp_no,
                                      "qty": parseInt(self.receivingputawaylist[0].qty) - parseInt(data.qty),
                                      "date": date,
                                      "pic": self.userid
                                    },
                                    { headers })
                                    .subscribe(val => {
                                      if (self.receivingputawaylist[0].qty == data.qty) {
                                        self.api.delete("table/putawaylist_temp", { params: { filter: 'putawaylisttemp_no=' + "'" + self.receivingputawaylist[0].putawaylisttemp_no + "'" }, headers })
                                          .subscribe(
                                            (val) => {
                                              self.getPutawayTemp();
                                              self.getPutawayTempDetail();
                                            });
                                      }
                                      self.getPutawayTemp();
                                      self.getPutawayTempDetail();
                                      self.myForm.get('barcodeno').setValue('')
                                      let alert = self.alertCtrl.create({
                                        title: 'Sukses ',
                                        subTitle: 'Update Item Sukses',
                                        buttons: ['OK']
                                      });
                                      alert.present();
                                    });
                                })
                            }
                            else {
                              const headers = new HttpHeaders()
                                .set("Content-Type", "application/json");
                              self.getNextNoPUTempDetail().subscribe(val => {
                                self.nextno = val['nextno'];
                                let date = moment().format('YYYY-MM-DD');
                                self.api.post("table/putawaylist_temp_detail",
                                  {
                                    "putawaylisttemp_no": self.nextno,
                                    "receiving_no": self.receivingputawaylist[0].receiving_no,
                                    "doc_no": self.receivingputawaylist[0].doc_no,
                                    "order_no": self.receivingputawaylist[0].order_no,
                                    "batch_no": self.receivingputawaylist[0].batch_no,
                                    "item_no": self.receivingputawaylist[0].item_no,
                                    "posting_date": date,
                                    "location_code": self.receivingputawaylist[0].location_code,
                                    "location_position": self.receivingputawaylist[0].location_position,
                                    "division": self.receivingputawaylist[0].division,
                                    "qty": data.qty,
                                    "qty_receiving": self.receivingputawaylist[0].qty_receiving,
                                    "unit": self.receivingputawaylist[0].unit,
                                    "flag": '',
                                    "pic": self.userid,
                                    "status": 'OPEN',
                                    "chronology_no": '',
                                    "uuid": UUID.UUID()
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    const headers = new HttpHeaders()
                                      .set("Content-Type", "application/json");
                                    let date = moment().format('YYYY-MM-DD');
                                    self.api.put("table/putawaylist_temp",
                                      {
                                        "putawaylisttemp_no": self.receivingputawaylist[0].putawaylisttemp_no,
                                        "qty": parseInt(self.receivingputawaylist[0].qty) - parseInt(data.qty),
                                        "date": date,
                                        "pic": self.userid
                                      },
                                      { headers })
                                      .subscribe(val => {
                                        if (self.receivingputawaylist[0].qty == data.qty) {
                                          self.api.delete("table/putawaylist_temp", { params: { filter: 'putawaylisttemp_no=' + "'" + self.receivingputawaylist[0].putawaylisttemp_no + "'" }, headers })
                                            .subscribe(
                                              (val) => {
                                                self.getPutawayTemp();
                                                self.getPutawayTempDetail();
                                              });
                                        }
                                        self.getPutawayTemp();
                                        self.getPutawayTempDetail();
                                        self.myForm.get('barcodeno').setValue('')
                                        let alert = self.alertCtrl.create({
                                          title: 'Sukses ',
                                          subTitle: 'Add Item Sukses',
                                          buttons: ['OK']
                                        });
                                        alert.present();
                                      });
                                  })
                              });
                            }
                          });
                      }
                    }
                  }
                ]
              });
              alert.present();
            }
            else {
              let alert = self.alertCtrl.create({
                title: 'Error ',
                subTitle: 'Barcode Not Found',
                buttons: ['OK']
              });
              alert.present();
            }

          });
      }, function (reason) {
        alert(reason + '1');
      });
    }, function (reason) {
      self.barcodeScanner.scan().then(barcodeData => {
        var barcodeno = barcodeData.text;
        var batchno = barcodeno.substring(0, 4);
        var itemno = barcodeno.substring(4, 20);
        self.api.get('table/putawaylist_temp', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "' AND pic=" + "'" + self.userid + "'" } })
          .subscribe(val => {
            self.receivingputawaylist = val['data'];
            if (self.receivingputawaylist.length != 0) {
              let alert = self.alertCtrl.create({
                title: 'Qty',
                inputs: [
                  {
                    name: 'qty',
                    placeholder: 'Qty'
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
                      if (self.receivingputawaylist[0].qty < data.qty) {
                        let alert = self.alertCtrl.create({
                          title: 'Error ',
                          subTitle: 'Qty does not exist',
                          buttons: ['OK']
                        });
                        alert.present();
                      }
                      else {
                        self.api.get('table/putawaylist_temp_detail', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "' AND pic=" + "'" + self.userid + "'" } })
                          .subscribe(val => {
                            self.getputawaylist = val['data'];
                            if (self.getputawaylist.length) {
                              const headers = new HttpHeaders()
                                .set("Content-Type", "application/json");
                              let date = moment().format('YYYY-MM-DD');
                              self.api.put("table/putawaylist_temp_detail",
                                {
                                  "putawaylisttemp_no": self.getputawaylist[0].putawaylisttemp_no,
                                  "qty": parseInt(self.getputawaylist[0].qty) + parseInt(data.qty),
                                  "date": date,
                                  "pic": self.userid
                                },
                                { headers })
                                .subscribe(val => {
                                  const headers = new HttpHeaders()
                                    .set("Content-Type", "application/json");
                                  let date = moment().format('YYYY-MM-DD');
                                  self.api.put("table/putawaylist_temp",
                                    {
                                      "putawaylisttemp_no": self.receivingputawaylist[0].putawaylisttemp_no,
                                      "qty": parseInt(self.receivingputawaylist[0].qty) - parseInt(data.qty),
                                      "date": date,
                                      "pic": self.userid
                                    },
                                    { headers })
                                    .subscribe(val => {
                                      if (self.receivingputawaylist[0].qty == data.qty) {
                                        self.api.delete("table/putawaylist_temp", { params: { filter: 'putawaylisttemp_no=' + "'" + self.receivingputawaylist[0].putawaylisttemp_no + "'" }, headers })
                                          .subscribe(
                                            (val) => {
                                              self.getPutawayTemp();
                                              self.getPutawayTempDetail();
                                            });
                                      }
                                      self.getPutawayTemp();
                                      self.getPutawayTempDetail();
                                      self.myForm.get('barcodeno').setValue('')
                                      let alert = self.alertCtrl.create({
                                        title: 'Sukses ',
                                        subTitle: 'Update Item Sukses',
                                        buttons: ['OK']
                                      });
                                      alert.present();
                                    });
                                })
                            }
                            else {
                              const headers = new HttpHeaders()
                                .set("Content-Type", "application/json");
                              self.getNextNoPUTempDetail().subscribe(val => {
                                self.nextno = val['nextno'];
                                let date = moment().format('YYYY-MM-DD');
                                self.api.post("table/putawaylist_temp_detail",
                                  {
                                    "putawaylisttemp_no": self.nextno,
                                    "receiving_no": self.receivingputawaylist[0].receiving_no,
                                    "doc_no": self.receivingputawaylist[0].doc_no,
                                    "order_no": self.receivingputawaylist[0].order_no,
                                    "batch_no": self.receivingputawaylist[0].batch_no,
                                    "item_no": self.receivingputawaylist[0].item_no,
                                    "posting_date": date,
                                    "location_code": self.receivingputawaylist[0].location_code,
                                    "location_position": self.receivingputawaylist[0].location_position,
                                    "division": self.receivingputawaylist[0].division,
                                    "qty": data.qty,
                                    "qty_receiving": self.receivingputawaylist[0].qty_receiving,
                                    "unit": self.receivingputawaylist[0].unit,
                                    "flag": '',
                                    "pic": self.userid,
                                    "status": 'OPEN',
                                    "chronology_no": '',
                                    "uuid": UUID.UUID()
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    const headers = new HttpHeaders()
                                      .set("Content-Type", "application/json");
                                    let date = moment().format('YYYY-MM-DD');
                                    self.api.put("table/putawaylist_temp",
                                      {
                                        "putawaylisttemp_no": self.receivingputawaylist[0].putawaylisttemp_no,
                                        "qty": parseInt(self.receivingputawaylist[0].qty) - parseInt(data.qty),
                                        "date": date,
                                        "pic": self.userid
                                      },
                                      { headers })
                                      .subscribe(val => {
                                        if (self.receivingputawaylist[0].qty == data.qty) {
                                          self.api.delete("table/putawaylist_temp", { params: { filter: 'putawaylisttemp_no=' + "'" + self.receivingputawaylist[0].putawaylisttemp_no + "'" }, headers })
                                            .subscribe(
                                              (val) => {
                                                self.getPutawayTemp();
                                                self.getPutawayTempDetail();
                                              });
                                        }
                                        self.getPutawayTemp();
                                        self.getPutawayTempDetail();
                                        self.myForm.get('barcodeno').setValue('')
                                        let alert = self.alertCtrl.create({
                                          title: 'Sukses ',
                                          subTitle: 'Add Item Sukses',
                                          buttons: ['OK']
                                        });
                                        alert.present();
                                      });
                                  })
                              });
                            }
                          });
                      }
                    }
                  }
                ]
              });
              alert.present();
            }
            else {
              let alert = self.alertCtrl.create({
                title: 'Error ',
                subTitle: 'Barcode Not Found',
                buttons: ['OK']
              });
              alert.present();
            }

          });
      }).catch(err => {
        console.log('Error', err);
      });
    }, {
        press: true
      });
  }
  doScanBarcodeRack() {
    var self = this
    Honeywell.barcodeReaderPressSoftwareTrigger(function () {
      Honeywell.onBarcodeEvent(function (data) {
        var barcodeno = data.barcodeData.substring(0, 12);
        self.myForm.get('rackno').setValue(barcodeno)
      }, function (reason) {
        alert(reason + '1');
      });
    }, function (reason) {
      self.barcodeScanner.scan().then(barcodeData => {
        var barcodeno = barcodeData.text.substring(0, 12);
        self.myForm.get('rackno').setValue(barcodeno)
      }).catch(err => {
        console.log('Error', err);
      });
    }, {
        press: true
      });
  }
  getPutawayTemp() {
    this.api.get('table/putawaylist_temp', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" } })
      .subscribe(val => {
        this.putawaytemp = val['data'];
      });
  }
  getPutawayTempDetail() {
    this.api.get('table/putawaylist_temp_detail', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" } })
      .subscribe(val => {
        this.putawaytempdetail = val['data'];
      });
  }
  getNextNo() {
    return this.api.get('nextno/putaway/putaway_no')
  }
  getNextNoPUTemp() {
    return this.api.get('nextno/putawaylist_temp/putawaylisttemp_no')
  }
  getNextNoPUTempDetail() {
    return this.api.get('nextno/putawaylist_temp_detail/putawaylisttemp_no')
  }
  doSortPUT(filter) {
    if (this.sortPUT == 'ASC') {
      this.sortPUT = 'DESC'
    }
    else {
      this.sortPUT = 'ASC'
    }
    this.api.get("table/putaway", { params: { filter: "status='OPEN'", sort: filter + " " + this.sortPUT + " " } }).subscribe(val => {
      this.listputaway = val['data'];
      this.totaldatalistputaway = val['count'];
      this.filter = filter
    });
  }
  doSortPUTDetail(filter, listpu) {

  }
  getNextNoStockBalance() {
    return this.api.get('nextno/stock_balance/id')
  }
  doPostStockBalanceInScan(datatemp) {
    this.getNextNoStockBalance().subscribe(val => {
      let nextnostockbalance = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      let date = moment().format('YYYY-MM-DD');
      this.api.post("table/stock_balance",
        {
          "id": nextnostockbalance,
          "receiving_no": datatemp.receiving_no,
          "batch_no": datatemp.batch_no,
          "item_no": datatemp.item_no,
          "qty_in": this.myFormModal.value.qty,
          "qty_out": 0,
          "location": '81003',
          "sub_location": this.myForm.value.rackno,
          "description": 'Putaway',
          "status": 'OPEN',
          "datetime": date,
          "uuid": UUID.UUID()
        },
        { headers })
        .subscribe(val => {
          let cek = datatemp
          this.doGetStockPlus(cek)
        }, err => {
          this.doPostStockBalanceInScan(datatemp)
        })
    }, err => {
      this.doPostStockBalanceInScan(datatemp)
    });
  }
  doPostStockBalanceInMan(datatemp) {
    this.getNextNoStockBalance().subscribe(val => {
      this.nextnostockbalance = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      let date = moment().format('YYYY-MM-DD');
      this.api.post("table/stock_balance",
        {
          "id": this.nextnostockbalance,
          "receiving_no": datatemp.receiving_no,
          "batch_no": datatemp.batch_no,
          "item_no": datatemp.item_no,
          "qty_in": this.myFormModal.value.qty,
          "qty_out": 0,
          "location": '81003',
          "sub_location": this.myFormModal.value.location,
          "description": 'Putaway',
          "status": 'OPEN',
          "datetime": date,
          "uuid": UUID.UUID()
        },
        { headers })
        .subscribe(val => {
          let cek = datatemp
          this.doGetStockPlus(cek)
        }, err => {
          this.doPostStockBalanceInMan(datatemp)
        });
    }, err => {
      this.doPostStockBalanceInMan(datatemp)
    });
  }
  doPostStockBalanceOut(datatemp, data) {
    this.getNextNoStockBalance().subscribe(val => {
      let nextnostockbalance = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      let date = moment().format('YYYY-MM-DD');
      this.api.post("table/stock_balance",
        {
          "id": nextnostockbalance,
          "receiving_no": datatemp.receiving_no,
          "batch_no": datatemp.batch_no,
          "item_no": datatemp.item_no,
          "qty_in": 0,
          "qty_out": this.myFormModal.value.qty,
          "location": '81003',
          "sub_location": datatemp.staging,
          "description": 'Staging In',
          "status": 'OPEN',
          "datetime": date,
          "uuid": UUID.UUID()
        },
        { headers })
        .subscribe(val => {
          let cek = datatemp
          this.doGetStockMin(cek)
          this.doInsertPutaway(data)
        }, err => {
          this.doPostStockBalanceOut(datatemp, data)
        })
    }, err => {
      this.doPostStockBalanceOut(datatemp, data)
    });
  }
  getNextNoStock() {
    return this.api.get('nextno/stock/id')
  }
  doGetStockPlus(cek) {
    this.api.get('table/stock', { params: { limit: 30, filter: "batch_no=" + "'" + cek.batch_no + "' AND item_no=" + "'" + cek.item_no + "' AND location=" + "'81003' AND sub_location=" + "'" + this.myFormModal.value.location + "'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length == 0) {
          this.doPostStock(cek)
        }
        else {
          let datastock = data[0]
          this.doPutStockPlus(cek, datastock)
        }
      }, err => {
        this.doGetStockPlus(cek)
      });
  }
  doPostStock(cek) {
    this.getNextNoStock().subscribe(val => {
      let nextnostock = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      let date = moment().format('YYYY-MM-DD');
      this.api.post("table/stock",
        {
          "id": nextnostock,
          "batch_no": cek.batch_no,
          "item_no": cek.item_no,
          "qty": this.myFormModal.value.qty,
          "location": '81003',
          "sub_location": this.myFormModal.value.location,
          "datetime": date,
          "uuid": UUID.UUID()
        },
        { headers })
        .subscribe(val => {
        }, err => {
          this.doPostStock(cek)
        })
    }, err => {
      this.doPostStock(cek)
    });
  }
  doPutStockPlus(cek, datastock) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let date = moment().format('YYYY-MM-DD');
    this.api.put("table/stock",
      {
        "id": datastock.id,
        "batch_no": cek.batch_no,
        "item_no": cek.item_no,
        "qty": parseInt(datastock.qty) + parseInt(this.myFormModal.value.qty),
        "location": '81003',
        "sub_location": this.myFormModal.value.location,
        "datetime": date,
        "uuid": UUID.UUID()
      },
      { headers })
      .subscribe(val => {
      }, err => {
        this.doPutStockPlus(cek, datastock)
      })
  }
  doGetStockMin(cek) {
    this.api.get('table/stock', { params: { limit: 30, filter: "batch_no=" + "'" + cek.batch_no + "' AND item_no=" + "'" + cek.item_no + "' AND location=" + "'81003' AND sub_location=" + "'" + cek.staging + "'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length != 0) {
          let datastock = data[0]
          this.doPutStockMin(cek, datastock)
        }
      }, err => {
        this.doGetStockMin(cek)
      });
  }
  doPutStockMin(cek, datastock) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let date = moment().format('YYYY-MM-DD');
    this.api.put("table/stock",
      {
        "id": datastock.id,
        "batch_no": cek.batch_no,
        "item_no": cek.item_no,
        "qty": parseInt(datastock.qty) - parseInt(this.myFormModal.value.qty),
        "location": '81003',
        "sub_location": cek.staging,
        "datetime": date,
        "uuid": UUID.UUID()
      },
      { headers })
      .subscribe(val => {
        this.doGetStockPlus(cek)
      }, err => {
        this.doPutStockMin(cek, datastock)
      })
  }
}
