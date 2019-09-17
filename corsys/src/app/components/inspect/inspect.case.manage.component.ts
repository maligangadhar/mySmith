import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { ActivatedRoute } from '@angular/router';
import { IBroadcastService, IMessageService, ITranslateService } from '../../interfaces/interfaces';
import { broadcastKeys, caseStatus, messageType, responseStatus, spinnerType } from '../../models/enums';
import { IAdditionalObject, ICase, IKeyData, ILoaderMessage, IResponse, IInspectMyCases, InspectMetaData, IInspectCaseActionCenter, ICaseAssignResponse } from '../../models/viewModels';
import { GridControlComponent } from './../../controls/grid.control';
import { ModalConfirmComponent } from './../modal/modal.confirm.component';
import { Sp3ModalInspectCaseDetailComponent } from './inspect.case.detail.component';
import { InspectDetailComponent } from './inspect.detail.component';
import { InspectCaseService } from '../../services/inspect.service';
import { Adal4Service } from '@corsys/corsys-adal';
import { ModalDuplicateActionComponent } from '../modal/modal.duplicateAction.component';

@Component({
  selector: 'sp3-comp-inspect-case-manage',
  templateUrl: './inspect.case.manage.component.html'
})

export class InspectCaseManageComponent implements OnInit, OnDestroy {
  @ViewChild('caseDetail') caseDetail: Sp3ModalInspectCaseDetailComponent;
  @ViewChild('modalcasefailure') modalcasefailure: ModalConfirmComponent;
  @ViewChild('actionCenter') actionCenter: GridControlComponent;
  @ViewChild('inspectCaseDetail') inspectCaseDetail: InspectDetailComponent;
  @ViewChild('modalDuplicateActionPopUp') modalDuplicateActionPopUp: ModalDuplicateActionComponent;
  // captureCloseAction: (response: messageType) => void;
  loaderMessage: ILoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: true, type: spinnerType.small };
  inspectMyCases: IInspectMyCases[] = [];
  totalActions: number = 0;
  actionPerPage: number = 50;
  messageCode: string = '';
  isShow: boolean = false;
  startActionNumber: number = 1;
  endActionNumber: number;
  isLeftArrowDisabled: boolean = true;
  isRightArrowDisabled: boolean = false;
  pageNum: number = 1;
  loadPagination: boolean = true;
  filterCriteria: number[];
  noResultsFound: string = '';
  metaData: InspectMetaData = {
    CategoryTypes: [], PhysicalInspectionTypes: []
  };
  sortCriteria: string[];
  paramData: string = '';
  openCase: (caseId: ICase) => void;
  ngUnsubscribe: Subject<any> = new Subject<any>();
  defaultSort = {};
  noSearchData: boolean = false;
  showGrid: boolean;
  selectedCases: IInspectMyCases[] = [];
  onInspectionTypeChange: (event: Array<String>) => void;
  onFindingCategoryChange: (Event: Array<String>) => void;
  dataValues = {
    categoryTypes: [],
    physicalInspectionTypes: []
  };
  //PlaceHolder to store selected Values
  additionFilterPayLoad: IAdditionalObject = {
    srcObject: { CategoryIN: [], InspectionTypeIN: [] },
    targetValue: 'filter'
  };
  constructor( @Inject('InspectCaseService') private inspectCaseService: InspectCaseService,
    @Inject('IBroadcastService') private broadcastService: IBroadcastService,
    @Inject('ITranslateService') private translateService: ITranslateService,
    @Inject('IMessageService') private messageService: IMessageService, private route: ActivatedRoute, public service: Adal4Service) {
    this.filterCriteria = [
      caseStatus.AwaitingInspection
    ];
    this.sortCriteria = ['-Priority', '+LastUpdatedDate'];
    this.defaultSort = {};
    this.route.params.subscribe(params => {
      if (params.case) {
        this.paramData = params.case;
      }
    });
    this.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
      if (result.key === broadcastKeys[broadcastKeys.refreshCaseList]) {
        this.additionFilterPayLoad.srcObject['InspectionTypeIN'].length = 0;
        this.additionFilterPayLoad.srcObject['CategoryIN'].length = 0;
        this.fetchActionData();
      }
    });

    this.openCase = (caseId: ICase) => {
      this.caseDetail.show(caseId.caseId);
    };

    this.onInspectionTypeChange = (event) => {
      this.additionFilterPayLoad.srcObject['InspectionTypeIN'].length = 0;
      this.additionFilterPayLoad.srcObject['InspectionTypeIN'] = event;
      this.fetchActionData();
    };

    this.onFindingCategoryChange = (event) => {
      this.additionFilterPayLoad.srcObject['CategoryIN'].length = 0;
      this.additionFilterPayLoad.srcObject['CategoryIN'] = event;
      this.fetchActionData();
    };
  }

  captureCloseAction = (status: messageType) => {
    this.fetchActionData();
  }

  /**
   * Helper Function
   * @param cases : ICase[]
   * Convert the numeric value of Case Action to string
   */
  caseActionConversion = (cases, categories, inspectionTypes): IInspectCaseActionCenter[] => {
    return cases.map(param => {

      if (param.inspectionType !== null && param.inspectionType !== '' && param.inspectionType !== undefined) {
        let inspectType = inspectionTypes.filter(obj => { return obj.value === param.inspectionType; })[0];
        param.inspectTypeName = inspectType ? inspectType.label : '';
      }
      param.findingsCategoriesList = [];
      if (param.categories.length > 0) {
        for (let finding in param.categories) {
          if (Object.keys(categories).find(k => categories[k].value === param.categories[finding])) {
            param.findingsCategoriesList.push(
              ' ' + categories[
                Object.keys(categories).find(k => categories[k].value === param.categories[finding])
              ].label);
          }
        }
      }
      if (param.priority === 1) {
        param.priorityClass = 'svg-icn-flag-black';
      }
      else {
        param.priorityClass = '';
      }

      return param;
    });
  }

  public fetchActionData() {
    this.loaderMessage.showLoader = true;
    this.messageService.LoaderMessage = this.loaderMessage;
    this.inspectCaseService.getAwaitingInspectionCases(this.pageNum, this.actionPerPage, this.filterCriteria, this.sortCriteria, 'ANDCaseAction!=2', this.additionFilterPayLoad).subscribe(result => {
      this.isShow = true;
      this.dataValues.categoryTypes = this.metaData.CategoryTypes.map((param) => {
        return { label: param.name, value: param.id };
      });

      this.dataValues.physicalInspectionTypes = this.metaData.PhysicalInspectionTypes.map((param) => {
        return { label: param.name, value: param.id };
      });

      this.inspectMyCases = this.caseActionConversion(result.data.cases, this.dataValues.categoryTypes, this.dataValues.physicalInspectionTypes);
      // this.totalActions = result.data.count;

      if (this.inspectMyCases.length < 1) {
        this.noSearchData = true;
        this.showGrid = false;
        this.showMessage();
      }
      else {
        this.noSearchData = false;
        this.showGrid = true;
        if (this.paramData) {
          this.caseDetail.show(this.paramData);
        }
      }

      this.loaderMessage.showLoader = false;
      this.messageService.LoaderMessage = this.loaderMessage;
    },
      (error: IResponse<any>) => {
        this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
        this.loaderMessage.showLoader = false;
        this.messageService.LoaderMessage = this.loaderMessage;
      });
    if (this.loadPagination) {
      this.totalActions = 0;
      this.inspectCaseService.getAwaitingInspectionCasesCount(this.filterCriteria, 'ANDCaseAction!=2', this.additionFilterPayLoad).subscribe(result => {
        if (result.status === responseStatus.Success) {
          this.totalActions = +result.data;
        }
      }, (error) => {
        this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
      });
    }
  }

  showMessage = () => {
    if (this.additionFilterPayLoad.srcObject['InspectionTypeIN'].length !== 0 && this.additionFilterPayLoad.srcObject['CategoryIN'].length !== 0) {
      this.noResultsFound = this.translateService.instant('NoFilteredCases'); // no filtered results
    }
    else if (this.additionFilterPayLoad.srcObject['InspectionTypeIN'].length === 0 && this.additionFilterPayLoad.srcObject['CategoryIN'].length === 0) {
      this.noResultsFound = this.translateService.instant('NoFilteredCases'); // no selected results
    }
    else if (this.additionFilterPayLoad.srcObject['InspectionTypeIN'].length !== 0) {
      let inspections = this.dataValues.physicalInspectionTypes.filter(r => this.additionFilterPayLoad.srcObject['InspectionTypeIN'].includes(r.value)).map(item => item.label);
      this.noResultsFound = this.translateService.instant('NoFilteredInspectionCases').replace('xxxx', inspections.join(', ')); // no inspection filter results
    }
    else if (this.additionFilterPayLoad.srcObject['CategoryIN'].length !== 0) {
      let categories = this.dataValues.categoryTypes.filter(r => this.additionFilterPayLoad.srcObject['CategoryIN'].includes(r.value)).map(item => item.label);
      this.noResultsFound = this.translateService.instant('NoFilteredFindingCases').replace('xxxx', categories.join(', ')); // no finding category filter results
    }
  }

  loadCasesLazy = (pageNum: number, onRefresh: boolean) => {
    this.pageNum = pageNum;
    this.loadPagination = false;
    if (onRefresh) {
      this.loadPagination = true;
      this.sortCriteria = ['-Priority', '+LastUpdatedDate'];
      this.additionFilterPayLoad.srcObject['InspectionTypeIN'].length = 0;
      this.additionFilterPayLoad.srcObject['CategoryIN'].length = 0;
    }
    this.fetchActionData();
  }

  validationOkClick = () => {
    this.modalcasefailure.hide();
    this.fetchActionData();
    this.enableAssignToSelfButton = false;
    this.actionCenter.dataTable.reset();
  }

  enableAssignToSelfButton: boolean = false;
  caseFailList: string[] = [];

  onSelectFromGrid = (event: IInspectMyCases[]) => {
    this.selectedCases = event;
    this.enableAssignToSelfButton = this.selectedCases.length > 0 ? true : false;

  }
  assignCasestoMyselfClick = (event: IInspectMyCases[]) => {
    let casesToAdd: string[] = [];
    this.caseFailList = [];
    for (let caseIdtoAdd in this.selectedCases) {
      casesToAdd.push(this.selectedCases[caseIdtoAdd].caseId);
    }
    this.selectedCases.length = 0;
    this.inspectCaseService.assignToSelf(this.service.userInfo.username, casesToAdd).subscribe(result => {
      if (result.status === responseStatus.APIError && result.messageKey === 'SACM30004') {
        this.messageCode = result.message;
        this.messageService.LoaderMessage = { id: '', headerMessage: '', footerMessage: '', showLoader: false, type: spinnerType.small };
        this.modalDuplicateActionPopUp.show();
        return;
      }
      let casesAssignResponse: ICaseAssignResponse[] = result.data;
      for (let caseFail in casesAssignResponse) {
        this.caseFailList.push(casesAssignResponse[caseFail].caseId);
      }
      if (this.caseFailList.length > 0) {
        this.modalcasefailure.show();
      }
      this.enableAssignToSelfButton = false;
      this.setPage();
      this.fetchActionData();
      this.selectedCases = [];
    });

  }

  setPage = () => {
    let lastRowsSelected = (this.pageNum > Math.floor(this.totalActions / this.actionPerPage)) && (this.totalActions % this.actionPerPage) === this.selectedCases.length;
    if (lastRowsSelected && this.pageNum > 1) {
      this.pageNum = this.pageNum - 1;
    }
  }

  getInspectMetaData = () => {
    this.inspectCaseService.fetchMetadata().subscribe(result => {
      if (result.status === responseStatus.Success) {
        this.metaData = result.data;
        this.fetchActionData();
      }
    });
  }

  loadSortedCasesLazy = (sortValue: any) => {
    if (sortValue.sortField) {
      this.defaultSort = {};
      this.sortCriteria = [];
      switch (sortValue.sortField) {
        case 'lastUpdatedDate': this.defaultSort['LastUpdatedDate'] = sortValue.sortOrder === 1 ? '+' : '-';
          break;
      }
    }
    else {
      this.sortCriteria = ['-Status', '+LastUpdatedDate'];
    }

    for (var key in this.defaultSort) {
      this.sortCriteria.push((sortValue.sortOrder === 1 ? '+' : '-') + key);
    }
    this.loadPagination = false;
    this.fetchActionData();
  }
  ngOnInit(): void {
    this.inspectMyCases = [];
    this.totalActions = 0;
    this.getInspectMetaData();
    this.additionFilterPayLoad.srcObject['InspectionTypeIN'].length = 0;
    this.additionFilterPayLoad.srcObject['CategoryIN'].length = 0;
  }

  ngOnDestroy(): void {
    this.sortCriteria = ['-Status', '+LastUpdatedDate'];
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
