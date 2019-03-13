import { Component } from '@angular/core';
import { Platform, LoadingController, FabContainer, ActionSheetController, ModalController, MenuController, IonicPage, NavController, ToastController, NavParams, Refresher } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AlertController } from 'ionic-angular';
import { UUID } from 'angular2-uuid';
import { BarcodeScanner, BarcodeScannerOptions } from "@ionic-native/barcode-scanner";
import moment from 'moment';
import { Storage } from '@ionic/storage';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from "@angular/common/http";

declare var window;
declare var Honeywell;

@IonicPage()
@Component({
  selector: 'page-stockopnamedetail',
  templateUrl: 'stockopnamedetail.html',
})
export class StockopnamedetailPage {

  public so: any;
  public tim: any;
  public date: any;
  public soheaderlength: any;
  public name: any;
  public userid: any;
  public role = [];
  public roleid: any;
  public rolegroup: any;
  public rolecab: any;
  public roleiddetail = [];
  public rolenamedetail: any;
  public stockopnameline = [];
  public stockopnameresult = [];
  public iduser: any;
  public idline: any;
  public sublocation: any;
  public button: boolean = false;

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
    public loadingCtrl: LoadingController,
    public platform: Platform
  ) {
    this.so = this.navParams.get('so')
    this.tim = this.navParams.get('tim')
    this.storage.get('name').then((val) => {
      this.name = val;
    });
    this.storage.get('userid').then((val) => {
      this.userid = val;
      this.api.get('table/user_role', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
        .subscribe(val => {
          this.role = val['data'];
          this.roleid = this.role[0].id_role;
          this.rolegroup = this.role[0].id_group;
          this.rolecab = this.role[0].id_cab;
          this.api.get('table/role', { params: { filter: "id_role=" + "'" + this.roleid + "'" } })
            .subscribe(val => {
              this.roleiddetail = val['data'];
              this.rolenamedetail = this.roleiddetail[0].name;
            });
          this.doGetStockLineGroup()
        });
    });
  }
  doGetStockLineGroup() {
    this.api.get("table/stock_opname_line", { params: { limit: 10000, filter: "id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "' AND status='OPEN'", group: 'sub_location', sort: 'sub_location ASC' } })
      .subscribe(val => {
        this.stockopnameline = val['data']
      });
  }
  doGetStockLine(soline) {
    this.api.get("table/stock_opname_line", { params: { limit: 10000, filter: "id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "' AND status='OPEN' AND sub_location=" + "'" + soline.sub_location + "'" } })
      .subscribe(val => {
        let stockopname = val['data']
      });
  }
  doGetStockResult(soline) {
    this.button = true;
    this.iduser = soline.id_user
    this.sublocation = soline.sub_location
    this.api.get("table/stock_opname_result", { params: { limit: 10000, filter: "id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "' AND status='OPEN' AND sub_location=" + "'" + soline.sub_location + "' AND id_team=" + "'" + this.tim.id_team + "'" } })
      .subscribe(val => {
        this.stockopnameresult = val['data']
      });
  }
  doHideGetStockResult(soline) {
    this.button = false;
    this.stockopnameresult = [];
    this.iduser = '';
    this.idline = '';
    this.sublocation = '';
  }
  doScan(soline) {
    if (this.platform.is('cordova')) {
      this.doScanBarcode(soline)
    }
    else {
      this.doInputBarcode(soline)
    }
  }
  doScanBarcode(soline) {
    var self = this
    Honeywell.barcodeReaderPressSoftwareTrigger(function () {
      Honeywell.onBarcodeEvent(function (data) {
        var barcodeno = data.barcodeData;
        var batchno = barcodeno.substring(0, 4);
        var itemno = barcodeno.substring(4, 12);
        self.doInputQty(soline, batchno, itemno)
      }, function (reason) {
      });
    }, function (reason) {
      self.doScanBarcodeNative(soline)
    }, {
        press: true
      });
  }
  doScanBarcodeNative(soline) {
    this.barcodeScanner.scan().then(barcodeData => {
      var barcodeno = barcodeData.text;
      var batchno = barcodeno.substring(0, 4);
      var itemno = barcodeno.substring(4, 12);
      this.doInputQty(soline, batchno, itemno)
    }).catch(err => {
      console.log('Error', err);
    });
  }
  doInputBarcode(soline) {
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
            this.doInputQty(soline, batchno, itemno)
          }
        }
      ]
    });
    alert.present();
  }
  doInputQty(soline, batchno, itemno) {
    let alert = this.alertCtrl.create({
      title: batchno + "-" + itemno,
      inputs: [
        {
          name: 'Qty',
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
            var qty = data.Qty;
            this.doGetSOResult(soline, batchno, itemno, qty)
          }
        }
      ]
    });
    alert.present();
  }
  getNextNoResult() {
    return this.api.get('nextno/stock_opname_result/id')
  }
  doGetSOResult(soline, batchno, itemno, qty) {
    this.api.get("table/stock_opname_result", { params: { limit: 10000, filter: "id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "' AND sub_location=" + "'" + soline.sub_location + "' AND batch_no=" + "'" + batchno + "' AND item_no=" + "'" + itemno + "' AND id_team=" + "'" + this.tim.id_team + "'" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length == 0) {
          this.doPostSOResult(soline, batchno, itemno, qty)
        }
        else {
          let result = data[0]
          if (soline.status == 'OPEN') {
            let qtydiff = 0
            this.doPutSOResult(result, soline, batchno, itemno, qty, qtydiff)
          }
          else {
            let qtydiff = parseInt(data[0].qty_diff) + parseInt(qty)
            this.doPutSOResult(result, soline, batchno, itemno, qty, qtydiff)
          }
        }
      }, err => {
        this.doGetSOResult(soline, batchno, itemno, qty)
      });
  }
  doPostSOResult(soline, batchno, itemno, qty, ) {
    this.getNextNoResult().subscribe(val => {
      let nextno = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      let date = moment().format('YYYY-MM-DD HH:mm');
      this.api.post("table/stock_opname_result",
        {
          "id": nextno,
          "id_header": this.so.id,
          "id_team": this.tim.id_team,
          "location": this.rolecab,
          "sub_location": soline.sub_location,
          "batch_no": batchno,
          "item_no": itemno,
          "qty": qty,
          "datetime": date,
          "status": 'OPEN'
        },
        { headers })
        .subscribe(val => {
          let alert = this.alertCtrl.create({
            subTitle: 'Sukses',
            message: 'Item Berhasil di tambah',
            buttons: ['OK']
          });
          alert.present();
        }, err => {
          this.doPostSOResult(soline, batchno, itemno, qty)
        });
    }, err => {
      this.doPostSOResult(soline, batchno, itemno, qty)
    });
  }
  doPutSOResult(result, soline, batchno, itemno, qty, qtydiff) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let date = moment().format('YYYY-MM-DD HH:mm');
    this.api.put("table/stock_opname_result",
      {
        "id": result.id,
        "id_header": result.id_header,
        "id_team": result.id_team,
        "location": result.location,
        "sub_location": result.sub_location,
        "batch_no": batchno,
        "item_no": itemno,
        "qty": parseInt(result.qty) + parseInt(qty),
        "qty_diff": qtydiff,
        "datetime": date,
        "status": 'OPEN'
      },
      { headers })
      .subscribe(val => {
        let alert = this.alertCtrl.create({
          subTitle: 'Sukses',
          message: 'Item Berhasil di tambah',
          buttons: ['OK']
        });
        alert.present();
        this.doGetSOResultUpdate(result)
      }, err => {
        this.doPutSOResult(result, soline, batchno, itemno, qty, qtydiff)
      });
  }
  doAlertDelete(result) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete  ' + result.item_no + ' ?',
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
            this.doDeleteResult(result)
          }
        }
      ]
    });
    alert.present();
  }
  doDeleteResult(result) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.delete("table/stock_opname_result", { params: { filter: 'id=' + "'" + result.id + "'" }, headers })
      .subscribe(
        (val) => {
          this.doGetSOResultUpdate(result)
        }, err => {
          this.doDeleteResult(result)
        });
  }
  doGetSOResultUpdate(result) {
    this.api.get("table/stock_opname_result", { params: { limit: 10000, filter: "id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "' AND status='OPEN' AND sub_location=" + "'" + result.sub_location + "' AND id_team=" + "'" + this.tim.id_team + "'" } })
      .subscribe(val => {
        this.stockopnameresult = val['data']
      }, err => {
        this.doGetSOResultUpdate(result)
      });
  }
  doConfirmSubmit() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Submit',
      message: 'Yakin ingin Submit Stock Opname ini?',
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
            this.doGetSOFromResult()
          }
        }
      ]
    });
    alert.present();
  }
  doConfirmSubmitInpg() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Submit',
      message: 'Yakin ingin Submit Stock Opname ini?',
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
            this.doGetSOFromResultInpg()
          }
        }
      ]
    });
    alert.present();
  }
  doGetSOFromResult() {
    this.api.get("table/stock_opname_result", { params: { limit: 10000, filter: "id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "' AND status='OPEN' AND id_team=" + "'" + this.tim.id_team + "'" } })
      .subscribe(val => {
        let data = val['data']
        for (let i = 0; i < data.length; i++) {
          let result = data[i]
          this.doGetDiffFromStok(result)
        }
        this.doGetSOFromStok()
        this.doGetTeamHeader()
      }, err => {
        this.doGetSOFromResult()
      });
  }
  doGetSOFromResultInpg() {
    this.api.get("table/stock_opname_result", { params: { limit: 10000, filter: "id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "' AND status='OPEN' AND id_team=" + "'" + this.tim.id_team + "'" } })
      .subscribe(val => {
        let data = val['data']
        for (let i = 0; i < data.length; i++) {
          let result = data[i]
          this.doGetDiffFromStok(result)
        }
        this.doGetSOFromStok()
        this.doGetTeamHeaderInpg()
      }, err => {
        this.doGetSOFromResultInpg()
      });
  }
  doGetTeamHeader() {
    this.api.get("table/stock_opname_team_header", { params: { limit: 10000, filter: "id_team=" + "'" + this.tim.id_team + "' AND id_header=" + "'" + this.so.id + "' AND status='OPEN'" } })
      .subscribe(val => {
        let data = val['data']
        this.doUpdateTeamHeader(data)
      }, err => {
        this.doGetTeamHeader()
      });
  }
  doGetTeamHeaderInpg() {
    this.api.get("table/stock_opname_team_header", { params: { limit: 10000, filter: "id_team=" + "'" + this.tim.id_team + "' AND id_header=" + "'" + this.so.id + "' AND status='INPG'" } })
      .subscribe(val => {
        let data = val['data']
        this.doUpdateTeamHeaderInpg(data)
      }, err => {
        this.doGetTeamHeaderInpg()
      });
  }
  doUpdateTeamHeader(data) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let date = moment().format('YYYY-MM-DD HH:mm');
    this.api.put("table/stock_opname_team_header",
      {
        "id": data[0].id,
        "datetime": date,
        "status": 'INPG'
      },
      { headers })
      .subscribe(val => {
        this.navCtrl.pop()
      }, err => {
        this.doUpdateTeamHeader(data)
      });
  }
  doUpdateTeamHeaderInpg(data) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let date = moment().format('YYYY-MM-DD HH:mm');
    this.api.put("table/stock_opname_team_header",
      {
        "id": data[0].id,
        "datetime": date,
        "status": 'CLSD'
      },
      { headers })
      .subscribe(val => {
        this.navCtrl.pop()
      }, err => {
        this.doUpdateTeamHeaderInpg(data)
      });
  }
  doGetDiffFromStok(result) {
    this.api.get("table/stock_opname_line", { params: { limit: 10000, filter: "id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "' AND sub_location=" + "'" + result.sub_location + "' AND batch_no=" + "'" + result.batch_no + "' AND item_no=" + "'" + result.item_no + "' AND status='OPEN'" } })
      .subscribe(val => {
        let stok = val['data']
        if (stok.length == 0) {
          let stokqty = 0
          this.doUpdateDiffSOResult(result, stokqty)
        }
        else {
          let stokqty = stok[0].qty
          this.doUpdateDiffSOResult(result, stokqty)
        }
      }, err => {
        this.doGetDiffFromStok(result)
      });
  }
  doGetSOFromStok() {
    this.api.get("table/stock_opname_line", { params: { limit: 10000, filter: "id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "' AND status='OPEN' " } })
      .subscribe(val => {
        let data = val['data']
        for (let i = 0; i < data.length; i++) {
          let result = data[i]
          this.doGetDiffFromResult(result)
        }
      }, err => {
        this.doGetSOFromStok()
      });
  }
  doGetDiffFromResult(result) {
    this.api.get("table/stock_opname_result", { params: { limit: 10000, filter: "id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "' AND sub_location=" + "'" + result.sub_location + "' AND batch_no=" + "'" + result.batch_no + "' AND item_no=" + "'" + result.item_no + "' AND id_team=" + "'" + this.tim.id_team + "' AND status='OPEN'" } })
      .subscribe(val => {
        let stok = val['data']
        if (stok.length == 0) {
          this.doAddDiffSOResult(result)
        }
      }, err => {
        this.doGetDiffFromResult(result)
      });
  }
  doUpdateDiffSOResult(result, stokqty) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    let date = moment().format('YYYY-MM-DD HH:mm');
    this.api.put("table/stock_opname_result",
      {
        "id": result.id,
        "qty_diff": parseInt(result.qty) - parseInt(stokqty),
        "datetime": date,
        "status": 'OPEN'
      },
      { headers })
      .subscribe(val => {
      }, err => {
        this.doUpdateDiffSOResult(result, stokqty)
      })
  }
  doAddDiffSOResult(result) {
    this.getNextNoResult().subscribe(val => {
      let nextno = val['nextno'];
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");
      let date = moment().format('YYYY-MM-DD HH:mm');
      this.api.post("table/stock_opname_result",
        {
          "id": nextno,
          "id_header": this.so.id,
          "id_team": this.tim.id_team,
          "location": this.rolecab,
          "sub_location": result.sub_location,
          "batch_no": result.batch_no,
          "item_no": result.item_no,
          "qty": result.qty,
          "qty_diff": -Math.abs(result.qty),
          "datetime": date,
          "status": 'OPEN'
        },
        { headers })
        .subscribe(val => {
        }, err => {
          this.doAddDiffSOResult(result)
        })
    });
  }
}
