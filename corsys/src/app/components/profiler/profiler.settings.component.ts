import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { IProfilerSettingService, IMessageService, ITranslateService } from '../../interfaces/interfaces';
import { spinnerType, messageType, action } from '../../models/enums';
import { IProfilerCategory, IResponse } from '../../models/viewModels';
import { Subject } from 'rxjs';
@Component({
  selector: 'sp3-comp-profiler-setting',
  templateUrl: './profiler.settings.component.html'
})

export class ProfilerSettingComponent implements OnInit, OnDestroy {

  profilerCategories: IProfilerCategory[] = [];
  profilerCategoriesCopy: IProfilerCategory[] = [];
  ngUnsubscribe: Subject<any> = new Subject<any>();
  invalidFlag: boolean = true;
  invalidCancelFlag: boolean = true;
  regexKey: string = '^[0-9]{0,3}$';
  constructor( @Inject('IProfilerSettingService') private profilerSettingService: IProfilerSettingService,
   @Inject('IMessageService') private messageService: IMessageService,
   @Inject('ITranslateService') public translateService: ITranslateService) { }
  ngOnInit(): void {

    this.profilerSettingService.getProfilerSetting().
      takeUntil(this.ngUnsubscribe).
      subscribe((result: IResponse<IProfilerCategory[]>) => {
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('ProfilerInfo'), footerMessage: this.translateService.instant('ProfilerSettingsLoading'), showLoader: true, type: spinnerType.small };
        this.profilerCategories = result.data;
        this.profilerCategoriesCopy = JSON.parse(JSON.stringify(this.profilerCategories));
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('ProfilerInfo'), footerMessage: this.translateService.instant('ProfilerSettingsLoading'), showLoader: false, type: spinnerType.small };
      });

  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public revertDetails() {
    this.profilerCategories.length = 0;
    this.profilerCategories = JSON.parse(JSON.stringify(this.profilerCategoriesCopy));
    this.invalidFlag = false;
  }

  public saveChanges() {
    this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('ProfilerInfo'), footerMessage: this.translateService.instant('ProfilerSettingsSaving'), showLoader: true, type: spinnerType.small };
    var payLoad: IProfilerCategory[] = this.profilerCategories.map(function (obj) {
      return { id: obj.id, threshold: +obj.threshold };
    });
    this.profilerSettingService.patchProfilerSetting({ 'CategoryList': payLoad }).subscribe(result => {
      this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('ProfilerInfo'), footerMessage: this.translateService.instant('ProfilerSettingsSaving'), showLoader: false, type: spinnerType.small };
      this.profilerCategoriesCopy = JSON.parse(JSON.stringify(this.profilerCategories));
      this.invalidFlag=true;
      this.invalidCancelFlag=true;
      this.messageService.resetPageChange();
    }, (error: IResponse<any>) => {
      this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('ProfilerInfo'), footerMessage: this.translateService.instant('ProfilerSettingsSaving'), showLoader: false, type: spinnerType.small };
      this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
    });
  }

  public onDataChange() {
    var test = new RegExp(this.regexKey, 'g');
    this.invalidCancelFlag = false;
    this.messageService.setPageChange(action.profileEdit, true);
    this.invalidFlag = this.profilerCategories.filter((param: IProfilerCategory) => {
      let threshold: string = '' + param.threshold;
      var result = ((threshold === '') || (typeof threshold === 'undefined') || !String(threshold).match(test) || (+threshold < 0 || +threshold > 100));
      return result;
    }).length > 0;
  }
}
