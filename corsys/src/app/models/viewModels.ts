import {
    action,
    assessmentResults,
    assessmentTypes,
    effectType,
    findingStatus,
    messageResponseType,
    messageType,
    outputType,
    responseStatus,
    spinnerType,
    verdictSources,
    viewType,
    Weapons,
    Drugs,
} from './enums';


export interface IAppConfig {
    isProduction: boolean;
    adalConfig: adal.Config;
    rolesUrl: string;
    appsUrl: string;
    casesUrl: string;
    // casesCountUrl:string;
    caseDetailUrl: string;
    scansUrl: string;
    userUrl: string;
    settingsMetadataUrl: string;
    settingsUrl: string;
    analysisUrl: string;
    attachmentUrl: string;
    opAdminUrl: string;
    deviceLicenseInfo: string;
    locationsInfo: string;
    settingsMetadataCountryUrl:string;
    auditUrl:string;
    lineChartUrl: string;
    operationDashboardKPI: string;
    historgramUrl: string;      
}

export interface IAppMap {
    landing: string;
    dashboard: string;
    case: string;
    settings: string;
    arrivals: string;
    decisionCenter: string;
    analyzer: string;
    inspection: string;
    scanner: string;
    unauthorized: string;
}

export interface IResponse<T> {
    data: T;
    status: responseStatus;
    messageKey: string;
    apiUrl: string;
    blob?: Blob;
    message?: string;
}

export interface IAPIResponse<T> {
    data?: T;
    code: string;
    message: string;
}

export interface IAppDetail {
    id: number;
    name: string;
    appCode: string;
    description: string;
    status: number;
    logourl: string;
    appAdded: string;
    appPublished: string;
    appLastUpdated: string;
    version: string;
    type: string;
    category: string;
    roles: IAppRoles[];
}
export interface IAppRoles {
    id: number;
    name: string;
    numberofUsers: string;
}
export interface IApp {
    id: number;
    name: string;
    code: string;
    logourl: string;
    status: number;
}
export interface IUserSelectedRole {
    id: number;
    name: string;
    checked: boolean;
}
export interface IUserAccess {
    userId: string;
    role: IRoleWithApps;
}

export interface ILoginUser {
    password: string;
    userName: string;
}

export interface ICase {
    caseId: string;
    containerIds: string[];
    harmonisedSystemCodes: string[];
    from: string;
    to: string;
    status: number;
    dateCreated: Date;
    lastUpdatedDate?: Date;
    shippingCompany: string;
    dateOfArrival: Date;
    shipId: string;
    checked: boolean;
    caseAction?: number;
    originPort?: string;
    destinationPort?: string;
}

export interface IScreeningCaseDecisionCenter extends ICase {
    overAllRisk: number;
    overAllRiskKeyValue?: IKeyData;
}
export interface ICaseActionCenter extends ICase {
    statusText: string;
    priority: string;
    hold: string;
}

export interface IKeyValue {
    id: number;
    name: string;
}

export interface IDropDownValue {
    value: number;
    label: string;
}

export interface IUserLocationValue{
  locationCode:string;
  id: any;
  name: string;
}

export interface IKeyDataValue extends IKeyValue {
    value: number;
}
export interface ICodeValue {
    code: string;
    name: string;
}
export interface IKeyData {
    key: string;
    data: any;
}

export interface IRole {
    id: number;
    name: string;
    status?: number;
}

export interface IRoleDetail {
    id: number;
    name: string;
    status?: number;
    description?: string;
    users?: IKeyValue[];
    apps: IApp[];
    locationId: number;

}

export interface IRoleWithApps {
    id: number;
    name: string;
    status?: number;
    apps: IApp[];
    locationId:any;
}

export interface IMessage {
    showMessage: boolean;
    message: string;
    type: messageType;
}

export interface ILeaveMessage {
    showMessage: boolean;
    key: string;
    type?: action;
    message?: string;
}
export interface ILoaderMessage {
    id: string;
    type: spinnerType;
    headerMessage: string;
    footerMessage: string;
    showLoader: boolean;
}
export interface IOperationAllowed {
    from: action;
    operationAllowed: boolean;
}

export interface IUser {
    id: number;
    fullName: string;
    status: number;
}

export interface IUserDetail {
    id: number;
    userName: string;
    fullName: string;
    email: string;
    telephone: string;
    mobile: string;
    status: number;
    employementStatus: string;
    position: string;
    createDate: any;
    createdBy: string;
    modifiedDate: Date;
    modifiedBy: string;
    roles: IRoleWithApps[];
    assignedLicense?: boolean;
    locationcode:string;
    locations:any;
}

export interface IPageChange {
    landing: boolean;
    roleEdit: boolean;
    roleCreate: boolean;
    userEdit: boolean;
    userCreate: boolean;
    generalEdit: boolean;
    appEdit: boolean;
    imageEdit: boolean;
    findingAdded: boolean;
    profileEdit:boolean;
    rapEdit:boolean;
    dcEdit:boolean;
    operationalEdit:boolean;
    locationEdit:boolean;
    devicesEdit:boolean;
}

export interface IGeneralSettingsMetadataResponse {
    Currency: IKeyValue[];
    DateFormat: IKeyValue[];
    Language: IKeyValue[];
    Length: IKeyValue[];
    TimeZones: IKeyValue[];
    Weight: IKeyValue[];
    TimeFormat: IKeyValue[];   
    Ports:{ name: string, code: string }[];
}

export interface IStatusMetaDataResponse {
    UserStatus: IKeyValue[];
    RoleStatus: IKeyValue[];
    AppStatus: IKeyValue[];
}

export interface IGeneralSettingsData {
    timezone: number;
    dateFormat: number;
    currency: number;
    timeFormat: number;
    language: number;
    units: units;    
}
export interface units {
    weight: number;
    length: number;
}
export interface IMetadataCase {
    CargoStatus: IKeyValue[];
    CargoType: IKeyValue[];
    Country: { name: string, code: string }[];
    RegionState: { id: number, name: string, code: string }[];
    ReasonType: IKeyValue[];
}
export interface IMetaDataCaseNew {
    CargoStatus: IKeyValue[];
    CargoType: IKeyValue[];
    ReasonType: IKeyValue[];
    RiskColor: IKeyValue[];
}
export interface IMetaDataAnalysisCase {
    PhysicalInspectionTypes: IKeyValue[];
}
export interface IMetaDataImage {
    imageView: IKeyValue[];
}

export interface IkeyValueCode {
    id: number;
    name: string;
    code: string;
}
export interface ICaseInformation {
    sender: string;
    senderAddress: string;
    from: string;
    to: string;
    dateOfArrival: string;
    overallWeight: number;
    notes: string;
}
export interface IShippingInformation {
    shipId: string;
    shippingCompany: string;
    contactDetails: string;
    nationality: string;
}
export interface IVehicleInformation {
    licensePlateNumber: string;
    make: string;
    driverName: string;
    company: string;
    model: string;
    driverLicenseNumber: string;
}
export interface IContainer {
    containerId: string;
    harmonisedSystemCodes: string[];
}

export interface IRiskAssessmentInformation {
    overAllRiskRating: number;
    riskColor: number;
    riskCategories: IRiskCategoryInformation[];
}

export interface IRiskCategoryInformation {
    categoryId: number;
    category: string;
    categoryScore: number;
    thresholdScore: number;
    breach: boolean;
    breachValue: string;
}

export interface ICaseMatchInformation {
    containerId: string;
    to: string;
    dateOfArrival: string;
    status: string;
    shippingCompany: string;
    from: string;
    departureDate: string;
}

export interface ICaseCreateDetails {
    caseId: string;
    cargoType: number;
    senderName: string;
    senderAddress: string;
    from: string;
    to: string;
    dateOfArrival: string|Object;
    overallWeight: number;
    notes: string;
    shipping: IShippingInformation;
    vehicle: IVehicleInformation;
    containers: IContainer[];
    lastUpdateDate: string|Object;
    lastUpdatedBy: string;
    status: number;
    attachments?: IAttachment[];
    caseAction?: number;
    riskAssessmentDetails?: IRiskAssessmentInformation;
    assessmentDetails?: IAssessmentInformation;
    locationcode :string;
    originPortCode:string;
    destinationPortCode:string;
}
export interface IAssessmentInformation {
    overAllRiskRating: number;
    riskColor: number;
    riskCategories: IRiskCategoryInformation[];
    inspectionVerdict? : IInspectionVerdictDetails[];
    inspectionEvidenceDetails? : IInspectionEvidenceDetails[];
    findings?:IInspectionEvidenceDetails[];
}
export interface IInspectionVerdictDetails {
    assessment: any;
    comment: string;
    result:any;
}

export interface IInspectionEvidenceDetails {
    id?: string;
    Name: string;
    category: number;
    comment: string;
    source?: any;
    attachments?: IFindingAttachment[];
    includes:any;
    hsCode?: string;
    goodsType?: Weapons|Drugs;
}

export interface IFindingAttachment{
  DownloadPath:String;
  fileName:string;
  id:string;
}

export interface ICaseImageanalyzer extends ICaseCreateDetails {
    assignedTo: string;
    assessmentImages?: IAssessmentImage[];
}

export interface IAssessmentImage {
    scanImageId: string;
    fileName: string;
    category: outputType;
    viewType: viewType;
    energyLevel: string;
    fileType: string;
    image?: Blob;
    scanFolder?: string;
}

export interface IImageEffects {
    effectId?: string;
    effectType: effectType;
    order: number;
    effectValue: IImageEffectValue[];
}

export interface IImageEffectValue {
    propertyName: string;
    propertyValue: any;
}

export interface IImageView {
    viewId?: string;
    name: string;
    viewType: viewType;
    effects?: IImageEffects[];
    isOriginal?: boolean;
    isSelected?: boolean;
}

export interface IMageViewCallBack {
    ImageViewProp: IImageView;
    callback: any;
}

export interface ICaseId {
    caseId: string;
    caseAction?: number;
}

export interface ICaseRequestFormat {
    cases: {
        caseId: string, caseAction?: any, assignedTo: string
    }[];
    status: number;
    reason?: number;
    notes?: string;
    source?: verdictSources;
    assessment?: assessmentTypes;
    result?: assessmentResults;
    inspectionType?: number;
}

export interface IAssessmentTypes {
    None:any;
    Image:any;
    Physical:any;
    Automated:any;
}

export interface ICaseIDResponseFormat {
    caseId: string;
    failureReason: string;
    errorCode: string;
}
export interface ICaseResponseFormat {
    data: ICaseIDResponseFormat[];
    code: string;
    message: string;

}

export interface ICaseGetResponse {
    cases: ICase[];
    count: number;
}

export  interface ICaseCountResponse {
  data: number;
  code: string;
  message: string;
}

export interface ISearchGetResponseFormat {
    fieldName: string;
    fieldValue: string;
}

//  This is the request format to send a file & response format of attachments when fetching the case by id.
export interface IAttachment {
    id?: string;
    title: string;
    fileName: string;
    description?: string;
    fileType: string;
    fileSize: number;
    fileContent?: number[];
    uploadedBy?: string;
    uploadedDate?: Date;
    downloadPath?: string;
    isFileDeleted: boolean;
    isEditable?: boolean;
    rawFile?: any; //this will be deleted while sending to backend
}

export interface ICustomMessageResponse<T> {
    status: messageResponseType;
    result: T;
    selResult?: number;
}

export interface IEffectSetting {
    value: number;
    step: number;
    min: number;
    max: number;
    apply?: boolean;
}

export interface IImageRotate {
    value: number;
    step: number;
}

export interface IImageControl {
    toolbar: boolean;
    image: boolean;
    sound: boolean;
    fit: string;
    disableZoom: boolean;
    disableMove: boolean;
    disableRotate: boolean;
    numPage: number;
    totalPage: number;
    filmStrip: boolean;
    enableOverlay: boolean;
}

export interface IColorReset {
    name: string;
    content: string;
}

export interface IImageOptions {
    ctx: any;
    adsrc: any;
    zoom: IEffectSetting;
    rotate: IImageRotate;
    controls: IImageControl;
    brightness: IEffectSetting;
    contrast: IEffectSetting;
    sharpness?: IEffectSetting;
    colorReset: IColorReset;
    info: any;
}

export interface IPosition {
    x: number;
    y: number;
}
export interface IOverlay {
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;

}

export interface IMaxPosition {
    x: number;
    y: number;
    startX: number;
    startY: number;
    rightX: number;
    rightY: number;
    lastDistanceX?: number;
    lastDistanceY?: number;

}

export interface IAnalyzerStep {
    step: IAnalyzerStep;
    value: any;
}

export interface IAnalyzerModel {
    context: CanvasRenderingContext2D;
    reader: any;
    options: IImageOptions;
    overlay: IOverlay;
}

export interface IGeneralFormat {
    dateFormat: string;
    timeFormat: string;
    language: number;
}
export interface IQueryTags {
    fieldName: string;
    fieldValues: any[];
}
export interface IDisplayQueryTags extends IQueryTags {
    fieldColor: any[];
}

export interface IAnalysisDetails {
    caseId: string[];
    source?: verdictSources;
    assessment: assessmentTypes;
    result: assessmentResults;
    comment: string;
    inspectionType?: number;
    status: number;
}

export interface ILabelValue {
    label: string;
    value: string;
}

export interface IMarkAreaMove {
    mark: IMarkArea;
    movedX: number;
    movedY: number;
}
export interface IRulerCoordinates {
    startPoint: IPosition;
    endPoint: IPosition;
}
//ruler interface
export interface IRulerResponse {
    caseId: string;
    rulers: IRuler[];
}
export interface IRuler {
    rulerId?: string;
    name: string;
    height?: number;
    rulerClass?: string;
    zIndex?: number;
    angle: number;
    isVisible?: string;
    length: number;
    displayCoordinates: IRulerCoordinates;
    coordinates: IRulerCoordinates;
    createdDate?: string;
    createdBy?: string;
    lastUpdatedDate?: string;
    lastUpdatedBy?: string;
    rulerWidth: number;
    actualWidth: number;
    viewType: number;
    source?:number;
}

//mark area interface
export interface IMarkArea {
    findingid?: string;
    id: number;
    width: number;
    height: number;
    left: number;
    top: number;
    displayButtons: boolean;
    marksHScode?: string;
    category?: number;
    comments?: string;
    name?: string;
    goodsType?: number;
    markClass?: string;
    zIndex: number;
}

export interface BoundingRectangle {
    top: number;
    bottom: number;
    left: number;
    right: number;
    height?: number;
    width?: number;
}

export interface IArea {
    x: number;
    y: number;
    height: number;
    width: number;
}

export interface IPosition {
    x: number;
    y: number;
}
export interface IRePosition {
    x: boolean;
    y: boolean;
}
export interface IMarkAreaOptions {
    minSize: number[];
    maxSize: number[];
}

export interface IBoundingBox {
    leftTopCoordinate: IPosition;
    rightBottomCoordinate: IPosition;
}
export interface IFinding {
    findingId?: string;
    name: string;
    caseId?: string;
    findingNumber?: number;
    category: number;
    hsCode: string;
    goodsType: number;
    viewType?: number;
    source: number;
    comment: string;
    boundingBox?: IBoundingBox;
    displayBox?: IBoundingBox;
    displayWidth?: number;
    displayHeight?: number;
    width?: number;
    height?: number;
    markClass?: string;
    zIndex?: number;
    displayButtons?: boolean;
    status?: findingStatus;
    isVisible?: string;
    findingIndex?: number;
    verdictComment?: string;
    attachments?: IAttachment[];
}
export interface IMetadataImages {
    assessmentResults: IKeyValue[];
    assessmentTypes: IKeyValue[];
    PreliminaryAssessments: IKeyValue[];
    AnnotationShapes: IKeyValue[];
    EffectType: IKeyValue[];
    CategoryTypes: IKeyValue[];
    Drugs: IKeyValue[];
    Weapons: IKeyValue[];
}


export interface ITimeline {
    caseId: string;
    sections: ITimeLineSections[];
}

export interface ITimeLineSections {
    id: string;
    name: string;
    sectionId:number;
    details: ITimeLineSectionDetails[];
}
export interface ITimeLineSectionDetails {
    action?: string;
    date?: string|Object|Date;
    user?: string;
    status?: string;
    comments?: string;
    source?: string;
    scan?: string;
    type?: string;
    hsCode?: string;
    length?: number;
    verdict?: string;
    evidence?: string;
    findings?: string;
    riskScore?: string;
    actionText?: string;
    findingsCount?: number;
    rulersCount?: number;
    statusText?: string;
    isFinding?: boolean;
    isRuler?: boolean;
    isView?: boolean;
    isVerdict?: boolean;
    isApprovalRequest?: boolean;
    approvalRequestType?: string;
    inspectorAssigned?: boolean;
    isHold?: boolean;
    isPriority?: boolean;
    priorityFlag?: boolean;
    holdFlag?: boolean;
    isSupervisorStatusUpdate?: boolean;
    caseAction?: string;
    goodsType?: string;
    categoryType?:string;

}
export interface IFindingVerdict {
    findingIndex: number;
    findingCategory: string;
    findingDescription: string;
}


export interface IProfilerCategory {
    id: number;
    name?: string;
    threshold: number;
    createdDate?: string;
    updatedDate?: string;
    createdBy?: string;
    updatedBy?: string;
    failureReason?: string;
    errorCode?: string;
}

export interface IRAPScore {
    rapColorId: number;
    rapColorName?: string;
    minRapScore: number;
    maxRapScore: number;
    initialCaseStatus?: number;
    initialCaseStatusName?: string;
    createdBy?: string;
    updatedBy?: string;
    createdDate?: string;
    updatedDate?: string;
}

export interface IRAPScorePatchFormat {
    rapScoreList: IRAPScore[];
}

export interface IProfilerCategoryPatchFormat {
    CategoryList: IProfilerCategory[];
}
export interface IAdditionalObject {
    targetValue: string;
    srcObject: Object;
}

export interface IScannerObject {
    scanId: string;
    containerId: string;
    scanDateTime: string;
}

export interface IScannerBatchObject {
    scans: IScannerObject[];
}

export interface IAppSettingsDetails {
    appId: number;
    appName: string;
    settings: IAppSetting[];
}
export interface IAppSetting {
    settingsName: string;
    settingsValue: string;
    settingsId: number;
}

export interface IDeviceLicenseDetail {
    id: number;
    manufacturer?: string;
    status?: number;
    modelName?: string;
    serialNumber?: string;
    latitude?: string;
    longitude?: string;
    assignedLicense: boolean;
    licenseAvailable?: boolean;
    location?: string;
}

export interface ILocationsDetail {
    locationName: string;
    id: number;
    name:string;
    locationCode : string;
    locationStatus: number;
    status?: number;
}

export interface IOperationDashboardDetail {
    appId: number;
    appName: string;
    settings: [
        {
        settingsName: string;
        settingsValue: string;
        }
    ];
}

export interface IAuditMessages{
  eventID:string;
  eventType:string;
  DateTime:string;
  process:string;
  user:string;
  siteID:string;
  moduleID:string;
  eventData:{};
  entityType:string;
  entityID:string;
  description:string;
  eventSeverityLevel:'Emergency';
}

export interface IInspectMyCases {
    priority: number;
    caseId:string;
    categories: number[];
    lastUpdatedDate?: Date;
    inspectionType?:number;
  }
  export interface IInspectCaseActionCenter extends IInspectMyCases{
    findingsCategoriesList?:string[];
    inspectTypeName: string;
    priorityClass:string;
   }

  export interface InspectMetaData {
    PhysicalInspectionTypes: IKeyValue[];
    assessmentResults?: IKeyValue[];
    assessmentTypes?: IKeyValue[];
    PreliminaryAssessments?: IKeyValue[];
    AnnotationShapes?: IKeyValue[];
    EffectType?: IKeyValue[];
    CategoryTypes?: IKeyValue[];
    Drugs?: IKeyValue[];
    Weapons?: IKeyValue[];
  }

  export interface IInspectCaseResponse {
      cases: IInspectMyCases[];
      count: number;
  }

  export interface ICaseAssign {
     caseId:string;
     assignedTo:string;
  }
  export interface ICaseAssignRequest {
    cases:ICaseAssign[];
    status: number;
    reason:string;
    notes: string;
  }
  export interface ICaseAssignResponse {
    caseId:string;
    caseAction: any;
    assignedTo:string;
    failureReason: any;
    errorCode: any;
  }
  export interface IEvidence {
    Title: string;
    Description: string;
    FindingId:string;
    FileName:string;
    FileData:number[];
  }


  export interface IUserList {
    id: number;
    fullName: string;
    status: number;
    name: string;
}

export interface IOperationalUserChart {
    name: string;
    type: string;
    status: any;
    fullName:string;
    colour: string;
    actual: number;
    expected: number;
    timeseries?: string;
}

export interface IOperationalineChartStructure {
    [key: string]: IOperationalineChart[];
}

export interface IOperationalineChart {
    actual: number;
    target: number;
    timeslot: string;

}

export interface ITimeSeriesRequestFormat {
    users: string;
    duration: string;
}

export interface ITimeSeriesResponse {
    time_series: [IOperationalineChartStructure];
}

export interface IKPIChart {
    current: number;
    previous: number;
    changePercentage: number;
}

export interface IHistogramChart {
    destuff:object[];
    canine:object[];
    timeslot:string;
    historgram:any;
}

export interface IProfilerLineChart {
    actual: number;
    expected: number;
    date: string;
    total:any;
}

export interface IGeneralInfo {
    timezone:number;
    dateFormat:number;
    currency:number;
    timeFormat:any;
    language:any;
}

export interface ICustomPatterns {
    [key: string]: string;
}

export interface ILineRegion {
    [key: string] : Object[];
}

export interface ILineRegionInput {
    regions: ILineRegion;
    dynamicRegion: boolean;
}
