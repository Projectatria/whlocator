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
  selector: 'page-stockopnamedetail',
  templateUrl: 'stockopnamedetail.html',
})
export class StockopnamedetailPage {

  public so: any;
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
    this.so = this.navParams.get('so')
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
    this.api.get("table/stock_opname_result", { params: { limit: 10000, filter: "id_header=" + "'" + this.so.id + "' AND location=" + "'" + this.rolecab + "' AND status='OPEN' AND sub_location=" + "'" + soline.sub_location + "'" } })
      .subscribe(val => {
        this.stockopnameresult = val['data']
        console.log(this.stockopnameresult)
      });
  }

}
