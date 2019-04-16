import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-suratjalan',
  templateUrl: 'suratjalan.html',
})
export class SuratjalanPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController) {
  }
  closeModal() {
    this.viewCtrl.dismiss();
  }
  doPrint() {
    var divContents = document.getElementById("printarea").innerHTML;
    var printWindow = window.open();
    printWindow.document.write('<html><head><title>Surat Jalan</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('.table-border {border: 1px solid black;border-collapse: collapse;padding: 5px;text-align: center;}')
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div style="margin-top:10px;text-align:center;border:1px solid;border-color:transparent">');
    printWindow.document.write(divContents);
    printWindow.document.write('</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  }
}
