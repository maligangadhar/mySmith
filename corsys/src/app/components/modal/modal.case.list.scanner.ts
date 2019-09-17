import { Component, OnDestroy, Inject, Input, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { ITranslateService } from '../../interfaces/interfaces';
import { IMetadataImages } from '../../models/viewModels';
import { Subject } from 'rxjs/Subject';
import { responseStatus } from '../../models/enums';
import { ICaseService, IScannerService, IMessageService } from '../../interfaces/interfaces';
import { caseStatus, metaDataSettings, spinnerType } from '../../models/enums';
import { ICase, ICaseGetResponse, ICodeValue, IScreeningCaseDecisionCenter, IResponse } from '../../models/viewModels';
@Component({
  selector: 'sp3-comp-case-list-scanner',
  templateUrl: './modal.case.list.scanner.html'
})

export class SpCaseListScannerComponent implements OnDestroy,OnChanges {

  isLoading: boolean;
  scanIdToMap:string='';
  modalviewToggle:number=3;
  isUpdating: boolean = false;
  findingsHeader: {} = [this.translateService.instant('Finding_Category'),
  this.translateService.instant('Finding_GoodsType'), this.translateService.instant('Finding_Description')];
  ngUnsubscribe: Subject<any> = new Subject<any>();
  metadataImages: IMetadataImages = {
    AnnotationShapes: [], assessmentResults: [], assessmentTypes: [],
    CategoryTypes: [], Drugs: [], EffectType: [], PreliminaryAssessments: [], Weapons: []
  };
  @Output() onScanMapResponse: EventEmitter<number> = new EventEmitter<number>();
  @Input() public containerId: string;
  caseList:ICaseGetResponse={cases:[], count:0};
  filterCriteria: any[]=[];
  //getFindings: any;
  getImageAnalyzerMetadata: () => void;
  pairCase: (caseId: ICase) => void;
  declare: (event) => void;
  public visible = false;
	public visibleAnimate = false;

	public show(value: string, scanId:string): void {
    this.visible = true;
    this.scanIdToMap=scanId;
    setTimeout(() => this.visibleAnimate = true);
    this.getFindings(value);
	}

	public hide(): void {
		this.visibleAnimate = false;
		setTimeout(() => this.visible = false, 300);
  }
  public dismissNoModalpopup():void{
    this.visible=false;
    this.containerId='';
  }
  public  caseActionConversion(cases, countryList: ICodeValue[]): IScreeningCaseDecisionCenter[] {
    return cases.map(param => {
        let from = countryList.filter(obj => {
            return obj.code === param.from;
        })[0];
        if (from) {
            param.from = from.name;
        }

        let to = countryList.filter(obj => {
            return obj.code === param.to;
        })[0];
        if (to) {
            param.to = to.name;
        }

        return param;
    });
}
  public getFindings = (value:string) => {
    this.containerId=value;
    this.isLoading = true;
    this.filterCriteria=[];
    this.filterCriteria.push({fieldName: 'ContainerId', fieldValue: this.containerId});
    if (this.containerId && this.containerId !== null &&this.containerId.trim() !== '')  {
      this.caseService.getSearchCases(null, null, this.filterCriteria,true, null, '^AND^Status^IN^('+ caseStatus.AwaitingScan + ')').subscribe(result => {
        this.caseService.fetchCaseCreateMetaData(metaDataSettings.Cases).subscribe(obj => {
            if (obj.status === responseStatus.Success) {
              this.caseList.cases=this.caseActionConversion(result.data.cases, obj.data.Country);
              this.modalviewToggle=1;
              this.isLoading = false;
            }
        });
    });
    }
  }
  constructor(@Inject('ITranslateService') private translateService: ITranslateService,
  @Inject('IMessageService') private messageService: IMessageService,
    @Inject('ICaseService') private caseService: ICaseService, @Inject('IScannerService') private scannerService: IScannerService, ) {

      this.pairCase = (caseId: ICase) => {
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('PairingCase'), footerMessage: this.translateService.instant('SaveInProgress'), showLoader: true, type: spinnerType.small };
        if (caseId.containerIds && caseId.containerIds[0] !== null &&caseId.containerIds[0].trim() !== '' &&
        this.scanIdToMap && this.scanIdToMap !== null &&this.scanIdToMap.trim() !== '')  {
          this.scannerService.mapScanToCase(caseId.containerIds[0].trim(), this.scanIdToMap.trim()).subscribe(result => {
            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('PairingCase'), footerMessage: this.translateService.instant('SaveInProgress'), showLoader: false, type: spinnerType.small };
            if (result.status === responseStatus.Success) {
              this.onScanMapResponse.emit(0);
            }
            else{
              this.onScanMapResponse.emit(1);
            }
        },
        (error: IResponse<any>) => {
          this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('MatchingCase'), footerMessage: this.translateService.instant('SaveInProgress'), showLoader: false, type: spinnerType.small };
            this.onScanMapResponse.emit(1);
        });
        }
    };
  }
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (let propName in changes) {
        switch (propName) {
          case 'containerId':
            break;
        }
    }
}
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
