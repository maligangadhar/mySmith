import { Component, OnInit, OnDestroy, Inject, Input } from '@angular/core';
import { IAnalyzerService, ITranslateService } from '../interfaces/interfaces';
import { IFinding, IMetadataImages } from '../models/viewModels';
import { Subject } from 'rxjs/Subject';
import { responseStatus, findingStatus, categoryType } from '../models/enums';
@Component({
  selector: 'sp3-comp-finding-detail',
  templateUrl: './finding.detail.control.html'
})

export class SpFindingDetailComponent implements OnInit, OnDestroy {

  isLoading: boolean;
  findings: IFinding[] = [];
  isUpdating: boolean = false;
  findingsHeader: {} = [this.translateService.instant('Finding_Category'),
  this.translateService.instant('Finding_GoodsType'), this.translateService.instant('Finding_Description')];
  ngUnsubscribe: Subject<any> = new Subject<any>();
  metadataImages: IMetadataImages = {
    AnnotationShapes: [], assessmentResults: [], assessmentTypes: [],
    CategoryTypes: [], Drugs: [], EffectType: [], PreliminaryAssessments: [], Weapons: []
  };
  @Input() public caseId: string;
  @Input() public isVerdictVisible: boolean=true;

  getFindings: any;
  getImageAnalyzerMetadata: () => void;
  declare: (event) => void;

  constructor( @Inject('IAnalyzerService') private analyzerService: IAnalyzerService,
    @Inject('ITranslateService') private translateService: ITranslateService, ) {

    this.getFindings = () => {
      if (this.caseId === null) {
        this.findings = [];
        this.isLoading = false;
      }
      else {
        this.analyzerService.fetchImageFindings(this.caseId, null).takeUntil(this.ngUnsubscribe).subscribe(result => {
          if (result.data !== null) {
            var finding: any = {};
            this.findings = [];
            result.data.forEach(element => {
              finding = {};
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
            });
            this.isLoading = false;
          }
          else {
            this.isLoading = false;
          }
        });
      }
    };

    this.declare = (finding: IFinding) => {
      this.isUpdating = true;

      if (finding.findingId && this.caseId) {

        let status = findingStatus.Declared;
        if (finding.status === findingStatus.Declared) {
          status = findingStatus.Undeclared;
        }

        this.analyzerService.deleteFinding(this.caseId, finding.findingId, status).subscribe(result => {
          if (result.status === responseStatus.Success) {
            finding.status = status;
            this.isUpdating = false;
          }
        });
      }
      else {
        this.isUpdating = false;
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
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.getImageAnalyzerMetadata();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}

