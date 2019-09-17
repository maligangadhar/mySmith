import { Component, OnInit, Inject } from '@angular/core';
import { IOperationDashboardDetail } from '../../models/viewModels';
import { IOperationDashboardSettingService, IMessageService, ITranslateService } from '../../interfaces/interfaces';
import { spinnerType, action } from '../../models/enums';

@Component({
  selector: 'sp3-comp-opdash-setting',
  templateUrl: './operationalDashboard.component.html'
})
export class OperationalDashboardSettingComponent implements OnInit {
  constructor(
    @Inject('IOperationDashboardSettingService') private opDashboardService: IOperationDashboardSettingService,
    @Inject('ITranslateService') public translateService: ITranslateService,
    @Inject('IMessageService') private messageService: IMessageService){}
  regexKey: string = '^[0-9]{0,3}$';
  opdThreshold: IOperationDashboardDetail = { appId: 0, 
    appName: '', 
    settings: [
      {
        settingsName: '', 
        settingsValue: '0'
      }
    ]
  };
  opdThresholdCopy: IOperationDashboardDetail;
  isInvalid: boolean = false;
  onParamChange = () => {
    let regex = new RegExp(this.regexKey, 'g');
    let param = this.opdThreshold.settings[0].settingsValue;
    this.messageService.setPageChange(action.operationalEdit, true); 
    this.isInvalid = (param === '' || !param.match(regex) || (param.match(regex).length === 0) || +param < 0 || +param > 100);
  }

  saveChanges = () => {
    this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('OperationalDashBoardSetting'), footerMessage: this.translateService.instant('DashboardSaving'), showLoader: true, type: spinnerType.small };
    this.opDashboardService.patch(this.opdThreshold).subscribe( (result) => {
      this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('OperationalDashBoardSetting'), footerMessage: this.translateService.instant('DashboardSaving'), showLoader: false, type: spinnerType.small };
    });
  }

  cancelChanges = () => {
    this.opdThreshold = JSON.parse(JSON.stringify(this.opdThresholdCopy));
    this.onParamChange();
  }

  ngOnInit(): void {
    this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('OperationalDashBoardSetting'), footerMessage: this.translateService.instant('DashboardLoading'), showLoader: true, type: spinnerType.small };    
    this.opDashboardService.get('2').subscribe( (result) => {
      this.opdThreshold = result.data;
      this.opdThresholdCopy = JSON.parse(JSON.stringify(this.opdThreshold));
      this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('OperationalDashBoardSetting'), footerMessage: this.translateService.instant('DashboardLoading'), showLoader: false, type: spinnerType.small };
      
    });
  }
}
