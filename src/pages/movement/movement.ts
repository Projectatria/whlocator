import { Component, trigger } from '@angular/core';
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
  selector: 'page-movement',
  templateUrl: 'movement.html',
})
export class MovementPage {
  myForm: FormGroup;
  private receiving = [];
  private putawaylist = [];
  private location = [];
  private putaway = [];
  private movementtemp = [];
  private getmovementlist = [];
  public buttonText: string;
  public loading: boolean;
  public detailput: boolean = false;
  option: BarcodeScannerOptions;
  data = {};
  rackno = '';
  barcodeno = '';
  private nextno = '';
  public totalqty: any;
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
  totaldataputaway: any;
  private token: any;
  public loader: any;
  public movementtempdetail = [];
  public userid: any;
  public name: any;
  public role = [];
  public roleid: any;
  public rolecab: any;

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
    public loadingCtrl: LoadingController) {
    this.loader = this.loadingCtrl.create({
      // cssClass: 'transparent',
      content: 'Loading Content...'
    });
    this.loader.present();
    this.myForm = formBuilder.group({
      rackno: ['', Validators.compose([Validators.required])],
      barcodeno: [''],
    })
    this.storage.get('token').then((val) => {
      this.token = val;
    });
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
      this.getMovementTemp()
      this.getMovementTempDetail()
    });
  }
  ngAfterViewInit() {
    this.loader.dismiss();
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
    })

  }
  ionViewDidLoad() {
  }
  doOpenQty() {
    let rackno = this.myForm.value.rackno
    let barcodeno = this.myForm.value.barcodeno
    var batchno = barcodeno.substring(0, 4);
    var itemno = barcodeno.substring(4, 20);
    if (rackno == '') {
      let alert = this.alertCtrl.create({
        title: 'Error ',
        subTitle: 'Rack Number Must Be Fill',
        buttons: ['OK']
      });
      alert.present();
    }
    else {
      this.api.get('table/stock_balance', { params: { limit: 100, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "'" + ' AND ' + "status='OPEN' AND sub_location=" + "'" + rackno + "'" } })
        .subscribe(val => {
          this.putawaylist = val['data'];
          var stockin = 0;
          var stockout = 0;
          var stock = 0;
          for (let i = 0; i < this.putawaylist.length; i++) {
            if (this.putawaylist[i].qty_in != 0) {
              stockin = stockin + this.putawaylist[i].qty_in
            }
            if (this.putawaylist[i].qty_out != 0) {
              stockout = stockout + this.putawaylist[i].qty_out
            }
          }
          stock = stockin - stockout
          if (this.putawaylist.length) {
            let alert = this.alertCtrl.create({
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
                    if (data.qty > stock) {
                      let alert = this.alertCtrl.create({
                        title: 'Error ',
                        subTitle: 'Qty Input Greater than Qty Stock',
                        buttons: ['OK']
                      });
                      alert.present();
                    }
                    else {
                      this.api.get('table/movement_temp', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "' AND pic=" + "'" + this.userid + "'" } })
                        .subscribe(val => {
                          this.getmovementlist = val['data'];
                          if (this.getmovementlist.length) {
                            const headers = new HttpHeaders()
                              .set("Content-Type", "application/json");
                            let datetime = moment().format('YYYY-MM-DD HH:mm');
                            this.api.put("table/movement_temp",
                              {
                                "movementtemp_no": this.getmovementlist[0].movementtemp_no,
                                "qty": parseInt(this.getmovementlist[0].qty) + parseInt(data.qty),
                                "datetime": datetime
                              },
                              { headers })
                              .subscribe(val => {
                                this.getMovementTemp();
                                this.myForm.get('rackno').setValue('');
                                this.myForm.get('barcodeno').setValue('');
                                let alert = this.alertCtrl.create({
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
                            this.getNextNoPUTemp().subscribe(val => {
                              this.nextno = val['nextno'];
                              let datetime = moment().format('YYYY-MM-DD HH:mm');
                              this.api.post("table/movement_temp",
                                {
                                  "movementtemp_no": this.nextno,
                                  "receiving_no": this.putawaylist[0].receiving_no,
                                  "batch_no": this.putawaylist[0].batch_no,
                                  "item_no": this.putawaylist[0].item_no,
                                  "qty": data.qty,
                                  "location_code": this.putawaylist[0].location,
                                  "location_previous_position": this.putawaylist[0].sub_location,
                                  "location_current_position": '',
                                  "status": 'OPEN',
                                  "datetime": datetime,
                                  "pic": this.userid,
                                  "uuid": UUID.UUID()
                                },
                                { headers })
                                .subscribe(val => {
                                  this.getMovementTemp();
                                  this.myForm.get('rackno').setValue('');
                                  this.myForm.get('barcodeno').setValue('');
                                  let alert = this.alertCtrl.create({
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
            let alert = this.alertCtrl.create({
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
    let rackno = this.myForm.value.rackno
    let barcodeno = this.myForm.value.barcodeno
    var batchno = barcodeno.substring(0, 4);
    var itemno = barcodeno.substring(4, 20);
    self.api.get('table/movement_temp', { params: { limit: 100, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "'" + ' AND ' + "pic=" + "'" + self.userid + "'" } })
      .subscribe(val => {
        let putawaylist = val['data'];
        if (putawaylist.length) {
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
                  if (putawaylist[0].qty < data.qty) {
                    let alert = self.alertCtrl.create({
                      title: 'Error ',
                      subTitle: 'Qty does not exist',
                      buttons: ['OK']
                    });
                    alert.present();
                  }
                  else {
                    self.api.get('table/movement_temp_detail', { params: { limit: 30, filter: "pic=" + "'" + self.userid + "' AND batch_no=" + "'" + putawaylist[0].batch_no + "' AND item_no=" + "'" + putawaylist[0].item_no + "'" } })
                      .subscribe(val => {
                        let movetempdetail = val['data']
                        if (movetempdetail.length == 0) {
                          const headers = new HttpHeaders()
                            .set("Content-Type", "application/json");
                          self.getNextNoPUTempDetail().subscribe(val => {
                            let nextno = val['nextno'];
                            let datetime = moment().format('YYYY-MM-DD HH:mm');
                            self.api.post("table/movement_temp_detail",
                              {
                                "movementtemp_no": nextno,
                                "receiving_no": putawaylist[0].receiving_no,
                                "batch_no": putawaylist[0].batch_no,
                                "item_no": putawaylist[0].item_no,
                                "qty": data.qty,
                                "location_code": putawaylist[0].location_code,
                                "location_previous_position": putawaylist[0].location_previous_position,
                                "location_current_position": putawaylist[0].location_current_position,
                                "status": 'OPEN',
                                "datetime": datetime,
                                "pic": self.userid,
                                "uuid": UUID.UUID()
                              },
                              { headers })
                              .subscribe(val => {
                                self.api.put("table/movement_temp",
                                  {
                                    "movementtemp_no": putawaylist[0].movementtemp_no,
                                    "qty": putawaylist[0].qty - data.qty
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    if (putawaylist[0].qty == data.qty) {
                                      self.api.delete("table/movement_temp", { params: { filter: 'movementtemp_no=' + "'" + putawaylist[0].movementtemp_no + "'" }, headers })
                                        .subscribe(
                                          (val) => {
                                            self.getMovementTemp()
                                            self.getMovementTempDetail()
                                          }, err => {
                                            self.api.delete("table/movement_temp", { params: { filter: 'movementtemp_no=' + "'" + putawaylist[0].movementtemp_no + "'" }, headers })
                                              .subscribe(
                                                (val) => {
                                                  self.getMovementTemp()
                                                  self.getMovementTempDetail()
                                                }, err => {

                                                });
                                          });
                                    }
                                    self.getMovementTemp()
                                    self.getMovementTempDetail()
                                    let alert = self.alertCtrl.create({
                                      title: 'Sukses ',
                                      subTitle: 'Add Item Sukses',
                                      buttons: ['OK']
                                    });
                                    alert.present();
                                  });
                              });
                          });
                        }
                        else {
                          const headers = new HttpHeaders()
                            .set("Content-Type", "application/json");
                          let datetime = moment().format('YYYY-MM-DD HH:mm');
                          self.api.put("table/movement_temp_detail",
                            {
                              "movementtemp_no": movetempdetail[0].movementtemp_no,
                              "qty": parseInt(movetempdetail[0].qty) + parseInt(data.qty),
                              "datetime": datetime
                            },
                            { headers })
                            .subscribe(val => {
                              self.api.put("table/movement_temp",
                                {
                                  "movementtemp_no": putawaylist[0].movementtemp_no,
                                  "qty": putawaylist[0].qty - data.qty
                                },
                                { headers })
                                .subscribe(val => {
                                  if (putawaylist[0].qty == data.qty) {
                                    self.api.delete("table/movement_temp", { params: { filter: 'movementtemp_no=' + "'" + putawaylist[0].movementtemp_no + "'" }, headers })
                                      .subscribe(
                                        (val) => {
                                          self.getMovementTemp()
                                          self.getMovementTempDetail()
                                        }, err => {
                                          self.api.delete("table/movement_temp", { params: { filter: 'movementtemp_no=' + "'" + putawaylist[0].movementtemp_no + "'" }, headers })
                                            .subscribe(
                                              (val) => {
                                                self.getMovementTemp()
                                                self.getMovementTempDetail()
                                              }, err => {

                                              });
                                        });
                                  }
                                  self.getMovementTemp()
                                  self.getMovementTempDetail()
                                  let alert = self.alertCtrl.create({
                                    title: 'Sukses ',
                                    subTitle: 'Add Item Sukses',
                                    buttons: ['OK']
                                  });
                                  alert.present();
                                });
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
            subTitle: 'Item Not Found',
            buttons: ['OK']
          });
          alert.present();
        }

      });
  }
  getNextNoStockBalance() {
    return this.api.get('nextno/stock_balance/id')
  }
  doInsertPutaway(cek) {
    this.getNextNoStockBalance().subscribe(val => {
      let nextnostockbalance = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      let date = moment().format('YYYY-MM-DD');
      this.api.post("table/stock_balance",
        {
          "id": nextnostockbalance,
          "receiving_no": cek.receiving_no,
          "batch_no": cek.batch_no,
          "item_no": cek.item_no,
          "qty_in": cek.qty,
          "qty_out": 0,
          "location": cek.location_code,
          "sub_location": this.myForm.value.rackno,
          "description": 'Putaway',
          "status": 'OPEN',
          "datetime": date,
          "uuid": UUID.UUID()
        },
        { headers })
        .subscribe(val => {
        }, err => {
          this.doInsertPutaway(cek)
        })
    });
  }
  doSaveToMovement() {
    this.api.get('table/movement_temp_detail', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" } })
      .subscribe(val => {
        this.getmovementlist = val['data'];
        this.api.get('table/location_master', { params: { limit: 30, filter: "location_alocation=" + "'" + this.myForm.value.rackno + "'" } })
          .subscribe(val => {
            this.location = val['data'];
            if (this.getmovementlist.length == 0) {
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
                      this.api.get('table/movement_temp_detail', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" } })
                        .subscribe(val => {
                          this.getmovementlist = val['data'];
                          for (let i = 0; i < this.getmovementlist.length; i++) {
                            let cek = this.getmovementlist[i]
                            this.doPostStockBalance(cek)
                          }
                        });
                    }
                  }
                ]
              });
              alert.present();
            }
          });

      });
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

            this.api.delete("table/movement_temp", { params: { filter: 'movementtemp_no=' + "'" + putemp.movementtemp_no + "'" }, headers })
              .subscribe(
                (val) => {
                  this.getMovementTemp();
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
            this.api.get('table/movement_temp', { params: { limit: 30, filter: "batch_no=" + "'" + putemp.batch_no + "'" + ' AND ' + "item_no=" + "'" + putemp.item_no + "' AND pic=" + "'" + this.userid + "'" } })
              .subscribe(val => {
                let movetemp = val['data']
                if (movetemp.length == 0) {
                  const headers = new HttpHeaders()
                    .set("Content-Type", "application/json");
                  this.getNextNoPUTemp().subscribe(val => {
                    let nextno = val['nextno'];
                    let datetime = moment().format('YYYY-MM-DD HH:mm');
                    this.api.post("table/movement_temp",
                      {
                        "movementtemp_no": nextno,
                        "receiving_no": putemp.receiving_no,
                        "batch_no": putemp.batch_no,
                        "item_no": putemp.item_no,
                        "location_code": putemp.location,
                        "location_previous_position": putemp.sub_location,
                        "location_current_position": "",
                        "qty": putemp.qty,
                        "status": 'OPEN',
                        "datetime": datetime,
                        "pic": this.userid,
                        "uuid": UUID.UUID()
                      },
                      { headers })
                      .subscribe(val => {
                        const headers = new HttpHeaders()
                          .set("Content-Type", "application/json");
                        this.api.delete("table/movement_temp_detail", { params: { filter: 'movementtemp_no=' + "'" + putemp.movementtemp_no + "'" }, headers })
                          .subscribe(
                            (val) => {
                              this.getMovementTemp();
                              this.getMovementTempDetail();
                            });
                      })
                  });
                }
                else {
                  const headers = new HttpHeaders()
                    .set("Content-Type", "application/json");
                  let datetime = moment().format('YYYY-MM-DD HH:mm');
                  this.api.put("table/movement_temp",
                    {
                      "movementtemp_no": movetemp[0].movementtemp_no,
                      "qty": parseInt(movetemp[0].qty) + parseInt(putemp.qty),
                      "status": 'OPEN',
                      "datetime": datetime,
                      "pic": this.userid
                    },
                    { headers })
                    .subscribe(val => {
                      const headers = new HttpHeaders()
                        .set("Content-Type", "application/json");
                      this.api.delete("table/movement_temp_detail", { params: { filter: 'movementtemp_no=' + "'" + putemp.movementtemp_no + "'" }, headers })
                        .subscribe(
                          (val) => {
                            this.getMovementTemp();
                            this.getMovementTempDetail();
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
          self.api.get('table/stock_balance', { params: { limit: 100, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "'" + ' AND ' + "status='OPEN' AND sub_location=" + "'" + rackno + "'" } })
            .subscribe(val => {
              self.putawaylist = val['data'];
              var stockin = 0;
              var stockout = 0;
              var stock = 0;
              for (let i = 0; i < self.putawaylist.length; i++) {
                if (self.putawaylist[i].qty_in != 0) {
                  stockin = stockin + self.putawaylist[i].qty_in
                }
                if (self.putawaylist[i].qty_out != 0) {
                  stockout = stockout + self.putawaylist[i].qty_out
                }
              }
              stock = stockin - stockout
              if (self.putawaylist.length) {
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
                        if (data.qty > stock) {
                          let alert = self.alertCtrl.create({
                            title: 'Error ',
                            subTitle: 'Qty Input Greater than Qty Stock',
                            buttons: ['OK']
                          });
                          alert.present();
                        }
                        else {
                          let rackno = self.myForm.value.rackno
                          var batchno = barcodeno.substring(0, 4);
                          var itemno = barcodeno.substring(4, 20);
                          self.api.get('table/movement_temp', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "' AND pic=" + "'" + self.userid + "'" } })
                            .subscribe(val => {
                              self.getmovementlist = val['data'];
                              if (self.getmovementlist.length) {
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                let datetime = moment().format('YYYY-MM-DD HH:mm');
                                self.api.put("table/movement_temp",
                                  {
                                    "movementtemp_no": self.getmovementlist[0].movementtemp_no,
                                    "qty": parseInt(self.getmovementlist[0].qty) + parseInt(data.qty),
                                    "datetime": datetime,
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    self.getMovementTemp();
                                    self.myForm.get('rackno').setValue('');
                                    self.myForm.get('barcodeno').setValue('');
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
                                  let datetime = moment().format('YYYY-MM-DD HH:mm');
                                  self.api.post("table/movement_temp",
                                    {
                                      "movementtemp_no": self.nextno,
                                      "receiving_no": self.putawaylist[0].receiving_no,
                                      "batch_no": self.putawaylist[0].batch_no,
                                      "item_no": self.putawaylist[0].item_no,
                                      "location_code": self.putawaylist[0].location,
                                      "location_previous_position": self.putawaylist[0].sub_location,
                                      "location_current_position": self.myForm.value.rackno,
                                      "qty": data.qty,
                                      "status": 'OPEN',
                                      "datetime": datetime,
                                      "pic": self.userid,
                                      "uuid": UUID.UUID()
                                    },
                                    { headers })
                                    .subscribe(val => {
                                      self.getMovementTemp();
                                      self.myForm.get('rackno').setValue('');
                                      self.myForm.get('barcodeno').setValue('');
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
          self.api.get('table/stock_balance', { params: { limit: 100, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "'" + ' AND ' + "status='OPEN' AND sub_location=" + "'" + rackno + "'" } })
            .subscribe(val => {
              self.putawaylist = val['data'];
              var stockin = 0;
              var stockout = 0;
              var stock = 0;
              for (let i = 0; i < self.putawaylist.length; i++) {
                if (self.putawaylist[i].qty_in != 0) {
                  stockin = stockin + self.putawaylist[i].qty_in
                }
                if (self.putawaylist[i].qty_out != 0) {
                  stockout = stockout + self.putawaylist[i].qty_out
                }
              }
              stock = stockin - stockout
              if (self.putawaylist.length) {
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
                        if (data.qty > stock) {
                          let alert = self.alertCtrl.create({
                            title: 'Error ',
                            subTitle: 'Qty Input Greater than Qty Stock',
                            buttons: ['OK']
                          });
                          alert.present();
                        }
                        else {
                          let rackno = self.myForm.value.rackno
                          var batchno = barcodeno.substring(0, 4);
                          var itemno = barcodeno.substring(4, 20);
                          self.api.get('table/movement_temp', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "' AND pic=" + "'" + self.userid + "'" } })
                            .subscribe(val => {
                              self.getmovementlist = val['data'];
                              if (self.getmovementlist.length) {
                                const headers = new HttpHeaders()
                                  .set("Content-Type", "application/json");
                                let datetime = moment().format('YYYY-MM-DD HH:mm');
                                self.api.put("table/movement_temp",
                                  {
                                    "movementtemp_no": self.getmovementlist[0].movementtemp_no,
                                    "qty": parseInt(self.getmovementlist[0].qty) + parseInt(data.qty),
                                    "datetime": datetime,
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    self.getMovementTemp();
                                    self.myForm.get('rackno').setValue('');
                                    self.myForm.get('barcodeno').setValue('');
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
                                  let datetime = moment().format('YYYY-MM-DD HH:mm');
                                  self.api.post("table/movement_temp",
                                    {
                                      "movementtemp_no": self.nextno,
                                      "receiving_no": self.putawaylist[0].receiving_no,
                                      "batch_no": self.putawaylist[0].batch_no,
                                      "item_no": self.putawaylist[0].item_no,
                                      "location_code": self.putawaylist[0].location,
                                      "location_previous_position": self.putawaylist[0].sub_location,
                                      "location_current_position": self.myForm.value.rackno,
                                      "qty": data.qty,
                                      "status": 'OPEN',
                                      "datetime": datetime,
                                      "pic": self.userid,
                                      "uuid": UUID.UUID()
                                    },
                                    { headers })
                                    .subscribe(val => {
                                      self.getMovementTemp();
                                      self.myForm.get('rackno').setValue('');
                                      self.myForm.get('barcodeno').setValue('');
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
        self.api.get('table/movement_temp', { params: { limit: 100, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "'" + ' AND ' + "pic=" + "'" + self.userid + "'" } })
          .subscribe(val => {
            let putawaylist = val['data'];
            if (putawaylist.length) {
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
                      if (putawaylist[0].qty < data.qty) {
                        let alert = self.alertCtrl.create({
                          title: 'Error ',
                          subTitle: 'Qty does not exist',
                          buttons: ['OK']
                        });
                        alert.present();
                      }
                      else {
                        self.api.get('table/movement_temp_detail', { params: { limit: 30, filter: "pic=" + "'" + self.userid + "' AND batch_no=" + "'" + putawaylist[0].batch_no + "' AND item_no=" + "'" + putawaylist[0].item_no + "'" } })
                          .subscribe(val => {
                            let movetempdetail = val['data']
                            if (movetempdetail.length == 0) {
                              const headers = new HttpHeaders()
                                .set("Content-Type", "application/json");
                              self.getNextNoPUTempDetail().subscribe(val => {
                                let nextno = val['nextno'];
                                let datetime = moment().format('YYYY-MM-DD HH:mm');
                                self.api.post("table/movement_temp_detail",
                                  {
                                    "movementtemp_no": nextno,
                                    "receiving_no": putawaylist[0].receiving_no,
                                    "batch_no": putawaylist[0].batch_no,
                                    "item_no": putawaylist[0].item_no,
                                    "qty": data.qty,
                                    "location_code": putawaylist[0].location_code,
                                    "location_previous_position": putawaylist[0].location_previous_position,
                                    "location_current_position": putawaylist[0].location_current_position,
                                    "status": 'OPEN',
                                    "datetime": datetime,
                                    "pic": self.userid,
                                    "uuid": UUID.UUID()
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    self.api.put("table/movement_temp",
                                      {
                                        "movementtemp_no": putawaylist[0].movementtemp_no,
                                        "qty": putawaylist[0].qty - data.qty
                                      },
                                      { headers })
                                      .subscribe(val => {
                                        if (putawaylist[0].qty == data.qty) {
                                          self.api.delete("table/putawaylist_temp", { params: { filter: 'putawaylisttemp_no=' + "'" + putawaylist[0].putawaylisttemp_no + "'" }, headers })
                                            .subscribe(
                                              (val) => {
                                                self.getMovementTemp()
                                                self.getMovementTempDetail()
                                              });
                                        }
                                        self.getMovementTemp()
                                        self.getMovementTempDetail()
                                        let alert = self.alertCtrl.create({
                                          title: 'Sukses ',
                                          subTitle: 'Add Item Sukses',
                                          buttons: ['OK']
                                        });
                                        alert.present();
                                      });
                                  });
                              });
                            }
                            else {
                              const headers = new HttpHeaders()
                                .set("Content-Type", "application/json");
                              let datetime = moment().format('YYYY-MM-DD HH:mm');
                              self.api.put("table/movement_temp_detail",
                                {
                                  "movementtemp_no": movetempdetail[0].movementtemp_no,
                                  "qty": parseInt(movetempdetail[0].qty) + parseInt(data.qty),
                                  "datetime": datetime
                                },
                                { headers })
                                .subscribe(val => {
                                  self.api.put("table/movement_temp",
                                    {
                                      "movementtemp_no": putawaylist[0].movementtemp_no,
                                      "qty": putawaylist[0].qty - data.qty
                                    },
                                    { headers })
                                    .subscribe(val => {
                                      if (putawaylist[0].qty == data.qty) {
                                        self.api.delete("table/putawaylist_temp", { params: { filter: 'putawaylisttemp_no=' + "'" + putawaylist[0].putawaylisttemp_no + "'" }, headers })
                                          .subscribe(
                                            (val) => {
                                              self.getMovementTemp()
                                              self.getMovementTempDetail()
                                            });
                                      }
                                      self.getMovementTemp()
                                      self.getMovementTempDetail()
                                      let alert = self.alertCtrl.create({
                                        title: 'Sukses ',
                                        subTitle: 'Add Item Sukses',
                                        buttons: ['OK']
                                      });
                                      alert.present();
                                    });
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
                subTitle: 'Item Not Found',
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
        self.api.get('table/movement_temp', { params: { limit: 100, filter: "batch_no=" + "'" + batchno + "'" + ' AND ' + "item_no=" + "'" + itemno + "'" + ' AND ' + "pic=" + "'" + self.userid + "'" } })
          .subscribe(val => {
            let putawaylist = val['data'];
            if (putawaylist.length) {
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
                      if (putawaylist[0].qty < data.qty) {
                        let alert = self.alertCtrl.create({
                          title: 'Error ',
                          subTitle: 'Qty does not exist',
                          buttons: ['OK']
                        });
                        alert.present();
                      }
                      else {
                        self.api.get('table/movement_temp_detail', { params: { limit: 30, filter: "pic=" + "'" + self.userid + "' AND batch_no=" + "'" + putawaylist[0].batch_no + "' AND item_no=" + "'" + putawaylist[0].item_no + "'" } })
                          .subscribe(val => {
                            let movetempdetail = val['data']
                            if (movetempdetail.length == 0) {
                              const headers = new HttpHeaders()
                                .set("Content-Type", "application/json");
                              self.getNextNoPUTempDetail().subscribe(val => {
                                let nextno = val['nextno'];
                                let datetime = moment().format('YYYY-MM-DD HH:mm');
                                self.api.post("table/movement_temp_detail",
                                  {
                                    "movementtemp_no": nextno,
                                    "receiving_no": putawaylist[0].receiving_no,
                                    "batch_no": putawaylist[0].batch_no,
                                    "item_no": putawaylist[0].item_no,
                                    "qty": data.qty,
                                    "location_code": putawaylist[0].location_code,
                                    "location_previous_position": putawaylist[0].location_previous_position,
                                    "location_current_position": putawaylist[0].location_current_position,
                                    "status": 'OPEN',
                                    "datetime": datetime,
                                    "pic": self.userid,
                                    "uuid": UUID.UUID()
                                  },
                                  { headers })
                                  .subscribe(val => {
                                    self.api.put("table/movement_temp",
                                      {
                                        "movementtemp_no": putawaylist[0].movementtemp_no,
                                        "qty": putawaylist[0].qty - data.qty
                                      },
                                      { headers })
                                      .subscribe(val => {
                                        if (putawaylist[0].qty == data.qty) {
                                          self.api.delete("table/putawaylist_temp", { params: { filter: 'putawaylisttemp_no=' + "'" + putawaylist[0].putawaylisttemp_no + "'" }, headers })
                                            .subscribe(
                                              (val) => {
                                                self.getMovementTemp()
                                                self.getMovementTempDetail()
                                              });
                                        }
                                        self.getMovementTemp()
                                        self.getMovementTempDetail()
                                        let alert = self.alertCtrl.create({
                                          title: 'Sukses ',
                                          subTitle: 'Add Item Sukses',
                                          buttons: ['OK']
                                        });
                                        alert.present();
                                      });
                                  });
                              });
                            }
                            else {
                              const headers = new HttpHeaders()
                                .set("Content-Type", "application/json");
                              let datetime = moment().format('YYYY-MM-DD HH:mm');
                              self.api.put("table/movement_temp_detail",
                                {
                                  "movementtemp_no": movetempdetail[0].movementtemp_no,
                                  "qty": parseInt(movetempdetail[0].qty) + parseInt(data.qty),
                                  "datetime": datetime
                                },
                                { headers })
                                .subscribe(val => {
                                  self.api.put("table/movement_temp",
                                    {
                                      "movementtemp_no": putawaylist[0].movementtemp_no,
                                      "qty": putawaylist[0].qty - data.qty
                                    },
                                    { headers })
                                    .subscribe(val => {
                                      if (putawaylist[0].qty == data.qty) {
                                        self.api.delete("table/putawaylist_temp", { params: { filter: 'putawaylisttemp_no=' + "'" + putawaylist[0].putawaylisttemp_no + "'" }, headers })
                                          .subscribe(
                                            (val) => {
                                              self.getMovementTemp()
                                              self.getMovementTempDetail()
                                            });
                                      }
                                      self.getMovementTemp()
                                      self.getMovementTempDetail()
                                      let alert = self.alertCtrl.create({
                                        title: 'Sukses ',
                                        subTitle: 'Add Item Sukses',
                                        buttons: ['OK']
                                      });
                                      alert.present();
                                    });
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
                subTitle: 'Item Not Found',
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
  getMovementTemp() {
    this.api.get('table/movement_temp', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" } })
      .subscribe(val => {
        this.movementtemp = val['data'];
      });
  }
  getMovementTempDetail() {
    this.api.get('table/movement_temp_detail', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" } })
      .subscribe(val => {
        this.movementtempdetail = val['data'];
      });
  }
  getNextNo() {
    return this.api.get('nextno/putaway/putaway_no')
  }
  getNextNoPUTemp() {
    return this.api.get('nextno/movement_temp/movementtemp_no')
  }
  getNextNoPUTempDetail() {
    return this.api.get('nextno/movement_temp_detail/movementtemp_no')
  }
  getNextNoPU() {
    return this.api.get('nextno/movement/movement_no')
  }
  getNextNoStock() {
    return this.api.get('nextno/stock/id')
  }
  doGetStockPlus(cek) {
    this.api.get('table/stock', { params: { limit: 30, filter: "batch_no=" + "'" + cek.batch_no + "' AND item_no=" + "'" + cek.item_no + "' AND location=" + "'" + cek.location_code + "'" + " AND sub_location=" + "'" + this.myForm.value.rackno + "'" } })
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
          "qty": cek.qty,
          "location": cek.location_code,
          "sub_location": this.myForm.value.rackno,
          "datetime": date,
          "uuid": UUID.UUID()
        },
        { headers })
        .subscribe(val => {
        }, err => {
          this.doPostStock(cek)
        })
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
        "qty": parseInt(datastock.qty) + parseInt(cek.qty),
        "location": cek.location,
        "sub_location": cek.sub_location,
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
    this.api.get('table/stock', { params: { limit: 30, filter: "batch_no=" + "'" + cek.batch_no + "' AND item_no=" + "'" + cek.item_no + "' AND location=" + "'" + cek.location_code + "'" + " AND sub_location=" + "'" + cek.location_previous_position + "'" } })
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
        "qty": parseInt(datastock.qty) - parseInt(cek.qty),
        "location": cek.location_code,
        "sub_location": cek.location_previous_position,
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
  doPostMovement(cek) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.getNextNoPU().subscribe(val => {
      let nextno = val['nextno'];
      let datetime = moment().format('YYYY-MM-DD HH:mm');
      this.api.post("table/movement",
        {
          "movement_no": nextno,
          "receiving_no": cek.receiving_no,
          "batch_no": cek.batch_no,
          "item_no": cek.item_no,
          "location_code": cek.location_code,
          "location_previous_position": cek.location_previous_position,
          "location_current_position": this.myForm.value.rackno,
          "qty": cek.qty,
          "status": 'OPEN',
          "pic": this.userid,
          "datetime": datetime,
          "uuid": UUID.UUID()
        },
        { headers })
        .subscribe(val => {
          this.doDeleteMovementDetail(cek)
        }, err => {
          this.doPostMovement(cek)
        })
    });
  }
  doDeleteMovementDetail(cek) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.delete("table/movement_temp_detail", { params: { filter: "movementtemp_no=" + "'" + cek.movementtemp_no + "'" }, headers })
      .subscribe(val => {
        this.api.get('table/movement_temp_detail', { params: { limit: 30, filter: "pic=" + "'" + this.userid + "'" } })
          .subscribe(val => {
            this.getmovementlist = val['data'];
            let alert = this.alertCtrl.create({
              title: 'Sukses ',
              subTitle: 'Save Item To Rack Sukses',
              buttons: ['OK']
            });
            this.getMovementTempDetail();
            this.myForm.reset()
            alert.present();
          });
      }, err => {
        this.doDeleteMovementDetail(cek)
      })
  }
  doPostStockBalance(cek) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.getNextNoStockBalance().subscribe(val => {
      let nextno = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      let date = moment().format('YYYY-MM-DD');
      this.api.post("table/stock_balance",
        {
          "id": nextno,
          "receiving_no": cek.receiving_no,
          "batch_no": cek.batch_no,
          "item_no": cek.item_no,
          "qty_in": 0,
          "qty_out": cek.qty,
          "location": cek.location_code,
          "sub_location": cek.location_previous_position,
          "description": 'Movement',
          "status": 'OPEN',
          "datetime": date,
          "uuid": UUID.UUID()
        },
        { headers })
        .subscribe(val => {
          this.doGetStockMin(cek)
          this.doInsertPutaway(cek)
          this.doPostMovement(cek)
        }, err => {
          this.doPostStockBalance(cek)
        });
    });
  }
}
