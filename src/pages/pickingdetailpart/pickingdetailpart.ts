import { Component } from '@angular/core';
import { Platform, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { FormBuilder } from "@angular/forms";
import { HttpHeaders } from "@angular/common/http";
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { UUID } from 'angular2-uuid';
import { BarcodeScanner, BarcodeScannerOptions } from "@ionic-native/barcode-scanner";

declare var window;
declare var Honeywell;

@IonicPage()
@Component({
  selector: 'page-pickingdetailpart',
  templateUrl: 'pickingdetailpart.html',
})
export class PickingdetailpartPage {
  private picking_detail = [];
  searchpodetail: any;
  items = [];
  halaman = 0;
  totaldata: any;
  public toggled: boolean = false;
  receiptno = '';
  docno = ''
  batchno = '';
  locationcode = '';
  expectedreceiptdate = '';
  pickingdetail: string = "pickingdetailitem";
  private token: any;
  public detailpicking: any;
  public pickinglist: any;
  public pickingresult = [];
  public groupby = 'default'
  public nextnostockbalance: any;

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
    public storage: Storage,
    public platform: Platform
  ) {
    this.toggled = false;
    this.pickingdetail = "pickingdetailitem"
    this.receiptno = navParams.get('receiptno');
    this.batchno = navParams.get('batchno');
    this.locationcode = navParams.get('locationcode');
    this.expectedreceiptdate = navParams.get('expectedreceiptdate');
    this.getSOD();
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
  getSOD() {
    this.api.get("table/picking_list_detail", { params: { filter: "receipt_no=" + "'" + this.receiptno + "' AND status = 'OPEN'" } })
      .subscribe(val => {
        this.picking_detail = val['data'];
        this.totaldata = val['count'];
      })
  }
  doRefresh(refresher) {
    this.api.get("table/picking_list_detail", { params: { filter: "receipt_no=" + "'" + this.receiptno + "' AND status = 'OPEN'" } })
      .subscribe(val => {
        this.picking_detail = val['data'];
        this.totaldata = val['count'];
        this.searchpodetail = this.picking_detail;
        refresher.complete();
      });
  }
  dodetailpicking(picking) {
    this.pickinglist = picking.item_no;
    this.detailpicking = this.detailpicking ? false : true;
    this.getPickingResult(picking);
  }
  getPickingResult(picking) {
    // this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Item", filter: "[No_]=" + "'" + picking.item_no + "'" } }).subscribe(val => {
    //   let dataitem = val['data']
    //   this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Production BOM Line", filter: "[Production BOM No_]=" + "'" + dataitem[0]["Production BOM No_"] + "'" } }).subscribe(val => {
    //     this.pickingresult = val['data']
    //   });
    // })
    this.api.get("table/picking_list_detail_part", { params: { filter: "receipt_no=" + "'" + picking.receipt_no + "' AND item_no=" + "'" + picking.item_no + "' AND status = 'OPEN'", sort: 'line_no ASC' } })
      .subscribe(val => {
        this.pickingresult = val['data']
      });
  }
  getSetGroupBy(groupby) {
    if (groupby == 'default') {
      this.getDetailGroupByDefault()
    }
    else if (groupby == 'item') {
      this.getDetailGroupByItems()
    }
    else if (groupby == 'part') {
      this.getDetailGroupByPart()
    }
    else if (groupby == 'location') {
      this.getDetailGroupByLocation()
    }
  }
  getDetailGroupByDefault() {
    this.api.get('table/picking_list_detail', { params: { limit: 30, filter: "receipt_no=" + "'" + this.receiptno + "' AND status = 'OPEN'" } })
      .subscribe(val => {
        this.picking_detail = val['data'];
        this.totaldata = val['count'];
      });
  }
  getDetailGroupByItems() {
    this.api.get('table/picking_list_detail', { params: { limit: 30, filter: "receipt_no=" + "'" + this.receiptno + "' AND status = 'OPEN'", group: 'item_no', groupSummary: "sum (qty) as qtysum" } })
      .subscribe(val => {
        this.picking_detail = val['data'];
        this.totaldata = val['count'];
      });
  }
  getDetailGroupByPart() {
    this.api.get('table/picking_list_detail', { params: { limit: 30, filter: "receipt_no=" + "'" + this.receiptno + "' AND status = 'OPEN'", group: 'location_code', groupSummary: "sum (qty) as qtysum" } })
      .subscribe(val => {
        this.picking_detail = val['data'];
        this.totaldata = val['count'];
      });
  }
  getDetailGroupByLocation() {
    this.api.get('table/picking_list_detail', { params: { limit: 30, filter: "receipt_no=" + "'" + this.receiptno + "' AND status = 'OPEN'", group: 'location_code', groupSummary: "sum (qty) as qtysum" } })
      .subscribe(val => {
        this.picking_detail = val['data'];
        this.totaldata = val['count'];
      });
  }
  doCekStock(result, batchno, itemno) {
    this.api.get("table/stock", { params: { filter: "batch_no=" + "'" + batchno + "' AND item_no=" + "'" + itemno + "' AND sub_location=" + "'" + result.sub_location + "'", sort: 'batch_no ASC, sub_location ASC' } })
    .subscribe(val => {
      let data = val['data']
      if (data.length == 0) {
        let alert = this.alertCtrl.create({
          title: 'Perhatian',
          subTitle: 'Data tidak ditemukan',
          buttons: ['OK']
        });
        alert.present();
      }
      else {
        this.doMinStockBalance(result, batchno, itemno)
        this.doUpdatePicking(result)
      }
    }, err => {
      this.doCekStock(result, batchno, itemno)
    });
  }
  doScanBarcode(result) {
    var self = this
    Honeywell.barcodeReaderPressSoftwareTrigger(function () {
      Honeywell.onBarcodeEvent(function (data) {
        var barcodeno = data.barcodeData;
        var batchno = barcodeno.substring(0, 4);
        var itemno = barcodeno.substring(4, 12);
        self.doCekStock(result, batchno, itemno)
      }, function (reason) {
      });
    }, function (reason) {
      self.doScanBarcodeNative(result)
    }, {
        press: true
      });
  }
  doScanBarcodeNative(result) {
    this.barcodeScanner.scan().then(barcodeData => {
      var barcodeno = barcodeData.text;
      var batchno = barcodeno.substring(0, 4);
      var itemno = barcodeno.substring(4, 12);
      this.doCekStock(result, batchno, itemno)
    }).catch(err => {
      console.log('Error', err);
    });
  }
  doInputBarcode(result) {
    let alert = this.alertCtrl.create({
      title: 'Barcode No',
      inputs: [
        {
          name: 'barcodeData',
          placeholder: 'Barcode No'
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
            var barcodeno = data.barcodeData;
            var batchno = barcodeno.substring(0, 4);
            var itemno = barcodeno.substring(4, 12);
            this.doCekStock(result, batchno, itemno)
          }
        }
      ]
    });
    alert.present();
  }
  doPicking(result) {
    if (this.platform.is('cordova')) {
      this.doScanBarcode(result)
    }
    else {
      this.doInputBarcode(result)
    }
  }
  doUpdatePicking(result) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/picking_list_detail_part",
      {
        "uuid": result.uuid,
        "status": 'CLSD'
      },
      { headers })
      .subscribe(val => {
        this.api.get("table/picking_list_detail_part", { params: { filter: "receipt_no=" + "'" + result.receipt_no + "' AND item_no=" + "'" + result.item_no + "' AND status = 'OPEN'", sort: 'line_no ASC' } })
          .subscribe(val => {
            this.pickingresult = val['data']
            if (this.pickingresult.length == 0) {
              this.api.put("table/picking_list_detail",
                {
                  "id": result.id,
                  "status": 'CLSD'
                },
                { headers })
                .subscribe(val => {
                  this.api.get("table/picking_list_detail", { params: { filter: "receipt_no=" + "'" + result.receiptno + "' AND status = 'OPEN'" } })
                    .subscribe(val => {
                      this.picking_detail = val['data'];
                      if (this.picking_detail.length == 0) {
                        this.api.put("table/picking_list",
                        {
                          "receipt_no": result.receipt_no,
                          "status": 'CLSD'
                        },
                        { headers })
                        .subscribe(val => {
                        }); 
                      }
                    })
                  let alert = this.alertCtrl.create({
                    title: 'Sukses',
                    subTitle: 'Save Sukses',
                    buttons: ['OK']
                  });
                  alert.present();
                });
            }
            else {
              this.api.get("table/picking_list_detail", { params: { filter: "receipt_no=" + "'" + result.receiptno + "' AND status = 'OPEN'" } })
                .subscribe(val => {
                  this.picking_detail = val['data'];
                })
              let alert = this.alertCtrl.create({
                title: 'Sukses',
                subTitle: 'Save Sukses',
                buttons: ['OK']
              });
              alert.present();
            }
          });
      });
  }
  getNextNoStockBalance() {
    return this.api.get('nextno/stock_balance/id')
  }
  doMinStockBalance(result, batchno, itemno) {
    this.getNextNoStockBalance().subscribe(val => {
      let nextnostockbalance = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      let date = moment().format('YYYY-MM-DD');
      this.api.post("table/stock_balance",
        {
          "id": nextnostockbalance,
          "receiving_no": '',
          "batch_no": batchno,
          "item_no": itemno,
          "qty_in": 0,
          "qty_out": result.qty,
          "location": result.location,
          "sub_location": result.sub_location,
          "description": 'Picking',
          "status": 'OPEN',
          "datetime": date,
          "uuid": UUID.UUID()
        },
        { headers })
        .subscribe(val => {
          this.doPlusStockBalance(result, batchno, itemno)
        }, err => {
          this.doMinStockBalance(result, batchno, itemno)
        })
    });
  }
  doPlusStockBalance(result, batchno, itemno) {
    this.getNextNoStockBalance().subscribe(val => {
      let nextnostockbalance = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      let date = moment().format('YYYY-MM-DD');
      this.api.post("table/stock_balance",
        {
          "id": nextnostockbalance,
          "receiving_no": '',
          "batch_no": batchno,
          "item_no": itemno,
          "qty_in": result.qty,
          "qty_out": 0,
          "location": result.location,
          "sub_location": 'Staging Out',
          "description": 'Staging Out',
          "status": 'OPEN',
          "datetime": date,
          "uuid": UUID.UUID()
        },
        { headers })
        .subscribe(val => {
          this.doGetStockPlus(result, batchno, itemno)
          this.doGetStockMin(result, batchno, itemno)
        }, err => {
          this.doPlusStockBalance(result, batchno, itemno)
        })
    });
  }
  getNextNoStock() {
    return this.api.get('nextno/stock/id')
  }
  doGetStockPlus(result, batchno, itemno) {
    this.api.get('table/stock', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "' AND item_no=" + "'" + itemno + "' AND location=" + "'" + result.location + "'" + " AND sub_location=" + "'Staging Out'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length == 0) {
          this.doPostStock(result, batchno, itemno)
        }
        else {
          let datastock = data[0]
          this.doPutStockPlus(result, batchno, itemno, datastock)
        }
      }, err => {
        this.doGetStockPlus(result, batchno, itemno)
      });
  }
  doPostStock(result, batchno, itemno) {
    this.getNextNoStock().subscribe(val => {
      let nextnostock = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      let date = moment().format('YYYY-MM-DD');
      this.api.post("table/stock",
        {
          "id": nextnostock,
          "batch_no": batchno,
          "item_no": itemno,
          "qty": result.qty,
          "location": result.location,
          "sub_location": 'Staging Out',
          "datetime": date,
          "uuid": UUID.UUID()
        },
        { headers })
        .subscribe(val => {
        }, err => {
          this.doPostStock(result, batchno, itemno)
        })
    });
  }
  doPutStockPlus(result, batchno, itemno, datastock) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let date = moment().format('YYYY-MM-DD');
    this.api.put("table/stock",
      {
        "id": datastock.id,
        "batch_no": batchno,
        "item_no": itemno,
        "qty": parseInt(datastock.qty) + parseInt(result.qty),
        "location": result.location,
        "sub_location": datastock.sub_location,
        "datetime": date,
        "uuid": UUID.UUID()
      },
      { headers })
      .subscribe(val => {
      }, err => {
        this.doPutStockPlus(result, batchno, itemno, datastock)
      })
  }
  doGetStockMin(result, batchno, itemno) {
    this.api.get('table/stock', { params: { limit: 30, filter: "batch_no=" + "'" + batchno + "' AND item_no=" + "'" + itemno + "' AND location=" + "'" + result.location + "'" + " AND sub_location=" + "'" + result.sub_location + "'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length != 0) {
          let datastock = data[0]
          this.doPutStockMin(result, batchno, itemno, datastock)
        }
      }, err => {
        this.doGetStockMin(result, batchno, itemno)
      });
  }
  doPutStockMin(result, batchno, itemno, datastock) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let date = moment().format('YYYY-MM-DD');
    this.api.put("table/stock",
      {
        "id": datastock.id,
        "batch_no": batchno,
        "item_no": itemno,
        "qty_booking": parseInt(datastock.qty_booking) - parseInt(result.qty),
        "location": result.location,
        "sub_location": result.sub_location,
        "datetime": date,
        "uuid": UUID.UUID()
      },
      { headers })
      .subscribe(val => {
      }, err => {
        this.doPutStockMin(result, batchno, itemno, datastock)
      })
  }
}