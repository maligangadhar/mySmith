import { Component, OnInit, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { caseStatus, broadcastKeys, responseStatus, messageType, spinnerType } from '../../models/enums';
import { IBroadcastService, IMessageService, ITranslateService } from '../../interfaces/interfaces';
import { InspectDetailComponent } from './inspect.detail.component';
import { IResponse, IKeyData, IKeyValue, IInspectMyCases, InspectMetaData, IInspectCaseActionCenter } from '../../models/viewModels';
import { GridControlComponent } from './../../controls/grid.control';
import { ActivatedRoute } from '@angular/router';
import { InspectCaseService } from '../../services/inspect.service';
import { Adal4Service } from '@corsys/corsys-adal';
@Component({
	selector: 'sp3-comp-inspect-caseview',
	templateUrl: './inspect.case.view.component.html'
})

export class Sp3InspectCaseViewComponent implements OnInit, OnDestroy {
	@ViewChild('modal') modal: InspectDetailComponent;
	@ViewChild('actionCenter') actionCenter: GridControlComponent;
	inspectMyCases: IInspectMyCases[] = [];
	totalActions: number = 0;
	actionPerPage: number = 50;
	startActionNumber: number = 1;
  endActionNumber: number;
  loadPagination:boolean=true;
	isLeftArrowDisabled: boolean = true;
	isRightArrowDisabled: boolean = false;
	pageNum: number = 1;
	filterCriteria: number[];
	metaData: InspectMetaData = {
		CategoryTypes: [], PhysicalInspectionTypes: []
	};
	sortCriteria: string[];
	openCase: (caseId: IInspectCaseActionCenter) => void;
	ngUnsubscribe: Subject<any> = new Subject<any>();
	defaultSort = {};
	noSearchData: boolean = false;
	showGrid: boolean;
	caseIdToOpen: string = '';
	inspectiontype: number = 0;
  navTo:boolean=false;
	caseDetailsVisible: boolean = false;
	selectedCases: IInspectMyCases[] = [];
	constructor( @Inject('InspectCaseService') private inspectCaseService: InspectCaseService,
		@Inject('IBroadcastService') private broadcastService: IBroadcastService,
		@Inject('ITranslateService') public translateService: ITranslateService,
    	private route: ActivatedRoute,
		@Inject('IMessageService') private messageService: IMessageService, public service: Adal4Service) {
		this.filterCriteria = [
			caseStatus.InspectionInProgress
		];
		this.sortCriteria = ['-LastUpdatedDate'];
		this.defaultSort = {};
    this.route.params.subscribe(params => {
        if(params.case){
    	    this.navTo =(params.case) ? true:false;
          this.caseIdToOpen=params.case;
        }
    });

		this.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
			if (result.key === broadcastKeys[broadcastKeys.refreshCaseList]) {
				this.totalActions = 0;
				this.fetchActionData();
			}
		});

		this.openCase = (caseId: IInspectCaseActionCenter) => {
			this.caseDetailsVisible = true;
			this.caseIdToOpen = caseId.caseId;
			this.inspectiontype = caseId.inspectionType;
		};
	}
	closeCaseDetails = (event: any) => {
		this.caseDetailsVisible = false;
    this.navTo=false;
		this.loadCasesLazy(1, true);
	}
	/**
 * Helper Function
 * @param cases : ICase[]
 * Convert the numeric value of Case Action to string
 */
	caseActionConversion = (cases, categories, inspectionTypes): IInspectCaseActionCenter[] => {
		return cases.map(param => {
			if (param.inspectionType !== null && param.inspectionType !== '' && param.inspectionType !== undefined) {
				let inspectType = inspectionTypes.filter(obj => {
					return obj.id === param.inspectionType;
				})[0];
				param.inspectTypeName = inspectType.name;
			}
			param.findingsCategoriesList = [];
			if (param.categories.length > 0) {
				for (let finding in param.categories) {
					param.findingsCategoriesList.push(
						' '+categories[
							Object.keys(categories).find(k => categories[k].id === param.categories[finding])
						].name);
				}
			}


			return param;
		});
	}

	fetchActionData(): void {
		this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: true, type: spinnerType.small };
		this.inspectCaseService.getCases(this.service.userInfo.username, this.pageNum, this.actionPerPage, this.filterCriteria, this.sortCriteria, null).subscribe(result => {
			this.inspectCaseService.fetchMetadata().subscribe(obj => {
				if (obj.status === responseStatus.Success) {
					this.inspectMyCases = this.caseActionConversion(result.data.cases, obj.data.CategoryTypes, obj.data.PhysicalInspectionTypes);
				//	this.totalActions = this.inspectMyCases.length;
					if (this.inspectMyCases.length  < 1 ) {
						this.noSearchData = true;
						this.showGrid = false;
					}
					else {
						this.noSearchData = false;
						this.showGrid = true;
					}
					this.messageService.LoaderMessage = { id: '', headerMessage: '', footerMessage: '', showLoader: false, type: spinnerType.small };
          if(this.navTo){
             this.caseDetailsVisible = true;
          }
				}
				else {
					this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
				}


			},
				(error: IResponse<any>) => {
					this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
					this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
				}
			);
    });
    if(this.loadPagination){
        this.totalActions=0;
        this.inspectCaseService.getCasesCount(this.service.userInfo.username, this.pageNum, this.actionPerPage, this.filterCriteria, this.sortCriteria, null).subscribe(result => {
          if (result.status === responseStatus.Success) {
            this.totalActions =+result.data;
          }
        },(error) => {
          this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
          this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
        });
    }
	}
	onSelectFromGrid = (event: IInspectMyCases[]) => {
		this.selectedCases = event;

	}
	loadCasesLazy = (pageNum: number, onRefresh: boolean) => {
    this.pageNum = pageNum;
    this.loadPagination=false;
		if (onRefresh) {
      this.loadPagination=true;
			this.sortCriteria = ['-LastUpdatedDate'];
		}
		this.totalActions = 0;
		this.fetchActionData();
	}
	categoriesList: IKeyValue[] = [];
	inspectionTypes: IKeyValue[] = [];
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
			this.sortCriteria = ['-LastUpdatedDate'];
		}

		for (var key in this.defaultSort) {
			this.sortCriteria.push((sortValue.sortOrder === 1 ? '+' : '-') + key);
    }
    this.loadPagination=false;
		this.fetchActionData();
	}



	ngOnInit(): void {
		this.caseDetailsVisible = false;
		this.inspectMyCases = [];
		this.totalActions = 0;
		this.fetchActionData();
	}

	ngOnDestroy(): void {
		this.sortCriteria = ['-LastUpdatedDate'];
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
