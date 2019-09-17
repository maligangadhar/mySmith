import { Component, OnInit, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { ActivatedRoute } from '@angular/router';
import { caseStatus, caseActions, reasonType, broadcastKeys, metaDataSettings, responseStatus, messageType, verdictSources, spinnerType } from '../../models/enums';
import { ICaseService, IBroadcastService, ITranslateService, IMessageService, IDateFormatService, ICommonService } from '../../interfaces/interfaces';
import { ICase, ICaseActionCenter, ICaseRequestFormat, IResponse, IKeyData, ICodeValue } from '../../models/viewModels';
import { ModalCaseDetailComponent } from './decisionCenter.case.detail.component';
import { ModalDuplicateActionComponent } from '../modal/modal.duplicateAction.component';
@Component({
	selector: 'sp3-comp-decisioncenter-caseview',
	templateUrl: './decisionCenter.case.view.component.html'
})

export class ControlCenterCaseViewComponent implements OnInit, OnDestroy {
	@ViewChild('modal') modal: ModalCaseDetailComponent;
	@ViewChild('modalDuplicateActionPopUp') modalDuplicateActionPopUp: ModalDuplicateActionComponent;
	controlcenterActions: ICaseActionCenter[] = [];
	selectedCases: ICaseActionCenter[] = [];
	totalActions: number = 0;
	actionPerPage: number = 50;
	startActionNumber: number = 1;
	endActionNumber: number;
	isLeftArrowDisabled: boolean = true;
	isRightArrowDisabled: boolean = false;
	pageNum: number = 1;
	loadPagination: boolean = true;
	filterCriteria: number[];
	sortCriteria: string[];
	flagClass: string;
	holdClass: string;
	paramData: string = '';
	openCase: (caseId: ICase) => void;
	ngUnsubscribe: Subject<any> = new Subject<any>();
	defaultSort = {};
	countryList: ICodeValue[] = [];
	isShow: boolean = false;
	isFullScreenSpinner: boolean = false;
	messageCode: string = '';
	ports: any;
	// updateCases: (payload: ICaseRequestFormat) => void;
	constructor( @Inject('ICaseService') private caseService: ICaseService,
		@Inject('IBroadcastService') private broadcastService: IBroadcastService,
		@Inject('ITranslateService') private translateService: ITranslateService,
		@Inject('IMessageService') private messageService: IMessageService,
		@Inject('IDateFormatService') private dateFormatService: IDateFormatService,
		private route: ActivatedRoute,
		@Inject('ICommonService') private commonService: ICommonService) {
		this.filterCriteria = [
			caseStatus.AwaitingReAssessment,
			caseStatus.InspectionRequested,
			caseStatus.Emergency,
			caseStatus.ReScanRequested,
			caseStatus.AwaitingAssessment,
			caseStatus.AwaitingInspection
		];
		this.sortCriteria = ['-Priority', '-LastUpdatedDate'];
		this.defaultSort = {};
		this.route.params.subscribe(params => {
			if(params.case){
				this.paramData = params.case;
			  }
		});
		this.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
			if (result.key === broadcastKeys[broadcastKeys.refreshCaseList]) {
				this.isFullScreenSpinner = true;
				this.fetchActionData();
			}
		});

		this.openCase = (caseId: ICase) => {
			this.modal.show(caseId.caseId, true, verdictSources.DecisionCentre);
		};
	}

	/**
 * Helper Function
 * @param cases : ICase[]
 * Convert the numeric value of Case Action to string
 */
	caseActionConversion(cases, countryList: ICodeValue[]): ICaseActionCenter[] {
		return cases.map(param => {
			let status = caseStatus[param.status];
			let from = countryList.filter(obj => {
				return obj.code === param.from;
			})[0];

			if (from) {
				param.from = from.name;
			}

			let to = countryList.filter(obj => {
				return obj.code === param.to;
			})[0];

			if (param.dateOfArrival) {
				param.dateOfArrival = this.dateFormatService.operationalDate(param.dateOfArrival);
			}
			if (param.lastUpdatedDate) {
				param.lastUpdatedDate = this.dateFormatService.operationalDate(param.lastUpdatedDate);
			}

			if (to) {
				param.to = to.name;
			}

			let originPort = this.ports.filter(obj => {
				return obj.portCode === param.originPort;
			})[0];

			let destinationPort = this.ports.filter(obj => {
				return obj.portCode === param.destinationPort;
			})[0];

			if (originPort) {
				param.originPort = originPort.portName;
			}
			if (destinationPort) {
				param.destinationPort = destinationPort.portName;
			}

			param.statusText = this.translateService.instant(status);
			return param;
		}).map(action => {
			this.updateCaseActions(action);
			return action;
		});
	}
	captureCloseAction = (status: messageType) => {
		this.isFullScreenSpinner = true;
		this.fetchActionData();
	}

	captureCaseCloseAction = (event: any) => {
		this.fetchActionData();
	}

	updateCases = (payLoad: ICaseRequestFormat, selectedCase: ICaseActionCenter, newCaseAction: number) => {
		this.caseService.updateCases(payLoad).subscribe(result => {
			if (result.status === responseStatus.APIError && result.messageKey === 'SACM30004') {
				this.messageCode = result.message;
				this.messageService.LoaderMessage = { id: '', headerMessage: '', footerMessage: '', showLoader: false, type: spinnerType.small };
				this.modalDuplicateActionPopUp.show();
				return;
			}
			selectedCase.caseAction = newCaseAction;
			this.setCaseActions(selectedCase);
			selectedCase.priority = this.flagClass;
			selectedCase.hold = this.holdClass;
		}, (error: IResponse<any>) => {
			this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
		});
	}

	fetchActionData(): void {
		this.selectedCases.length = 0;
		// this.totalActions = 0;
		if (this.isFullScreenSpinner) {
			this.isFullScreenSpinner = false;
			this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: true, type: spinnerType.small };
		} else {
			this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: true, type: spinnerType.small };
		}
		this.caseService.getCases(false, this.pageNum, this.actionPerPage, this.filterCriteria, this.sortCriteria, '^AND^CaseAction^!=^0').subscribe(result => {
			this.caseService.fetchCaseCreateMetaData(metaDataSettings.Cases).subscribe(obj => {
				if (obj.status === responseStatus.Success) {
					this.isShow = true;
					this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
					if (result.data != null) {
						this.controlcenterActions = this.caseActionConversion(result.data.cases, obj.data.Country);
					}
					if (this.paramData) {
						this.modal.show(this.paramData, true, verdictSources.DecisionCentre);
					}
				} else {
					this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
				}

			}, (error) => {
				this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
				this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
			});
		}, (error) => {
			this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
			this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
		});
		if (this.loadPagination) {
			this.totalActions = 0;
			this.caseService.getCasesCount(false, this.filterCriteria, '^AND^CaseAction^!=^0').subscribe(result => {
				if (result.status === responseStatus.Success) {
					this.totalActions = +result.data;
				}
			}, (error) => {
				this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
				this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
			});
		}
	}

	onSorting = (event: any, onrefresh?: boolean) => {
		if (event && event.sortField && event.sortOrder) {
			this.sortCriteria = [(event.sortOrder > 0 ? '+' : '-') + this.commonService.sortTypes[event.sortField]];
			this.loadPagination = false;
			this.fetchActionData();
		}
	}

	loadCasesLazy = (pageNum: number, onpaging?: boolean) => {
		this.pageNum = pageNum;
		this.loadPagination = false;
		if (onpaging === true) {
			this.sortCriteria = ['-Priority', '-LastUpdatedDate'];
			this.loadPagination = true;
		}
		this.fetchActionData();
	}

	priorityIconClick = (selectedCase: ICaseActionCenter) => {
		let newCaseAction = selectedCase.caseAction;

		if (selectedCase.caseAction === caseActions.noSelection) {
			newCaseAction = caseActions.priority;
		}
		else if (selectedCase.caseAction === caseActions.priority) {
			newCaseAction = caseActions.noSelection;
		}

		let requestPayLoad: ICaseRequestFormat = {
			cases: [{ caseId: selectedCase.caseId, caseAction: newCaseAction, assignedTo: null }],
			status: selectedCase.status,
			reason: reasonType.ActionReason,
			notes: ''
		};
		this.updateCases(requestPayLoad, selectedCase, newCaseAction);
	}

	holdIconClick = (selectedCase: ICaseActionCenter) => {
		// logic for hold click
		let newCaseAction = selectedCase.caseAction;

		if (selectedCase.caseAction === caseActions.noSelection) {
			newCaseAction = caseActions.hold;
		}
		else if (selectedCase.caseAction === caseActions.hold) {
			newCaseAction = caseActions.noSelection;
		}

		let requestPayLoad: ICaseRequestFormat = {
			cases: [{ caseId: selectedCase.caseId, caseAction: newCaseAction, assignedTo: null }],
			status: selectedCase.status,
			reason: reasonType.ActionReason,
			notes: ''
		};
		this.updateCases(requestPayLoad, selectedCase, newCaseAction);
	}

	updateCaseActions = (param: ICaseActionCenter) => {
		this.setCaseActions(param);
		param.priority = this.flagClass;
		param.hold = this.holdClass;
	}

	setCaseActions = (param: ICaseActionCenter) => {
		let caseAction: caseActions = param.caseAction;
		this.flagClass = '';
		if (param.status === caseStatus.AwaitingAssessment || param.status === caseStatus.AwaitingInspection) {
			switch (caseAction) {
				case caseActions.noSelection:
					this.flagClass = 'svg-icn-flag-grey';
					this.holdClass = 'svg-icn-hold-grey';
					break;
				case caseActions.priority:
					this.flagClass = 'svg-icn-flag-red';
					this.holdClass = '';
					break;
				case caseActions.hold:
					this.flagClass = '';
					this.holdClass = 'svg-icn-hold-yellow';
					break;
				case caseActions.emergency:
					this.flagClass = '';
					this.holdClass = '';
					break;
			}
		} else {
			this.flagClass = '';
			this.holdClass = '';
		}
	}

	fetchCaseCountryData() {
		this.caseService.fetchCaseCountryData().subscribe(result => {
			if (result.status === responseStatus.Success) {
				let data = result.data as any;
				this.ports = [].concat.apply([],data.map(x => x.ports));
			}
	});
}

ngOnInit(): void {
	this.fetchCaseCountryData();
	this.fetchActionData();
}

ngOnDestroy(): void {
	this.sortCriteria = ['-Priority', '-LastUpdatedDate'];
	this.ngUnsubscribe.next();
	this.ngUnsubscribe.complete();
}
}
