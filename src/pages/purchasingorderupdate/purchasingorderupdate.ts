import { Component } from '@angular/core';
import { ViewController, IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiProvider } from '../../providers/api/api';
import { HttpHeaders } from "@angular/common/http";
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-purchasingorderupdate',
  templateUrl: 'purchasingorderupdate.html',
})
export class PurchasingorderupdatePage {
  myForm: FormGroup;
  private vendor = [];
  private nextno = '';
  private poid = '';
  private docno = '';
  private orderno = '';
  private vendorno = '';
  private transferdate = '';
  private locationcode = '';
  private description = '';
  private purchasing_order = [];
  private token:any;

  error_messages = {
    'docno': [
      { type: 'required', message: 'Doc No Must Be Fill' }

    ],
    'orderno': [
      { type: 'required', message: 'Order No Must Be Fill' }
    ],
    'vendorno': [
      { type: 'required', message: 'Vendor No Must Be Fill' }
    ],
    'transferdate': [
      { type: 'required', message: 'Transfer Date Must Be Fill' }
    ],
    'locationcode': [
      { type: 'required', message: 'Location Code Must Be Fill' }
    ]
  }
  ven: any = {};
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public fb: FormBuilder,
    public api: ApiProvider,
    public alertCtrl: AlertController,
    public storage: Storage
  ) {
    this.myForm = fb.group({
      docno: ['', Validators.compose([Validators.required])],
      orderno: ['', Validators.compose([Validators.required])],
      vendorno: ['', Validators.compose([Validators.required])],
      transferdate: ['', Validators.compose([Validators.required])],
      locationcode: ['', Validators.compose([Validators.required])],
      description: ['', Validators.compose([Validators.required])],
    })
    this.getVendor();
    this.poid = navParams.get('poid')
    this.docno = navParams.get('docno');
    this.orderno = navParams.get('orderno');
    this.vendorno = navParams.get('vendorno');
    this.transferdate = navParams.get('transferdate');
    this.locationcode = navParams.get('locationcode');
    this.description = navParams.get('description');
    this.myForm.get('docno').setValue(this.docno);
    this.myForm.get('orderno').setValue(this.orderno);
    this.myForm.get('vendorno').setValue(this.vendorno);
    this.myForm.get('transferdate').setValue(this.transferdate);
    this.myForm.get('locationcode').setValue(this.locationcode);
    this.myForm.get('description').setValue(this.description);
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
  getVendor() {
    this.api.get('table/vendor', { params: { limit: 100 } }).subscribe(val => {
      this.vendor = val['data'];
    });
  }
  ionViewDidLoad() {

  }
  closeModal() {
    this.viewCtrl.dismiss();
  }
  onChange(ven) {
    this.ven = ven;
  }
  updatePO() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");

    this.api.put("table/purchasing_order",
      {
        "po_id": this.poid,
        "doc_no": this.myForm.value.docno,
        "order_no": this.myForm.value.orderno,
        "vendor_no": this.myForm.value.vendorno,
        "vendor_status": this.ven.gen_bus_posting_group,
        "transfer_date": this.myForm.value.transferdate,
        "posting_desc": this.myForm.value.description,
        "location_code": this.myForm.value.locationcode
      },
      { headers })
      .subscribe(
        (val) => {
          this.myForm.reset()
          let alert = this.alertCtrl.create({
            title: 'Sukses',
            subTitle: 'Update Sukses',
            buttons: ['OK']
          });
          alert.present();
          this.viewCtrl.dismiss();
        },
        response => {

        },
        () => {

        });
  }
}
