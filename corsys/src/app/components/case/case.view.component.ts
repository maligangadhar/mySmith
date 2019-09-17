import { Component, Inject, Input, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { IResponse, ICase, IKeyValue, ICodeValue, IKeyData } from '../../models/viewModels';
import { ICaseService, IMessageService, IBroadcastService, ITranslateService, ICommonService } from '../../interfaces/interfaces';
import { responseStatus, metaDataSettings, messageType, caseButtonTypes, broadcastKeys, action, caseStatus, spinnerType } from '../../models/enums';
import { ModalCaseCreationComponent } from '../modal/modal.case.creation.component';
import { SPButtonComponent } from '../../controls/case.button.control';
import { GridControlComponent } from '../../controls/grid.control';
import { Subject } from 'rxjs/Rx';
@Component({
	selector: 'sp3-comp-case-view',
	templateUrl: './case.view.component.html'
})

export class CaseViewComponent implements OnInit, OnDestroy {
	@Input() public controlId: string;
	@ViewChild('modal') modal: ModalCaseCreationComponent;
	@ViewChild('deleteCases') deleteCases: SPButtonComponent;
	@ViewChild('clearCases') clearCases: SPButtonComponent;
	@ViewChild('scanCases') scanCases: SPButtonComponent;
	@ViewChild('cancelCases') cancelCases: SPButtonComponent;
	@ViewChild('caseDataTable') caseDataTable: GridControlComponent;

	buttonMarginLeft: number = 0;
	title: string;
	message: string;
	showError: boolean;
	draftKey?: number[];
	totalCases: number = 0;
	gridRows: number = 50;
	pageNumber: number = 1;
	cancelClass: string = 'btn btn-red';
	scanClass: string = 'btn btn-orng';
	deleteClass: string = 'btn btn-reverse';
	clearClass: string = 'btn btn-green';
	dataSource: ICase[] = [];
	cases: ICase[] = [];
	cargoStatusList: IKeyValue[] = [];
	countryList: ICodeValue[] = [];
	caseButtonTypes: any;
	loadPagination: boolean = true;
	ports: any;
	isDeleteDisabled: boolean = true;
	isScanDisabled: boolean = false;
	isCancelDisabled: boolean = false;
	isClearDisabled: boolean = false;
	isShow: boolean = false;
	selectedList: string[] = [];
	selectedCases: ICase[] = [];
	reasonType: IKeyValue[];
	ngUnsubscribe: Subject<any> = new Subject<any>();
	sortCriteria = ['-LastUpdatedDate'];

	caseview: (pageNum: number, noOfRows: number) => void;
	createCase: () => void;
	loadCasesLazy: (pageNum: number) => void;
	openCase: (selectedCase: ICase) => void;
	onChange: (event: any, caseId: string) => void;
	onSelect: (event: any) => void;
	onSelectFromGrid: (event: any) => void;
	enableDisableButtons: (status: boolean) => void;
	callBackButtonWidth: (event: number) => void;
	getCaseMetadata: () => void;
	onSorting: (event: any) => void;
	fetchCaseCountryData: () => void;

	constructor(
		@Inject('IMessageService') private messageService: IMessageService,
		@Inject('ITranslateService') private translateService: ITranslateService,
		@Inject('IBroadcastService') private broadcastService: IBroadcastService,
		@Inject('ICaseService') private caseService: ICaseService,
		@Inject('ICommonService') private commonService: ICommonService) {
		var vm = this;
		vm.caseButtonTypes = caseButtonTypes;

		vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {

			if (result.key === broadcastKeys[broadcastKeys.refreshCaseList]) {
				vm.selectedCases = [];
				if (vm.caseDataTable) {
					vm.caseDataTable.selectedValues = [];
				}
				vm.selectedList = [];

				if (result.data === action.setDefaultData) {
					if (this.caseDataTable.dataTable) {
						this.caseDataTable.dataTable.reset();
					}
				}

				vm.caseview(vm.pageNumber, vm.gridRows);
				vm.enableDisableButtons(false);

			} else if (result.key === broadcastKeys[broadcastKeys.errorcaseListUpdate]) {
				vm.showError = true;
				vm.messageService.Message = { message: result.data.messageKey, showMessage: true, type: messageType.Error };
				vm.selectedCases = [];
				if (vm.caseDataTable) {
					vm.caseDataTable.selectedValues = [];
				}
				vm.selectedList = [];
				vm.enableDisableButtons(false);
			}

		});

		vm.fetchCaseCountryData = () => {
			this.caseService.fetchCaseCountryData().subscribe(result => {
				if (result.status === responseStatus.Success) {
					let data = result.data as any;
					this.ports = [].concat.apply([], data.map(x => x.ports));
				}
				this.caseview(this.pageNumber, this.gridRows);
			});
		};

		vm.openCase = (selectedCase: ICase) => {
			vm.broadcastService.broadcast('existingCaseDetails', selectedCase.caseId);
			vm.modal.show();
		};

		vm.callBackButtonWidth = (event: number) => {
			setTimeout(() => {
				this.buttonMarginLeft = event + 8;
			}, 1);
		};

		vm.getCaseMetadata = () => {
			this.caseService.fetchMetadata().subscribe(result => {
				if (result.status === responseStatus.Success) {
					vm.cargoStatusList = result.data.CargoStatus;
					//console.log('vm.cargoStatusList:::',vm.cargoStatusList);
				}
			});
		};

		vm.onSelectFromGrid = (event: ICase[]) => {
			vm.selectedCases = event;
			vm.selectedList = [];
			for (var i = 0; i < vm.selectedCases.length; i++) {
				vm.selectedList.push(vm.selectedCases[i].caseId);
			}
			if (vm.selectedList.length > 0) {
				vm.enableDisableButtons(true);
			}
			else {
				vm.enableDisableButtons(false);
			}

		};

		vm.onSelect = (event: ICase) => {
			vm.selectedList = [];
			for (var i = 0; i < vm.selectedCases.length; i++) {
				vm.selectedList.push(vm.selectedCases[i].caseId);
			}
			if (vm.selectedList.length > 0) {
				vm.enableDisableButtons(true);
			}
			else {
				vm.enableDisableButtons(false);
			}

		};

		vm.loadCasesLazy = (pageNum: number, onRefresh?: boolean) => {
			this.pageNumber = pageNum;
			vm.selectedCases = [];
			vm.selectedList = [];
			vm.loadPagination = false;
			vm.enableDisableButtons(false);
			if (onRefresh === true) {
				this.sortCriteria = ['-LastUpdatedDate'];
				this.loadPagination = true;
			}
			vm.caseview(vm.pageNumber, vm.gridRows);
		};

		vm.enableDisableButtons = (status: boolean) => {
			if (status === true) {
				vm.isCancelDisabled = vm.isClearDisabled = vm.isScanDisabled = vm.isDeleteDisabled = false;
			}
			else {
				vm.isCancelDisabled = vm.isClearDisabled = vm.isScanDisabled = vm.isDeleteDisabled = true;
			}
		};


		vm.caseview = (pageNum: number, noOfRows: number) => {
			vm.message = '';
			vm.showError = false;
			vm.draftKey = [];
			if (this.controlId === 'Draft') {
				this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: true, type: spinnerType.small };
			}

			vm.caseService.fetchCaseCreateMetaData(metaDataSettings.Cases).subscribe(res => {
				if (res.status === responseStatus.Success) {
					//vm.cargoStatusList = res.data.CargoStatus;
					vm.countryList = res.data.Country;

				}
				if (vm.controlId === 'Draft') {
					vm.draftKey = [];
					vm.draftKey.push(caseStatus.Draft);
				}
				else {
					vm.draftKey = [];
					vm.draftKey.push(caseStatus.AwaitingScreening);
				}
				if (vm.draftKey.length === 0) {
					vm.draftKey = null;
				}

				if (this.controlId === 'Draft') {
					vm.caseService.getCases(true, pageNum, noOfRows, vm.draftKey, vm.sortCriteria).subscribe(result => {

						if (result.status === responseStatus.Success) {
							if (result.data && result.data.cases.length > 0) {
								vm.cases = result.data.cases;
								vm.selectedList = [];
								vm.cases.forEach(item => {

									let from = this.countryList.find(obj => obj.code === item.from);

									if (from) {
										item.from = from.name;
									}

									let originPort = this.ports.find(obj => obj.portCode === item.originPort);

									if (originPort) {
										item.originPort = originPort.portName;
									}

									let destinationPort = this.ports.find(obj => obj.portCode === item.destinationPort);

									if (destinationPort) {
										item.destinationPort = destinationPort.portName;
									}

									let status = this.cargoStatusList.find(obj => obj.id === item.status);

									if (status) {
										item.status = status.name as any;
									}

									item.checked = false;

								});
								this.isShow = true;
							}
							else {
								this.isShow = true;
							}

							this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };

						} else {
							this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
							vm.showError = true;
							vm.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
						}
					},
						(error: IResponse<any>) => {
							this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
							vm.showError = true;
							vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
						}
					);
					if (this.loadPagination) {
						vm.totalCases = 0;
						this.caseService.getCasesCount(true, vm.draftKey, null).subscribe(result => {
							if (result.status === responseStatus.Success) {
								this.totalCases = +result.data;
							}
						}, (error) => {
							this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
							this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
						});
					}
				}
			}, (error: IResponse<any>) => {
				this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
				vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
			});
		};

		vm.createCase = () => {
			vm.modal.show();
		};

		// This method is fired on sorting columns
		vm.onSorting = (event: any, onrefresh?: boolean) => {
			if (event && event.sortField && event.sortOrder) {
				this.sortCriteria = [(event.sortOrder > 0 ? '+' : '-') + this.commonService.sortTypes[event.sortField]];
				this.loadPagination = false;
				vm.caseview(vm.pageNumber, vm.gridRows);
			}
		};
	}

	ngOnInit() {
		this.getCaseMetadata();
		this.fetchCaseCountryData();
		this.selectedList = [];
		this.selectedCases = [];
	}

	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
