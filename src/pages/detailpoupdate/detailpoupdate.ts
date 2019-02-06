import { Component } from '@angular/core';
import { ViewController, IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiProvider } from '../../providers/api/api';
import { HttpHeaders } from "@angular/common/http";
import { Storage } from '@ionic/storage';


/**
 * Generated class for the PurchasingorderaddPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-detailpoupdate',
  templateUrl: 'detailpoupdate.html',
})
export class DetailpoupdatePage {
  myForm: FormGroup;
  private items = [];
  private nextno = '';
  private detailno = '';
  private docno = '';
  private orderno = '';
  private itemno = '';
  private qty = '';
  private unit = '';
  private itemdesc = '';
  private itemdiv = '';
  private token:any;

  error_messages = {
    'docno': [
      { type: 'required', message: 'Doc No Must Be Fill' }

    ],
    'orderno': [
      { type: 'required', message: 'Order No Must Be Fill' }
    ],
    'itemno': [
      { type: 'required', message: 'Item No Must Be Fill' }
    ],
    'qty': [
      { type: 'required', message: 'Qty Date Must Be Fill' }
    ],
    'unit': [
      { type: 'required', message: 'Unit Code Must Be Fill' }
    ]

  }
  item: any = {};
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
      itemno: ['', Validators.compose([Validators.required])],
      qty: ['', Validators.compose([Validators.required])],
      unit: ['', Validators.compose([Validators.required])],
    })
    this.getItems();
    this.detailno = navParams.get('detailno')
    this.docno = navParams.get('docno')
    this.orderno = navParams.get('orderno');
    this.itemno = navParams.get('itemno');
    this.qty = navParams.get('qty');
    this.unit = navParams.get('unit');
    this.myForm.get('docno').setValue(this.docno);
    this.myForm.get('orderno').setValue(this.orderno);
    this.myForm.get('itemno').setValue(this.itemno);
    this.myForm.get('qty').setValue(this.qty);
    this.myForm.get('unit').setValue(this.unit);
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
  getItems() {
    this.api.get('table/items', { params: { limit: 100 } }).subscribe(val => {
      this.items = val['data'];
    });
  }
  ionViewDidLoad() {

  }
  closeModal() {
    this.viewCtrl.dismiss();
  }
  onChange(item) {
    this.item = item;
    this.itemdesc = item.description;
    this.itemdiv = item.division_code;
  }
  updatePODetail() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");

    this.api.put("table/purchasing_order_detail",
      {
        "po_detail_no": this.detailno,
        "doc_no": this.myForm.value.docno,
        "order_no": this.myForm.value.orderno,
        "item_no": this.myForm.value.itemno,
        "description": this.itemdesc,
        "division": this.itemdiv,
        "qty": this.myForm.value.qty,
        "unit": this.myForm.value.unit
      },
      { headers })
      .subscribe(
        (val) => {
          this.api.put("table/receiving",
            {
              "receiving_no": this.detailno,
              "doc_no": this.myForm.value.docno,
              "order_no": this.myForm.value.orderno,
              "item_no": this.myForm.value.itemno,
              "division": this.itemdiv,
              "qty": this.myForm.value.qty,
              "unit": this.myForm.value.unit
            },
            { headers })
            .subscribe();
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
