import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiProvider } from "../../providers/api/api";
import { HttpHeaders } from "@angular/common/http";

@IonicPage()
@Component({
  selector: 'page-installationadd',
  templateUrl: 'installationadd.html',
})
export class InstallationaddPage {

  myForm: FormGroup;
  error_messages = {
    'installation_no': [
      { type: 'required', message: 'Harus di isi' }
      // { type: 'minlength', message: 'Karakter terlalu sedikit' },
      // { type: 'maxlength', message: 'Karakter terlalu banyak' },
      // { type: 'pattern', message: 'Harus angka' },
      // { type: 'validusername', message: 'Username Salah' },

    ],
    'installation_date': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'installation_time': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'state': [
      { type: 'required', message: 'kolom tidak boleh kosong' }
    ],
    'staff_name': [
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
      installation_no: ['', Validators.compose([Validators.required])],
      installation_date: ['', Validators.compose([Validators.required])],
      installation_time: ['', Validators.compose([Validators.required])],
      state: ['', Validators.compose([Validators.required])],
      staff_name: ['', Validators.compose([Validators.required])],
      latitude: ['', Validators.compose([Validators.required])],
      longitude: ['', Validators.compose([Validators.required])],
    })
  }
  closeInstallationadd(){
    this.navCtrl.pop();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InstallationaddPage');
  }

  insertInstallation() {
    if (!this.myForm.valid) { return }
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");

    this.api.post("table/installation",
      {
        "installation_no": this.myForm.value.installation_no,
        "installation_date": this.myForm.value.installation_date,
        "installation_time": this.myForm.value.installation_time,
        "state": this.myForm.value.state,
        "staff_name": this.myForm.value.staff_name,
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
