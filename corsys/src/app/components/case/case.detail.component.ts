import { Component, ViewChild, OnInit, OnDestroy, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { ITranslateService, IMessageService, ICaseService, ICaseAnalysisService, IBroadcastService, IAttachmentService, IProfilerSettingService, IDateFormatService, IAnalyzerService } from '../../interfaces/interfaces';
import { IResponse, IKeyValue, ICaseCreateDetails, IContainer, IAttachment, IAnalysisDetails, ICaseRequestFormat, ICustomMessageResponse, IRiskCategoryInformation, IProfilerCategory, IInspectionEvidenceDetails, IInspectionVerdictDetails, InspectMetaData } from '../../models/viewModels';
import {
    responseStatus, messageType, metaDataSettings, caseButtonTypes, caseStatus, messageResponseType, broadcastKeys, casePageStatus,
    reasonType, applicationName, verdictSources, assessmentTypes, assessmentResults, spinnerType, categoryType, findingStatus, VerdictTypes
} from '../../models/enums';
import { ModalConfirmComponent } from '../modal/modal.confirm.component';
import { Router } from '@angular/router';
// import { spinnerType, categoryType, findingStatus, VerdictTypes } from '../../models/enums';
import { ENV_APP_MAP } from '../../config/appMap/appMap';

@Component({
    selector: 'sp3-comp-case-detail',
    templateUrl: './case.detail.component.html'
})

export class CaseDetailComponent implements OnInit, OnDestroy {
    @Input() public caseId: string;
    @Input() public viewMode: number;
    @Input() public appName: applicationName;
    @Input() public isFooterVisible: boolean = true;
    @Input() public isFromIATimeline: boolean = false;
    @Input() public source?: verdictSources;
    @Output() cardDisplayUpdate;
    @Output() onCloseClick: any = new EventEmitter();
    categoryType: any;
    findingStatus: any;
    VerdictTypes: any;
    @ViewChild('modalClose') modalClose: ModalConfirmComponent;
    assessmentType: any={};
    caseDate: Object|string;
    verdictComment: string = '';
    nationalityClass = '';
    isDisabled: boolean = true;
    generatedCaseId: string[] = ['-'];
    caseStatus: string = '-';
    IsCreationSuccess: boolean = false;
    containerIdValue: string = '';
    overAllWeightValue: string = '';
    saveInProgress: boolean = false;
    IsDraftCreationSuccess: boolean = false;
    pageStatus: casePageStatus = casePageStatus.IsCreateCaseOpened;
    checkType: any = casePageStatus;
    isExistingCaseSaveChanges: boolean = false;
    existingCaseStatus: caseStatus;
    selectedCaseIds: string[] = [];
    selectedAttachmentIds: string[] = [];
    inspectionVerdict: IInspectionVerdictDetails[];
    isAssessmentImagesPanelVisible: boolean = false;
    isAssessmentImagesPanelVisible1: boolean = false;
    isImageAssessmentVerdictPanelVisible: boolean = false;
    isInspectionEvidencePanelVisible: boolean = false;
    isInspectionVerdictPanelVisible: boolean = false;
    isNotesPanelVisible: boolean = false;
    isFlagVisible: boolean = false;
    isHoldVisible: boolean = false;
    isPriority: boolean = false;
    isHold: boolean = false;
    isScanEnabled: boolean = false;
    isCancelEnabled: boolean = false;
    isInspectEnabled: boolean = false;
    isSuspectEnabled: boolean = false;
    isReScanEnabled: boolean = false;
    isClearEnabled: boolean = false;
    isImageAnalyserEnabled: boolean = false;
    flagModified: boolean = false;
    isDetailsVisible: boolean = true;
    countryData: any;
    sourcePortList: IKeyValue[] = [];
    destinationPortList: IKeyValue[] = [];
    inspectedCaseDetails: any = {
        assessmentImages: [],
        findings: [],
        rulers: [],
        inspectionVerdict: []
    };
    caseCreateDetails: ICaseCreateDetails = {
        caseId: null,
        cargoType: 0,
        senderName: '',
        senderAddress: '',
        from: '',
        to: '',
        originPortCode: '',
        destinationPortCode: '',
        dateOfArrival: '',
        overallWeight: 0,
        notes: '',
        shipping: {
            shipId: '',
            shippingCompany: '',
            contactDetails: '',
            nationality: ''
        },
        vehicle: {
            licensePlateNumber: '',
            make: '',
            driverName: '',
            company: '',
            model: '',
            driverLicenseNumber: ''
        },
        containers: [{
            containerId: '',
            harmonisedSystemCodes: []
        }],
        lastUpdateDate: '',
        lastUpdatedBy: '',
        status: 0,
        locationcode: ''
    };
    containersList: IContainer[] = [];
    public visible = false;
    private visibleAnimate = false;
    isDirty: boolean;
    id: string = 'caseCreate';
    caseFromCountryCodeList: IKeyValue[] = [];
    caseToCountryCodeList: IKeyValue[] = [];
    caseFromCountryNameList: IKeyValue[] = [];
    caseToCountryNameList: IKeyValue[] = [];
    cargoTypesList: IKeyValue[] = [];
    nationalityNameList: IKeyValue[] = [];
    nationalityCodeList: IKeyValue[] = [];
    selectedOriginalPort: string = '';
    selectedDestinationPort: string = '';
    column0Expanded: boolean = false;
    column1Expanded: boolean = false;
    column2Expanded: boolean = false;
    column3Expanded: boolean = false;
    column4Expanded: boolean = false;
    column5Expanded: boolean = false;
    column6Expanded: boolean = false;
    column7Expanded: boolean = false;
    column8Expanded: boolean = false;
    column9Expanded: boolean = false;
    column10Expanded: boolean = false;
    column11Expanded: boolean = false;
    isExpandAllDisabled: boolean = false;
    isCollapseAllDisabled: boolean = false;
    //Ngmodels for controls
    hsCodeValue: string = '';
    selectedFromCountry: string = '';
    selectedToCountry: string = '';
    selectedNationality: IKeyValue;
    caseStatusList: IKeyValue[] = [];
    caseButtonTypes: any;
    reasonType: IKeyValue[] = [];
    pageTitle: string;
    oldAttachments: IAttachment[];
    attachments: IAttachment[] = [];
    selectedAttachments: IAttachment[] = [];
    flagClass: string = 'btn btn-default btn-primary flag-grey';
    holdClass: string = 'btn btn-default btn-primary hold-grey';
    expandAllClasss: string = 'btn btn-link';
    collapseAllClass: string = 'btn btn-link';
    checkVerdictSources: any;
    analysisPayload: IAnalysisDetails;
    inspectionTypes: IKeyValue[] = [];
    overAllRiskRating: number;
    caseStatusInfo: any;
    riskColor: number;
    riskCategories: IRiskCategoryInformation[];
    profilerCategories: IProfilerCategory[] = [];
    findings: IInspectionEvidenceDetails[];
    hasViews: boolean = false;
    inspectMetaData: InspectMetaData = {
        CategoryTypes: [], PhysicalInspectionTypes: []
    };
    ngUnsubscribe: Subject<any> = new Subject<any>();
    // duplicateActivity: ($event: messageType) => void;
    constructor( @Inject('IMessageService') private messageService: IMessageService, @Inject('IBroadcastService') private broadcastService: IBroadcastService,
        @Inject('ITranslateService') private translateService: ITranslateService,
        @Inject('IAttachmentService') private attachmentService: IAttachmentService,
        @Inject('ICaseAnalysisService') private caseAnalysisService: ICaseAnalysisService,
        @Inject('IProfilerSettingService') private profilerSettingService: IProfilerSettingService,
        @Inject('ICaseService') private caseService: ICaseService,
        @Inject('IDateFormatService') private dateFormatService: IDateFormatService,
        @Inject('IAnalyzerService') private analyzerService: IAnalyzerService,
        private router: Router) {
        this.caseButtonTypes = caseButtonTypes;
        this.checkVerdictSources = verdictSources;
        this.findingStatus = findingStatus;
        this.VerdictTypes = VerdictTypes;
        this.categoryType = categoryType;
        this.caseStatusInfo = caseStatus;
        this.analysisPayload = {
            caseId: [],
            source: verdictSources.DecisionCentre,
            assessment: assessmentTypes.None,
            result: assessmentResults.NotFound,
            comment: '',
            status: 0
        };
    }

    duplicateActivity = (event: messageType) => {
        // triggered on duplicate activity
    }

    redirectToImageAnalyzer = (event?: any) => {
        if (applicationName.ImageAnalyser !== this.appName) {
            this.router.navigate([ENV_APP_MAP.analyzer, { case: this.generatedCaseId[0], file: event.fileName }]);
        }
    }

    onRowStyleLoad = (rowData: any) => {
        let styleClass = '';
        if (rowData['breachValue'] && rowData['breachValue'] === 'Y') {
            styleClass = styleClass + ' threshold';
        }

        return styleClass;
    }

    processClickOperation = (actionType: number, event) => {
        this.analysisPayload.comment = event.result;
        this.analysisPayload.source = verdictSources.DecisionCentre;
        this.analysisPayload.caseId = this.generatedCaseId;
        switch (actionType) {
            case caseStatus.Cleared:
                this.analysisPayload.assessment = assessmentTypes.None;
                this.analysisPayload.result = assessmentResults.None;
                this.analysisPayload.status = caseStatus.Cleared;
                break;
            case caseStatus.AwaitingInspection:
                this.analysisPayload.inspectionType = event.selResult;
                this.analysisPayload.assessment = assessmentTypes.Physical;
                this.analysisPayload.result = assessmentResults.Inconclusive;
                this.analysisPayload.status = caseStatus.AwaitingInspection;

                break;
            case caseStatus.AwaitingScan:
                this.analysisPayload.assessment = assessmentTypes.Image;
                this.analysisPayload.result = assessmentResults.Inconclusive;
                this.analysisPayload.status = caseStatus.AwaitingScan;

                break;
            case caseStatus.Suspect:
                this.analysisPayload.assessment = assessmentTypes.Image;
                this.analysisPayload.result = assessmentResults.Found;
                this.analysisPayload.status = caseStatus.Suspect;


        }
    }

    onScanCasePopUpClick = (event: ICustomMessageResponse<string>) => {
        if (event.status === messageResponseType.Yes) {
            this.processClickOperation(caseStatus.AwaitingScan, event);
            this.saveAnalysisPayLoad();
        }
        else if (event.status === messageResponseType.No) {
            this.onCloseClick.emit(this.flagModified);
        }
    }

    onInspectCasePopUpClick = (event: ICustomMessageResponse<string>) => {
        if (event.status === messageResponseType.Yes) {
            this.processClickOperation(caseStatus.AwaitingInspection, event);
            this.saveAnalysisPayLoad();
        }
        else if (event.status === messageResponseType.No) {
            this.onCloseClick.emit(this.flagModified);
        }
    }

    onSuspectCasePopUpClick = (event: ICustomMessageResponse<string>) => {
        if (event.status === messageResponseType.Yes) {
            this.processClickOperation(caseStatus.Suspect, event);
            this.saveAnalysisPayLoad();
        }
        else if (event.status === messageResponseType.No) {
            this.onCloseClick.emit(this.flagModified);
        }
    }

    onClearCasePopUpClick = (event: ICustomMessageResponse<string>) => {
        if (event.status === messageResponseType.Yes) {
            this.processClickOperation(caseStatus.Cleared, event);
            this.saveAnalysisPayLoad();
        }
        else if (event.status === messageResponseType.No) {
            this.onCloseClick.emit(this.flagModified);
        }
    }

    saveAnalysisPayLoad = () => {
        this.caseAnalysisService.putCaseAnalysis(this.analysisPayload).takeUntil(this.ngUnsubscribe).subscribe((result) => {
            this.onCloseClick.emit(this.flagModified);
        }, (error: IResponse<any>) => {
            this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
        });
    }

    downloadAttachment = (event: IAttachment) => {
        if (!event.id || event.id === '0') {
            this.attachmentService.downloadLocalFile(event);
        }
        else {
            this.attachmentService.getAttachmentByAttachmentId(event.id, event.downloadPath, event.fileType);
        }
    }
    downloadInspectionEvidence = (event: IAttachment) => {
        if (!event.id || event.id === '0') {
            this.attachmentService.downloadLocalFile(event);
        }
        else {
            this.attachmentService.getAttachmentByAttachmentId(event.fileName, event.downloadPath, event.fileType);
        }
    }

    setDefaultColumnSettings(): void {
        this.column0Expanded = false;
        this.column1Expanded = false;
        this.column2Expanded = false;
        this.column3Expanded = false;
        this.column4Expanded = false;
        this.column5Expanded = false;
        this.column6Expanded = false;
        this.column7Expanded = false;
        this.column8Expanded = false;
        this.column9Expanded = false;
        this.column10Expanded = false;
        this.column11Expanded = false;
        this.setExpandCollapseButtonStatus();
    }

    onTableHeaderCheckboxToggle(event: any): void {
        if (event.checked === true) {
            for (let m of this.attachments) {
                if (this.selectedAttachments.find(obj => obj.title === m.title) === undefined) {
                    this.selectedAttachments.push(m);
                }
            }
        }
        else {
            this.selectedAttachments.length = 0;
        }
    }

    refreshAttachmentGrid(attachmentList: IAttachment[]): void {
        this.attachments = [];
        setTimeout(() => {
            this.attachments = attachmentList;

            let newAttachments = this.attachments.slice();
            this.oldAttachments = JSON.parse(JSON.stringify(this.attachments));
            for (var i = 0; i < newAttachments.length; i++) {
                this.oldAttachments[i].rawFile = newAttachments[i].rawFile;
            }

        }, 1);
    }

    expandAll(): void {
        this.column0Expanded = this.column1Expanded = this.column2Expanded = this.column3Expanded = this.column4Expanded = this.column5Expanded = this.column6Expanded = this.column7Expanded = this.column8Expanded = this.column9Expanded = this.column10Expanded = this.column11Expanded = true;
        this.isExpandAllDisabled = true;
        this.isCollapseAllDisabled = false;
        this.setExpandCollapseClass();
    }

    collapseAll(): void {
        this.column0Expanded = this.column1Expanded = this.column2Expanded = this.column3Expanded = this.column4Expanded = this.column5Expanded = this.column6Expanded = this.column7Expanded = this.column8Expanded = this.column9Expanded = this.column10Expanded = this.column11Expanded = false;
        this.isCollapseAllDisabled = true;
        this.isExpandAllDisabled = false;
        this.setExpandCollapseClass();
    }

    columnExpandCollapse(tabNumber: number): void {
        switch (tabNumber) {
            case 0:
                this.column0Expanded = !this.column0Expanded;
                break;
            case 1:
                this.column1Expanded = !this.column1Expanded;
                break;
            case 2:
                this.column2Expanded = !this.column2Expanded;
                break;
            case 3:
                this.column3Expanded = !this.column3Expanded;
                break;
            case 4:
                this.column4Expanded = !this.column4Expanded;
                break;
            case 5:
                this.column5Expanded = !this.column5Expanded;
                break;
            case 6:
                this.column6Expanded = !this.column6Expanded;
                break;
            case 7:
                this.column7Expanded = !this.column7Expanded;
                break;
            case 8:
                this.column8Expanded = !this.column8Expanded;
                break;
            case 9:
                this.column9Expanded = !this.column9Expanded;
                break;
            case 10:
                this.column10Expanded = !this.column10Expanded;
                break;
            case 11:
                this.column11Expanded = !this.column11Expanded;
                break;
        }
        this.setExpandCollapseButtonStatus();
    }

    setExpandCollapseButtonStatus(): void {
        this.isExpandAllDisabled = false;
        this.isCollapseAllDisabled = false;
        if (this.column0Expanded && this.column1Expanded && this.column2Expanded && this.column3Expanded && this.column4Expanded &&
            this.column5Expanded && this.column6Expanded && this.column7Expanded && this.column8Expanded &&
            this.column9Expanded && this.column10Expanded && this.column11Expanded) {
            this.isExpandAllDisabled = true;
            this.isCollapseAllDisabled = false;
        }
        else if (!this.column1Expanded && !this.column2Expanded && !this.column3Expanded && !this.column4Expanded &&
            !this.column5Expanded && !this.column6Expanded && !this.getPanelExpanded()) {
            this.isCollapseAllDisabled = true;
            this.isExpandAllDisabled = false;
        }

        this.setExpandCollapseClass();
    }

    getPanelExpanded = () => {
        if (this.source === this.checkVerdictSources.DecisionCentre && this.column0Expanded) {
            return true;
        }
        if (this.isAssessmentImagesPanelVisible && this.column7Expanded) {
            return true;
        }
        if (this.isImageAssessmentVerdictPanelVisible && this.column8Expanded) {
            return true;
        }
        if (this.isInspectionEvidencePanelVisible && this.column9Expanded) {
            return true;
        }
        if (this.isInspectionVerdictPanelVisible && this.column10Expanded) {
            return true;
        }
        if (this.isNotesPanelVisible && this.column11Expanded) {
            return true;
        }
        return false;
    }

    setExpandCollapseClass(): void {
        switch (this.isExpandAllDisabled) {
            case true:
                this.expandAllClasss = 'btn btn-link ';
                break;
            default:
                this.expandAllClasss = 'btn btn-link active';
                break;
        }

        switch (this.isCollapseAllDisabled) {
            case true:
                this.collapseAllClass = 'btn btn-link ';
                break;
            default:
                this.collapseAllClass = 'btn btn-link active';
                break;
        }
    }

    reset(): void {

        this.caseStatus = '-';
        this.overAllWeightValue = '';
        // this.caseDate = null;
        this.flagModified = false;
        this.caseCreateDetails = {
            caseId: null,
            cargoType: 0,
            senderName: '',
            senderAddress: '',
            from: '',
            to: '',
            originPortCode: '',
            destinationPortCode: '',
            dateOfArrival: '',
            overallWeight: 0,
            notes: '',
            shipping: {
                shipId: '',
                shippingCompany: '',
                contactDetails: '',
                nationality: ''
            },
            vehicle: {
                licensePlateNumber: '',
                make: '',
                driverName: '',
                company: '',
                model: '',
                driverLicenseNumber: ''
            },
            containers: [{
                containerId: '',
                harmonisedSystemCodes: []
            }],
            lastUpdateDate: '',
            lastUpdatedBy: '',
            status: 0,
            locationcode: ''
        };
        this.selectedNationality = this.nationalityNameList[0];
        this.setDefaultColumnSettings();
        this.isDisabled = true;
        this.IsCreationSuccess = false;
        this.IsDraftCreationSuccess = false;
        this.pageStatus = casePageStatus.IsCreateCaseOpened;
        this.pageTitle = this.translateService.instant('CaseDetails');
        this.isExistingCaseSaveChanges = false;
        this.isDirty = false;
        this.generatedCaseId = ['-'];
        this.hsCodeValue = '';
        this.containerIdValue = '';
        this.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
        this.attachments = [];
        this.oldAttachments = [];
        this.selectedAttachments = [];
        this.isAssessmentImagesPanelVisible = false;
        this.isNotesPanelVisible = false;
        this.isImageAssessmentVerdictPanelVisible = false;
        this.isInspectionEvidencePanelVisible = false;
        this.isInspectionVerdictPanelVisible = false;
        this.isFlagVisible = false;
        this.isHoldVisible = false;
        this.flagClass = 'btn btn-default btn-primary flag-grey';
        this.holdClass = 'btn btn-default btn-primary hold-grey';
        if (this.appName === applicationName.Inspection || this.isFromIATimeline) {
            this.isDetailsVisible = false;
        }
        else {
            this.isDetailsVisible = true;
        }
    }
    backtolist(): void {
        this.reset();
        this.isDirty = false;
        this.onCloseClick.emit(this.flagModified);
        //this.hide();
    }
    getAnalyzerCaseDetails(): void {
        this.analyzerService.getAnalyzerCaseDetails(this.caseId).subscribe((requestResult) => {
            if (requestResult.status === responseStatus.Success) {
                this.hasViews = true;
            } else {
                this.hasViews = false;
            }
        });
    }
    getCountryData(original, destination): void {
        this.caseService.fetchCaseCountryData().subscribe(result => {
            if (result.status === responseStatus.Success) {
                for (let country in result.data) {
                    if (result.data[country].code === this.selectedFromCountry) {
                        this.selectedFromCountry = result.data[country].name;
                        result.data[country].ports.forEach(item => {
                            if (original && item.portCode === original) {
                                this.selectedOriginalPort = item.portName;
                            }
                        });
                    }
                    if (result.data[country].code === this.selectedToCountry) {
                        this.selectedToCountry = result.data[country].name;
                        result.data[country].ports.forEach(item => {
                            if (destination && item.portCode === destination) {
                                this.selectedDestinationPort = item.portName;
                            }
                        });
                    }
                }
            }
        });
    }
    viewSavedViews(): void {
        this.router.navigate(['IA', { case: this.caseId }]);
    }
    getCaseMetadata(): void {

        this.isDisabled = true;
        this.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: true, type: spinnerType.small };
        this.caseService.fetchMetadata().subscribe(result => {
            if (result.status === responseStatus.Success) {
                this.caseStatusList = result.data.CargoStatus;
                this.reasonType = result.data.ReasonType;
                this.reasonType.unshift({ id: 0, name: '' }); //added this type as it is required in select control
                this.reasonType.pop();  //removed last element of array.
            }
        });

        this.profilerSettingService.getProfilerSetting().
            takeUntil(this.ngUnsubscribe).
            subscribe((result: IResponse<IProfilerCategory[]>) => {
                this.profilerCategories = result.data;
            });

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

        this.getAnalyzerCaseDetails();
        this.caseService.fetchCaseCreateMetaData(metaDataSettings.Cases).subscribe(result => {
            if (result.status === responseStatus.Success) {
                this.reset();
                this.IsCreationSuccess = false;
                this.IsDraftCreationSuccess = false;
                this.cargoTypesList = result.data.CargoType;
                let nationalityIndex = 0;
                this.nationalityNameList.push({ id: 0, name: '' });
                this.nationalityCodeList.push({ id: 0, name: '' });
                for (let nationality in result.data.Country) {
                    nationalityIndex++;
                    let nationalityName: IKeyValue = {
                        id: nationalityIndex,
                        name: result.data.Country[nationality].name.trim()
                    };
                    let nationalityCode: IKeyValue = {
                        id: nationalityIndex,
                        name: result.data.Country[nationality].code.trim()
                    };

                    this.nationalityNameList.push(nationalityName);
                    this.nationalityCodeList.push(nationalityCode);
                }
                if (this.nationalityNameList.length > 0) {
                    this.selectedNationality = this.nationalityNameList[0];
                }
                this.getCaseDetails(this.caseId);
            }
            else {
                this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
                this.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
            }
        },
            (error: IResponse<any>) => {
                this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
                this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
            }
        );
    }
    toggleClick(response: any): void {
        if (response.status === messageResponseType.No || response.status === messageResponseType.Yes) {
            //this.hide();
            this.onCloseClick.emit(this.flagModified);
        }
    }

    closeClick(): void {
        this.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
        if (this.isDirty) {
            this.modalClose.show();
        }
        else {
            this.reset();
            this.IsCreationSuccess = false;
            this.IsDraftCreationSuccess = false;
            this.isDirty = false;
            this.onCloseClick.emit(this.flagModified);
        }
    }

    closeModal(): void {
        this.modalClose.hide();
    }
    leaveClick(): void {
        this.messageService.Message = { message: '', showMessage: false, type: messageType.Success };

        this.modalClose.hide();
        this.reset();
        this.onCloseClick.emit(this.flagModified);
        //this.hide();
    }
    backClick(): void {
        this.messageService.Message = { message: '', showMessage: false, type: messageType.Success };
        this.modalClose.hide();
    }
    show(caseId: string): void {
        this.visible = true;
        this.reset();
        setTimeout(() => this.visibleAnimate = true);
        this.getCaseDetails(caseId);
    }
    hide(): void {
        this.reset();
        this.visibleAnimate = false;
        if (this.flagModified === true) {
            this.flagModified = true;
            this.broadcastService.broadcast(broadcastKeys[broadcastKeys.refreshCaseList], null);
        }
        setTimeout(() => this.visible = false, 1);
    }
    setPanelsVisibility(status: number, appName: applicationName): void {
        switch (status) {
            case caseStatus.Cleared:
                this.isAssessmentImagesPanelVisible = true;
                this.isImageAssessmentVerdictPanelVisible = true;
                this.isInspectionEvidencePanelVisible = true;
                this.isInspectionVerdictPanelVisible = true;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = false;
                this.isHoldVisible = false;
                this.isScanEnabled = false;
                this.isCancelEnabled = false;
                this.isInspectEnabled = false;
                this.isSuspectEnabled = false;
                this.isReScanEnabled = false;
                this.isClearEnabled = false;
                this.isImageAnalyserEnabled = false;
                break;
            case caseStatus.Draft:
                this.isAssessmentImagesPanelVisible = false;
                this.isImageAssessmentVerdictPanelVisible = false;
                this.isInspectionEvidencePanelVisible = false;
                this.isInspectionVerdictPanelVisible = false;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = false;
                this.isHoldVisible = false;
                this.isScanEnabled = false;
                this.isCancelEnabled = false;
                this.isInspectEnabled = false;
                this.isSuspectEnabled = false;
                this.isReScanEnabled = false;
                this.isClearEnabled = false;
                this.isImageAnalyserEnabled = false;
                break;
            case caseStatus.AwaitingScreening:
                this.isAssessmentImagesPanelVisible = false;
                this.isImageAssessmentVerdictPanelVisible = false;
                this.isInspectionEvidencePanelVisible = false;
                this.isInspectionVerdictPanelVisible = false;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = false;
                this.isHoldVisible = false;
                this.isScanEnabled = true;
                this.isCancelEnabled = false;
                this.isInspectEnabled = false;
                this.isSuspectEnabled = false;
                this.isReScanEnabled = false;
                this.isClearEnabled = true;
                this.isImageAnalyserEnabled = false;
                break;
            case caseStatus.AwaitingScan:
                this.isAssessmentImagesPanelVisible = false;
                this.isImageAssessmentVerdictPanelVisible = false;
                this.isInspectionEvidencePanelVisible = false;
                this.isInspectionVerdictPanelVisible = false;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = false;
                this.isHoldVisible = false;
                this.isScanEnabled = false;
                // this.isCancelEnabled = true;
                this.isInspectEnabled = true;
                this.isSuspectEnabled = false;
                this.isReScanEnabled = false;
                this.isClearEnabled = true;
                this.isImageAnalyserEnabled = false;
                break;
            case caseStatus.Cancelled:
                this.isAssessmentImagesPanelVisible = false;
                this.isImageAssessmentVerdictPanelVisible = false;
                this.isInspectionEvidencePanelVisible = false;
                this.isInspectionVerdictPanelVisible = false;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = false;
                this.isHoldVisible = false;
                this.isScanEnabled = false;
                this.isCancelEnabled = false;
                this.isInspectEnabled = false;
                this.isSuspectEnabled = false;
                this.isReScanEnabled = false;
                this.isClearEnabled = false;
                this.isImageAnalyserEnabled = false;
                break;
            case caseStatus.Deleted:
                this.isAssessmentImagesPanelVisible = false;
                this.isImageAssessmentVerdictPanelVisible = false;
                this.isInspectionEvidencePanelVisible = false;
                this.isInspectionVerdictPanelVisible = false;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = false;
                this.isHoldVisible = false;
                this.isScanEnabled = false;
                this.isCancelEnabled = false;
                this.isInspectEnabled = false;
                this.isSuspectEnabled = false;
                this.isReScanEnabled = false;
                this.isClearEnabled = false;
                this.isImageAnalyserEnabled = false;
                break;
            case caseStatus.AwaitingAssessment:
                this.isAssessmentImagesPanelVisible = true;
                this.isImageAssessmentVerdictPanelVisible = false;
                this.isInspectionEvidencePanelVisible = false;
                this.isInspectionVerdictPanelVisible = false;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = true;
                this.isHoldVisible = true;
                this.isScanEnabled = false;
                this.isCancelEnabled = false;
                this.isInspectEnabled = true;
                this.isSuspectEnabled = false;
                this.isReScanEnabled = false;
                this.isClearEnabled = true;
                this.isImageAnalyserEnabled = true;
                break;
            case caseStatus.AssessmentInProgress:
                this.isAssessmentImagesPanelVisible = true;
                this.isImageAssessmentVerdictPanelVisible = false;
                this.isInspectionEvidencePanelVisible = false;
                this.isInspectionVerdictPanelVisible = false;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = false;
                this.isHoldVisible = false;
                this.isScanEnabled = false;
                this.isCancelEnabled = false;
                this.isInspectEnabled = false;
                this.isSuspectEnabled = false;
                this.isReScanEnabled = false;
                this.isClearEnabled = false;
                this.isImageAnalyserEnabled = false;
                break;
            case caseStatus.AwaitingReAssessment:
                this.isAssessmentImagesPanelVisible = true;
                this.isImageAssessmentVerdictPanelVisible = true;
                this.isInspectionEvidencePanelVisible = false;
                this.isInspectionVerdictPanelVisible = false;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = false;
                this.isHoldVisible = false;
                this.isScanEnabled = false;
                this.isCancelEnabled = false;
                this.isInspectEnabled = true;
                this.isSuspectEnabled = true;
                this.isReScanEnabled = true;
                this.isClearEnabled = true;
                this.isImageAnalyserEnabled = true;
                break;
            case caseStatus.ReScanRequested:
                this.isAssessmentImagesPanelVisible = false;
                this.isImageAssessmentVerdictPanelVisible = false;
                this.isInspectionEvidencePanelVisible = false;
                this.isInspectionVerdictPanelVisible = false;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = false;
                this.isHoldVisible = false;
                this.isScanEnabled = false;
                this.isCancelEnabled = false;
                this.isInspectEnabled = true;
                this.isSuspectEnabled = true;
                this.isReScanEnabled = true;
                this.isClearEnabled = true;
                this.isImageAnalyserEnabled = true;
                break;
            case caseStatus.Emergency:
                this.isAssessmentImagesPanelVisible = true;
                this.isImageAssessmentVerdictPanelVisible = true;
                this.isInspectionEvidencePanelVisible = false;
                this.isInspectionVerdictPanelVisible = false;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = false;
                this.isHoldVisible = false;
                this.isScanEnabled = false;
                this.isCancelEnabled = false;
                this.isInspectEnabled = true;
                this.isSuspectEnabled = true;
                this.isReScanEnabled = true;
                this.isClearEnabled = true;
                this.isImageAnalyserEnabled = true;
                break;
            case caseStatus.InspectionRequested:
                this.isAssessmentImagesPanelVisible = true;
                this.isImageAssessmentVerdictPanelVisible = true;
                this.isInspectionEvidencePanelVisible = true;
                this.isInspectionVerdictPanelVisible = false;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = false;
                this.isHoldVisible = false;
                this.isScanEnabled = false;
                this.isCancelEnabled = false;
                this.isInspectEnabled = true;
                this.isSuspectEnabled = true;
                this.isReScanEnabled = true;
                this.isClearEnabled = true;
                this.isImageAnalyserEnabled = true;
                break;
            case caseStatus.AwaitingInspection:
                this.isAssessmentImagesPanelVisible = true;
                this.isImageAssessmentVerdictPanelVisible = true;
                this.isInspectionEvidencePanelVisible = true;
                this.isInspectionVerdictPanelVisible = false;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = true;
                this.isHoldVisible = true;
                this.isScanEnabled = false;
                this.isCancelEnabled = false;
                this.isInspectEnabled = false;
                this.isSuspectEnabled = true;
                this.isReScanEnabled = true;
                this.isClearEnabled = true;
                this.isImageAnalyserEnabled = true;
                break;
            case caseStatus.InspectionInProgress:
                this.isAssessmentImagesPanelVisible = true;
                this.isImageAssessmentVerdictPanelVisible = true;
                this.isInspectionEvidencePanelVisible = true;
                this.isInspectionVerdictPanelVisible = false;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = false;
                this.isHoldVisible = false;
                this.isScanEnabled = false;
                this.isCancelEnabled = false;
                this.isInspectEnabled = false;
                this.isSuspectEnabled = false;
                this.isReScanEnabled = false;
                this.isClearEnabled = false;
                this.isImageAnalyserEnabled = false;
                break;
            case caseStatus.Suspect:
                this.isAssessmentImagesPanelVisible = true;
                this.isImageAssessmentVerdictPanelVisible = true;
                this.isInspectionEvidencePanelVisible = true;
                this.isInspectionVerdictPanelVisible = true;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = false;
                this.isHoldVisible = false;
                this.isScanEnabled = false;
                this.isCancelEnabled = false;
                this.isInspectEnabled = false;
                this.isSuspectEnabled = false;
                this.isReScanEnabled = false;
                this.isClearEnabled = true;
                this.isImageAnalyserEnabled = true;
                break;
            case caseStatus.AssessmentCleared:
                this.isAssessmentImagesPanelVisible = true;
                this.isImageAssessmentVerdictPanelVisible = true;
                this.isInspectionEvidencePanelVisible = false;
                this.isInspectionVerdictPanelVisible = false;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = false;
                this.isHoldVisible = false;
                this.isScanEnabled = false;
                this.isCancelEnabled = false;
                this.isInspectEnabled = true;
                this.isSuspectEnabled = true;
                this.isReScanEnabled = false;
                this.isClearEnabled = false;
                this.isImageAnalyserEnabled = true;
                break;
            case caseStatus.InspectionCleared:
                this.isAssessmentImagesPanelVisible = true;
                this.isImageAssessmentVerdictPanelVisible = true;
                this.isInspectionEvidencePanelVisible = true;
                this.isInspectionVerdictPanelVisible = true;
                this.isNotesPanelVisible = true;
                this.isFlagVisible = false;
                this.isHoldVisible = false;
                this.isScanEnabled = false;
                this.isCancelEnabled = false;
                this.isInspectEnabled = false;
                this.isSuspectEnabled = true;
                this.isReScanEnabled = false;
                this.isClearEnabled = false;
                this.isImageAnalyserEnabled = true;
                break;

        }

        switch (appName) {
            case applicationName.ImageAnalyser:
                this.isAssessmentImagesPanelVisible = false;
                this.isNotesPanelVisible = false;
                break;
        }
    }
    toggleTimeLineAndDetail(tab: string) {
        this.isDetailsVisible = tab === 'detail' ? true : false;
    }


    flagAndHoldDisplay(): void {
        if (this.caseCreateDetails.status === caseStatus.AwaitingAssessment || this.caseCreateDetails.status === caseStatus.AwaitingInspection) {
            if (this.isPriority) {
                this.isHoldVisible = false;
                this.isFlagVisible = true;
                this.flagClass = 'btn btn-default btn-primary flag-red';
            }
            else if (this.isHold) {
                this.isFlagVisible = false;
                this.isHoldVisible = true;
                this.holdClass = 'btn btn-default btn-primary hold-white';
            }
            else {
                this.isHoldVisible = true;
                this.isFlagVisible = true;
                this.flagClass = 'btn btn-default btn-primary flag-grey';
                this.holdClass = 'btn btn-default btn-primary hold-grey';
            }
        }
    }
    setFlagAndHold(id: string): void {
        let caseRequest: ICaseRequestFormat = {
            cases: [{
                caseId: this.generatedCaseId[0],
                caseAction: reasonType.ActionReason,
                assignedTo: null
            }],
            notes: '',
            reason: 5,
            status: this.caseCreateDetails.status
        };
        if (id === 'flag') {
            this.isPriority = !this.isPriority;
            if (this.isPriority) {
                caseRequest.cases[0].caseAction = 1;
            }
            else {
                caseRequest.cases[0].caseAction = 0;
            }
        }
        else if (id === 'hold') {
            this.isHold = !this.isHold;
            if (this.isHold) {
                caseRequest.cases[0].caseAction = 2;
            }
            else {
                caseRequest.cases[0].caseAction = 0;
            }
        }
        this.caseService.updateCases(caseRequest).subscribe((result) => {
            if (result.status === responseStatus.Success) {
                this.flagAndHoldDisplay();
                this.flagModified = true;
            }
        });

    }

    setRiskDetails(existingCaseDetails: ICaseCreateDetails): void {
        if (existingCaseDetails.riskAssessmentDetails && existingCaseDetails.riskAssessmentDetails != null) {
            if (existingCaseDetails.riskAssessmentDetails.overAllRiskRating != null
                && existingCaseDetails.riskAssessmentDetails.riskColor != null && existingCaseDetails.riskAssessmentDetails.riskCategories != null) {
                this.caseCreateDetails.riskAssessmentDetails = existingCaseDetails.riskAssessmentDetails;
                this.overAllRiskRating = this.caseCreateDetails.riskAssessmentDetails.overAllRiskRating;
                this.riskColor = this.caseCreateDetails.riskAssessmentDetails.riskColor;
                this.riskCategories = this.caseCreateDetails.riskAssessmentDetails.riskCategories;
                for (let i = 0; i < this.profilerCategories.length; i++) {
                    for (let j = 0; j < this.riskCategories.length; j++) {
                        if (this.profilerCategories[i].id === this.riskCategories[j].categoryId) {
                            this.riskCategories[j].category = this.profilerCategories[i].name;
                            this.riskCategories[j].breachValue = this.riskCategories[j].breach ? 'Y' : 'N';
                            break;
                        }
                    }
                }
            }
        }
    }

    getCaseDetails(caseId: string): void {
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: true, type: spinnerType.small };
        this.caseService.getCaseDetailById(caseId).subscribe(result => {
            if (result.status === responseStatus.Success) {
                let existingCaseDetails: ICaseCreateDetails = result.data;
                this.riskCategories = [];

                //panel 0
                this.setRiskDetails(existingCaseDetails);

                this.caseCreateDetails.senderName = existingCaseDetails.senderName;
                this.caseCreateDetails.senderAddress = existingCaseDetails.senderAddress;
                if (existingCaseDetails.overallWeight && existingCaseDetails.overallWeight !== null) {
                    this.overAllWeightValue = existingCaseDetails.overallWeight.toString();
                }
                else {
                    this.overAllWeightValue = '';
                }
                this.caseCreateDetails.notes = existingCaseDetails.notes;
                this.selectedFromCountry = existingCaseDetails.from;
                this.selectedToCountry = existingCaseDetails.to;
                this.getCountryData(existingCaseDetails.originPortCode, existingCaseDetails.destinationPortCode);
                if (existingCaseDetails.dateOfArrival !== null && existingCaseDetails.dateOfArrival !== '') {
                    this.caseDate = this.dateFormatService.operationalDate(existingCaseDetails.dateOfArrival);
                }
                else {
                    this.caseDate = null;
                }
                //panel 2
                if (existingCaseDetails.shipping && existingCaseDetails.shipping !== null) {
                    this.caseCreateDetails.shipping.shipId = existingCaseDetails.shipping.shipId;
                    this.caseCreateDetails.shipping.shippingCompany = existingCaseDetails.shipping.shippingCompany;
                    this.caseCreateDetails.shipping.contactDetails = existingCaseDetails.shipping.contactDetails;
                    if (existingCaseDetails.shipping.nationality === null || existingCaseDetails.shipping.nationality === '' || existingCaseDetails.shipping.nationality === undefined) {
                        this.selectedNationality = this.nationalityNameList[0];
                    }
                    else {
                        this.selectedNationality = this.nationalityNameList[Object.keys(this.nationalityCodeList).find(k => this.nationalityCodeList[k].name === existingCaseDetails.shipping.nationality.trim())];
                    }
                }
                else {
                    this.selectedNationality = this.nationalityNameList[0];
                }

                //panel 3
                this.caseCreateDetails.vehicle.licensePlateNumber = existingCaseDetails.vehicle.licensePlateNumber;
                this.caseCreateDetails.vehicle.company = existingCaseDetails.vehicle.company;
                this.caseCreateDetails.vehicle.make = existingCaseDetails.vehicle.make;
                this.caseCreateDetails.vehicle.model = existingCaseDetails.vehicle.model;
                this.caseCreateDetails.vehicle.driverName = existingCaseDetails.vehicle.driverName;
                this.caseCreateDetails.vehicle.driverLicenseNumber = existingCaseDetails.vehicle.driverLicenseNumber;

                //panel 4
                if (existingCaseDetails.containers && existingCaseDetails.containers != null) {
                    this.containerIdValue = existingCaseDetails.containers[0].containerId;
                    if (existingCaseDetails.containers[0].harmonisedSystemCodes !== null) {
                        this.hsCodeValue = existingCaseDetails.containers[0].harmonisedSystemCodes.join(',');
                    }
                }
                else {
                    this.containerIdValue = '';
                    this.hsCodeValue = '';
                }
                this.findings = existingCaseDetails.assessmentDetails.findings;
                this.inspectionVerdict = existingCaseDetails.assessmentDetails.inspectionVerdict;

                this.inspectedCaseDetails = existingCaseDetails.assessmentDetails;
                this.assessmentType.none = this.inspectedCaseDetails.inspectionVerdict.find(p=>p.assessment === 0);
                this.assessmentType.image = this.inspectedCaseDetails.inspectionVerdict.find(p=>p.assessment === 1);
                this.assessmentType.physical = this.inspectedCaseDetails.inspectionVerdict.find(p=>p.assessment === 2);
                this.assessmentType.automated = this.inspectedCaseDetails.inspectionVerdict.find(p=>p.assessment === 3);
                this.assessmentType.datasourceprofiler = this.inspectedCaseDetails.findings.find(p=>p.source === 1);
                //general values
                this.generatedCaseId = [existingCaseDetails.caseId];
                this.caseCreateDetails.lastUpdateDate = this.dateFormatService.operationalDate(existingCaseDetails.lastUpdateDate);
                this.caseCreateDetails.lastUpdatedBy = existingCaseDetails.lastUpdatedBy;
                this.caseCreateDetails.status = existingCaseDetails.status;
                if(this.caseStatusList[Object.keys(this.caseStatusList).find(k => this.caseStatusList[k].id === existingCaseDetails.status)]){
                  this.caseStatus = this.caseStatusList[Object.keys(this.caseStatusList).find(k => this.caseStatusList[k].id === existingCaseDetails.status)].name;
                }
                if (existingCaseDetails.attachments && existingCaseDetails.attachments.length) {
                    this.refreshAttachmentGrid(existingCaseDetails.attachments);
                }
                this.pageTitle = this.translateService.instant('CaseDetails');
                this.setPanelsVisibility(existingCaseDetails.status, this.appName);
                this.caseCreateDetails.caseAction = existingCaseDetails.caseAction;
                switch (this.caseCreateDetails.caseAction) {
                    case 1:
                        this.isPriority = true;
                        this.isHold = false;
                        break;
                    case 2:
                        this.isPriority = false;
                        this.isHold = true;
                        break;
                    default:
                        this.isPriority = false;
                        this.isHold = false;
                        break;
                }
                this.flagAndHoldDisplay();
                this.collapseAll();
                this.isDirty = false;
                this.isDisabled = true;

                /**Story 3575, need to add verdictComment,fetch data from api and bind the verdicit comemnt to verdictComment varaiable
                 *
                 */
            }
            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('CaseLoading'), showLoader: false, type: spinnerType.small };
        });
    }
    viewTimeLineViews = () => {
        if (applicationName.ImageAnalyser !== this.appName) {
            this.router.navigate(['IA', { case: this.caseId, edit: 'false' }]);
        }
    }
    ngOnInit(): void {
        this.reset();
        this.getCaseMetadata();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
