import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiProvider } from "../../providers/api/api";
import { HttpHeaders } from "@angular/common/http";

@IonicPage()
@Component({
  selector: 'page-truckadd',
  templateUrl: 'truckadd.html',
})
export class TruckaddPage {

  myForm: FormGroup;
  error_messages = {
    'truck_no': [
      { type: 'required', message: 'Truck Number Salah' }
      // { type: 'minlength', message: 'Karakter terlalu sedikit' },
      // { type: 'maxlength', message: 'Karakter terlalu banyak' },
      // { type: 'pattern', message: 'Harus angka' },
      // { type: 'validusername', message: 'Username Salah' },

    ],
    'staff_name': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'invoice_no': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'latitude': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'longitude': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ]
  }

  constructor(public navCtrl: NavController, public navParams: NavParams, public api: ApiProvider, public fb: FormBuilder, private alertCtrl: AlertController) {
    this.myForm = fb.group({
      truck_no: ['', Validators.compose([Validators.required])],
      staff_name: ['', Validators.compose([Validators.required])],
      state: ['', Validators.compose([Validators.required])],
      posting_date: ['', Validators.compose([Validators.required])],
      latitude: ['', Validators.compose([Validators.required])],
      longitude: ['', Validators.compose([Validators.required])],
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TruckaddPage');
  }

  insertTruck() {
    if (!this.myForm.valid) { return }
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");

    this.api.post("table/truck",
      {
        "truck_no": this.myForm.value.truck_no,
        "staff_name": this.myForm.value.staff_name,
        "state": this.myForm.value.state,
        "posting_date": this.myForm.value.posting_date,
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
  closeTruckadd(){
    this.navCtrl.pop();
  }

}
