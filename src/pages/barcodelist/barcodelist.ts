import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { ApiProvider } from '../../providers/api/api';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-barcodelist',
  templateUrl: 'barcodelist.html',
})
export class BarcodelistPage {
  batchno = null;
  orderno = null;
  itemno = null;
  qty = null;
  i = null;
  arr = [];
  private token:any;

  private barcode = [];
  private totaldata: any;
  constructor(
    public api: ApiProvider, 
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private barcodeScanner: BarcodeScanner, 
    private viewCtrl: ViewController,
    public storage: Storage
  ) {
    this.batchno = navParams.get('batchno');
    this.orderno = navParams.get('orderno');
    this.itemno = navParams.get('itemno');
    this.qty = navParams.get('qty');
    this.getItems();
    for (this.i = 0; this.i < this.qty; this.i++) {
      this.arr.push(this.i);
    }    
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
    this.api.get("table/purchasing_order_detail", {
      params:
        {
          filter: 'order_no=' + "'" + this.orderno + "'" +
            ' ' + 'and' + ' ' +
            'item_no=' + "'" + this.itemno + "'"
        }
    }).subscribe(val => {
      this.barcode = val['data'];
      this.totaldata = val['count'];

    })
  }
  ionViewDidLoad() {
  }
  closeModal() {
    this.viewCtrl.dismiss();
  }
  doPrint() {
    var divHeaders = document.getElementById("printareaheader").innerHTML;
    var divContents = document.getElementById("printarea").innerHTML;
    var printWindow = window.open();
    printWindow.document.write('<html><head><title>Barcode Print</title>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div style="padding-top:10px;padding-bottom:10px;text-align:center;border:1px solid;border-color:#dedede">');
    printWindow.document.write(divHeaders);
    printWindow.document.write('</div>');
    printWindow.document.write('<div style="margin-top:10px;text-align:center;border:1px solid;border-color:transparent">');
    for (let i = 0; i < this.qty; i++) {
      printWindow.document.write('<div style="text-align:center;float:left;padding-top:10px;width:24%;margin-bottom:5px;margin-right:5px;border:1px solid;border-color:#dedede"">');
      printWindow.document.write(divContents);
      printWindow.document.write('</div>');
    }
    printWindow.document.write('</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
    //window.print();
  }
  openfolder() {
    var thePath = 'C:\\Windows';
		window.open('file://' + thePath, 'explorer');
  }
}
