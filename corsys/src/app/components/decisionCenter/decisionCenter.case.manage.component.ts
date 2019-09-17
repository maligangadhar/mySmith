import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SelectItem } from 'primeng/primeng';
import { Subject } from 'rxjs/Rx';
import { ActivatedRoute } from '@angular/router';
import { SpAutocompleteComponent } from '../../controls/autocomplete.control';
import { GridControlComponent } from '../../controls/grid.control';
import { IBroadcastService, ICaseService, IMessageService, ITranslateService, IStorageService, IDateFormatService, ICommonService } from '../../interfaces/interfaces';
import {
	broadcastKeys,
	caseStatus,
	controlCenterColumn,
	metaDataSettings,
	responseStatus,
	spinnerType,
	verdictSources,
	messageType,
} from '../../models/enums';
import {
	ICase,
	ICaseActionCenter,
	ICodeValue,
	IKeyData,
	ILoaderMessage,
	IQueryTags,
	ISearchGetResponseFormat,
	IResponse,
} from '../../models/viewModels';
import { ModalQueryBuilderComponent } from './../modal/modal.queryBuilder.component';
import { ModalCaseDetailComponent } from './decisionCenter.case.detail.component';
import { unionBy } from 'lodash/array';

@Component({
	selector: 'sp3-comp-decisioncenter-case-manage',
	templateUrl: './decisionCenter.case.manage.component.html'
})

export class ControlCenterCaseManageComponent implements OnInit, OnDestroy {
	@ViewChild('modal') modal: ModalCaseDetailComponent;
	@ViewChild('modalQueryBuilder') modalQueryBuilder: ModalQueryBuilderComponent;
	@ViewChild('autocomplete') autocomplete: SpAutocompleteComponent;
	@ViewChild('actionCenter') actionCenter: GridControlComponent;
	controlcenterActions: ICaseActionCenter[] = [];
	results: any[];
	suggestions: any[] = [];
	totalActions: number = 0;
	actionPerPage: number = 50;
	pageNum: number = 1;
	filterCriteria: any[];
	loadPagination: boolean = true;
	autocompleteFilterCriteria: string[];
	sortCriteria: string[];
	ngUnsubscribe: Subject<any> = new Subject<any>();
	countryList: ICodeValue[] = [];
	countryListMetadata: SelectItem[] = [];
	searchResults: any[];
	resultsStatus: ISearchGetResponseFormat[] = [];
	querytagsToDisplay: IQueryTags[] = [];
	showGrid: boolean;
	caseIdsSearchList: string[] = [];
	shippingCompanySearchList: string[] = [];
	containerSerachList: string[] = [];
	fromSearchList: string[] = [];
	statusSerachList: string[] = [];
	emptyMessage: string;
	queryTags: any[] = [];
	paramData: string = '';
	ports: any;
	getSearchData: (event: any) => void;
	caseActionConversion: (cases: any, countryList: ICodeValue[]) => ICaseActionCenter[];
	fetchActionData: (searchAll) => void;
	loadCasesLazy: (pageNum: number) => void;
	onSorting: (event: any) => void;
	formQueryTagsToDisplay: (query: any[]) => void;
	getCaseMetadata: () => void;
	checkCaseLoad: () => void;
	openCase: (caseId: ICase) => void;
	noSearchData: boolean = false;
	fixedStaticList: caseStatus[] = [caseStatus.AwaitingProfiling,
	caseStatus.AwaitingScan,
	caseStatus.AwaitingAssessment,
	caseStatus.InspectionRequested,
	caseStatus.AwaitingInspection,
	caseStatus.Cleared,
	caseStatus.Suspect,
	caseStatus.ReScanRequested];

	loaderMessage: ILoaderMessage = { id: '', headerMessage: 'Loading Cases...', footerMessage: 'Loading Cases..', showLoader: true, type: spinnerType.small };
	//loaderMessage: ILoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: true, type: spinnerType.small };
	constructor( @Inject('ICaseService') private caseService: ICaseService,
		@Inject('IBroadcastService') private broadcastService: IBroadcastService,
		private route: ActivatedRoute,
		@Inject('ITranslateService') private translateService: ITranslateService,
		@Inject('IMessageService') private messageService: IMessageService,
		@Inject('IStorageService') storageService: IStorageService,
		@Inject('IDateFormatService') private dateFormatService: IDateFormatService,
		@Inject('ICommonService') private commonService: ICommonService) {
		let dateFormat = storageService.getItem('generalFormat').dateFormat || 'MM-DD-YYYY';
		this.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
			if (result.key === broadcastKeys[broadcastKeys.refreshCaseList]) {
				this.fetchActionData(true);
			}
		});
		this.checkCaseLoad = () => {
			this.paramData = '';
			this.route.params.subscribe(params => {
				let criteria = [];
				if (params.case) {
					this.paramData = params.case;
					criteria.push({ 'fieldName': 'CaseId', 'fieldValue': params.case });
					criteria.push({ 'fieldName': 'ContainerId', 'fieldValue': params.case });
					criteria.push({ 'fieldName': 'ShippingCompany', 'fieldValue': params.case });
					criteria.push({ 'fieldName': 'From', 'fieldValue': params.case });
					this.filterCriteria = criteria;
					this.fetchActionData(true);
				}
			}
			);
		};
		this.openCase = (caseId: ICase) => {
			this.modal.show(caseId.caseId, true, verdictSources.DecisionCentre);
		};
		this.getSearchData = (event: any) => {
			if (event != null) {
				let searchText: string = event.query.trim();
				this.caseService.getSearchdata(searchText, this.autocompleteFilterCriteria)
					.takeUntil(this.ngUnsubscribe)
					.subscribe(result => {
						this.autocomplete.suggestions = result.data;
					});
			}
			else {
				this.autocomplete.suggestions = [];
			}
		};

		this.caseActionConversion = (cases, countryList: ICodeValue[]): ICaseActionCenter[] => {
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
			});
		};

		this.fetchActionData = (searchAll: boolean = false) => {
			var autoCompPanelDiv = <HTMLInputElement>document.getElementsByClassName('ui-autocomplete-panel')[0];
			autoCompPanelDiv.style.display = 'none';
			this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: true, type: spinnerType.small };
			this.caseService.getSearchCases(this.pageNum, this.actionPerPage, this.filterCriteria, searchAll, this.sortCriteria)
				.takeUntil(this.ngUnsubscribe)
				.subscribe(result => {
					if (result.data !== null) {
						this.loaderMessage.showLoader = true;
						this.messageService.LoaderMessage = this.loaderMessage;
						this.caseService.fetchCaseCreateMetaData(metaDataSettings.Cases).subscribe(obj => {
							if (obj.status === responseStatus.Success) {
								this.controlcenterActions = this.caseActionConversion(result.data.cases, obj.data.Country);
								this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
								this.controlcenterActions = this.caseActionConversion(result.data.cases, obj.data.Country);
								if (this.controlcenterActions.length < 1) {
									this.noSearchData = true;
									this.showGrid = false;
									this.loaderMessage.showLoader = false;
									this.messageService.LoaderMessage = this.loaderMessage;
								}
								else {
									this.noSearchData = false;
									this.showGrid = true;
									this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
									this.loaderMessage.showLoader = false;
									this.messageService.LoaderMessage = this.loaderMessage;
									if (this.paramData) {
										this.modal.show(this.paramData, true, verdictSources.DecisionCentre);
									}
								}
							}
						});
					}
				}, (error: IResponse<any>) => {
					this.loaderMessage.showLoader = false;
					this.messageService.LoaderMessage = this.loaderMessage;
					this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
				});
			if (this.loadPagination) {
				this.totalActions = 0;
				this.caseService.getSearchCasesCount(this.filterCriteria, searchAll).subscribe(result => {
					if (result.status === responseStatus.Success) {
						this.totalActions = +result.data;
					}
				}, (error) => {
					this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
					this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
				});
			} else {
				// this is for subsequent searches - [if query changes]
				this.loadPagination = true;
			}
		};

		// This method is fired on sorting columns
		this.onSorting = (event: any, onrefresh?: boolean) => {
			if (event && event.sortField && event.sortOrder) {
				this.sortCriteria = [(event.sortOrder > 0 ? '+' : '-') + this.commonService.sortTypes[event.sortField]];
				this.loadPagination = false;
				let searchAll = this.queryTags.length === 1 && this.queryTags[0].fieldName === '' ? true : false;
				this.fetchActionData(searchAll);
			}
		};

		this.loadCasesLazy = (pageNum: number, onpaging?: boolean) => {
			this.pageNum = pageNum;
			this.loadPagination = false;
			if (onpaging === true) {
				this.sortCriteria = ['-LastUpdatedDate'];
				this.loadPagination = true;
			}
			let searchAll = this.queryTags.length === 1 && this.queryTags[0].fieldName === '' ? true : false;
			this.fetchActionData(searchAll);
		};

		this.formQueryTagsToDisplay = (query: any[]) => {
			this.querytagsToDisplay = [];
			this.caseIdsSearchList = [];
			this.fromSearchList = [];
			this.statusSerachList = [];
			this.containerSerachList = [];
			this.shippingCompanySearchList = [];
			let tempData: any[] = [];
			let dummySerach: any[] = [];
			for (let value in query) {
				tempData = [];
				switch (query[value].fieldName) {
					case controlCenterColumn[controlCenterColumn.CaseId]:
						tempData = query[value].fieldValue.split(',');
						this.caseIdsSearchList = this.caseIdsSearchList.concat(tempData);
						break;
					case controlCenterColumn[controlCenterColumn.Status]:
						tempData = query[value].fieldValue.split(',');
						let tempStatuses: any[] = [];
						for (let status in tempData) {
							let tempStatus = this.translateService.instant(this.resultsStatus[Object.keys(this.resultsStatus).find(k => this.resultsStatus[k].fieldName === tempData[status])].fieldValue);
							tempStatuses.push(tempStatus);
						}
						this.statusSerachList = this.statusSerachList.concat(tempStatuses);
						// this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.Status], fieldValues: tempStatuses } )
						break;
					case controlCenterColumn[controlCenterColumn.From]:
						tempData = query[value].fieldValue.split(',');

						let tempCountryNames: any[] = [];
						for (let country in tempData) {
							let tempCountry = this.countryListMetadata[Object.keys(this.countryListMetadata).find(k => this.countryListMetadata[k].value === tempData[country])].label;
							tempCountryNames.push(tempCountry);
						}
						this.fromSearchList = this.fromSearchList.concat(tempCountryNames);
						break;
					case controlCenterColumn[controlCenterColumn.To]:
						tempData = query[value].fieldValue.split(',');
						tempCountryNames = [];
						for (let country in tempData) {
							let tempCountry = this.countryListMetadata[Object.keys(this.countryListMetadata).find(k => this.countryListMetadata[k].value === tempData[country])].label;
							tempCountryNames.push(tempCountry);
						}
						this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.To], fieldValues: tempCountryNames });
						break;
					case controlCenterColumn[controlCenterColumn.ShippingCompany]:
						tempData = query[value].fieldValue.split(',');
						this.shippingCompanySearchList = [];
						this.shippingCompanySearchList = this.shippingCompanySearchList.concat(tempData);
						break;
					case controlCenterColumn[controlCenterColumn.DateOfArrival]:
						tempData = query[value].fieldValue.split(',');
						let tempArrivalDate: string[] = [this.dateFormatService.formatDate(tempData[0], dateFormat) + ' - ' + this.dateFormatService.formatDate(tempData[1], dateFormat)];
						this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.DateOfArrival], fieldValues: tempArrivalDate });
						break;
					case controlCenterColumn[controlCenterColumn.LastModified]:
						tempData = query[value].fieldValue.split(',');
						let tempupdatedDate: string[] = [this.dateFormatService.formatDate(tempData[0], dateFormat) + ' - ' + this.dateFormatService.formatDate(tempData[1], dateFormat)];
						this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.LastModified], fieldValues: tempupdatedDate });
						break;
					case controlCenterColumn[controlCenterColumn.ContainerId]:
						tempData = query[value].fieldValue.split(',');
						this.containerSerachList = this.containerSerachList.concat(tempData);
						break;
					default:
						dummySerach.push(query[value].fieldValue);
						//this.querytagsToDisplay.push({ fieldName: null, fieldValues: [query[value].fieldValue] });
						break;
				}
			}
			if (this.caseIdsSearchList.length > 0) {
				this.caseIdsSearchList = Array.from(new Set(this.caseIdsSearchList));
				this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.CaseId], fieldValues: this.caseIdsSearchList });
			}
			if (this.shippingCompanySearchList.length > 0) {
				this.shippingCompanySearchList = Array.from(new Set(this.shippingCompanySearchList));
				this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.ShippingCompany], fieldValues: this.shippingCompanySearchList });
			}
			if (this.fromSearchList.length > 0) {
				this.fromSearchList = Array.from(new Set(this.fromSearchList));
				this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.From], fieldValues: this.fromSearchList });
			}
			if (this.statusSerachList.length > 0) {
				this.statusSerachList = Array.from(new Set(this.statusSerachList));
				this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.Status], fieldValues: this.statusSerachList });
			}
			if (this.containerSerachList.length > 0) {
				this.containerSerachList = Array.from(new Set(this.containerSerachList));
				this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.ContainerId], fieldValues: this.containerSerachList });
			}
			if (dummySerach.length > 0) {
				dummySerach = Array.from(new Set(dummySerach));
				this.querytagsToDisplay.push({ fieldName: '', fieldValues: dummySerach });
			}

		};

		this.getCaseMetadata = () => {
			this.caseService.fetchMetadata().subscribe(result => {
				this.resultsStatus = [];
				if (result.status === responseStatus.Success) {
					this.loaderMessage.showLoader = false;
					this.messageService.LoaderMessage = this.loaderMessage;
					for (let status in result.data.CargoStatus) {
						let tempStatus: ISearchGetResponseFormat = { fieldName: '', fieldValue: '' };
						tempStatus.fieldName = result.data.CargoStatus[status].id.toString();
						tempStatus.fieldValue = this.translateService.instant(result.data.CargoStatus[status].name);
						this.resultsStatus.push(tempStatus);

					}
				}
			});
			this.caseService.fetchCaseCreateMetaData(metaDataSettings.Cases).subscribe(result => {
				if (result.status === responseStatus.Success) {
					for (let country in result.data.Country) {
						let countryToAdd: SelectItem = {
							label: result.data.Country[country].name.trim(),
							value: result.data.Country[country].code.trim()
						};
						this.countryListMetadata.push(countryToAdd);
					}
				}
			});

		};
	}
	onSelectionChanged(event) {
		if (!event.fieldValue) {
			return;
		}
		if (event.fieldValue.length === 0 || event.fieldValue.trim() === '') {
			return;
		}
		this.queryTags = [];

		if (event.fieldName === null) { //for any invalid search text we search in all categories

			this.autocompleteFilterCriteria.forEach(item => {
				this.queryTags.push({
					'fieldName': item,
					'fieldValue': event.fieldValue
				});
			});
		}
		else {
			this.queryTags.push({
				'fieldName': event.fieldName,
				'fieldValue': event.fieldValue,
				'fullValue': event.fullValue

			});

		}

		this.filterCriteria = this.queryTags.map(x => Object.assign({}, x));
		this.queryTags = this.queryTags.slice(0, 1);
		if (event.fieldName === null) {
			this.queryTags[0].fieldName = '';
		}
		if (this.queryTags.length > 0) {
			this.formQueryTagsToDisplay(this.queryTags);

			// Resetting the page number to 1 as this is a new search
			this.pageNum = 1;

			if (event.fieldName && event.fieldName.length > 0) {
				this.fetchActionData(false);
			} else {
				this.fetchActionData(true);
			}
			this.autocomplete.selectedSearch = event;
			// remove the selected item from autocomplete
			setTimeout(() => this.autocomplete.selectedSearch = null);
		}
	}

	onAddingAdvancedSearchCriterias(additionalQueries: any[]): void {
		this.querytagsToDisplay = [];
		let dateOfArrival: number[] = [];
		let lastModified: number[] = [];
		let updatedDate: number[] = [];
		// Check for duplicate values
		/* additionalQueries.forEach((qry, index) => {
			if (qry.fieldName === 'Status' && this.queryTags.length > 0) {
				this.queryTags.forEach(item => {
					if (item.fieldName === 'Status') {
						item.fieldValue = qry.fieldValue;
						additionalQueries.splice(index, 1);
					}
				});
			}
		}); */
		// this.queryTags = this.queryTags.concat(additionalQueries);
		this.queryTags = unionBy(additionalQueries, this.queryTags, 'fieldName');
		for (let query in this.queryTags) {
			if (this.queryTags[query].fieldName === '' ||
				this.queryTags[query].fieldName === null ||
				this.queryTags[query].fieldName === undefined) {
				this.queryTags.splice(this.queryTags.indexOf(this.queryTags[query]), 1);
			}
			if (this.queryTags[query] && this.queryTags[query].fieldName === controlCenterColumn[controlCenterColumn.DateOfArrival]) {
				dateOfArrival.push(this.queryTags.indexOf(this.queryTags[query]));
			}
			if (this.queryTags[query] && this.queryTags[query].fieldName === controlCenterColumn[controlCenterColumn.LastModified]) {
				lastModified.push(this.queryTags.indexOf(this.queryTags[query]));
			}
			if (this.queryTags[query] && this.queryTags[query].fieldName === controlCenterColumn[controlCenterColumn.UpdatedDate]) {
				updatedDate.push(this.queryTags.indexOf(this.queryTags[query]));
			}
		}

		if (dateOfArrival.length > 1) {
			if (dateOfArrival[0] !== null) {
				this.queryTags.splice(dateOfArrival[0], 1);
			}
		}
		if (lastModified.length > 1) {
			if (lastModified[0] !== null) {
				this.queryTags.splice(lastModified[0], 1);
			}
		}
		if (updatedDate.length > 1) {
			if (updatedDate[0] !== null) {
				this.queryTags.splice(updatedDate[0], 1);
			}

		}
		this.formQueryTagsToDisplay(this.queryTags);
		if (this.queryTags.length > 0) {
			this.filterCriteria = this.queryTags;
			this.fetchActionData(false);
		}
		else {
			this.controlcenterActions = [];
			this.showGrid = false;
			this.noSearchData = true;
			this.loaderMessage.showLoader = false;
			this.messageService.LoaderMessage = this.loaderMessage;
		}
	}

	removeSearch = (queryToRemove: IQueryTags, queryDataToRemove: string) => {
		// tslint:disable-next-line:no-console
		// console.log('queryToRemove:::', queryToRemove, 'queryDataToRemove:::', queryDataToRemove);
		// this.loaderMessage.showLoader = true;
		// this.messageService.LoaderMessage = this.loaderMessage;
		this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: true, type: spinnerType.small };
		for (let query in this.queryTags) {
			if (this.queryTags[query].fieldName === queryToRemove.fieldName) {
				if (queryToRemove.fieldName === controlCenterColumn[controlCenterColumn.DateOfArrival] || queryToRemove.fieldName === controlCenterColumn[controlCenterColumn.LastModified] ||
					queryToRemove.fieldName === controlCenterColumn[controlCenterColumn.UpdatedDate]) {
					this.queryTags.splice(this.queryTags.indexOf(this.queryTags[query]), 1);
					this.querytagsToDisplay.splice(this.querytagsToDisplay.indexOf(queryToRemove), 1);
				}
				else if (queryToRemove.fieldName === controlCenterColumn[controlCenterColumn.From] ||
					queryToRemove.fieldName === controlCenterColumn[controlCenterColumn.To]) {
					let tempCountryCode: string = '';
					tempCountryCode = this.countryListMetadata[Object.keys(this.countryListMetadata).find(k => this.countryListMetadata[k].label === queryDataToRemove)].value;

					let data: any[] = [];
					data = this.queryTags[query].fieldValue.split(',');
					data = data.filter(obj => obj !== tempCountryCode);
					this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues =
						this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues.filter(obj => obj !== queryDataToRemove);
					if (this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues.length === 0) {
						this.querytagsToDisplay.splice(this.querytagsToDisplay.indexOf(queryToRemove), 1);
					}
					if (data.length > 0) {
						this.queryTags[query].fieldValue = data.join(',');
						//this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues = data;
					}
					else {
						this.queryTags.splice(this.queryTags.indexOf(this.queryTags[query]), 1);
						// this.querytagsToDisplay.splice(this.querytagsToDisplay.indexOf(queryToRemove), 1);
					}
				}
				else if (queryToRemove.fieldName === controlCenterColumn[controlCenterColumn.Status]) {
					let tempStatus: any;
					tempStatus = this.resultsStatus[Object.keys(this.resultsStatus).find(k => this.resultsStatus[k].fieldValue === queryDataToRemove)].fieldName;

					let data: any[] = [];
					data = this.queryTags[query].fieldValue.split(',');
					data = data.filter(obj => obj !== tempStatus);
					this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues =
						this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues.filter(obj => obj !== queryDataToRemove);
					if (this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues.length === 0) {
						this.querytagsToDisplay.splice(this.querytagsToDisplay.indexOf(queryToRemove), 1);
					}
					if (data.length > 0) {
						this.queryTags[query].fieldValue = data.join(',');
						//this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues = data;
					}
					else {
						this.queryTags.splice(this.queryTags.indexOf(this.queryTags[query]), 1);
						//  this.querytagsToDisplay.splice(this.querytagsToDisplay.indexOf(queryToRemove), 1);
					}
				} else if (queryToRemove.fieldName === '') {
					this.queryTags.splice(this.queryTags.indexOf(this.queryTags[query]), 1);
					this.querytagsToDisplay.splice(this.querytagsToDisplay.indexOf(queryToRemove), 1);
				}
				else {
					let data: any[] = [];
					data = this.queryTags[query].fieldValue.split(',');
					data = data.filter(obj => obj !== queryDataToRemove);
					this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues =
						this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues.filter(obj => obj !== queryDataToRemove);
					if (this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues.length === 0) {
						this.querytagsToDisplay.splice(this.querytagsToDisplay.indexOf(queryToRemove), 1);
					}
					if (data.length > 0) {
						this.queryTags[query].fieldValue = data.join(',');
					}
					else {
						this.queryTags.splice(this.queryTags.indexOf(this.queryTags[query]), 1);

					}
				}
			}
		}
		//this.querytagsToDisplay = [];
		//this.formQueryTagsToDisplay(this.queryTags);
		if (this.queryTags.length > 0) {
			this.filterCriteria = this.queryTags;
			this.pageNum = 1;
			if (this.actionCenter) {
				this.actionCenter.startActionNumber = 1;
				this.actionCenter.pageNum = 1;
			}

			this.fetchActionData(false);
		}
		else {
			this.controlcenterActions = [];
			this.showGrid = false;
			this.noSearchData = false;
			this.loaderMessage.showLoader = false;
			this.messageService.LoaderMessage = this.loaderMessage;
		}
	}

	openQueryBuilder = () => {
		this.modalQueryBuilder.show();
	}

	fetchCaseCountryData() {
		this.caseService.fetchCaseCountryData().subscribe(result => {
			if (result.status === responseStatus.Success) {
				let data = result.data as any;
				this.ports = [].concat.apply([], data.map(x => x.ports));
			}
		});
	}

	ngOnInit(): void {
		this.fetchCaseCountryData();
		this.getCaseMetadata();
		this.filterCriteria = [];
		this.queryTags = [];
		this.sortCriteria = ['-LastUpdatedDate'];
		this.searchResults = [];
		this.showGrid = false;
		this.noSearchData = false;
		this.emptyMessage = this.translateService.instant('EmptyMessage');
		//filter criteria for autocomplete control
		this.autocompleteFilterCriteria = [controlCenterColumn[controlCenterColumn.CaseId], controlCenterColumn[controlCenterColumn.ContainerId],
		controlCenterColumn[controlCenterColumn.ShippingCompany], controlCenterColumn[controlCenterColumn.From]];
		this.querytagsToDisplay = [];
		this.checkCaseLoad();
	}

	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
