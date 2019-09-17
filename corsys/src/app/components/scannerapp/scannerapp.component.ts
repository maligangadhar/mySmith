import { Component, OnInit, Inject } from '@angular/core';
import { IScannerService, IDateFormatService, IMessageService, ITranslateService } from '../../interfaces/interfaces';
import { IScannerObject } from '../../models/viewModels';
import { responseStatus, spinnerType, messageType } from '../../models/enums';
import { Router, ActivatedRoute } from '@angular/router';
// import { ModalSuccessComponent } from '../modal/modal.success.component';
// import { ModalConfirmComponent } from '../modal/modal.confirm.component';
import { IMyDateRangeModel } from '@corsys/daterangepicker';
@Component({
  selector: 'sp3-comp-scanner',
  templateUrl: './scannerapp.component.html'
})
export class ScannerComponent implements OnInit {
  //@ViewChild('modalSuccess') modalSuccess: ModalSuccessComponent;
  //@ViewChild('modalFailure') modalFailure: ModalConfirmComponent;
  scannerviewToggle: number = 1;
  data: IScannerObject[];
  selectedassociation: string[];
  totalRecords: number = 0;
  mapResponse: number = -1;
  dataParams = { association: false, pageNo: 1, pageSize: 30, filter: '' };
  scanDate: string = null;
  arrivalbeginDate: any = '';
  arrivalEndDate: any = '';
  dateRangeSetArrival: (event: IMyDateRangeModel) => void;
  constructor(
    @Inject('IScannerService') private scannerService: IScannerService,
    private router: Router, private activatedRoute: ActivatedRoute,
    @Inject('IDateFormatService') private dateFormatService: IDateFormatService,
    // @Inject('IDateTimeFormatService') private dateTimeFormatService: IDateTimeFormatService,
    @Inject('ITranslateService') private translateService: ITranslateService,
    @Inject('IMessageService') private messageService: IMessageService) {

    this.activatedRoute.params.subscribe(params => {
      this.mapResponse = parseInt(params.mapSuccess);
      if (params.mapSuccess === undefined || params.mapSuccess === NaN) {
        this.mapResponse = -1;
      }
    });
    this.dateRangeSetArrival = (event: IMyDateRangeModel) => {
      if (event.beginJsDate !== null && event.endJsDate !== null) {
        this.arrivalbeginDate = this.dateFormatService.formatDateforApi(event.beginJsDate);
        if (event.endJsDate !== null ) {
          let setEndDate = new Date(event.endJsDate);
          setEndDate.setHours(23);
          setEndDate.setMinutes(59);
          setEndDate.setSeconds(59);
        this.arrivalEndDate = this.dateFormatService.formatDateforApi(setEndDate);
          
        }
        this.dataParams.filter = 'TimeStamp^IN^(' + this.arrivalbeginDate + ',' + this.arrivalEndDate + ')';
      } else {
        this.dataParams.filter = '';
      }
    };

  }
  /**
   * Executed when the user clicks on the Change Scanner Button
   */
  showScannerList() {
    this.scannerviewToggle = 0;
  }
  showScansList() {
    this.scannerviewToggle = 1;
  }

  /**
   * This is triggered when the user clicks on the Batch Id
   */
  openScannedImage = (scan: IScannerObject) => {
    this.router.navigate(['IA', { scanToOpen: scan.scanId, scanDate: scan.scanDateTime, scanContainer: scan.containerId, source: 'scanApp' }]);
    this.scannerviewToggle = 2;
  }

  /**
   * This is triggered when the user is trying to dril down
   */
  lisItemChanges = (event) => {
    this.scannerviewToggle = event;
  }



  getScannedItemList = () => {
    this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ScanDetails'), showLoader: true, type: spinnerType.small };
    this.scannerService.getScanItemList(this.dataParams).subscribe(result => {
      if (result.status === responseStatus.Success) {
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ScanDetails'), showLoader: false, type: spinnerType.small };
        this.data = result.data ? this.formatResultList(result.data.scans) : [];
        this.totalRecords = result.data['count'];
      } else {
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ScanDetails'), showLoader: false, type: spinnerType.small };
        this.data = [];
      }
    }, (error) => {
      this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
      this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ScanDetails'), showLoader: false, type: spinnerType.small };
    });
  }
  ngOnInit() {
    this.getScannedItemList();
    this.mapResponse = -1;
  }

  formatResultList = (result: IScannerObject[]): IScannerObject[] => {
    return result.map((val: IScannerObject) => {
      return {
        scanId: val.scanId,
        scanDateTime: val.scanDateTime,
        containerId: val.containerId ? val.containerId : ''
      };
    });
  }

  /**  
   * Code Block for Lazy load
   */

  loadCasesLazy = (pageNo: number) => {
    this.dataParams.pageNo = pageNo;
    this.getScannedItemList();

  }

  onDateChange = (date: any) => {
    this.scanDate = date;
  }

  applyFilter = () => {
    this.getScannedItemList();
  }
}
