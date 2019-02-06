import { Component } from '@angular/core';
import { ModalController, ViewController, IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
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
  selector: 'page-detailpoactionupdate',
  templateUrl: 'detailpoactionupdate.html',
})
export class DetailpoactionupdatePage {
  myForm: FormGroup;
  private items = [];
  private nextno = '';
  private detailno = '';
  private docno = '';
  private orderno = '';
  private itemno = '';
  private qty = '';
  private receivingpic = '';
  private locationplan = '';
  private token:any;

  error_messages = {
    'docno': [
      { type: 'required', message: 'Doc No Must Be Fill' }

    ],
    'orderno': [
      { type: 'required', message: 'Order No Must Be Fill' }
    ],
    'itemno': [
      { type: 'required', message: 'Item No No Must Be Fill' }
    ],
    'qty': [
      { type: 'required', message: 'Qty Date Must Be Fill' }
    ],
    'receivingpic': [
      { type: 'required', message: 'Receiving PIC Must Be Fill' }
    ],
    'locationplan': [
      { type: 'required', message: 'Location Plan Must Be Fill' }
    ]
    
  }
  item:any = {};
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public fb: FormBuilder,
    public api: ApiProvider,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public storage: Storage
    
  ) {
    this.myForm = fb.group({
      docno: ['', Validators.compose([Validators.required])],
      orderno: ['', Validators.compose([Validators.required])],
      itemno: ['', Validators.compose([Validators.required])],
      qty: ['', Validators.compose([Validators.required])],
      receivingpic: ['', Validators.compose([Validators.required])],
      locationplan: ['', Validators.compose([Validators.required])],
    })
    this.getItems();
    this.detailno = navParams.get('detailno')
    this.docno = navParams.get('docno')
    this.orderno = navParams.get('orderno');
    this.itemno = navParams.get('itemno');
    this.qty = navParams.get('qty');
    this.receivingpic = navParams.get('receivingpic');
    this.locationplan = navParams.get('locationplan');
    this.myForm.get('docno').setValue(this.docno);
    this.myForm.get('orderno').setValue(this.orderno);
    this.myForm.get('itemno').setValue(this.itemno);
    this.myForm.get('qty').setValue(this.qty);
    this.myForm.get('receivingpic').setValue(this.receivingpic);
    this.myForm.get('locationplan').setValue(this.locationplan);
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
  }
  doUpdateReceiving() {
      const headers = new HttpHeaders()
        .set("Content-Type", "application/json");

      this.api.put("table/receiving",
        {
          "receiving_no" : this.detailno,
          "position": this.myForm.value.locationplan,
          "status": 'inpg',
          "receiving_pic": this.myForm.value.receivingpic
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
  showLocation(){
    let locationModal = this.modalCtrl.create('LocationPage', 
    { cssClass: "modal-fullscreen" });
    locationModal.present();
  }
}
