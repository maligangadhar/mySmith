import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs/Rx';

import { CaseButtonStatusCode } from '../../businessConstants/businessConstants';
import { SpMultiTextComponent } from '../../controls/multitext.control';
import { IAnalyzerService, ICaseService, IMessageService, ITranslateService, ICaseAnalysisService } from '../../interfaces/interfaces';
import {
  categoryType,
  findingStatus,
  messageResponseType,
  reasonType,
  responseStatus,
  spinnerType,
  assessmentResults,
  assessmentTypes,
  verdictSources,
  messageType
} from '../../models/enums';
import {
  IAttachment,
  ICaseRequestFormat,
  ICustomMessageResponse,
  IFinding,
  IKeyValue,
  ILoaderMessage,
  IMetadataImages,
  IResponse,
  IAnalysisDetails,
  IEvidence
} from '../../models/viewModels';
import { ModalVerdictPromptComponent } from './../modal/modal.verdict.prompt.component';
import { InspectCaseService } from '../../services/inspect.service';

@Component({
  selector: 'sp3-comp-inspect-case-verdict',
  templateUrl: './inspect.case.verdict.component.html'
})

export class InspectCaseVerdictComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() public caseId: string;
  @Input() public inspectiontype?: number;
  @Input() public isReadOnly: boolean = false;
  @Output() backToMyCases: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('textAreaSelector') spMultiText: SpMultiTextComponent;
  @ViewChild('modalPrompt') modalPrompt: ModalVerdictPromptComponent;
  @ViewChild('findingPrompt') findingPrompt: ModalVerdictPromptComponent;
  @ViewChild('scrollMe') private scrollMeContainer: ElementRef;
  @ViewChild('findingVerdictComment') findingVerdictComment: SpMultiTextComponent;

  payLoad: ICaseRequestFormat = {
    cases: [{ caseId: '', caseAction: null, assignedTo: null }],
    status: 0,
    reason: null,
    notes: null,
    source: 0,
    result: 0,
    assessment: 0,
    inspectionType: 0
  };

  analysisPayload: IAnalysisDetails = {
    caseId: [],
    assessment: assessmentTypes.None,
    result: assessmentResults.NotFound,
    comment: '',
    status: 0
  };
  scrollFlag :boolean=true;
  selVerdict: string;
  loaderMessage: ILoaderMessage = { id: '', headerMessage: 'Loading...', footerMessage: 'Verdict In Progress', showLoader: true, type: spinnerType.small };
  isLoading: boolean;
  description: string = '';
  evidencesList: IEvidence[] = [];
  visible: boolean = false;
  visibleAnimate: boolean = false;
  comments: string = '';
  findings: IFinding[] = [];
  isUpdating: boolean = false;
  toggle: boolean = false;
  selectedCategory: IKeyValue;
  categoryList: IKeyValue[] = [];
  subCategoryDisplay: boolean = false;
  subCategoryMandatory: boolean = false;
  subCategoryList: IKeyValue[] = [];
  selectedSubCategory: IKeyValue;
  markHsCode: string = '';
  newFinding: any = {};
  isMessageShown: boolean = false;
  caseList: string[];
  findingsHeader: {} = [this.translateService.instant('Finding_Category'),
  this.translateService.instant('Finding_Description')];
  ngUnsubscribe: Subject<any> = new Subject<any>();
  metadataImages: IMetadataImages = {
    AnnotationShapes: [], assessmentResults: [], assessmentTypes: [],
    CategoryTypes: [], Drugs: [], EffectType: [], PreliminaryAssessments: [], Weapons: []
  };
  onUploadAttachment: (event: ICustomMessageResponse<IAttachment>, finding: IFinding) => void;
  onUploadFinding: (event: ICustomMessageResponse<IAttachment>, finding: IFinding) => void;
  removeAttachment: (index) => void;
  getFindings: any;
  getImageAnalyzerMetadata: () => void;
  declare: (event, action: string) => void;
  checkClearEnable: () => void;
  addFinding: () => void;
  updateComemntBox: () => void;
  processVerdictClickOperation: () => void;
  enableClearButton: boolean = false;
  enableSuspectAndInspect: boolean = false;
  flag: boolean = false;
  clearCaseMessage: string = '';
  headerText: string = '';
  yesButtonTitle: string = '';
  isSaveDisabled: boolean = false;
  isLoaderVisible: boolean = false;
  constructor( @Inject('IAnalyzerService') private analyzerService: IAnalyzerService,
    @Inject('ITranslateService') private translateService: ITranslateService,
    @Inject('ICaseService') private caseService: ICaseService,
    @Inject('InspectCaseService') private inspectService: InspectCaseService,
    @Inject('IMessageService') private messageService: IMessageService,
    @Inject('ICaseAnalysisService') private caseAnalysisService: ICaseAnalysisService, ) {
    this.isSaveDisabled = false;

    this.getFindings = () => {
      if (this.caseId === null || this.caseId === undefined) {
        this.findings = [];
        this.isLoading = false;
      }
      else {
        let index = 0;
        this.analyzerService.fetchImageFindings(this.caseId, null).takeUntil(this.ngUnsubscribe).subscribe(result => {
          this.isUpdating = true;
          if (result.data !== null) {
            var finding: any = {};
            this.findings = [];
            result.data.forEach(element => {
              finding = {};
              finding.findingNumber = ++index;
              finding.verdictComment = element.verdictComment ? element.verdictComment : '';
              finding.attachments = element.attachments;
              finding.comment = element.comment;
              finding.findingId = element.findingId;
              finding.findingNumber = element.findingNumber;
              finding.category = this.metadataImages.CategoryTypes.find(o => o.id === element.category).name;
              finding.status = element.status;
              if (element.category === categoryType.weapons) { // weapons = 0
                finding.goodsType = this.metadataImages.Weapons.find(o => o.id === element.goodsType).name;
              }
              else
                if (element.category === categoryType.drugs) { // drugs = 1
                  finding.goodsType = this.metadataImages.Drugs.find(o => o.id === element.goodsType).name;
                }
                else

                  if (element.category === categoryType.undeclared) { // undeclared = 2
                    finding.goodsType = element.hsCode;
                  }

              this.findings.push(finding);
              this.checkClearEnable();
            });
            this.isUpdating = false;
            this.isLoading = false;
          }
          else {
            this.isUpdating = false;
            this.isLoading = false;
          }
          this.categoryList = this.metadataImages.CategoryTypes;
          this.selectedCategory = this.metadataImages.CategoryTypes[0];
          this.subCategoryList = this.metadataImages.Weapons;
          this.selectedSubCategory = this.metadataImages.Weapons[0];


          this.subCategoryDisplay = true;
        },
          (error: IResponse<any>) => {
            this.isLoading = false;
            this.isUpdating = false;
          });
      }
    };


    this.getImageAnalyzerMetadata = () => {
      this.analyzerService.fetchImageAnalyzerMetaData().takeUntil(this.ngUnsubscribe).subscribe(result => {
        if (result.status === responseStatus.Success) {
          this.metadataImages = result.data;
          this.getFindings();
        }
      });
    };
    this.declare = (finding: IFinding, action: string) => {
      this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('Loading'), showLoader: true, type: spinnerType.small };
      this.isUpdating = true;
      let status = findingStatus.Undeclared;


      switch (action) {
        case 'Declare':
          if (finding.findingId && this.caseId) {
            status = findingStatus.Declared;
            if (finding.status === findingStatus.Declared) {
              status = findingStatus.Undeclared;
            }
          }
          break;
        case 'Confirm':
          if (finding.findingId && this.caseId) {
            status = findingStatus.Confirmed;
            if (finding.status === findingStatus.Confirmed) {
              status = findingStatus.Undeclared;
            }
          }
          break;
        case 'Clear':
          if (finding.findingId && this.caseId) {
            status = findingStatus.Cleared;
            if (finding.status === findingStatus.Cleared) {
              status = findingStatus.Undeclared;
            }
          }
          break;

      }

      if (finding.findingId && this.caseId) {
        let source = '3';
        this.analyzerService.deleteFinding(this.caseId, finding.findingId, status, finding.verdictComment, source).subscribe(result => {
          this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('Loading'), showLoader: false, type: spinnerType.small };
          if (result.status === responseStatus.Success) {
            finding.status = status;
            this.isUpdating = false;
            if (this.evidencesList.length > 0) {
              this.inspectService.addEvidence(this.caseId, this.evidencesList).subscribe(result => {
                this.evidencesList = [];
              });
            }
            this.updateComemntBox();
            this.checkClearEnable();
          }
          else {
            this.isUpdating = false;
            this.updateComemntBox();
          }
        }, (error) => {
          this.messageService.LoaderMessage.showLoader = false;
          this.messageService.LoaderMessage = this.messageService.LoaderMessage;
          this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
        });
      }
      else {
        this.isUpdating = false;
        this.updateComemntBox();
      }

    };
    this.updateComemntBox = () => {
      this.findingVerdictComment.controlClass = '';
    };
    this.onUploadAttachment = (event: ICustomMessageResponse<IAttachment>, finding: IFinding) => {

      let attachmentAttached: IEvidence =
        {
          Title: event.result.title,
          Description: event.result.description,
          FileName: event.result.fileName,
          FileData: event.result.fileContent,
          FindingId: finding.findingId
        };
      this.evidencesList.push(attachmentAttached);
      this.findings[this.findings.indexOf(finding)].attachments.push(event.result);
    };
    this.onUploadFinding = (event: ICustomMessageResponse<IAttachment>, finding: IFinding) => {
      this.newFinding.attachments.push(event.result);
      let attachmentAttachedFromFinding: IEvidence =
        {
          Title: event.result.title,
          Description: event.result.description,
          FileName: event.result.fileName,
          FileData: event.result.fileContent,
          FindingId: finding.findingId
        };
      this.evidencesList.push(attachmentAttachedFromFinding);
    };
    this.removeAttachment = (index) => {
      this.newFinding.attachments.splice(index, 1);
      this.evidencesList.splice(index, 1);
    };
    this.addFinding = () => {
      this.newFinding = {} as any;
      this.newFinding.caseId = this.caseId;
      this.newFinding.comment = '';
      this.newFinding.category = this.categoryList[0];
      this.newFinding.goodsType = this.subCategoryList[0];
      this.newFinding.hsCode = '';
      this.newFinding.name = '';
      this.newFinding.source = 3; // inspection source
      this.newFinding.attachments = [];
      this.toggle = !this.toggle;
      this.scrollFlag=true;      
    };
    this.checkClearEnable = () => {
      let clearAndDeclarelength: number = 0;
      let suspectInspectLength: number = 0;
      this.flag = true;
      this.enableClearButton = false;
      this.enableSuspectAndInspect = false;
      if (this.description.trim() === '' && !this.description) {
        this.enableClearButton = false;
        this.enableSuspectAndInspect = false;
      }
      else {
        for (let finding in this.findings) {

          if (this.findings[finding].status === 0) {
            suspectInspectLength = 0;
            clearAndDeclarelength = 0;
            break;
          }
          else if ((this.findings[finding].status === 1 || this.findings[finding].status === 3)) {
            clearAndDeclarelength += 1;

          }
          else if (this.findings[finding].status === 4) {
            suspectInspectLength += 1;

          }
        }

        if (clearAndDeclarelength === this.findings.length) {
          this.enableClearButton = true;
          this.enableSuspectAndInspect = true;
        }
        else if (suspectInspectLength > 0) {
          this.enableClearButton = false;
          this.enableSuspectAndInspect = true;
        }
        else {
          this.enableClearButton = false;
          this.enableSuspectAndInspect = false;
        }
      }

    };

    this.processVerdictClickOperation = () => {
      this.analysisPayload.comment = this.description;
      this.analysisPayload.caseId = [this.caseId];
      this.analysisPayload.source = verdictSources.Inspection;
      switch (this.selVerdict) {
        case 'clear':
          this.analysisPayload.status = CaseButtonStatusCode.Clear;
          this.analysisPayload.inspectionType = this.inspectiontype;
          this.analysisPayload.assessment = assessmentTypes.Physical;
          this.analysisPayload.result = assessmentResults.NotFound;
          break;
        case 'inspect':
          this.analysisPayload.status = CaseButtonStatusCode.InspectionRequested;
          this.analysisPayload.inspectionType = this.inspectiontype;
          this.analysisPayload.assessment = assessmentTypes.Physical;
          this.analysisPayload.result = assessmentResults.Inconclusive;
          break;
        case 'suspect':
          this.analysisPayload.status = CaseButtonStatusCode.Suspect;
          this.analysisPayload.inspectionType = this.inspectiontype;
          this.analysisPayload.assessment = assessmentTypes.Physical;
          this.analysisPayload.result = assessmentResults.Found;
          break;
      }
    };

  }

  onCategoryChange(event: IKeyValue) {
    let category = this.newFinding.category as any;
    switch (category.id) {
      case 0:
        this.subCategoryList = this.metadataImages.Weapons;
        break;
      case 1:
        this.subCategoryList = this.metadataImages.Drugs;
        break;
    }

    if (this.categoryList.find(this.findDefaultValue)) {
      this.categoryList.splice(0, 1);
    }
  }

  findDefaultValue(valueToFind) {
    return valueToFind.id === -1;
  }

  saveFinding() {
    if (!this.checkFindingValues()) {
      return;
    }

    this.clearCaseMessage = this.translateService.instant('ConfirmNewFinding');
    this.headerText = this.translateService.instant('AddNewFinding');
    this.yesButtonTitle = this.translateService.instant('Ok');
    //this.findingPrompt.show();
    this.isSaveDisabled = true;
    this.isLoading = true;
    this.newFinding.category = this.newFinding.category.id;
    this.newFinding.goodsType = this.newFinding.goodsType.id;

    this.analyzerService.addImageFinding(this.caseId, this.newFinding).subscribe(result => {
      if (result.status === responseStatus.Success) {
        this.toggle = false;
        this.isSaveDisabled = false;
        this.evidencesList.forEach((param: IEvidence) => {
          param.FindingId = result.data.findingId;
        });

        if (this.evidencesList.length > 0) {
          this.inspectService.addEvidence(this.caseId, this.evidencesList).subscribe(result => {
            this.evidencesList = [];
            this.getFindings();
          });
        } else {
          this.getFindings();
        }
      }
      else {
        this.toggle = false;
        this.isSaveDisabled = false;
      }
    });
  }

  checkFindingValues(): boolean {
    this.isMessageShown = false;
    let category = this.newFinding.category as any;
    let subcategory = this.newFinding.goodsType as any;

    if (category.id === -1 || subcategory.id === -1) {
      return false;
    }
    else {
      if (category.id === 2 && this.newFinding.hsCode.trim() === '') {
        this.isMessageShown = true;
        return false;
      }
    }
    return true;
  }

  cancelFinding() {
    this.toggle = false;
  }

  public closeClick(): void {
    this.hide();
  }
  public show(): void {
    this.description = '';
    this.visible = true;
    setTimeout(() => {
      this.visibleAnimate = true;
    });
  }

  public hide(): void {
    this.visibleAnimate = false;
    setTimeout(() => this.visible = false, 300);
  }
  ngOnInit(): void {
    this.isLoading = true;
    this.getImageAnalyzerMetadata();
    this.description = '';
  }

  ngAfterViewChecked() {
    if (this.toggle && this.scrollFlag &&  this.scrollMeContainer && this.scrollMeContainer.nativeElement) {
      this.scrollMeContainer.nativeElement.scrollTop = this.scrollMeContainer.nativeElement.scrollHeight;
      this.scrollFlag=false;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  public verdictClick = (verdict: string) => {
    this.payLoad.cases[0].caseId = this.caseId;
    this.payLoad.reason = reasonType.StatusChange;
    this.payLoad.notes = this.description;
    this.caseList = [this.caseId];
    this.selVerdict = verdict;
    this.payLoad.inspectionType = this.inspectiontype;
    this.payLoad.assessment = assessmentTypes.Physical;
    this.payLoad.source = verdictSources.Inspection;
    switch (verdict) {
      case 'clear':
        this.payLoad.status = CaseButtonStatusCode.Clear;
        this.payLoad.result = assessmentResults.NotFound;
        this.clearCaseMessage = 'ClearAllSelectedQuestion';
        this.headerText = this.translateService.instant('VerdictClearCase');
        this.yesButtonTitle = this.translateService.instant('ClearCase');
        break;
      case 'inspect':
        this.payLoad.status = CaseButtonStatusCode.InspectionRequested;
        this.payLoad.result = assessmentResults.Inconclusive;
        this.clearCaseMessage = 'InspectAllSelectedQuestion';
        this.headerText = this.translateService.instant('VerdictInspectCase');
        this.yesButtonTitle = this.translateService.instant('InspectCaseText');
        break;
      case 'suspect':
        this.payLoad.status = CaseButtonStatusCode.Suspect;
        this.payLoad.result = assessmentResults.Found;
        this.clearCaseMessage = 'SuspectAllSelectedQuestion';
        this.headerText = this.translateService.instant('VerdictSuspectCase');
        this.yesButtonTitle = this.translateService.instant('SuspectCaseText');
        break;
    }
    if (this.description) {
      this.modalPrompt.show();
    }
    else {
      this.spMultiText.focusOut();
      return;
    }

  }
  public verdictSummaryUpdate = (event: any) => {
    this.checkClearEnable();
  }
  public updateVerdict = () => {
    this.isUpdating = true;
    this.messageService.LoaderMessage = { id: '', headerMessage: '', footerMessage: '', showLoader: true, type: spinnerType.fullScreen };
    this.caseService.updateCases(this.payLoad).takeUntil(this.ngUnsubscribe).subscribe((result) => {
      if (result.status === responseStatus.Success) {
        if (this.selVerdict && this.selVerdict.trim().length !== 0) {
          this.processVerdictClickOperation();
          this.caseAnalysisService.putCaseAnalysis(this.analysisPayload).takeUntil(this.ngUnsubscribe).subscribe((result) => {
            this.messageService.LoaderMessage = { id: '', headerMessage: '', footerMessage: '', showLoader: false, type: spinnerType.fullScreen };
            this.modalPrompt.hide();
            this.hide();
            this.backToMyCases.emit(true);
            this.isUpdating = false;
          }, (error: IResponse<any>) => {
            this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
          });
        }
      }
      else {
        this.messageService.LoaderMessage = { id: '', headerMessage: '', footerMessage: '', showLoader: false, type: spinnerType.fullScreen };
        this.isUpdating = false;
        this.modalPrompt.hide();
      }

    }, (error: IResponse<any>) => {
      this.messageService.LoaderMessage = { id: '', headerMessage: '', footerMessage: '', showLoader: false, type: spinnerType.fullScreen };
      this.isUpdating = false;
      this.modalPrompt.hide();
    });
  }

  public modalPromptClick = (response) => {
    if (response.status === messageResponseType.Yes) {
      this.updateVerdict();
    }


  }
  public valueAddedTosummary = (event: any) => {
    if (event.trim() !== '') {
      this.checkClearEnable();
    }
  }
  public findingPromptClick = (response) => {
    if (response.status === messageResponseType.Yes) {
      this.isSaveDisabled = true;
      this.isLoading = true;
      this.newFinding.category = this.newFinding.category.id;
      this.newFinding.goodsType = this.newFinding.goodsType.id;

      this.analyzerService.addImageFinding(this.caseId, this.newFinding).subscribe(result => {
        if (result.status === responseStatus.Success) {
          this.toggle = false;
          this.isSaveDisabled = false;
          this.evidencesList.forEach((finding: IEvidence) => {
            finding.FindingId = result.data.findingId;
          });

          if (this.evidencesList.length > 0) {
            this.inspectService.addEvidence(this.caseId, this.evidencesList).subscribe(result => {
              this.evidencesList = [];
              this.getFindings();
            });
          } else {
            this.getFindings();
          }
        }
        else {
          this.toggle = false;
          this.isSaveDisabled = false;
        }
      });
    }
    else {
      this.findingPrompt.hide();
      this.isSaveDisabled = false;
    }

  }

}
