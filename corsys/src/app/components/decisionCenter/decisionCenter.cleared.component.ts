import { Component, OnInit, Inject, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { ICase, ICodeValue, ICaseActionCenter, ISearchGetResponseFormat, IDisplayQueryTags, ICustomMessageResponse, IResponse, IAnalysisDetails, IAppSettingsDetails } from '../../models/viewModels';
import { ICaseService, ITranslateService, IMessageService, ICaseAnalysisService, IGeneralSettings, IStorageService, IDateFormatService, ICommonService } from '../../interfaces/interfaces';
import { caseStatus, responseStatus, metaDataSettings, controlCenterColumn, caseButtonTypes, assessmentTypes, assessmentResults, verdictSources, messageResponseType, messageType, spinnerType, settingsAppIds, DecisionCentreSettings } from '../../models/enums';
import { ModalQueryBuilderComponent } from './../modal/modal.queryBuilder.component';
import { SpAutocompleteComponent } from '../../controls/autocomplete.control';
import { SelectItem } from 'primeng/primeng';
import { GridControlComponent } from '../../controls/grid.control';
import { ModalCaseDetailComponent } from './decisionCenter.case.detail.component';
import { unionBy } from 'lodash/array';
@Component({
	selector: 'sp3-comp-decisioncentre-cleared-caseview',
	templateUrl: './decisionCenter.cleared.component.html'
})

export class DecisioncentreClearedCaseComponent implements OnInit, OnDestroy {
	ports: any;
	buttonMarginLeft: number = 0;
	@ViewChild('modal') modal: ModalCaseDetailComponent;
	@ViewChild('modalQueryBuilder') modalQueryBuilder: ModalQueryBuilderComponent;
	@ViewChild('autocomplete') autocomplete: SpAutocompleteComponent;
	@ViewChild('actionCenter') actionCenter: GridControlComponent;
	controlcenterActions: ICaseActionCenter[] = [];
	selectedCases: ICaseActionCenter[] = [];
	selectedList: string[] = [];
	results: any[];
	suggestions: any;
	isGettingSettings: boolean = true;
	totalActions: number = 0;
	actionPerPage: number = 50;
	clearCaseThreshold: number = 0;
	loadPagination: boolean = true;
	pageNum: number = 1;
	filterCriteria: any[];
	autocompleteFilterCriteria: string[];
	sortCriteria: string[];
	ngUnsubscribe: Subject<any> = new Subject<any>();
	countryList: ICodeValue[] = [];
	countryListMetadata: SelectItem[] = [];
	searchResults: any[];
	resultsStatus: ISearchGetResponseFormat[] = [];
	riskRatingStatus: ISearchGetResponseFormat[] = [];
	querytagsToDisplay: IDisplayQueryTags[] = [];
	showGrid: boolean;
	caseIdsSearchList: string[] = [];
	shippingCompanySearchList: string[] = [];
	containerSerachList: string[] = [];
	fromSearchList: string[] = [];
	riskRatingList: string[] = [];
	emptyMessage: string;
	queryTags: any[] = [];
	decisionCenterCleared: string = 'clearedCases';
	caseButtonTypes: any;
	analysisPayload: IAnalysisDetails;
	getSettings: () => void;
	getSearchData: (event: any) => void;
	caseActionConversion: (cases: any, countryList: ICodeValue[]) => ICaseActionCenter[];
	fetchActionData: (searchAll) => void;
	loadCasesLazy: (pageNum: number) => void;
	onSorting: (event: any) => void;
	formQueryTagsToDisplay: (query: any[]) => void;
	getCaseMetadata: () => void;
	openCase: (caseId: ICase) => void;
	onSelectFromGrid: (event: any) => void;
	onScreenPopUpClick: (event: ICustomMessageResponse<string>) => void;
	processClickOperation: (actionType: number, event: any) => void;
	callBackButtonWidth: (event: number) => void;
	setPage: () => void;
	noSearchData: boolean = false;
	constructor(
		@Inject('IGeneralSettings') private generalSettings: IGeneralSettings,
		@Inject('ICaseService') private caseService: ICaseService,
		@Inject('IMessageService') private messageService: IMessageService,
		@Inject('ICaseAnalysisService') private caseAnalysisService: ICaseAnalysisService,
		@Inject('ITranslateService') private translateService: ITranslateService,
		@Inject('IStorageService') storageService: IStorageService,
		@Inject('IDateFormatService') private dateFormatService: IDateFormatService,
		@Inject('ICommonService') private commonService: ICommonService) {
		let dateFormat = storageService.getItem('generalFormat').dateFormat || 'MM-DD-YYYY';

		this.caseButtonTypes = caseButtonTypes;
		this.analysisPayload = {
			caseId: [],
			source: verdictSources.DecisionCentre,
			assessment: assessmentTypes.None,
			result: assessmentResults.NotFound,
			comment: '',
			status: 0
		};

		this.getSettings = () => {
			this.isGettingSettings = true;
			this.generalSettings.fetchOpAdminSettings(settingsAppIds.DecisionCentre).
				takeUntil(this.ngUnsubscribe).
				subscribe((resultAppSettings: IResponse<IAppSettingsDetails>) => {
					if (resultAppSettings.status === responseStatus.Success) {
						//let clearCaseTreshold:number=48;
						for (let value in resultAppSettings.data.settings) {
							//if(resultAppSettings.data.settings[value].settingsName=== DecisionCentreSettings[DecisionCentreSettings.ClearedCasesDuration])
							if (resultAppSettings.data.settings[value].settingsId === DecisionCentreSettings.ClearedCasesDuration) {
								this.clearCaseThreshold = +resultAppSettings.data.settings[value].settingsValue;
							}
						}
						this.isGettingSettings = false;
					}
					else {
						this.isGettingSettings = false;
					}
				});

		};

		this.callBackButtonWidth = (event: number) => {
			setTimeout(() => {
				this.buttonMarginLeft = event + 8;
			}, 1);
		};

		this.onScreenPopUpClick = (event: ICustomMessageResponse<string>) => {
			if (event.status === messageResponseType.Yes) {
				this.processClickOperation(caseStatus.AwaitingScreening, event);
				this.caseAnalysisService.putCaseAnalysis(this.analysisPayload).takeUntil(this.ngUnsubscribe).subscribe((result) => {
					this.setPage();
					this.fetchActionData(false);
				}, (error: IResponse<any>) => {
					this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
				});
			}
		};

		this.processClickOperation = (actionType: number, event) => {
			switch (actionType) {
				case caseStatus.AwaitingScreening:
					this.analysisPayload.comment = event.result;
					this.analysisPayload.source = verdictSources.DecisionCentre;
					this.analysisPayload.caseId = this.selectedList;
					this.analysisPayload.assessment = assessmentTypes.None;
					this.analysisPayload.result = assessmentResults.Inconclusive;
					this.analysisPayload.status = caseStatus.AwaitingScreening;
					break;
			}
		};

		this.openCase = (caseId: ICase) => {
			this.modal.show(caseId.caseId, false, verdictSources.DecisionCentre);
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
				if (param.harmonisedSystemCodes && param.harmonisedSystemCodes.length > 0) {
					let hsCode = '';
					param.harmonisedSystemCodes.forEach((element, index) => {
						hsCode += element;
						if (index !== param.harmonisedSystemCodes.length - 1) {
							hsCode += ',';
						}
					});
					param.hsCode = hsCode;
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

				//param.overAllRiskKeyValue = { key: '', value: '' };
				//param.overAllRiskKeyValue.key = param.riskColor;
				//param.overAllRiskKeyValue.data = param.overAllRisk;
				param.overAllRiskKeyValue = param.riskColor + '-' + param.overAllRisk;

				param.statusText = this.translateService.instant(status);
				return param;
			});
		};

		this.onSelectFromGrid = (event: ICaseActionCenter[]) => {
			this.selectedCases = event;
			this.selectedList = [];
			for (var i = 0; i < this.selectedCases.length; i++) {
				this.selectedList.push(this.selectedCases[i].caseId);
			}
		};

		this.setPage = () => {
			let lastRowsSelected = (this.pageNum > Math.floor(this.totalActions / this.actionPerPage)) && (this.totalActions % this.actionPerPage) === this.selectedCases.length;
			if (lastRowsSelected && this.pageNum > 1) {
				this.pageNum = this.pageNum - 1;
			}
		};

		this.fetchActionData = (searchAll: boolean = false) => {
			this.selectedList = [];
			if (this.filterCriteria.length > 0) {
				this.filterCriteria.push({ fieldName: 'Status', fieldValue: caseStatus.Cleared });
			}
			var autoCompPanelDiv = <HTMLInputElement>document.getElementsByClassName('ui-autocomplete-panel')[0];
			autoCompPanelDiv.style.display = 'none';
			this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('GridClearCaseLoading'), showLoader: true, type: spinnerType.small };
			this.caseService.getSearchClearCases(this.clearCaseThreshold, this.pageNum, this.actionPerPage, this.filterCriteria, this.sortCriteria, searchAll, 'override')
				.takeUntil(this.ngUnsubscribe)
				.subscribe(result => {
					if (result.data !== null) {
						this.caseService.fetchCaseCreateMetaData(metaDataSettings.Cases).subscribe(obj => {
							if (obj.status === responseStatus.Success) {
								this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('GridClearCaseLoading'), showLoader: false, type: spinnerType.small };
								this.controlcenterActions = this.caseActionConversion(result.data.cases, obj.data.Country);
								if (this.controlcenterActions.length < 1) {
									this.noSearchData = true;
									this.showGrid = false;
								}
								else {
									this.noSearchData = false;
									this.showGrid = true;
								}
							}
						});
					}
					this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('GridClearCaseLoading'), showLoader: false, type: spinnerType.small };
				});
			if (this.loadPagination) {
				this.totalActions = 0;
				this.caseService.getSearchClearCasesCount(this.clearCaseThreshold, this.pageNum, this.actionPerPage, this.filterCriteria, searchAll, 'override').subscribe(result => {
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
			this.containerSerachList = [];
			this.shippingCompanySearchList = [];
			let tempData: any[] = [];
			let dummySerach: any[] = [];
			this.riskRatingList = [];
			for (let value in query) {
				tempData = [];
				switch (query[value].fieldName) {
					case controlCenterColumn[controlCenterColumn.CaseId]:
						tempData = query[value].fieldValue.split(',');
						this.caseIdsSearchList = this.caseIdsSearchList.concat(tempData);
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
						this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.To], fieldValues: tempCountryNames, fieldColor: [] });
						break;
					case controlCenterColumn[controlCenterColumn.ShippingCompany]:
						tempData = query[value].fieldValue.split(',');
						this.shippingCompanySearchList = this.shippingCompanySearchList.concat(tempData);
						break;
					case controlCenterColumn[controlCenterColumn.DateOfArrival]:
						tempData = query[value].fieldValue.split(',');
						// let tempArrivalDate: string[] = [tempData[0].toString() + ' - ' + tempData[1].toString()];
						let tempArrivalDate: string[] = [this.dateFormatService.formatDate(tempData[0], dateFormat) + ' - ' + this.dateFormatService.formatDate(tempData[1], dateFormat)];

						this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.DateOfArrival], fieldValues: tempArrivalDate, fieldColor: [] });
						break;
					case controlCenterColumn[controlCenterColumn.LastModified]:
						tempData = query[value].fieldValue.split(',');
						let tempupdatedDate: string[] = [this.dateFormatService.formatDate(tempData[0], dateFormat) + ' - ' + this.dateFormatService.formatDate(tempData[1], dateFormat)];
						// let tempupdatedDate: string[] = [tempData[0].toString() + ' - ' + tempData[1].toString()];
						this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.LastModified], fieldValues: tempupdatedDate, fieldColor: [] });
						break;
					case controlCenterColumn[controlCenterColumn.ContainerId]:
						tempData = query[value].fieldValue.split(',');
						this.containerSerachList = this.containerSerachList.concat(tempData);
						break;
					case controlCenterColumn[controlCenterColumn.Status]:
						break;
					case controlCenterColumn[controlCenterColumn.RiskRating]:
						tempData = query[value].fieldValue.toString().split(',');
						let tempRatingStatuses: any[] = [];
						this.riskRatingList = [];
						for (let status in tempData) {
							let tempStatus = this.riskRatingStatus[Object.keys(this.riskRatingStatus).find(k => this.riskRatingStatus[k].fieldValue === tempData[status])].fieldValue;
							tempRatingStatuses.push(tempStatus);
						}
						this.riskRatingList = this.riskRatingList.concat(tempRatingStatuses);
						break;
					case controlCenterColumn[controlCenterColumn.OverAllRisk]:
						tempData = query[value].fieldValue.split(',');
						this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.OverAllRisk], fieldValues: tempData, fieldColor: [] });
						break;
					default:
						dummySerach.push(query[value].fieldValue);
						//this.querytagsToDisplay.push({ fieldName: null, fieldValues: [query[value].fieldValue] });
						break;
				}
			}
			if (this.caseIdsSearchList.length > 0) {
				this.caseIdsSearchList = Array.from(new Set(this.caseIdsSearchList));
				this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.CaseId], fieldValues: this.caseIdsSearchList, fieldColor: [] });
			}
			if (this.shippingCompanySearchList.length > 0) {
				this.shippingCompanySearchList = Array.from(new Set(this.shippingCompanySearchList));
				this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.ShippingCompany], fieldValues: this.shippingCompanySearchList, fieldColor: [] });
			}
			if (this.fromSearchList.length > 0) {
				this.fromSearchList = Array.from(new Set(this.fromSearchList));
				this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.From], fieldValues: this.fromSearchList, fieldColor: [] });
			}
			if (this.containerSerachList.length > 0) {
				this.containerSerachList = Array.from(new Set(this.containerSerachList));
				this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.ContainerId], fieldValues: this.containerSerachList, fieldColor: [] });
			}
			if (this.riskRatingList.length > 0) {
				this.riskRatingList = Array.from(new Set(this.riskRatingList));
				this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.RiskRating], fieldValues: [], fieldColor: this.riskRatingList });
			}
			if (dummySerach.length > 0) {
				dummySerach = Array.from(new Set(dummySerach));
				this.querytagsToDisplay.push({ fieldName: '', fieldValues: dummySerach, fieldColor: [] });
			}

		};

		this.getCaseMetadata = () => {
			this.caseService.fetchMetadata().subscribe(result => {
				this.resultsStatus = [];
				this.riskRatingStatus = [];
				if (result.status === responseStatus.Success) {
					this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('GridClearCaseLoading'), showLoader: false, type: spinnerType.small };
					for (let status in result.data.CargoStatus) {
						let tempStatus: ISearchGetResponseFormat = { fieldName: '', fieldValue: '' };
						tempStatus.fieldName = result.data.CargoStatus[status].id.toString();
						tempStatus.fieldValue = this.translateService.instant(result.data.CargoStatus[status].name);
						this.resultsStatus.push(tempStatus);
					}
					for (let status in result.data.RiskColor) {
						let tempStatus: ISearchGetResponseFormat = { fieldName: '', fieldValue: '' };
						tempStatus.fieldValue = result.data.RiskColor[status].id.toString();
						tempStatus.fieldName = this.translateService.instant(result.data.RiskColor[status].name);
						this.riskRatingStatus.push(tempStatus);
					}
				}
			}, (error) => {
				this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
				this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
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
			this.querytagsToDisplay = [];
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
		let updatedDate: number[] = [];
		let lastModified: number[] = [];
		let tempData: any[] = [];
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
			if (this.queryTags[query] && this.queryTags[query].fieldName === controlCenterColumn[controlCenterColumn.RiskRating]) {
				if (this.queryTags[query] && this.queryTags[query].fieldValue.indexOf(',') !== -1) {
					let temp = '';
					tempData = this.queryTags[query].fieldValue.toString().split(',');
					for (let rating in tempData) {
						temp += this.riskRatingStatus[Object.keys(this.riskRatingStatus).find(k => this.riskRatingStatus[k].fieldValue === tempData[rating])].fieldValue;
						if (+rating !== tempData.length - 1) {
							temp += ',';
						}
					}
					this.queryTags[query].fieldValue = temp;
				} else {
					this.queryTags[query].fieldValue = this.riskRatingStatus[Object.keys(this.riskRatingStatus).find(k => this.riskRatingStatus[k].fieldValue === this.queryTags[query].fieldValue)].fieldValue;
				}
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
			this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('GridClearCaseLoading'), showLoader: false, type: spinnerType.small };
		}
	}

	removeSearch = (queryToRemove: IDisplayQueryTags, queryDataToRemove: string) => {
		this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('GridClearCaseLoading'), showLoader: true, type: spinnerType.small };
		for (let query in this.queryTags) {
			if (this.queryTags[query].fieldName === queryToRemove.fieldName) {
				if (queryToRemove.fieldName === controlCenterColumn[controlCenterColumn.DateOfArrival] ||
					queryToRemove.fieldName === controlCenterColumn[controlCenterColumn.UpdatedDate] ||
					queryToRemove.fieldName === controlCenterColumn[controlCenterColumn.LastModified]) {
					this.queryTags.splice(this.queryTags.indexOf(this.queryTags[query]), 1);
					this.querytagsToDisplay.splice(this.querytagsToDisplay.indexOf(queryToRemove), 1);
				}
				else if (queryToRemove.fieldName === controlCenterColumn[controlCenterColumn.From] ||
					queryToRemove.fieldName === controlCenterColumn[controlCenterColumn.To]) {
					let tempCountryCode: string = '';
					tempCountryCode = this.countryListMetadata[Object.keys(this.countryListMetadata).find(k => this.countryListMetadata[k].label === queryDataToRemove)].value;

					let data: any[] = [];
					data = this.queryTags[query].fieldValue.toString().split(',');
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
					data = this.queryTags[query].fieldValue.toString().split(',');
					data = data.filter(obj => obj !== tempStatus);
					if (this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues && this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues) {
						this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues = this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues.filter(obj => obj !== queryDataToRemove);
					}
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
				}
				else if (queryToRemove.fieldName === '') {
					this.queryTags.splice(this.queryTags.indexOf(this.queryTags[query]), 1);
					this.querytagsToDisplay.splice(this.querytagsToDisplay.indexOf(queryToRemove), 1);
				}
				else if (queryToRemove.fieldName === controlCenterColumn[controlCenterColumn.RiskRating]) {
					this.riskRatingQueryTags(query, queryDataToRemove);
				}
				else {
					let data: any[] = [];
					data = this.queryTags[query].fieldValue.toString().split(',');
					data = data.filter(obj => obj !== queryDataToRemove);
					this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues = this.querytagsToDisplay[this.querytagsToDisplay.indexOf(queryToRemove)].fieldValues.filter(obj => obj !== queryDataToRemove);
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
			} else {
				//this.queryTags.splice(this.queryTags.indexOf(this.queryTags[query]), 1);
				//this.querytagsToDisplay.splice(this.querytagsToDisplay.indexOf(queryToRemove), 1);
			}
		}
		if (this.querytagsToDisplay.length > 0) {
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
			this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('GridClearCaseLoading'), showLoader: false, type: spinnerType.small };
		}
	}
	riskRatingQueryTags = (query, queryDataToRemove) => {
		for (let tags in this.querytagsToDisplay) {
			if (this.querytagsToDisplay[+tags].fieldName === 'RiskRating') {
				let queryData = this.querytagsToDisplay[+tags];
				for (let k in queryData.fieldColor) {
					if (queryData && queryData.fieldColor[k] === queryDataToRemove) {
						this.querytagsToDisplay[+tags].fieldColor.splice(+k, 1);
					}
				}
				if (this.querytagsToDisplay[+tags].fieldColor.length === 0) {
					this.querytagsToDisplay.splice(+tags, 1);
				}

			}
		}
		//let fieldData=this.queryTags[query];
		let fieldData = this.queryTags[query].fieldValue.toString().split(',');
		fieldData = fieldData.filter(obj => obj !== queryDataToRemove);
		if (fieldData.length === 0) {
			this.queryTags.splice(this.queryTags.indexOf(this.queryTags[query]), 1);
		}
		else {
			this.queryTags[query].fieldValue = fieldData.join(',');
		}
		//this.queryTags[query].fieldValue = fieldData.join(',');
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
		this.isGettingSettings = true;
		this.fetchCaseCountryData();
		this.getSettings();
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
		controlCenterColumn[controlCenterColumn.ShippingCompany], controlCenterColumn[controlCenterColumn.From], controlCenterColumn[controlCenterColumn.RiskRating]];
		this.querytagsToDisplay = [];
	}

	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
