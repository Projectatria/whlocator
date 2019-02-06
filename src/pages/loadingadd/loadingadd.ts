import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiProvider } from "../../providers/api/api";
import { HttpHeaders } from "@angular/common/http";

@IonicPage()
@Component({
  selector: 'page-loadingadd',
  templateUrl: 'loadingadd.html',
})
export class LoadingaddPage {

  myForm: FormGroup;
  error_messages = {
    'loading_no': [
      { type: 'required', message: 'Harus di isi' }
      // { type: 'minlength', message: 'Karakter terlalu sedikit' },
      // { type: 'maxlength', message: 'Karakter terlalu banyak' },
      // { type: 'pattern', message: 'Harus angka' },
      // { type: 'validusername', message: 'Username Salah' },

    ],
    'invoice_no': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'qc_no': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'state': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'loading_date': [
      { type: 'required', message: 'Silahkan pilih tanggal' }
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
      loading_no: ['', Validators.compose([Validators.required])],
      invoice_no: ['', Validators.compose([Validators.required])],
      state: ['', Validators.compose([Validators.required])],
      qc_no: ['', Validators.compose([Validators.required])],
      loading_date: ['', Validators.compose([Validators.required])],
      latitude: ['', Validators.compose([Validators.required])],
      longitude: ['', Validators.compose([Validators.required])],
    })
  }
  closeLoadingadd(){
    this.navCtrl.pop();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoadingaddPage');
  }

  insertLoading() {
    if (!this.myForm.valid) { return }
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");

    this.api.post("table/loading",
      {
        "loading_no": this.myForm.value.loading_no,
        "invoice_no": this.myForm.value.invoice_no,
        "qc_no": this.myForm.value.qc_no,
        "state": this.myForm.value.state,
        "loading_date": this.myForm.value.loading_date,
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

}
