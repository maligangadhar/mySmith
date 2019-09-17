import { EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
    IRoleDetail, IResponse, IUserAccess, IRole, IAppDetail, IMessage, IUserDetail, IApp, ICaseCreateDetails, IEffectSetting,
    IGeneralSettingsData, IUser, ILeaveMessage, ILoaderMessage, IOperationAllowed, IGeneralSettingsMetadataResponse, IPosition, IRePosition,
    IMetadataCase, IMetaDataCaseNew, ICaseRequestFormat, ICaseGetResponse, ICaseIDResponseFormat, IAttachment, ISearchGetResponseFormat,
    IAssessmentImage, IMetadataImages, IAnalysisDetails, IFinding, IImageView, ITimeline, IRuler, IRulerResponse, IMetaDataAnalysisCase, IAppConfig, IProfilerCategory, IProfilerCategoryPatchFormat, IScannerBatchObject, IRAPScore, IRAPScorePatchFormat, IAppSettingsDetails, IDeviceLicenseDetail, IOperationDashboardDetail, ILocationsDetail, IStatusMetaDataResponse, IAuditMessages, ICaseCountResponse, IOperationalineChartStructure, ITimeSeriesRequestFormat, ITimeSeriesResponse, IKPIChart, IUserList, IHistogramChart, IProfilerLineChart, IGeneralInfo, ICustomPatterns
} from '../models/viewModels';
import { sortOrder, action, page, metaDataSettings, findingStatus } from '../models/enums';
import { SelectItem } from 'primeng/primeng';

export interface ICommonService {
    // LoginDetail: ILoginDetail;
    getRequestHeader: () => any;
    RolesList: IRole[];
    NewRoleAdded: boolean; // TO DO, need to be removed
    NewUserAdded: boolean;
    UserUpdated: boolean;
    UserChanged: boolean;
    RoleUpdated: boolean;
    NewRoleAddedChange: EventEmitter<boolean>;
    NewUserAddedChange: EventEmitter<boolean>;
    UserUpdatedChange: EventEmitter<boolean>;
    UserDetailChange: EventEmitter<any>;
    userdetailChanged: any;
    newRole: IRoleDetail; // TO DO, need to be removed
    roleModified: boolean;
    UserAccess: IUserAccess;
    emailValidator(email: string): boolean;
    shipIdValidator(shipId: string): boolean;
    hsCodeValidator(hsCode: string): boolean;
    overAllWeightValidator(overAllWeight: string): boolean;
    containerIdValidator(containerIdValue: string): boolean;
    newUser: IUserDetail;
    getAuthToken: () => any;
    sortTypes: any;
}

export interface ICacheStorageService {
    cacheMetaData: IResponse<any>;
    cacheGeneralSettingMetaData: IResponse<any>;
    cacheGeneralSettingsMetaData: IResponse<any>;
    cacheAnalysisMetaData: IResponse<any>;
    scanMetadata: IResponse<any>;
    cacheUserDetails: IResponse<any>;
    cacheCountryDetails: IResponse<any>;
    cacheUsers: IResponse<any>;
    cacheRoles: IResponse<any>;
    cacheCountries: IResponse<any>;
    cacheApplications: IResponse<any>;
}

export interface IUserAccessService {
    getUserAccess: (userId: string) => Observable<IResponse<IUserAccess>>;
}

export interface ITranslateService {
    CurrentLang: string;
    setDefaultLang: (lang: string) => void;
    enableFallback: (enable: boolean) => void;
    use: (lang: string) => void;
    replace: (word: string, words: string | string[]) => string;
    instant: (key: string, words?: string | string[]) => string;
}

export interface ICaseService {
    getCases: (addCreatedBy: boolean, pageNum?: number, pageSize?: number, filterCriteria?: number[], sortCriteria?: string[], additionalCondition?: string) => Observable<IResponse<ICaseGetResponse>>;
    getCasesCount: (addCreatedBy: boolean, filterCriteria?: number[], additionalCondition?: string) => Observable<IResponse<ICaseCountResponse>>;
    getCasesByStatus: (assignedTo: boolean, filterCriteria?: number[]) => Observable<IResponse<ICaseGetResponse>>;
    createCase: <ICaseCreateDetails>(caseDetail: ICaseCreateDetails) => Observable<IResponse<ICaseCreateDetails>>;
    updateCase: <ICaseCreateDetails>(caseDetail: ICaseCreateDetails) => Observable<IResponse<ICaseCreateDetails>>;
    fetchCaseCreateMetaData: (metadataFor: metaDataSettings) => Observable<IResponse<IMetadataCase>>;
    fetchCaseCountryData: () => Observable<IResponse<IMetadataCase>>;
    updateCases: (caseStatus: ICaseRequestFormat) => Observable<IResponse<ICaseIDResponseFormat[]>>;
    getCaseDetailById: (caseID: string) => Observable<IResponse<ICaseCreateDetails>>;
    fetchMetadata: () => Observable<IResponse<IMetaDataCaseNew>>;
    getSearchdata: (keyword: string, filterCriteria?: string[]) => Observable<IResponse<ISearchGetResponseFormat[]>>;
    getSearchCasesCount: (filterCriteria?: any[], searchAll?: boolean, additionalCondition?: string) => Observable<IResponse<ICaseCountResponse>>;
    getSearchCases: (pageNum?: number, pageSize?: number, filterCriteria?: any[], searchAll?: boolean, sortCriteria?: string[], additionalCondition?: string) => Observable<IResponse<ICaseGetResponse>>;
    getSearchClearCases: (timeDuration?: number, pageNum?: number, pageSize?: number, filterCriteria?: any[],sortCriteria?: string[], searchAll?: boolean, appendUrl?: string) => Observable<IResponse<ICaseGetResponse>>;
    getCaseTimeline: (caseId: string) => Observable<IResponse<ITimeline>>;
    getSearchClearCasesCount: (timeDuration?: number, pageNum?: number, pageSize?: number, filterCriteria?: any[], searchAll?: boolean, appendUrl?: string) => Observable<IResponse<ICaseCountResponse>>;
}

export interface IRoleService {
    getRoles: () => Observable<IResponse<IRole[]>>;
    createRole: (roleDetails: IRoleDetail) => Observable<IResponse<IRoleDetail>>;
    updateRole: (roleDetails: IRoleDetail) => Observable<IResponse<IRoleDetail>>;
    getRole: (id: number) => Observable<IResponse<IRoleDetail>>;
    setRoleDetail: (roleDetail: IRoleDetail) => void;
    getRoleDetail: () => IRoleDetail;
}
export interface IApplicationService {
    getApplications: () => Observable<IResponse<IApp[]>>;
    getApplication: (appId: number) => Observable<IResponse<IAppDetail>>;
    updateApplication: (appDetails: IAppDetail) => Observable<IResponse<IAppDetail>>;
}

export interface IMessageService {
    Message: IMessage;
    CurrentPage: page;
    LeaveMessage: ILeaveMessage;
    LoaderMessage: ILoaderMessage;
    OperationAllowed: boolean;
    OperationGoAhead: EventEmitter<IOperationAllowed>;
    MessageAdded: EventEmitter<IMessage>;
    LeaveMessageAdded: EventEmitter<ILeaveMessage>;
    LoaderMessageAdded: EventEmitter<ILoaderMessage>;
    resetPageChange: () => void;
    getPageChange: (currentAction: action) => void;
    showLeaveMessage: (currentAction: action) => boolean;
    setPageChange: (currentAction: action, status: boolean) => void;

}

export interface IUserService {
    getUser: (userId: number) => Observable<IResponse<IUserDetail>>;
    getUsers: () => Observable<IResponse<IUser[]>>;
    createUser: (userDetails: IUserDetail) => Observable<IResponse<IUserDetail>>;
    updateUser: (userDetails: IUserDetail) => Observable<IResponse<IUserDetail>>;
    getUserByName: (userName: string) => Observable<IResponse<IUserDetail>>;
    updateUserLocation: (user: any) => Observable<IResponse<IUserDetail>>;
}

export interface ISortService {
    sort: (data: any[], sortBy: string, orderType?: sortOrder) => any[];
    sortCaseIndependent: (data: any[], sortBy: string, orderType?: sortOrder) => any[];
}

export interface IBroadcastService {
    broadcast: (key: string, data: any) => void;
    DataChange: EventEmitter<any>;
    clear: () => void;
}

export interface ICompMessageService {
    sendMessage: (message: any) => void;
    clearMessage: () => void;
    getMessage: () => Observable<any>;
}


export interface IGeneralSettings {
    fetchGeneralSettingsMetaData: (metadataFor: metaDataSettings) => Observable<IResponse<IGeneralSettingsMetadataResponse>>;
    fetchStatusMetaData: (metadataFor: string) => Observable<IResponse<IStatusMetaDataResponse>>;
    getGenralSettings: () => Observable<IResponse<IGeneralSettingsData>>;
    updateGeneralSettings: (setingsDetail: IGeneralSettingsData) => Observable<IResponse<IGeneralSettingsData>>;
    fetchOpAdminSettings: (appId?: number) => Observable<IResponse<IAppSettingsDetails>>;
    updateOpAdminSettings: (appDetails: IAppSettingsDetails) => Observable<IResponse<IAppSettingsDetails>>;
}

export interface IAttachmentService {
    getAttachmentByAttachmentId: (attachmentId: string, folderName: string, mimeType: string) => void;
    postAttachment: (attachment: IAttachment[], caseId: string) => Observable<IResponse<IAttachment>[]>;
    attachmentValidation: (fileObject: Object, acceptableMimeTypes: string) => boolean;
    convertToByteArray: (fileObject: Object, title: string, description: string) => Observable<IAttachment>;
    downloadLocalFile: (fileObject: IAttachment) => void;
}

export interface IImageReaderService {
    createReader: (mimeType: any, obj: any) => any;
    IsSupported: (mimeType: any) => boolean;

}


export interface IImageService {
    zoom: (contxt, reader, options, overlays, picPos, direction, findings: IFinding[], rulers: IRuler[], maxPosition, rePosition: IRePosition, imageDimennsions: IPosition) => void;
    rotate: (contxt, reader, options, overlays, picPos, direction) => void;
    overLay: (contxt, reader, options, overlays, picPos) => void;
    negative: (context, width, height, picPos: IPosition) => void;
    resizeTo: (context, reader, options, overlays, picPos, value, screenWidth, screenHeight) => void;
    applyTransform: (context, reader, options, overlays, picPos, applyEffects: boolean, movetoMousePos?: boolean) => void;
    sharpen: (context, weight, height, mix, picPos: IPosition, movetoMousePos?: boolean) => void;
    processBrightnessContrast: (picPos: IPosition, context, brightness: IEffectSetting, contrast: IEffectSetting, width, height, reader, options) => void;
    adjustMovement: (context, reader, options, overlays, picPos, maxPosition, dragStart, offsetX, offsetY, marks, rulers: IRuler[], imageDimennsions: IPosition) => IPosition;
    adjustMarksAndRulers: (marks: IFinding[], ruler: IRuler[], x: number, y: number) => void;
    createPixcelMap: (image: string) => void;
    appLyColorPresets: (picPos: IPosition, colorPreset: string, context, width: number, height: number, reader, options) => void;
    colorPresetList: SelectItem[];
    doTransform: boolean;
    loadLuts: () => void;
    resetDetails: () => void;
    zoomRulers: (reader, imageDimennsions, options, oldZoom, rulers, picPos) => void;
    zoomMarks: (reader, imageDimennsions, options, oldZoom, findings, picPos) => void;
}


export interface IAnalyzerService {
    getScanDetails: (scanID: string) => Observable<IResponse<IAssessmentImage[]>>;
    getAnalyzerCaseDetails: (caseID: string) => Observable<IResponse<IAssessmentImage[]>>;
    getImageByScanId: (scanFolder: string, scanImageId: string, mimeType: string) => any;
    fetchImageAnalyzerMetaData: () => Observable<IResponse<IMetadataImages>>;
    fetchImageFindings: (caseId: string, viewType: number) => Observable<IResponse<IFinding[]>>;
    createView: <IImageView>(caseID: string, viewDetail: IImageView) => Observable<IResponse<IImageView>>;
    updateView: (caseID: string, viewDetail: IImageView) => Observable<IResponse<IImageView>>;
    getViews: (caseID: string) => Observable<IResponse<IImageView[]>>;
    getViewDetailByViewId: (caseID: string, viewID: string) => Observable<IResponse<IImageView>>;
    addImageFinding: (caseId: string, finding: IFinding) => Observable<IResponse<IFinding>>;
    updateImageFinding: (caseId: string, finding: IFinding) => Observable<IResponse<IFinding>>;
    deleteFinding: (caseId: string, findingId: string, status: findingStatus, VerdictComment?: string, source?: string) => Observable<IResponse<any>>;
    fetchImageRulers: (caseId: string, viewType: number) => Observable<IResponse<IRulerResponse>>;
    addImageRuler: (caseId: string, ruler: IRuler) => Observable<IResponse<IRuler>>;
    // updateImageFinding: (caseId: string, finding: IFinding) => Observable<IResponse<IFinding>>;
    deleteRuler: (caseId: string, rulerId: string, status: findingStatus) => Observable<IResponse<any>>;
    fetchScanMetadata: () => Observable<IResponse<any>>;
}

export interface IStorageService {
    setItem: (key: string, value: any) => void;
    getItem: (key: string) => any;
    clearItem: (key: string) => void;
    clearStorage: () => void;
}

export interface IDateFormatService {
    formatDate: (date: Object, format?: string) => string;
    formatDateforApi: (dateString: string | Object) => string;
    operationalDate: (utcDateTimeValue: string | Object) => Object;
}

export interface ITimeFormatService {
    formatTime: (time: string, format?: string) => string;
}

export interface IDateTimeFormatService {
    // format: (dateTime: string| Date, format?: string) => string;
    formatDateTime: (dateTime: Date | string, format?: string) => string;
    // convertUTCToLocalDateTime: (utcDateTimeValue: string) => string;
}

export interface ICaseAnalysisService {
    putCaseAnalysis: (payLoad: IAnalysisDetails) => Observable<IResponse<IAnalysisDetails>>;
    fetchCaseAnalysisMetaData: () => Observable<IResponse<IMetaDataAnalysisCase>>;
}

export interface IAppParams {
    getParams: () => IAppConfig;
}

export interface IProfilerSettingService {
    getProfilerSetting: () => Observable<IResponse<IProfilerCategory[]>>;
    patchProfilerSetting: (profilerSettings: IProfilerCategoryPatchFormat) => Observable<IResponse<IProfilerCategory[]>>;
}
/* export interface IDCSettingService {
    getDCSetting: (lang: string) => Observable<IResponse<IProfilerCategory[]>>;
    patchDCSetting: (dcSettings: IProfilerCategoryPatchFormat) => Observable<IResponse<IProfilerCategory[]>>;
  } */
export interface IRAPPathwayService {
    getRAPScore: (lang: string) => Observable<IResponse<IRAPScore[]>>;
    patchRAPScore: (profilerSettings: IRAPScorePatchFormat) => Observable<IResponse<IRAPScore[]>>;
}

export interface IScannerService {
    getScanItemList: (params: Object) => Observable<IResponse<IScannerBatchObject>>;
    mapScanToCase: (containerId: string, scanId: string) => Observable<IResponse<any>>;
}

export interface IDeviceLicenseService {
    get: () => Observable<IResponse<IDeviceLicenseDetail[]>>;
    getById: (deviceId: string) => Observable<IResponse<IDeviceLicenseDetail>>;
    patch: (payLoad: IDeviceLicenseDetail) => Observable<IResponse<boolean>>;
    put: (payLoad: IDeviceLicenseDetail) => Observable<IResponse<IDeviceLicenseDetail[]>>;
    post: (payLoad: IDeviceLicenseDetail) => Observable<IResponse<IDeviceLicenseDetail[]>>;
}
export interface ILocationService {
    get: () => Observable<IResponse<ILocationsDetail[]>>;
}

export interface IOperationDashboardSettingService {
    get: (id?: string) => Observable<IResponse<IOperationDashboardDetail>>;
    put: (payLoad: IOperationDashboardDetail) => Observable<IResponse<IOperationDashboardDetail>>;
    post: (payLoad: IOperationDashboardDetail) => Observable<IResponse<IOperationDashboardDetail>>;
    patch: (payLoad: IOperationDashboardDetail) => Observable<IResponse<IOperationDashboardDetail>>;
}
export interface IAuditMessageService {
    manageAuditMessages: () => Observable<IResponse<IAuditMessages>>;
}

export interface IOperationalChartService {
    formatData: (obj: IOperationalineChartStructure, selectedUsers, colorPatterns, selectedFilter: string, userList: IUserList[]) => Object;
    getTotalScanData: (obj: ITimeSeriesRequestFormat) => Observable<IResponse<ITimeSeriesResponse>>;
    getOPerationKPI: (params: Object) => Observable<IResponse<IKPIChart>>;
    getUserData: (filter: string) => Observable<IResponse<IUserList[]>>;
    getHistogramData: (obj: ITimeSeriesRequestFormat) => Observable<IResponse<IHistogramChart>>;
}

export interface IProfilerChartService {
    getData: (url: string, params: Object) => Observable<IResponse<IProfilerLineChart[]>>;
    getGeneralData: (url: string) => Observable<IResponse<IGeneralInfo[]>>;
    formatData: (obj: IProfilerLineChart[], colorPatterns?: ICustomPatterns | string[], dataNames?: ICustomPatterns) => Object;
}
export interface IOperationalUserChart {
    name: string;
    type: string;
    status: any;
    colour: string;
    actual: number;
    expected: number;
    timeseries?: string;
}

