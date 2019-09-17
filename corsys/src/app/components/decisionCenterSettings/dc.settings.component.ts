import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { IMessageService, IGeneralSettings, ITranslateService } from '../../interfaces/interfaces';
import { spinnerType, messageType, settingsAppIds, responseStatus, action } from '../../models/enums';
import { IResponse, IAppSettingsDetails, IAppSetting } from '../../models/viewModels';
import { Subject } from 'rxjs';
@Component({
  selector: 'sp3-comp-dc-setting',
  templateUrl: './dc.settings.component.html'
})

export class DCSettingComponent implements OnInit, OnDestroy {

  dcCategories: IAppSetting[] = [];
  dcCategoriesCopy: IAppSetting[] = [];
  dcCategoriesDetails: IAppSettingsDetails = {appId:0,appName:'', settings:[]};
  ngUnsubscribe: Subject<any> = new Subject<any>();
  invalidFlag: boolean = true;
  invalidCancelFlag: boolean = true;
  regexKey: string = '^[0-9]{0,6}$';
  dcsettingsId: number = null;
  constructor(@Inject('IGeneralSettings') private generalSettings: IGeneralSettings,
              @Inject('ITranslateService') private translateService: ITranslateService,
              @Inject('IMessageService') private messageService: IMessageService) { }

  ngOnInit(): void {
    this.generalSettings.fetchOpAdminSettings(settingsAppIds.DecisionCentre).
      subscribe((result: IResponse<IAppSettingsDetails>) => {
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('DecisionCenterInfo'), footerMessage: this.translateService.instant('DecisionCenterLoading'), showLoader: true, type: spinnerType.small };
        //console.log(JSON.stringify(result.data));
        this.dcCategoriesDetails=result.data;
        this.dcCategories = result.data.settings;
        this.dcCategoriesCopy = JSON.parse(JSON.stringify(this.dcCategories));
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('DecisionCenterInfo'), footerMessage: this.translateService.instant('DecisionCenterLoading'), showLoader: false, type: spinnerType.small };
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public revertDetails() {
    this.dcCategories.length = 0;
    this.dcCategories = JSON.parse(JSON.stringify(this.dcCategoriesCopy));
    this.invalidFlag = false;
  }

  public saveChanges() {
    this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('DecisionCenterInfo'), footerMessage: this.translateService.instant('DecisionCenterSaving'), showLoader: true, type: spinnerType.small };
    var payLoad: IAppSetting[] = this.dcCategories.map(function (obj) {
      return { settingsName : obj.settingsName, settingsValue: obj.settingsValue, settingsId: obj.settingsId  };
    });
    var payLoadToUpdate: IAppSettingsDetails={
      appId:this.dcCategoriesDetails.appId,
      appName: this.dcCategoriesDetails.appName,
      settings:payLoad
    };
  this.generalSettings.updateOpAdminSettings(payLoadToUpdate).subscribe(result => {
    //console.log(result.status);
    if(result.status===responseStatus.Success)
    {
      this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('DecisionCenterInfo'), footerMessage: this.translateService.instant('DecisionCenterSaving'), showLoader: false, type: spinnerType.small };
      this.dcCategoriesCopy = JSON.parse(JSON.stringify(this.dcCategories));
     }
     else
     {
      this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('DecisionCenterInfo'), footerMessage: this.translateService.instant('DecisionCenterSaving'), showLoader: false, type: spinnerType.small };
      this.dcCategories = JSON.parse(JSON.stringify(this.dcCategoriesCopy));
     }
    }, (error: IResponse<any>) => {
      this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('DecisionCenterInfo'), footerMessage: this.translateService.instant('DecisionCenterSaving'), showLoader: false, type: spinnerType.small };
      this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
    });
  }
  
  public onDataChange () {
    var test = new RegExp(this.regexKey, 'g');
    this.invalidCancelFlag = false;
    this.messageService.setPageChange(action.dcEdit, true); 
    this.invalidFlag = this.dcCategories.filter((param: IAppSetting) => {
      let threshold: string = '' + param.settingsValue;
      var result = ((threshold === '') || (typeof threshold === 'undefined') || !String(threshold).match(test) || (+threshold < 0 || +threshold > 10000));
      return result;
    }).length > 0;
  }
}
