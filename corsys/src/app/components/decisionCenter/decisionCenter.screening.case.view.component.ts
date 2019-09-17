import { Component, OnInit, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { metaDataSettings, responseStatus, caseStatus, messageResponseType, caseButtonTypes, messageType, assessmentTypes, assessmentResults, verdictSources, spinnerType, controlCenterColumn } from '../../models/enums';
import { ICaseService, ITranslateService, IMessageService, ICaseAnalysisService, IStorageService, IDateFormatService, ICommonService } from '../../interfaces/interfaces';
import { ICase, IScreeningCaseDecisionCenter, ICodeValue, ICustomMessageResponse, IResponse, IAnalysisDetails, IKeyValue, IDisplayQueryTags, ISearchGetResponseFormat } from '../../models/viewModels';
import { SelectItem } from 'primeng/primeng';
import { ModalQueryBuilderComponent } from '../modal/modal.queryBuilder.component';
import { SpAutocompleteComponent } from '../../controls/autocomplete.control';
import { GridControlComponent } from '../../controls/grid.control';
import { ModalCaseDetailComponent } from './decisionCenter.case.detail.component';
import { unionBy } from 'lodash/array';

@Component({
    selector: 'sp3-comp-decisioncentre-screening-caseview',
    templateUrl: './decisionCenter.screening.case.view.component.html'
})

export class DecisionCentreScreeningCaseViewComponent implements OnInit, OnDestroy {
    ports: any;
    buttonMarginLeft: number;
    @ViewChild('modal') modal: ModalCaseDetailComponent;
    @ViewChild('modalQueryBuilder') modalQueryBuilder: ModalQueryBuilderComponent;
    @ViewChild('autocomplete') autocomplete: SpAutocompleteComponent;
    @ViewChild('actionCenter') actionCenter: GridControlComponent;
    resultsStatus: ISearchGetResponseFormat[] = [];
    controlcenterActions: IScreeningCaseDecisionCenter[] = [];
    selectedCases: IScreeningCaseDecisionCenter[] = [];
    selectedList: string[] = [];
    totalActions: number = 0;
    actionPerPage: number = 50;
    startActionNumber: number = 1;
    showGrid: boolean = false;
    noSearchData: boolean = true;
    loadPagination: boolean = true;
    suggestions: any;
    endActionNumber: number;
    isLeftArrowDisabled: boolean = true;
    isRightArrowDisabled: boolean = false;
    pageNum: number = 1;
    filterCriteria: any[];
    sortCriteria: string[];
    flagClass: string;
    holdClass: string;
    defaultSort = {};
    countryList: ICodeValue[] = [];
    countryListMetadata: SelectItem[] = [];
    inspectionTypes: IKeyValue[] = [];
    isShow: boolean = false;
    caseButtonTypes: any;
    analysisPayload: IAnalysisDetails;
    queryTags: any[] = [];
    querytagsToDisplay: IDisplayQueryTags[] = [];
    caseIdsSearchList: string[] = [];
    shippingCompanySearchList: string[] = [];
    containerSerachList: string[] = [];
    fromSearchList: string[] = [];
    riskRatingList: string[] = [];
    getSearchData: (event: any) => void;
    riskRatingStatus: ISearchGetResponseFormat[] = [];
    formQueryTagsToDisplay: (query: any[]) => void;
    getCaseMetadata: () => void;
    openCase: (caseId: ICase) => void;
    toggleClick: (response: any) => void;
    onSelectFromGrid: (event: any) => void;
    processClickOperation: (actionType: number, event: any) => void;
    onScanCasePopUpClick: (event: ICustomMessageResponse<string>) => void;
    onInspectCasePopUpClick: (event: ICustomMessageResponse<string>) => void;
    onClearCasePopUpClick: (event: ICustomMessageResponse<string>) => void;
    callBackButtonWidth: (event: number) => void;
    setPage: () => void;

    ngUnsubscribe: Subject<any> = new Subject<any>();
    autocompleteFilterCriteria: string[];
    constructor( @Inject('ICaseService') private caseService: ICaseService,
        @Inject('ITranslateService') private translateService: ITranslateService,
        @Inject('ICaseAnalysisService') private caseAnalysisService: ICaseAnalysisService,
        @Inject('IMessageService') private messageService: IMessageService,
        @Inject('IStorageService') storageService: IStorageService,
        @Inject('IDateFormatService') private dateFormatService: IDateFormatService,
        @Inject('ICommonService') private commonService: ICommonService) {
        var vm = this;
        let dateFormat = storageService.getItem('generalFormat').dateFormat || 'MM-DD-YYYY';
        vm.filterCriteria = [
            caseStatus.AwaitingScreening
        ];
        vm.sortCriteria = ['-LastUpdatedDate'];
        vm.defaultSort = {};
        vm.caseButtonTypes = caseButtonTypes;
        vm.analysisPayload = {
            caseId: [],
            source: verdictSources.DecisionCentre,
            assessment: assessmentTypes.None,
            result: assessmentResults.NotFound,
            comment: '',
            status: 0
        };


        vm.callBackButtonWidth = (event: number) => {
            setTimeout(() => {
                this.buttonMarginLeft = event + 8;
            }, 1);
        };


        vm.openCase = (caseId: ICase) => {
            vm.modal.show(caseId.caseId, false, verdictSources.DecisionCentre);
        };

        vm.onSelectFromGrid = (event: IScreeningCaseDecisionCenter[]) => {
            vm.selectedCases = event;
            vm.selectedList = [];
            for (var i = 0; i < vm.selectedCases.length; i++) {
                vm.selectedList.push(vm.selectedCases[i].caseId);
            }
        };

        vm.processClickOperation = (actionType: number, event) => {
            switch (actionType) {
                case caseStatus.Cleared:
                    vm.analysisPayload.comment = event.result;
                    vm.analysisPayload.source = verdictSources.DecisionCentre;
                    vm.analysisPayload.caseId = vm.selectedList;
                    vm.analysisPayload.assessment = assessmentTypes.None;
                    vm.analysisPayload.result = assessmentResults.None;
                    vm.analysisPayload.status = caseStatus.Cleared;
                    break;
                case caseStatus.AwaitingInspection:
                    vm.analysisPayload.comment = event.result;
                    vm.analysisPayload.inspectionType = event.selResult;
                    vm.analysisPayload.source = verdictSources.DecisionCentre;
                    vm.analysisPayload.caseId = vm.selectedList;
                    vm.analysisPayload.assessment = assessmentTypes.None;
                    vm.analysisPayload.result = assessmentResults.None;
                    vm.analysisPayload.status = caseStatus.AwaitingInspection;

                    break;
                case caseStatus.AwaitingScan:
                    vm.analysisPayload.comment = event.result;
                    vm.analysisPayload.source = verdictSources.DecisionCentre;
                    vm.analysisPayload.caseId = vm.selectedList;
                    vm.analysisPayload.assessment = assessmentTypes.None;
                    vm.analysisPayload.result = assessmentResults.None;
                    vm.analysisPayload.status = caseStatus.AwaitingScan;

                    break;
            }
        };

        vm.onScanCasePopUpClick = (event: ICustomMessageResponse<string>) => {
            if (event.status === messageResponseType.Yes) {
                vm.processClickOperation(caseStatus.AwaitingScan, event);
                vm.caseAnalysisService.putCaseAnalysis(vm.analysisPayload).takeUntil(vm.ngUnsubscribe).subscribe((result) => {
                    let searchAll = this.queryTags.length === 1 && this.queryTags[0].fieldName === '' ? true : false;
                    this.setPage();
                    this.fetchActionData(searchAll);
                }, (error: IResponse<any>) => {
                    vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                });
            }
        };

        vm.onInspectCasePopUpClick = (event: ICustomMessageResponse<string>) => {
            if (event.status === messageResponseType.Yes) {
                vm.processClickOperation(caseStatus.AwaitingInspection, event);
                vm.caseAnalysisService.putCaseAnalysis(vm.analysisPayload).takeUntil(vm.ngUnsubscribe).subscribe((result) => {
                    let searchAll = this.queryTags.length === 1 && this.queryTags[0].fieldName === '' ? true : false;
                    this.setPage();
                    this.fetchActionData(searchAll);
                }, (error: IResponse<any>) => {
                    vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                });
            }
        };

        vm.onClearCasePopUpClick = (event: ICustomMessageResponse<string>) => {
            if (event.status === messageResponseType.Yes) {
                vm.processClickOperation(caseStatus.Cleared, event);
                vm.caseAnalysisService.putCaseAnalysis(vm.analysisPayload).takeUntil(vm.ngUnsubscribe).subscribe((result) => {
                    let searchAll = this.queryTags.length === 1 && this.queryTags[0].fieldName === '' ? true : false;
                    this.setPage();
                    this.fetchActionData(searchAll);
                }, (error: IResponse<any>) => {
                    vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                });
            }
        };

        // adding search
        this.getSearchData = (event: any) => {
            if (event != null) {
                let searchText: string = event.query.trim();
                this.caseService.getSearchdata(searchText, this.autocompleteFilterCriteria)
                    .takeUntil(this.ngUnsubscribe)
                    .subscribe(result => {
                        this.autocomplete.suggestions = result.data;
                        this.suggestions = result.data;
                    });
            }
            else {
                this.autocomplete.suggestions = [];
            }
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
                        let tempArrivalDate: string[] = [this.dateFormatService.formatDate(tempData[0], dateFormat) + ' - ' + this.dateFormatService.formatDate(tempData[1], dateFormat)];

                        // let tempArrivalDate: string[] = [tempData[0].toString() + ' - ' + tempData[1].toString()];
                        this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.DateOfArrival], fieldValues: tempArrivalDate, fieldColor: [] });
                        break;
                    case controlCenterColumn[controlCenterColumn.LastModified]:
                        tempData = query[value].fieldValue.split(',');
                        let tempupdatedDate: string[] = [this.dateFormatService.formatDate(tempData[0], dateFormat) + ' - ' + this.dateFormatService.formatDate(tempData[1], dateFormat)];
                        this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.LastModified], fieldValues: tempupdatedDate, fieldColor: [] });
                        break;
                    case controlCenterColumn[controlCenterColumn.OverAllRisk]:
                        tempData = query[value].fieldValue.split(',');
                        this.querytagsToDisplay.push({ fieldName: controlCenterColumn[controlCenterColumn.OverAllRisk], fieldValues: tempData, fieldColor: [] });
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

        this.setPage = () => {
            let lastRowsSelected = (this.pageNum > Math.floor(this.totalActions / this.actionPerPage)) && (this.totalActions % this.actionPerPage) === this.selectedCases.length;
            if (lastRowsSelected && this.pageNum > 1) {
                this.pageNum = this.pageNum - 1;
            }
        };
    }

    onAddingAdvancedSearchCriterias(additionalQueries: any[]): void {
        this.querytagsToDisplay = [];
        let dateOfArrival: number[] = [];
        let updatedDate: number[] = [];
        let lastModified: number[] = [];
        let tempData: any[] = [];
        // for (let rating in this.queryTags) {
        //     if (this.queryTags[rating].fieldName === 'RiskRating') {
        //         this.queryTags.splice(this.queryTags.indexOf(this.queryTags[rating]), 1);
        //     }
        // }
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
                if (this.queryTags[query].fieldValue.indexOf(',') !== -1) {
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
            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
        }
    }

    removeSearch = (queryToRemove: IDisplayQueryTags, queryDataToRemove: string) => {
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('GridClearCaseLoading'), showLoader: true, type: spinnerType.small };
        for (let query in this.queryTags) {
            if (this.queryTags[query].fieldName === queryToRemove.fieldName) {
                if (queryToRemove.fieldName === controlCenterColumn[controlCenterColumn.DateOfArrival] ||
                    queryToRemove.fieldName === controlCenterColumn[controlCenterColumn.UpdatedDate] || queryToRemove.fieldName === controlCenterColumn[controlCenterColumn.LastModified]) {
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
                    }
                    else {
                        this.queryTags.splice(this.queryTags.indexOf(this.queryTags[query]), 1);
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
                    }
                    else {
                        this.queryTags.splice(this.queryTags.indexOf(this.queryTags[query]), 1);
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

    /**
 * Helper Function
 * @param cases : ICase[]
 * Convert the numeric value of Case Action to string
 */
    caseActionConversion(cases, countryList: ICodeValue[]): IScreeningCaseDecisionCenter[] {
        return cases.map(param => {
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
            //param.overAllRiskKeyValue = { key: '', value: '' };
            //param.overAllRiskKeyValue.key = param.riskColor;
            //param.overAllRiskKeyValue.data = param.overAllRisk;
            param.overAllRiskKeyValue = param.riskColor + '-' + param.overAllRisk;


            return param;
        });
    }

    fetchCaseAnalysisMetaData(): void {
        this.inspectionTypes = [];
        this.caseAnalysisService.fetchCaseAnalysisMetaData().subscribe(metaDataResult => {
            if (metaDataResult.status === responseStatus.Success) {
                this.inspectionTypes.push({ id: -1, name: this.translateService.instant('SelectInspectionType') });
                for (let type in metaDataResult.data.PhysicalInspectionTypes) {
                    this.inspectionTypes.push({
                        id: metaDataResult.data.PhysicalInspectionTypes[type].id,
                        name: metaDataResult.data.PhysicalInspectionTypes[type].name
                    });
                }
            }
        });
    }

    fetchActionData(searchAll: boolean): void {
        this.selectedCases.length = 0;
        var autoCompPanelDiv = <HTMLInputElement>document.getElementsByClassName('ui-autocomplete-panel')[0];
        autoCompPanelDiv.style.display = 'none';
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: true, type: spinnerType.small };
        this.caseService.getSearchCases(this.pageNum, this.actionPerPage, this.filterCriteria, searchAll, this.sortCriteria, '^AND^Status^IN^(' + caseStatus.AwaitingScreening + ')').subscribe(result => {
            if (result.status === responseStatus.Success) {
                this.caseService.fetchCaseCreateMetaData(metaDataSettings.Cases).subscribe(obj => {
                    this.isShow = true;
                    this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
                    this.controlcenterActions = this.caseActionConversion(result.data.cases, obj.data.Country);
                    this.showGrid = this.controlcenterActions.length > 0 ? true : false;
                    this.noSearchData = !this.showGrid;
                });
            } else {
                this.noSearchData = true;
                this.showGrid = false;
                this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
            }
        }, (error) => {
            this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
        });
        if (this.loadPagination) {
            this.totalActions = 0;
            this.caseService.getSearchCasesCount(this.filterCriteria, searchAll, '^AND^Status^IN^(' + caseStatus.AwaitingScreening + ')').subscribe(result => {
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
    }

    loadCasesLazy = (pageNum: number, onRefresh?: boolean) => {
        this.pageNum = pageNum;
        this.loadPagination = false;
        if (onRefresh === true) {
            this.loadPagination = true;
            this.sortCriteria = ['-LastUpdatedDate'];
        }
        let searchAll = this.queryTags.length === 1 && this.queryTags[0].fieldName === '' ? true : false;
        this.fetchActionData(searchAll);
    }

    onSorting = (event: any) => {
        if (event && event.sortField && event.sortOrder) {
            this.sortCriteria = [(event.sortOrder > 0 ? '+' : '-') + this.commonService.sortTypes[event.sortField]];
            let searchAll = this.queryTags.length === 1 && this.queryTags[0].fieldName === '' ? true : false;
            this.fetchActionData(searchAll);
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
        let fieldData = this.queryTags[query];


        fieldData = this.queryTags[query].fieldValue.toString().split(',');
        fieldData = fieldData.filter(obj => obj !== queryDataToRemove);
        if (fieldData.length === 0) {
            this.queryTags.splice(this.queryTags.indexOf(this.queryTags[query]), 1);
        }
        else {
            this.queryTags[query].fieldValue = fieldData.join(',');
        }
    }
    openQueryBuilder = () => {
        this.modalQueryBuilder.show();
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
            setTimeout(() => this.autocomplete.selectedSearch = null);
        }
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
        this.fetchCaseAnalysisMetaData();
        this.getCaseMetadata();
        this.filterCriteria = [];
        this.queryTags = [];
        this.querytagsToDisplay = [];
        this.showGrid = false;
        this.noSearchData = false;
        this.autocompleteFilterCriteria = [controlCenterColumn[controlCenterColumn.CaseId], controlCenterColumn[controlCenterColumn.ContainerId],
        controlCenterColumn[controlCenterColumn.ShippingCompany], controlCenterColumn[controlCenterColumn.From], controlCenterColumn[controlCenterColumn.RiskRating]];
    }

    ngOnDestroy(): void {
        this.sortCriteria = ['-LastUpdatedDate'];
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
