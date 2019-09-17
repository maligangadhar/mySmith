export enum responseStatus {
    Success,
    Failure,
    APIError,
    Forbidden,
    ApiNotAvailable,
    InvalidInput,
    NotAuthorized,
    NoDataFound,
    SessionExpired,
    UnknownError,
    Timeout
}

export enum opMode {
    Create = 1,
    Edit = 2,
    View = 3,
    createUser = 4
}

export enum findingStatus {
    Undeclared = 0,
    Declared = 1,
    Deleted = 2,
    Confirmed = 4,
    Cleared = 3
}

export enum messageType {
    Success = 1,
    Warning = 2,
    Error = 3
}

export enum viewType {
    LeftorRight,
    ToporBottom,
    FrontorBack,
    Left,
    Right,
    Top,
    Bottom,
    Front,
    Back
}

export enum cardType {
    role = 1,
    user = 2,
    generalSetting = 3,
    createUser = 4,
    ProfilerSetting = 6
}

export enum sortOrder {
    Asc = 1,
    Desc = 2
}

export enum messageResponseType {
    Yes = 1,
    No = 2,
    NoWithCondition = 3,
    NoPopupShown = 4,
    PopupShown = 5
}

export enum effectType {
    Zoom = 1,
    Brightness = 2,
    Contrast = 3,
    ColorPreset = 4
}

export enum caseStatus {
    Noop = 0,
    AwaitingScreening = 1,
    AwaitingScan = 2,
    Cleared = 3,
    Cancelled = 4,
    Draft = 5,
    Deleted = 6,
    AwaitingAssessment = 7,
    AssessmentInProgress = 8,
    AwaitingReAssessment = 9,
    Emergency = 10,
    InspectionRequested = 11,
    AwaitingInspection = 12,
    InspectionInProgress = 13,
    Suspect = 14,
    InspectionCleared = 15,
    ReScanRequested = 16,
    AssessmentCleared = 17,
    AwaitingProfiling = 18
}


export enum casePageStatus {
    IsCreateCaseOpened = 1,
    IsExistingCaseOpened = 2,
    IsExistingDraftCaseOpened = 3
}

export enum action {
    roleEdit,
    roleCreate,
    userEdit,
    userCreate,
    roleTabChange,
    homeButtonClick,
    roleChange,
    roleFilterChange,
    roleAddButtonClick,
    roleSearch,
    roleCreateCancelClick,
    roleEditCancelClick,
    userChange,
    userFilterChange,
    userSearch,
    userAddButtonClick,
    userCreateCancelClick,
    userEditCancelClick,
    userSearchPublish,
    roleSearchPublish,
    generalSettingsChange,
    appEdit,
    setDefaultData,
    imageEdit,
    imageClearVerdictButtonClick,
    imageSuspectVerdictButtonClick,
    imageVerdictSelectClick,
    imageViewClick,
    findingAdded,
    profileEdit,
    rapEdit,
    dcEdit,
    operationalEdit,
    locationEdit,
    devicesEdit
}

export enum page {
    generalSetting = 1,
    user = 2,
    role = 3,
    applications = 4,
    allCases = 5,
    draftCases = 6
}

export enum colType {
    label = 1,
    link = 2,
    checkbox = 3,
    textbox = 4,
    dropdown = 5,
    button = 6,
    saveButton = 7,
    textArea = 8,
    iconClass = 9,
    date = 10,
    circleClass = 11,
    dateTime = 12
}
export enum size {
    full = 1,
    half = 2,
    quarter = 3
}

export enum roleStatus {
    Active = 1,
    InActive = 2
}

export enum metaDataSettings {
    Applications,
    Roles,
    Users,
    GeneralSettings,
    Cases,
    Images
}

export enum caseButtonTypes {
    ClearAllSelected = 1,
    ScanAllSelected = 2,
    CancelAllSelected = 3,
    DeleteAllSelected = 4,
    Clear = 5,
    Scan = 6,
    CancelCase = 7,
    DecideLater = 8,
    Inspect = 9,
    Suspect = 10,
    ReScanRequest = 11,
    ClearCase = 12,
    ImageAnalyser = 13,
    ReScanCase = 14,
    AwaitingInspection = 15,
    ClearOnImage = 16,
    SuspectOnImage = 17,
    ScanCaseInDC = 18,
    AwaitingInspectionCaseInDC = 19,
    ClearCaseInDC = 20,
    AwaitingScreeningInDC = 21,
    SuspectInDC = 22,
    ReScanInDc = 23
}

export enum broadcastKeys {
    refreshCaseList,
    errorcaseListUpdate,
    actionCenterChange
}

export enum reasonType {
    Error = 1,
    JourneyCancelled = 2,
    NoArrival = 3,
    DraftReason = 4,
    ActionReason = 5,
    StatusChange = 6
}

export enum controlCentreTabs {
    myActions = 1,
    manageCases = 2,
    mySuspect = 3,
    myActivity = 4
}

export enum arrivalsTabs {
    myCases = 1,
    myDrafts = 2
}

export enum settingsTabs {
    settingsGeneral = 1,
    settingsUsers = 2,
    settingsRoles = 3,
    settingsApps = 4,
    settingsProfile = 5,
    settingsRappath = 6,
    settingsdc = 7,
    locationsListing=8,
    settingsDeviceLicense = 9,
    settingsOpDashboard =10
}

export enum inspectTabs {
    myCases = 1,
    awaitingInspectionCases = 2
}
export enum caseActions {
    noSelection = 0,
    priority = 1,
    hold = 2,
    emergency = 4
}

export enum analyzerActions {
    zoom,
    rotate,
    negative,
    sharpness,
    emboss,
    contrast,
    brightness
}

export enum controlCenterColumn {
    CaseId,
    ContainerId,
    ShippingCompany,
    From,
    To,
    UpdatedDate,   
    DateOfArrival,
    Status,
    RiskRating,
    LastModified,
    OverAllRisk
}

export enum assessmentTypes {
    None,
    Image,
    Physical,
    Automated
}

export enum assessmentResults {
    None,
    Found,
    NotFound,
    Inconclusive
}

export enum verdictSources {
    Profiler = 0,
    Analyzer = 1,
    DecisionCentre = 2,
    Inspection = 3
}

export enum markType {
    Finding = 1,
    Zoom = 2
}

export enum collapsiblePanelType {
    Left,
    Right
}

export enum categoryType {
    weapons = 0,
    drugs = 1,
    undeclared = 2
}
export enum goodsType0 {
  Guns = 0,
  Knives = 1,
  Explosives = 2
}
export enum goodsType1 {
  Cocaine = 0,
  Heroin = 1,
  Marijuana = 2
}

export enum inspectionTypeTimeline
{
    Destuff=0,
    Canine=1,
    RADNUC=2
}

export enum applicationName {
     Arrivals,
     ImageAnalyser,
     ControlCenter,
     Inspection
}

export enum outputType{
  None,
  SnapShot,
  ScannedManifest,
  UVIS,
  OCR,
  LPR,
  ManualInspection,
  Video,
  HEMD,
  Xray
}
export enum imageConfig
{
    scanResoution=.004
}

export enum lang {
  EN,
  FR
}

export enum spinnerType{
    small,
    fullScreen
}
export enum settingsAppIds
{
    DecisionCentre=6
}
export enum DecisionCentreSettings
{
    ClearedCasesDuration=1
}
export enum inspectionType
{
    None,
    Destuff,
    Canine,
    RADNUC
}

export enum YepNope {
    Yes = 0,
    No = 1,
    Other = 3
}

export enum Weapons {
    Guns,
    Knives,
    Explosives
}

export enum Drugs {
    Cocaine,
    Heroin,
    Marijuana
}

export enum VerdictTypes {
    Suspect = 1,
    Clear = 2,
    Inspect = 3
}

/** Dashboard changes */
export enum dashboardTabs {
    operationalDashboard,
    profilerDashboard,
    profilerResultDashboard
}
/** Dashboard changes ends here */
