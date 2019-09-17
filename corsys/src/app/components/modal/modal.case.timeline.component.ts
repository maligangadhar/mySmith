import { Component, OnInit, Inject, Input } from '@angular/core';
import { ITranslateService, ICaseService, IAnalyzerService, IDateFormatService } from '../../interfaces/interfaces';
import { IResponse, IKeyValue, ITimeLineSectionDetails, ITimeLineSections, ITimeline, IMetadataImages } from '../../models/viewModels';
import { responseStatus, caseStatus, findingStatus, categoryType, viewType ,goodsType0 ,goodsType1,inspectionTypeTimeline } from '../../models/enums';
import { Subject } from 'rxjs';
import { caseEventCodes } from '../../businessConstants/businessConstants';
import {Router} from '@angular/router';
@Component({
    selector: 'sp3-comp-modal-case-timeline',
    templateUrl: './modal.case.timeline.component.html'
})

export class CaseTimeLineComponent implements OnInit {
  @Input() public caseId: string;
    isCaseCreation:boolean=false;
    caseTimeline:ITimeline;
    isLoading:boolean=false;
    getCaseTimeline: any;
    timeLineSectionsDetails:ITimeLineSectionDetails[];
    timeLineSections:ITimeLineSections[];
    ngUnsubscribe: Subject<any> = new Subject<any>();
    cargoStatusList: IKeyValue[] = [];
    metadataImages: IMetadataImages = {
        AnnotationShapes: [], assessmentResults:[], assessmentTypes: [],
        CategoryTypes: [], Drugs: [], EffectType: [], PreliminaryAssessments: [], Weapons: []
    };
    constructor( @Inject('ICaseService') private caseService: ICaseService,
                 @Inject('IAnalyzerService') private analyzerService: IAnalyzerService,
                 @Inject('ITranslateService') public translateService: ITranslateService,
                 @Inject('IDateFormatService') private dateformatService: IDateFormatService,
                 private router:Router) {
        
        this.getCaseTimeline= () => 
        {
            this.isLoading=true;
        this.caseService.getCaseTimeline(this.caseId).takeUntil(this.ngUnsubscribe).subscribe((result) => {
           
            if(result.status===responseStatus.Success)
             {
                this.caseService.fetchMetadata().subscribe(res => {
                      if(res.status===responseStatus.Success)
                      {
                        this.analyzerService.fetchImageAnalyzerMetaData().subscribe(obj => {
                            if (obj.status === responseStatus.Success) {
                                this.metadataImages = obj.data;
                                this.cargoStatusList=res.data.CargoStatus;
                                this.caseTimeline=result.data;
                                this.timeLineSections=result.data.sections;
                                //console.log(JSON.stringify(this.timeLineSections));
                                this.timeLineSections= this.updateCaseSections(this.timeLineSections);
                                this.isLoading=false;
                            }
                        },
                            (error: IResponse<any>) => {
                                    //this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                                    //this.loaderMessage.showLoader = false;
                                    //this.messageService.LoaderMessage = this.loaderMessage;
                                    this.isLoading=false;
                            });

                       
                      }
                      else
                      {
                          this.isLoading=false;
                      }
                },
				(error: IResponse<any>) => {
						//this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
						//this.loaderMessage.showLoader = false;
                        //this.messageService.LoaderMessage = this.loaderMessage;
                        this.isLoading=false;
				 }
               );             
             }
             else
             {
                 this.isLoading=false;
             }
        },
        (error: IResponse<any>) => {
           // this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
            //this.loaderMessage.showLoader = false;
           this.isLoading = false;
        });
    };
}





updateCaseSections (timeLineSections:ITimeLineSections[]):ITimeLineSections[]
{
  
   for(let section in timeLineSections)
   {       
       timeLineSections[section].name=timeLineSections[section].name.trim();
       switch(timeLineSections[section].sectionId)
       {
         case 0:           
         timeLineSections[section].details=this.updateCaseCreationSection(timeLineSections[section].details);
         timeLineSections[section].details=this.updateManualCaseCreationSection(timeLineSections[section].details);
         break;
         case 5:
         timeLineSections[section].details=this.updateImageAssesmentSection(timeLineSections[section].details);
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         break;
         case 2:       
         timeLineSections[section].details=this.updateProfilerSection(timeLineSections[section].details);
         break;
         case 4:
         timeLineSections[section].details=this.updateScanSection(timeLineSections[section].details);
         break;
         case 7:
         timeLineSections[section].details=this.updateInspectionSection(timeLineSections[section].details);
         break;
         case 6:
         timeLineSections[section].details=this.updateSupervisorActionsSection(timeLineSections[section].details);
         break;
         case 3:
         timeLineSections[section].details=this.updateScreeningSection(timeLineSections[section].details);
         break;
         case 30:
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         timeLineSections[section].details=this.inspectionStatusLabel(timeLineSections[section].details);
         break;
         case 10:
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         break;
         case 16:
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         break;
         case 15:
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         break;
         case 10:
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         break;
         case 8:
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         break;
         case 36:
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         break;
         case 42:
         timeLineSections[section].details=this.updateInspectiontabStatusLabel(timeLineSections[section].details);
         timeLineSections[section].details=this.goodsTypeLabel(timeLineSections[section].details);
         break;
         case 43:
         timeLineSections[section].details=this.updateInspectiontabStatusLabel(timeLineSections[section].details);
         timeLineSections[section].details=this.goodsTypeLabel(timeLineSections[section].details);
         break;
         case 44:
         timeLineSections[section].details=this.updateInspectiontabStatusLabel(timeLineSections[section].details);
         timeLineSections[section].details=this.goodsTypeLabel(timeLineSections[section].details);
         break;
         case 18:
         timeLineSections[section].details=this.goodsTypeLabel(timeLineSections[section].details);
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         break;
         case 19:
         timeLineSections[section].details=this.goodsTypeLabel(timeLineSections[section].details);
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         break;
         case 20:
         timeLineSections[section].details=this.goodsTypeLabel(timeLineSections[section].details);
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         break;
         case 24:
         timeLineSections[section].details=this.typeLabel(timeLineSections[section].details);
         break;
         case 25:
         timeLineSections[section].details=this.typeLabel(timeLineSections[section].details);
         break;
         case 41:
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         break;
         case 37:
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         break;
         case 11:
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         timeLineSections[section].name=this.updateRADInpectTypeLabel(timeLineSections[section].details);
         break;
         case 12:
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         timeLineSections[section].name=this.updateRADInpectTypeLabel(timeLineSections[section].details);
         break;
         case 13:
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         timeLineSections[section].name=this.updateRADInpectTypeLabel(timeLineSections[section].details);
         break;
         case 17:
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         break;
         case 39:
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         break;
         case 49:
         timeLineSections[section].details=this.updateCommonStatusLabel(timeLineSections[section].details);
         break;
      }
      let detailSection = timeLineSections[section].details;
      if(detailSection)
      {
          for (let detail in detailSection)
          {            
              if(detailSection[detail].date)
              {          
                  detailSection[detail].date = this.dateformatService.operationalDate(detailSection[detail].date);                   
              }
          }
      }
   }
   return timeLineSections;
}

updateProfilerSection(section:ITimeLineSectionDetails[]):ITimeLineSectionDetails[] 
{
    for (let detail in section)
    {
        if(section[detail].action==='CVPCE'){
          section[detail].statusText=this.translateService.instant(caseStatus[3]);  
        }else if(section[detail].action==='CPSE'){
          section[detail].statusText=this.translateService.instant(caseStatus[section[detail].status]);
        }{
           section[detail].actionText=this.translateService.instant(caseEventCodes[section[detail].action]); 
        }
    }
    return section;
}
updateSupervisorActionsSection(section:ITimeLineSectionDetails[]):ITimeLineSectionDetails[] 
{
    for (let detail in section)
    {
        section[detail].actionText=caseEventCodes[section[detail].action];
        section[detail].statusText=this.translateService.instant(caseStatus[section[detail].status]); 
        if(section[detail].action==='CRAE'||section[detail].action==='CRSE'||section[detail].action=== 'CIAE'|| section[detail].action=== 'CAIE'|| section[detail].action==='CRAFE'||section[detail].action=== 'CIAFE')
        {
            section[detail].isVerdict=true;
            if(Object.keys(this.cargoStatusList).find(k => this.cargoStatusList[k].id === parseInt(section[detail].status)))
            {
                section[detail].statusText=this.cargoStatusList[Object.keys(this.cargoStatusList).find(k => this.cargoStatusList[k].id === parseInt(section[detail].status))].name;
            }

        }
        if(section[detail].action==='CPE'|| section[detail].action==='CPFE'||section[detail].action==='CPRE'||section[detail].action==='CPRFE')
        {
            section[detail].isPriority=true;
            if(section[detail].caseAction)
            {
                if(section[detail].caseAction==='0')
                {
                  section[detail].priorityFlag=false;
                }
                else if(section[detail].caseAction==='1')
                {
                    section[detail].priorityFlag=true;
                }
            }
        }
        if(section[detail].action==='CHFE'|| section[detail].action==='COHE'||section[detail].action==='CRE'|| section[detail].action==='CRFE')
        {
            section[detail].isHold=true;
            if(section[detail].caseAction)
            {
                if(section[detail].caseAction==='0')
                {
                  section[detail].holdFlag=false;
                }
                else if(section[detail].caseAction==='2')
                {
                    section[detail].holdFlag=true;
                }
            }
        }       
    }
    return section;
}
/*case "CAIE":
                case "CVICE":
                case "CVICFE":
                case "CVISE":
                case "CVISFE":
                case "CSCE":
                case "CSCFE":
 */
updateInspectionSection(section:ITimeLineSectionDetails[]):ITimeLineSectionDetails[] 
{
    for (let detail in section)
    {
        section[detail].actionText=caseEventCodes[section[detail].action];
        switch (section[detail].action)
        {
          case 'CSCE': if(parseInt(section[detail].status)===caseStatus.InspectionInProgress)
                        {
                            section[detail].inspectorAssigned=true;
                        }
                        break;

         case 'CVICE' : section[detail].isVerdict=true;  
                        section[detail].verdict='Cleared';
                        break;
         
         case 'CVICFE' : section[detail].isVerdict=true;  
                        section[detail].verdict='Cleared Failed';
                        break;

         case 'CVISE'  : section[detail].isVerdict=true;  
                        section[detail].verdict='Suspected';
                        break;
        
         case 'CVISFE' : 
                        section[detail].isVerdict=true;  
                        section[detail].verdict='Suspected Failed';
                        break;
        case 'CIRE':    section[detail].isApprovalRequest=true;
                        section[detail].approvalRequestType='Inspect';
                        section[detail].statusText= this.translateService.instant(caseStatus[caseStatus.InspectionRequested]);
                        break;
        case 'CRRE':    section[detail].isApprovalRequest=true;
                        section[detail].approvalRequestType='ReScan';
                        section[detail].statusText=this.translateService.instant(caseStatus[caseStatus.ReScanRequested]);
                        break; 
        case 'CIAE' :   section[detail].isApprovalRequest=true;
                        section[detail].approvalRequestType='Inspection Approved';
                        section[detail].statusText=this.translateService.instant(caseStatus[caseStatus.AwaitingInspection]);
                        break; 
        }
        section[detail].statusText=this.translateService.instant(caseStatus[section[detail].status]); 
        // if(Object.keys(this.cargoStatusList).find(k => this.cargoStatusList[k].id === parseInt(section[detail].status)))
        // {
        //     section[detail].statusText=this.cargoStatusList[Object.keys(this.cargoStatusList).find(k => this.cargoStatusList[k].id === parseInt(section[detail].status))].name;
        // }
     
    
    }
    return section;
}
updateScanSection(section:ITimeLineSectionDetails[]):ITimeLineSectionDetails[] 
{
    for (let detail in section)
    {
        section[detail].actionText=caseEventCodes[section[detail].action];
        if(Object.keys(this.cargoStatusList).find(k => this.cargoStatusList[k].id === parseInt(section[detail].status)))
        {
            section[detail].statusText=this.cargoStatusList[Object.keys(this.cargoStatusList).find(k => this.cargoStatusList[k].id === parseInt(section[detail].status))].name;
        }         
    }

    return section;
}
updateScreeningSection(section:ITimeLineSectionDetails[]):ITimeLineSectionDetails[] 
{
    for (let detail in section)
    {
        section[detail].actionText=caseEventCodes[section[detail].action];
        if(Object.keys(this.cargoStatusList).find(k => this.cargoStatusList[k].id === parseInt(section[detail].status)))
        {
            section[detail].statusText=this.cargoStatusList[Object.keys(this.cargoStatusList).find(k => this.cargoStatusList[k].id === parseInt(section[detail].status))].name;
        }       
       
    }

    return section;
}
updateManualCaseCreationSection(section:ITimeLineSectionDetails[]):ITimeLineSectionDetails[] 
{
  for (let detail in section){
    if(section[detail].status)
    {
        section[detail].statusText=this.translateService.instant(caseStatus[section[detail].status]);  
    }
  }
  return section;
}
updateCommonStatusLabel(section:ITimeLineSectionDetails[]):ITimeLineSectionDetails[] 
{
  for (let detail in section){
    if(section[detail].status)
    {
        section[detail].statusText=this.translateService.instant(caseStatus[section[detail].status]);  
    }
  }
  return section;
}
updateRADInpectTypeLabel(section:ITimeLineSectionDetails[]) 
{
  let label='Supervisor -';
  for (let detail in section){
    if(section[detail].type)
    {
      label+= this.translateService.instant(inspectionTypeTimeline[section[detail].type]);
      label+='- Inspect';
    }
  }
  return label;
}
inspectionStatusLabel(section:ITimeLineSectionDetails[]):ITimeLineSectionDetails[] 
{
  for (let detail in section){
    if(section[detail].type)
    {
        section[detail].type=this.translateService.instant(inspectionTypeTimeline[section[detail].type]);  
    }
  }
  return section;
}
updateInspectiontabStatusLabel(section:ITimeLineSectionDetails[]):ITimeLineSectionDetails[] 
{
  for (let detail in section){
    if(section[detail].status)
    {
        section[detail].statusText=this.translateService.instant(findingStatus[section[detail].status]);  
    }
  }
  return section;
}
typeLabel(section:ITimeLineSectionDetails[]):ITimeLineSectionDetails[] 
{
  for (let detail in section){
    if(section[detail].type)
    {
        section[detail].type=this.translateService.instant(viewType[section[detail].type]);  
    }
  }
  return section;
}
goodsTypeLabel(section:ITimeLineSectionDetails[]):ITimeLineSectionDetails[] 
{
  for (let detail in section){
    if(section[detail].type)
    {
        section[detail].categoryType=this.translateService.instant(categoryType[section[detail].type]);  
    }
  }
  for (let detail in section){
      if(section[detail].type === '0'){
        section[detail].goodsType=this.translateService.instant(goodsType0[section[detail].goodsType]);  
      }
      if(section[detail].type ==='1'){
        section[detail].goodsType=this.translateService.instant(goodsType1[section[detail].goodsType]);  
      }
  }
  return section;
}
updateCaseCreationSection(section:ITimeLineSectionDetails[]):ITimeLineSectionDetails[] 
{

    let previousState:string='';
     for (let detail in section)
     {
         switch (section[detail].action)
         {   case null:
            break;
             case 'CUE':
                        section[detail].actionText= ((previousState==='CDCE'||previousState==='CDUE') && this.isCaseCreation===false)?'Case Created':'Case Updated';
                        if(section[detail].actionText==='Case Created')
                        {
                            this.isCaseCreation=true;
                        }
                        previousState='CUE';
                 break;
             default:
                       section[detail].actionText=caseEventCodes[section[detail].action];
                       previousState=section[detail].action;
         }
         if(section[detail].status)
         {
            section[detail].statusText=this.translateService.instant(caseStatus[section[detail].status]);   
            if(parseInt(section[detail].status)===caseStatus.Deleted)
            {
                section[detail].actionText='Case/Draft Deleted';
            }
         }
         
        //  if(Object.keys(this.cargoStatusList).find(k => this.cargoStatusList[k].id === parseInt(section[detail].status)))
        //  {         
        //  section[detail].statusText=this.cargoStatusList[Object.keys(this.cargoStatusList).find(k => this.cargoStatusList[k].id === parseInt(section[detail].status))].name;
        //  }
     }

    return section;
}
updateFindingSection(section:ITimeLineSectionDetails):ITimeLineSectionDetails{

    
    section.isFinding=true;
    if(section.type==='-1')
    {
        section.type='';
    }
    else if(Object.keys(this.metadataImages.CategoryTypes).find(k => this.metadataImages.CategoryTypes[k].id === parseInt(section.type))){
    
        if(parseInt(section.type)!==categoryType.undeclared)
        {
          switch(parseInt(section.type))
          {
             case categoryType.drugs:
             //console.log('subtype:'+section.goodsType);
             if(Object.keys(this.metadataImages.Drugs).find(k => this.metadataImages.Drugs[k].id === parseInt(section.goodsType)))
             {
                section.hsCode=this.metadataImages.Drugs[Object.keys(this.metadataImages.Drugs).find(k => this.metadataImages.Drugs[k].id === parseInt(section.goodsType))].name;
             }
            
             break;

             case categoryType.weapons:
             if(Object.keys(this.metadataImages.Weapons).find(k => this.metadataImages.Weapons[k].id === parseInt(section.goodsType)))
             {
                section.hsCode=this.metadataImages.Weapons[Object.keys(this.metadataImages.Weapons).find(k => this.metadataImages.Weapons[k].id === parseInt(section.goodsType))].name;
             }
             break;
          }
        }
        section.type=this.metadataImages.CategoryTypes[Object.keys(this.metadataImages.CategoryTypes).find(k => this.metadataImages.CategoryTypes[k].id === parseInt(section.type))].name;
    }
    
    if(section.status)
    {
        section.statusText=findingStatus[section.status];
    }
  
    return section;
}
updateImageAssesmentSection(section:ITimeLineSectionDetails[]):ITimeLineSectionDetails[] 
{
    for (let detail in section)
    {
        section[detail].actionText=caseEventCodes[section[detail].action];

        switch(section[detail].action)
        {
          case 'FCFE':
          case 'FCE':
          case 'FDE':
          case 'FUE':
          case 'FDFE':
          case 'FUFE': section[detail]=this.updateFindingSection(section[detail]);
                       break;
          case 'RCFE':
          case 'RCE':
          case 'RDE':
          case 'RUE':
          case 'RDFE':
          case 'RUFE': section[detail].isRuler=true;
                        break;
        case 'VCFE':
        case 'VCE':
        case 'VDE':
        case 'VUE':
        case 'VDFE':
        case 'VUFE':  section[detail].isView=true;
                    if(section[detail].type)
                    {
                        section[detail].type= this.translateService.instant(viewType[parseInt(section[detail].type)]);
                    }
                        break;
          case 'CVACFE':
          case'CVACE':  section[detail].isVerdict=true;
                        if(section[detail].status)
                        {
                            section[detail].statusText=findingStatus[section[detail].status];
                        }
                        section[detail].statusText='Cleared';
                        break;
          case'CVASFE':
          case'CVASE':  section[detail].isVerdict=true;
                        if(section[detail].status)
                        {
                            section[detail].statusText=findingStatus[section[detail].status];
                        }
                        section[detail].statusText='Suspected';
                        break;
          case 'CIRE': section[detail].isApprovalRequest=true;
                       section[detail].approvalRequestType='Inspect';
                       section[detail].statusText= this.translateService.instant(caseStatus[caseStatus.InspectionRequested]);
                       break;
          case 'CRRE': section[detail].isApprovalRequest=true;
                       section[detail].approvalRequestType='ReScan';
                       section[detail].statusText=this.translateService.instant(caseStatus[caseStatus.ReScanRequested]);
                       break; 
          case 'CIAE' : section[detail].isApprovalRequest=true;
                        section[detail].approvalRequestType='Inspection Approved';
                        section[detail].statusText=this.translateService.instant(caseStatus[caseStatus.AwaitingInspection]);
                        break; 
         
        }
        if(section[detail].verdict)
        {
            switch(parseInt(section[detail].verdict))
            {
                case 1: section[detail].verdict='Suspect';
                        break;
                case 2: section[detail].verdict='Clear';
                        break;
                case 3: section[detail].verdict='Inspect';
                        break;
            }
        }      
    }

    return section;

}

viewTimeLineViews = () => {
  this.router.navigate(['IA', { case: this.caseId,edit:'true'}]);
}
toggleClass(div) {
    var className = div.getAttribute('class');
    if(className==='column closed') {
      div.className = 'column';
    }
    else{
      div.className = 'column closed';
    }
  }
ngOnInit(): void {
    this.getCaseTimeline();
 }
}


