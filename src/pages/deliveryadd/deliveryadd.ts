import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiProvider } from "../../providers/api/api";
import { HttpHeaders } from "@angular/common/http";

@IonicPage()
@Component({
  selector: 'page-deliveryadd',
  templateUrl: 'deliveryadd.html',
})
export class DeliveryaddPage {

  myForm: FormGroup;
  address:'';
  error_messages = {
    'delivery_no': [
      { type: 'required', message: 'Harus di isi' }
      // { type: 'minlength', message: 'Karakter terlalu sedikit' },
      // { type: 'maxlength', message: 'Karakter terlalu banyak' },
      // { type: 'pattern', message: 'Harus angka' },
      // { type: 'validusername', message: 'Username Salah' },

    ],
    'invoice_no': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'receipt_name': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'state': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'delivery_date': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'hp_no': [
      { type: 'required', message: 'kolom tidak boleh kosong' },
      { type: 'pattern', message: 'Harus angka' },
      { type: 'minlength', message: 'Karakter terlalu sedikit' },
    ],
    'address': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'latitude': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'longitude': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ]
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public fb: FormBuilder,
    private alertCtrl: AlertController,
    public api: ApiProvider,
    private modal: ModalController
  ) {
    this.address = navParams.get('param');
    this.myForm = fb.group({
      delivery_no: ['', Validators.compose([Validators.required])],
      invoice_no: ['', Validators.compose([Validators.required])],
      receipt_name: ['', Validators.compose([Validators.required])],
      state: ['', Validators.compose([Validators.required])],
      delivery_date: ['', Validators.compose([Validators.required])],
      hp_no: ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.pattern(/^[0-9]+$/)])],
      address: ['', Validators.compose([Validators.required])],
      latitude: ['', Validators.compose([Validators.required])],
      longitude: ['', Validators.compose([Validators.required])],
    })

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DeliveryaddPage');
    console.log(this.address);
  }
  insertDelivery() {
    if (!this.myForm.valid) { return }
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");

    this.api.post("table/delivery",
      {
        "delivery_no": this.myForm.value.delivery_no,
        "invoice_no": this.myForm.value.invoice_no,
        "receipt_name": this.myForm.value.receipt_name,
        "state": this.myForm.value.state,
        "delivery_date": this.myForm.value.delivery_date,
        "hp_no": this.myForm.value.hp_no,
        "address": this.myForm.value.address,
        "latitude": this.myForm.value.latitude,
        "longitude": this.myForm.value.longitude
      },
      { headers })
      .subscribe(
      (val) => {
        console.log("POST call successful value returned in body",
          val);
        this.myForm.reset()
        let alert = this.alertCtrl.create({
          title: 'Sukses',
          subTitle: 'Insert Sukses',
          buttons: ['OK']
        });
        alert.present();

      },
      response => {
        console.log("POST call in error", response);
      },
      () => {
        console.log("The POST observable is now completed.");
      });
  }
  openMapModal() {
    let openMapModal = this.modal.create('MapmodalPage', this.modal, { cssClass: "modal-fullscreen" });
    openMapModal.present();
  }
  closeDeliveryadd() {
    this.navCtrl.pop();
  }

}
