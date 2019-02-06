import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiProvider } from "../../providers/api/api";
import { HttpHeaders } from "@angular/common/http";

@IonicPage()
@Component({
  selector: 'page-receivingcustadd',
  templateUrl: 'receivingcustadd.html',
})
export class ReceivingcustaddPage {

  myForm: FormGroup;
  error_messages = {
    'receivingcust_no': [
      { type: 'required', message: 'Harus di isi' }
      // { type: 'minlength', message: 'Karakter terlalu sedikit' },
      // { type: 'maxlength', message: 'Karakter terlalu banyak' },
      // { type: 'pattern', message: 'Harus angka' },
      // { type: 'validusername', message: 'Username Salah' },

    ],
    'invoice_no': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'receivingcust_date': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'receivingcust_time': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'receiver_name': [
      { type: 'required', message: 'Silahkan pilih tanggal' }
    ],
    'state': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'latitude': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'longitude': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ]
  }

  constructor(public navCtrl: NavController, public navParams: NavParams, public fb: FormBuilder, private alertCtrl: AlertController, public api: ApiProvider) {
    this.myForm = fb.group({
      receivingcust_no: ['', Validators.compose([Validators.required])],
      invoice_no: ['', Validators.compose([Validators.required])],
      receivingcust_date: ['', Validators.compose([Validators.required])],
      receivingcust_time: ['', Validators.compose([Validators.required])],
      receiver_name: ['', Validators.compose([Validators.required])],
      state: ['', Validators.compose([Validators.required])],
      latitude: ['', Validators.compose([Validators.required])],
      longitude: ['', Validators.compose([Validators.required])],
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReceivingaddPage');
  }

  insertReceiving() {
    if (!this.myForm.valid) { return }
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");

    this.api.post("table/receivingcust",
      {
        "receivingcust_no": this.myForm.value.receivingcust_no,
        "invoice_no": this.myForm.value.invoice_no,
        "receivingcust_date": this.myForm.value.receivingcust_date,
        "receivingcust_time": this.myForm.value.receivingcust_time,
        "receiver_name": this.myForm.value.receiver_name,
        "state": this.myForm.value.state,
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

  closeReceivingcustadd(){
    this.navCtrl.pop();
  }

}
