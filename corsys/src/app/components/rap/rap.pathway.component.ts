import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { IRAPPathwayService, IMessageService,ICaseService,ITranslateService } from '../../interfaces/interfaces';
import { Subject } from 'rxjs/Subject';
import { lang ,responseStatus,spinnerType,messageType, action} from '../../models/enums';
import { IResponse,IRAPScore } from '../../models/viewModels';

@Component({
  selector: 'sp3-comp-rap-pathway',
  templateUrl: './rap.pathway.component.html'
})
export class RapPathwayComponent implements OnInit, OnDestroy  {

  rapCategories: IRAPScore[] = [];
  rapCategoriesCopy: IRAPScore[] = [];
  ngUnsubscribe: Subject<any> = new Subject<any>();
  invalidFlag: boolean = false;
  invalidCancelFlag: boolean = true;
  regexKey: string = '^[0-9]{0,6}$';
  caseStatusList:any[]=[];
  
constructor( @Inject('IRAPPathwayService') private rapService: IRAPPathwayService, @Inject('ITranslateService') private translateService:ITranslateService , @Inject('ICaseService') private caseService:ICaseService, @Inject('IMessageService') private messageService: IMessageService) { }

  ngOnInit() {
    this.caseService.fetchMetadata().subscribe(result => {
        if (result.status === responseStatus.Success) {
            this.caseStatusList = result.data.CargoStatus;
        }
    });
    this.rapService.getRAPScore(lang[lang.EN]).
      takeUntil(this.ngUnsubscribe).
      subscribe((result: IResponse<IRAPScore[]>) => {
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('RAPPathwayInfo'), footerMessage:  this.translateService.instant('RAPPathwayLoading'), showLoader: true, type: spinnerType.small };
        this.rapCategories = result.data;
        this.rapCategories.forEach(rap => {
          if(this.caseStatusList[Object.keys(this.caseStatusList).find(k => this.caseStatusList[k].id === rap.initialCaseStatus)]){
            rap.initialCaseStatusName = this.caseStatusList[Object.keys(this.caseStatusList).find(k => this.caseStatusList[k].id === rap.initialCaseStatus)].name;
          }
        });
        this.rapCategoriesCopy = JSON.parse(JSON.stringify(this.rapCategories));
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('RAPPathwayInfo'), footerMessage:  this.translateService.instant('RAPPathwayLoading'), showLoader: false, type: spinnerType.small };
    });
  }
  public revertDetails() {
    this.rapCategories.length = 0;
    this.rapCategories= JSON.parse(JSON.stringify(this.rapCategoriesCopy));
    this.invalidFlag = false;
    this.messageService.Message = { message: '', showMessage: false, type: messageType.Error };
  }
  public saveChanges() {
    this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('RAPPathwayInfo'), footerMessage:  this.translateService.instant('RAPPathwaySaving'), showLoader: true, type: spinnerType.small };
    var payLoad:IRAPScore[]=this.rapCategories.map(function (obj) {
      return { rapColorId: +obj.rapColorId, minRapScore:+obj.minRapScore,maxRapScore:+obj.maxRapScore };
    });
    this.rapService.patchRAPScore({'rapScoreList': payLoad }).subscribe(result => {
      if (result.status === responseStatus.Success) {
        this.rapCategoriesCopy = JSON.parse(JSON.stringify(this.rapCategories));
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('RAPPathwayInfo'), footerMessage:  this.translateService.instant('RAPPathwaySaving'), showLoader: false, type: spinnerType.small };
        this.messageService.Message = { message: result.messageKey, showMessage: false, type: messageType.Error };
      }else{
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('RAPPathwayInfo'), footerMessage:  this.translateService.instant('RAPPathwaySaving'), showLoader: false, type: spinnerType.small };
          this.messageService.Message = { message: this.translateService.instant('RapErrorMessage'), showMessage: true, type: messageType.Error };
      }
    }, (error: IResponse<any>) => {
      this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('RAPPathwayInfo'), footerMessage:  this.translateService.instant('RAPPathwaySaving'), showLoader: false, type: spinnerType.small };
      this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
    });
  }

  public onDataChange() {
    var regStr = new RegExp(this.regexKey, 'g');
    this.invalidFlag = false;
    this.invalidCancelFlag = false;
    let prevMaxVal:number=0;
    this.messageService.setPageChange(action.rapEdit, true); 
    this.rapCategories.forEach( (el,index) => {
      if( (!String(el.minRapScore).match(regStr) || !String(el.maxRapScore).match(regStr)) ||  (index!==0 &&  prevMaxVal > +el.minRapScore  || +el.minRapScore > +el.maxRapScore)) {
        this.invalidFlag=true;
      }
      prevMaxVal=el.maxRapScore;
    });
  }
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
