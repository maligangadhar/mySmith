import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Renderer,
    SimpleChanges,
    ViewChild,
    HostListener
} from '@angular/core';
import { Router } from '@angular/router';
import { SelectItem } from 'primeng/primeng';
import { Subject } from 'rxjs/Rx';

import { CaseButtonStatusCode } from '../../businessConstants/businessConstants';
import { Sp3MarkAreaControlComponent } from '../../controls/mark.area.control';
import {
    IAnalyzerService,
    IBroadcastService,
    ICaseAnalysisService,
    ICaseService,
    IImageReaderService,
    IImageService,
    IMessageService,
    ITranslateService,
    IStorageService,
} from '../../interfaces/interfaces';
import {
    action,
    applicationName,
    assessmentResults,
    assessmentTypes,
    caseButtonTypes,
    caseStatus,
    effectType,
    imageConfig,
    messageResponseType,
    messageType,
    reasonType,
    responseStatus,
    viewType,
} from '../../models/enums';
import { spinnerType, inspectionType, verdictSources, broadcastKeys } from '../../models/enums';
import {
    BoundingRectangle,
    IAnalysisDetails,
    ICase,
    ICaseRequestFormat,
    ICustomMessageResponse,
    IFinding,
    IImageEffects,
    IImageOptions,
    IImageView,
    IKeyDataValue,
    IKeyValue,
    IMageViewCallBack,
    IMarkArea,
    IMarkAreaMove,
    IMaxPosition,
    IMetadataImages,
    IOverlay,
    IPosition,
    IRePosition,
    IResponse,
    IRuler,
    IRulerCoordinates,
    IScannerObject,
} from '../../models/viewModels';
import { ImageReaderService } from '../../services/image.reader.service';
import { InspectCaseVerdictComponent } from '../inspect/inspect.case.verdict.component';
import { ModalClearCasePopupComponent } from '../modal/modal.clearcase.component';
import { ModalVerdictPromptComponent } from '../modal/modal.verdict.prompt.component';
@Component({
    selector: 'sp3-comp-image-analyzer',
    templateUrl: './image.analyzer.component.html'
})

export class ImageAnalyzerComponent implements OnInit, OnDestroy, OnChanges {
    public brightnessLevel: number = 50;
    public contrastLevel: number = 50;
    public effects: string;
    public viZual: string;
    public fitToView: string;
    @Input() public imagePath?: any;
    @Input() public scanFlag?: boolean = false;
    @Input() public options: IImageOptions;
    @Input() public isNextButtonVisible: boolean;
    @Input() public imageViews: IKeyValue[];
    @Input() public selectedView: IKeyValue;
    @Input() public viewList: IImageView[] = [];
    @Input() public selectedImageView: IImageView;
    @Input() public case: ICase = null;
    @Input() public descrimination?: any;
    @Input() toggleSwitchFlag: boolean = false;
    @Input() public viewMode?: boolean = false;
    @Input() public editFinding?: boolean = false;
    @Input() public scan: IScannerObject = { scanId: '', scanDateTime: '', containerId: '' };
    @Input() public caseId: string;
    @Input() public inspectiontype?: number;
    metadataImages: IMetadataImages = {
        AnnotationShapes: [], assessmentResults: [], assessmentTypes: [],
        CategoryTypes: [], Drugs: [], EffectType: [], PreliminaryAssessments: [], Weapons: []
    };
    @ViewChild('imageViewer') imageViewer;
    @ViewChild('imageViewerHemd') imageViewerHemd;
    @ViewChild('markArea') markArea: Sp3MarkAreaControlComponent;
    @ViewChild('caseVerdict') caseVerdict: InspectCaseVerdictComponent;
    @ViewChild('inspectionCallBackPopUp') inspectionCallBackPopUp: ModalClearCasePopupComponent;
    @ViewChild('requestAssessmentPopUp') requestAssessmentPopUp: ModalClearCasePopupComponent;
    @ViewChild('modalCaseImagePopup') modalCaseImagePopup: ModalClearCasePopupComponent;
    @ViewChild('modalSuspectCaseImagePopup') modalSuspectCaseImagePopup: ModalClearCasePopupComponent;
    @ViewChild('reScanCallBackPopUp') reScanCallBackPopUp: ModalVerdictPromptComponent;
    context: CanvasRenderingContext2D;
    contextHemd: CanvasRenderingContext2D;
    stampHeight: number;
    selectedOption: IKeyValue;
    selectedTopButtonOption: IKeyValue;
    selectedZoomOption: IKeyValue;
    curPos: IPosition = { x: 0, y: 0 };
    picPos: IPosition = { x: 0, y: 0 };
    panPicPos: IPosition = { x: 0, y: 0 };
    changeStateStore = {
        previousvalue: 1,
        currentValue: 1
    };
    dragStart: IPosition = { x: 0, y: 0 };
    mousePos: IPosition = { x: 0, y: 0 };
    maxPosition: IMaxPosition = { x: 0, y: 0, startX: 0, startY: 0, rightX: 0, rightY: 0 };
    distanceMoved: IPosition = { x: 0, y: 0 };
    toAnnotate: boolean = false;
    findingsList: IFinding[] = [];
    rulersList: IRuler[] = [];
    findingsCount: number = 0;
    pencilEnabled: boolean = false;
    // isUndo: boolean = false;
    //isRedo: boolean = false;
    rulerEnabled: boolean = false;
    findingsExists: boolean = false;
    ngUnsubscribe: Subject<any> = new Subject<any>();
    selectorOptions: IImageOptions;
    imageActionOptions: IKeyValue[] = [];
    imageTopButtonOptions: IKeyDataValue[] = [];
    selectAction: string = '';
    toRuler: boolean = false;
    reader: any;
    hemdReader: any;
    selectorContext: CanvasRenderingContext2D;
    overlays: IOverlay[] = [];// [{ x: 0, y: 0, w: 0, h: 0, color: '#00FF00' }];
    clear: any;
    currentX: any;
    currentY: any;
    lineCol: any;
    lineWidth: any = 1;
    mouseIsDown: any;
    selMouseIsDown: any;
    startX: any;
    startY: any;
    endX: any;
    endY: any;
    marAreaWidth: any = window.innerWidth;
    marAreaHeight: any = window.innerHeight;
    contextSize: IPosition;
    dataSentToMarkArea: boolean = false;
    loadMarAreaControl: boolean = false;
    hemdImageLoader: boolean = false;
    caseFindings: IFinding[] = [];
    imageRulers: IRuler[] = [];
    actualRatio: number;
    //image crop start
    @ViewChild('imageSelector', undefined) cropcanvas: ElementRef;
    @Input('image') public image: any;
    @Input('inputImage') public inputImage: any;
    @Output() public onCrop: EventEmitter<any> = new EventEmitter();
    @Output() public onloadNextCaseClick: EventEmitter<boolean> = new EventEmitter();
    @Output() selectedViewChange: EventEmitter<IKeyValue> = new EventEmitter();
    @Output() originalImageRestore: EventEmitter<IMageViewCallBack> = new EventEmitter();
    @Output() refreshPage: EventEmitter<string> = new EventEmitter();
    @Output() showLoader: EventEmitter<boolean> = new EventEmitter();
    @Output() public closeAction: EventEmitter<boolean> = new EventEmitter();
    selMarkHeight: number;
    selMarkWidth: number;
    zoomBounding: BoundingRectangle;
    zoomMarks: IMarkArea[] = [];
    marks: IMarkArea[] = [];
    movedX: number = 0;
    movedY: number = 0;
    top: number = 0;
    left: number = 0;
    mainLeft: number = 0;
    mainTop: number = 0;
    public croppedWidth: number;
    public croppedHeight: number;
    public intervalRef: number;
    public raf: number;
    public renderer: Renderer;
    public windowListener: EventListenerObject;
    isMenuClose: boolean = false;
    isRightMenuClose: boolean = false;
    isRightPanelVisible: boolean = false;
    isCaseButtonsVisible: boolean = true;
    changedImageView: IImageView = null;
    selectedVerdictAction: IKeyValue;
    newImageView: IImageView;
    zoom: (direction: number, isRestoreImage: boolean, isRestoreStateStoreChange: boolean) => void;
    rotate: (direction) => void;
    negative: () => void;
    overLay: () => void;
    showFindings: boolean = true;
    showRulers: boolean = true;
    onBrightnessChangeEvent: (value: number) => void;
    onContrastChangeEvent: (value: number) => void;
    resizeTo: (value) => void;
    getSidePanelState: (status: boolean) => void;
    closeRightSidePanelState: (status: boolean) => void;
    onClearCasePopUpClick: (event: ICustomMessageResponse<string>) => void;
    onSuspectCasePopUpClick: (event: ICustomMessageResponse<string>) => void;
    onReScanCallback: (event: ICustomMessageResponse<string>) => void;
    onInspectCallback: (event: ICustomMessageResponse<string>) => void;
    onClearCallback: (event: ICustomMessageResponse<string>) => void;
    onSuspectCallback: (event: ICustomMessageResponse<string>) => void;
    onRequestAssessmentCallback: (event: ICustomMessageResponse<string>) => void;
    onLeaveMessageClick: (event: messageResponseType) => void;
    onImageActionOptionChange: (event: IKeyValue) => void;
    caseInfoAction: (event: IKeyDataValue) => void;
    imageActionOptionChange: (event: IKeyValue) => void;
    onImageTopButtonOptionChange: (event: IKeyValue) => void;
    backToInspection: () => void;
    backToVerdict: () => void;
    findingdAndVerdict: () => void;
    sharpen: () => void;
    annotate: () => void;
    openCase: () => void;
    //  btnUndoSelect: () => void;
    //  btnRedoSelect: () => void;
    rulerDraw: () => void;
    getImageAnalyzerMetadata: () => void;
    readOnlyCheck: () => void;
    loadNextCaseClick: () => void;
    onViewChange: (data: any) => void;
    imageSaveClick: () => void;
    imageSaveAsClick: () => void;
    onViewClick: (view: IImageView) => void;
    viewClick: (view: IImageView) => void;
    getViewName: () => string;
    saveImageOnLeavemessage: () => void;
    ShowOriginalImageOnLeavemessage: () => void;
    setDefaultValues: () => void;
    setImageManupulationValues: (effects: IImageEffects[], isViewLoad: boolean) => void;
    getSaveAsButtonStatus: () => boolean;
    getSaveButtonStatus: () => boolean;
    addZoomEffects: (direction: number) => void;
    caseDetailsClick: () => void;
    setTopbarActions: () => void;
    presetChange: (brightness: number, contrast: number) => void;
    canvasWidth: number;
    canvasHeight: number;
    resetMarkArea: boolean = true;
    resetRulerArea: boolean = true;
    caseButtonTypes: any;
    generatedCaseId: string[] = [];
    appName: applicationName = applicationName.ImageAnalyser;
    hemdOptions: IImageOptions;
    analysisPayload: IAnalysisDetails = {
        caseId: [],
        assessment: assessmentTypes.None,
        result: assessmentResults.NotFound,
        comment: '',
        status: 0
    };
    payLoad: ICaseRequestFormat = {
        cases: [{ caseId: '', caseAction: null, assignedTo: null }],
        status: 0,
        reason: null,
        notes: null
    };
    queryText: string = '';
    querydynamicId: string = '';
    popUpButtonTitle: string = '';
    emitOnEffectChange: boolean = false;
    presetCount: number = 0;
    caseInformation: string;
    caseInfoActions: string;
    onZoomSelectionChange: (event, isRestorImage: boolean, isZoomApply: boolean) => void;
    zoomLevelOptions: IKeyValue[]; // = [{ name: 'Fit to view', id: 1 }];
    toggleBottomPanelFlag: boolean = false;
    toggleBottomPanel: () => void;
    registerImageEffects: (actionType: effectType, effect: any, value: any) => void;
    resetEffectValues: () => void;
    onColorTypeChange: ($event) => void;
    colorPresetList: SelectItem[];
    toggleColorList: (event: number) => void;
    toggleColorListDropDownFlag: boolean = true;
    toggleDiscriminationSwitchButtonFlag: boolean = false;
    //initially disabled
    //toggleSwitchFlag: boolean = true;
    getDiscriminationSwitchState: (flag: boolean) => void;
    disableDiscriminationSwitchFlag: boolean = false;
    isFooterVisible: boolean = true;
    visible: boolean = false;
    verdictSource?: verdictSources = null;
    public visibleAnimate = false;
    reloadImage: () => void;
    selectedItem: Object;
    findImageEffects: (effectList: IImageEffects[], effectType: effectType) => number;
    imageReaderService: IImageReaderService;
    hemdReaderService: IImageReaderService;
    initialPageReloadFlag: boolean = true;
    canvasTopMargin: number = 200;
    brightnessVal: number = 50;
    contrastVal: number = 50;
    brigtnessContrassFlg: boolean = false;
    constructor(renderer: Renderer,
        @Inject('IImageService') private imageService: IImageService,
        @Inject('IMessageService') private messageService: IMessageService,
        @Inject('ICaseAnalysisService') private caseAnalysisService: ICaseAnalysisService,
        @Inject('ICaseService') private caseService: ICaseService,
        @Inject('ITranslateService') public translateService: ITranslateService,
        @Inject('IAnalyzerService') private analyzerService: IAnalyzerService,
        @Inject('IStorageService') private storageService: IStorageService,
        @Inject('IBroadcastService') private broadcastService: IBroadcastService, private router: Router) {
        var vm = this;
        vm.colorPresetList = vm.imageService.colorPresetList;
        vm.selectedItem = [vm.imageService.colorPresetList[0]];
        vm.caseInformation = vm.translateService.instant('CaseInformation');
        vm.caseInfoActions = vm.translateService.instant('caseInfoActions');
        vm.effects = vm.translateService.instant('Effects');
        vm.viZual = vm.translateService.instant('Vizual');
        vm.fitToView = vm.translateService.instant('FitToView');
        vm.zoomLevelOptions = [{ name: vm.fitToView, id: 1 }];
        this.imageReaderService = new ImageReaderService();
        /**
         * Lists are toggled based on button click
         */
        vm.toggleColorList = (value: number) => {
            if (value === 0) {
                vm.colorPresetList = vm.imageService.colorPresetList;
                vm.selectedItem = vm.imageService.colorPresetList[0];
                vm.toggleColorListDropDownFlag = false;
                vm.onColorTypeChange(vm.imageService.colorPresetList[0]);
            } else {
                vm.toggleColorListDropDownFlag = true;
                vm.colorPresetList = [vm.imageService.colorPresetList[0]];
                vm.options.colorReset.name = null;
                vm.options.colorReset.content = null;
                vm.registerImageEffects(effectType.ColorPreset, vm.options.colorReset, vm.options.colorReset.name);
                vm.imageService.appLyColorPresets(this.picPos, null, vm.context, vm.context.canvas.width * this.options.zoom.value, vm.context.canvas.height * this.options.zoom.value, this.reader, this.options);
            }
            vm.initialPageReloadFlag = false;
        };

        vm.zoomLevelOptions = [
            { name: vm.translateService.instant('FitToView'), id: 1 },
            { name: '100%', id: 1 },
            { name: '150%', id: 5 },
            { name: '200%', id: 10 },
            { name: '250%', id: 15 },
            { name: '300%', id: 20 },
            { name: '350%', id: 25 },
            { name: '400%', id: 30 }
        ];

        this.openCase = () => {
            this.visible = true;
            this.caseId = vm.case.caseId;
            setTimeout(() => this.visibleAnimate = true);
            this.isFooterVisible = true;
        };

        vm.onColorTypeChange = (event: any) => {
            if (event.value) {
                vm.selectedItem = event.value;
                vm.options.colorReset.name = event.value.name;
                vm.options.colorReset.content = event.value.content;
                vm.imageService.appLyColorPresets(this.picPos, event.value.name.toLowerCase(), vm.context, vm.context.canvas.width * this.options.zoom.value, vm.context.canvas.height * this.options.zoom.value, this.reader, this.options);
                vm.registerImageEffects(effectType.ColorPreset, vm.options.colorReset, vm.options.colorReset.name);
            } else {
                vm.selectedItem = null;
                vm.options.colorReset.name = null;
                vm.options.colorReset.content = null;
                vm.imageService.appLyColorPresets(this.picPos, null, vm.context, vm.context.canvas.width * this.options.zoom.value, vm.context.canvas.height * this.options.zoom.value, this.reader, this.options);
                vm.registerImageEffects(effectType.ColorPreset, vm.options.colorReset, vm.options.colorReset.name);
            }

        };

        vm.resetEffectValues = () => {
            vm.imageService.resetDetails();
            vm.emitOnEffectChange = false;
            vm.presetCount = 0;

            vm.toggleDiscriminationSwitchButtonFlag = false;
            vm.brightnessLevel = 50;
            vm.contrastLevel = 50;
            vm.options.brightness.value = 0;
            vm.options.brightness.apply = false;
            vm.options.contrast.value = 0;
            vm.options.contrast.apply = false;
            vm.imageViewerHemd.nativeElement.style.visibility = 'hidden';
            this.hemdImageLoader = false;
            vm.setDefaultValues();
        };
        vm.getDiscriminationSwitchState = (flag: boolean) => {
            vm.toggleDiscriminationSwitchButtonFlag = flag;
            if (flag) {
                if (!vm.toggleColorListDropDownFlag) {
                    vm.toggleColorList(1);
                    vm.initialPageReloadFlag = true;
                }
                this.hemdReaderService = new ImageReaderService();
                vm.imageViewerHemd.nativeElement.style.visibility = 'visible';
                if (!this.hemdImageLoader) {
                    this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: true, type: spinnerType.small };
                    this.analyzerService.getImageByScanId(this.descrimination.scanFolder, this.descrimination.scanImageId, this.descrimination.fileType).subscribe((response) => {
                        let result = response.blob();
                        this.hemdReader = this.hemdReaderService.createReader(result.type, result).create(result, this.hemdOptions, this.onHemdLoadedData);
                        this.imageService.applyTransform(this.contextHemd, this.hemdReader, this.hemdOptions, this.overlays, this.picPos, false);
                        this.hemdImageLoader = true;
                        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                    }, (error: IResponse<any>) => {
                        vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                    });
                }
            } else {
                this.imageViewerHemd.nativeElement.style.visibility = 'hidden';
            }
            vm.messageService.setPageChange(action.imageEdit, true);
        };
        vm.findImageEffects = (effectList: IImageEffects[], effectType: effectType) => {
            let effectListLength = effectList.length;
            let foundIndex = -1;
            let i = 0;
            for (; i < effectListLength; i++) {
                if (effectList[i].effectType === effectType) {
                    foundIndex = i;
                    break;
                } else {
                    continue;
                }
            }
            return foundIndex;
        };

        /**
         * Register effects.
         * Update the effects if they exist else add a new effect.
         */
        vm.registerImageEffects = (actionType: effectType, effect: any, value: any) => {
            let order: number = 0;
            if (vm.changedImageView.effects) {
                order = vm.changedImageView.effects.length;
            } else {
                vm.changedImageView.effects = [];
            }

            let effectOccurance: number = vm.findImageEffects(vm.changedImageView.effects, actionType);

            var effects: IImageEffects = {
                effectType: 0,
                effectValue: [],
                order: 0
            };
            switch (actionType) {
                case effectType.Zoom:
                    effects.effectType = effectType.Zoom;
                    effects.effectValue.push({ propertyName: 'Direction', propertyValue: effect.toString() });
                    effects.effectValue.push({ propertyName: 'ZoomValue', propertyValue: vm.options.zoom.value.toString() });
                    effects.order = order;
                    break;

                case effectType.Brightness:
                    effects.effectType = effectType.Brightness;
                    effects.effectValue.push({ propertyName: 'BrightnessValue', propertyValue: value.toString() });
                    effects.order = order;
                    break;

                case effectType.Contrast:
                    effects.effectType = effectType.Contrast;
                    effects.effectValue.push({ propertyName: 'ContrastValue', propertyValue: value.toString() });
                    effects.order = order;
                    break;

                case effectType.ColorPreset:
                    effects.effectType = effectType.ColorPreset;
                    effects.effectValue.push({ propertyName: 'ColorPresetConfig', propertyValue: JSON.stringify(effect) });
                    effects.effectValue.push({ propertyName: 'ColorPresetValue', propertyValue: vm.toggleColorListDropDownFlag });
                    effects.order = order;
                    break;
            }

            if (effectOccurance > -1) {
                vm.changedImageView.effects[effectOccurance] = effects;
            } else {
                vm.changedImageView.effects.push(effects);
            }

            if (!vm.viewMode) {
                vm.messageService.setPageChange(action.imageEdit, true);
            }
        };

        vm.toggleBottomPanel = () => {
            vm.toggleBottomPanelFlag = !vm.toggleBottomPanelFlag;
        };

        vm.caseDetailsClick = () => {
            if (!this.viewMode) {
                vm.isRightPanelVisible = true;
                vm.setTopbarActions();
                if (window.outerWidth <= 1024) {
                    this.isMenuClose = true;
                }
            } else {
                if (vm.storageService.getItem('selectedApp') === applicationName.ControlCenter) {
                    this.storageService.setItem('IsFromIA', true);
                    this.router.navigate(['DecisionCentre', { case: vm.case.caseId, type: 'detail' }]);
                }
                else {
                    this.storageService.setItem('IsFromIA', true);
                    this.router.navigate(['Inspection', { case: vm.case.caseId, type: 'detail' }]);
                }
            }
        };

        vm.setTopbarActions = () => {
            vm.imageActionOptions = [];
            vm.imageTopButtonOptions = [];
            if (vm.isRightPanelVisible) {
                vm.isCaseButtonsVisible = false;
                vm.imageActionOptions = [
                    { name: vm.translateService.instant('ActionsVerdict'), id: caseStatus.Noop },
                    { name: vm.translateService.instant('ClearVerdict'), id: caseStatus.Cleared },
                    { name: vm.translateService.instant('SuspectVerdict'), id: caseStatus.Suspect },
                    { name: vm.translateService.instant('InspectVerdict'), id: caseStatus.InspectionRequested },
                    { name: vm.translateService.instant('RequestReAssessmentVerdict'), id: caseStatus.AwaitingReAssessment },
                    { name: vm.translateService.instant('RequestReScanVerdict'), id: caseStatus.ReScanRequested }
                ];
                vm.selectedOption = vm.imageActionOptions[0];
                vm.imageTopButtonOptions = [
                    { name: vm.translateService.instant('CaseDetails'), id: 1, value: -1 },
                    { name: vm.translateService.instant('Findings'), id: 2, value: vm.findingsCount },
                    { name: vm.translateService.instant('CaseTimeline'), id: 3, value: -1 }
                ];
                vm.selectedTopButtonOption = vm.imageTopButtonOptions[1];
            }
            else {
                vm.isCaseButtonsVisible = true;
                vm.imageActionOptions = [
                    { name: vm.translateService.instant('Clear'), id: caseStatus.Cleared },
                    { name: vm.translateService.instant('suspect'), id: caseStatus.Suspect },
                    { name: vm.translateService.instant('InspectVerdict'), id: caseStatus.InspectionRequested },
                    { name: vm.translateService.instant('RequestReAssessmentVerdict'), id: caseStatus.AwaitingReAssessment },
                    { name: vm.translateService.instant('RequestReScanVerdict'), id: caseStatus.ReScanRequested }
                ];
                vm.selectedOption = vm.imageActionOptions[0];
            }
        };

        vm.onImageTopButtonOptionChange = (event: IKeyValue) => {
            switch (event.id) {
                case 1:
                    break;
                case 2:
                    vm.caseDetailsClick();
                    break;
                case 3:
                case 4:
                    break;
            }
        };
        vm.getImageAnalyzerMetadata = () => {
            vm.analyzerService.fetchImageAnalyzerMetaData().subscribe(result => {
                if (result.status === responseStatus.Success) {
                    vm.metadataImages = result.data;
                }
            });
        };



        vm.selectedZoomOption = vm.zoomLevelOptions[0];
        vm.setDefaultValues = () => {
            vm.options = {
                ctx: null,
                adsrc: null,
                zoom: {
                    value: 1.0,
                    step: 0.1,
                    min: 1,
                    max: 4
                },
                brightness: {
                    value: 0,
                    step: 1,
                    min: 1,
                    max: 100,
                    apply: false
                },
                contrast: {
                    value: 0,
                    step: 1,
                    min: 1,
                    max: 100,
                    apply: false
                },
                colorReset: {
                    name: '',
                    content: ''
                },
                rotate: {
                    value: 0,
                    step: 90
                },
                controls: {
                    toolbar: true,
                    image: true,
                    sound: false,
                    fit: 'page',
                    disableZoom: false,
                    disableMove: false,
                    disableRotate: false,
                    numPage: 1,
                    totalPage: 1,
                    filmStrip: false,
                    enableOverlay: false
                },
                info: {}
            };
            vm.curPos = { x: 0, y: 0 };
            vm.picPos = { x: 0, y: 0 };
            vm.dragStart = { x: 0, y: 0 };
            vm.mousePos = { x: 0, y: 0 };
            vm.maxPosition = { x: 0, y: 0, startX: 0, startY: 0, rightX: 0, rightY: 0 };
            vm.distanceMoved = { x: 0, y: 0 };

            vm.changeStateStore = {
                previousvalue: 1,
                currentValue: 1
            };
            if (vm.selectedImageView && vm.selectedImageView.isOriginal != undefined && !vm.selectedImageView.isOriginal) {
                vm.selectedZoomOption = vm.zoomLevelOptions[0];
                vm.onZoomSelectionChange(vm.selectedZoomOption, false, false);
            }
            if (vm.changedImageView) {
                if (vm.selectedImageView.effects) {
                    vm.changedImageView.effects = vm.selectedImageView.effects;
                }
                else {
                    vm.changedImageView.effects = [];
                }
            }
            vm.messageService.resetPageChange();
        };

        vm.onZoomSelectionChange = (event, isRestoreImage: boolean, isZoomApply: boolean) => {
            let direction = 0;
            if (event.id) {
                this.changeStateStore.currentValue = event.id;
                if (this.changeStateStore.previousvalue < this.changeStateStore.currentValue) {
                    if (this.changeStateStore.currentValue === 1) {
                        direction = this.changeStateStore.currentValue - this.changeStateStore.previousvalue - 1;
                    }
                    else {
                        if (this.changeStateStore.previousvalue === 1) {
                            direction = this.changeStateStore.currentValue - this.changeStateStore.previousvalue + 1;
                        }
                        else {
                            direction = this.changeStateStore.currentValue - this.changeStateStore.previousvalue;

                        }
                    }
                }
                else if (this.changeStateStore.previousvalue > this.changeStateStore.currentValue) {
                    if (this.changeStateStore.currentValue === 1) {
                        direction = this.changeStateStore.currentValue - this.changeStateStore.previousvalue - 1;
                    }
                    else {
                        direction = this.changeStateStore.currentValue - this.changeStateStore.previousvalue;
                    }
                }
                if (direction !== 0) {
                    vm.zoom(direction, isRestoreImage, false);
                }

                this.changeStateStore.previousvalue = event.id;
                vm.messageService.setPageChange(action.imageEdit, isZoomApply);
            }
        };

        vm.imageActionOptions = [
            { name: vm.translateService.instant('Clear'), id: caseStatus.Cleared },
            { name: vm.translateService.instant('suspect'), id: caseStatus.Suspect },
            { name: vm.translateService.instant('InspectVerdict'), id: caseStatus.InspectionRequested },
            { name: vm.translateService.instant('RequestReAssessmentVerdict'), id: caseStatus.AwaitingReAssessment },
            { name: vm.translateService.instant('RequestReScanVerdict'), id: caseStatus.ReScanRequested },

        ];

        vm.selectedOption = vm.imageActionOptions[0];
        vm.caseButtonTypes = caseButtonTypes;

        vm.getSaveButtonStatus = () => {
            var status = vm.messageService.getPageChange(action.imageEdit);
            if (vm.selectedImageView && vm.selectedImageView.isOriginal || !status) {
                return true;
            }
            else {
                return false;
            }
        };

        vm.addZoomEffects = (direction: number) => {
            vm.registerImageEffects(effectType.Zoom, direction, 0);
        };

        vm.getSaveAsButtonStatus = () => {
            var status = vm.messageService.getPageChange(action.imageEdit);
            if (vm.viewList.length === 7 || !status) {
                return true;
            }
            else {
                return false;
            }
        };

        vm.getViewName = () => {
            let count = vm.viewList.filter(x => x.viewType === vm.changedImageView.viewType && !x.isOriginal).length;
            let viewName = '';
            switch (vm.changedImageView.viewType) {
                case viewType.LeftorRight:
                case viewType.Left:
                    viewName = 'Side';
                    break;
                case viewType.Top:
                case viewType.ToporBottom:
                    viewName = 'Top';
                    break;
                default:
                    viewName = 'Side';
                    break;
            }
            return 'Saved View 00' + (count + 1) + '(' + viewName + ')';
        };

        vm.imageSaveClick = () => {
            if (vm.changedImageView && vm.changedImageView.isOriginal) {
                // save as new view
                vm.imageSaveAsClick();
            }
            else if (vm.changedImageView && !vm.changedImageView.isOriginal) {
                // update view
                vm.analyzerService.updateView(vm.case.caseId, vm.changedImageView).subscribe((result) => {
                    if (result.status === responseStatus.Success) {
                        vm.changedImageView.viewId = result.data.viewId;
                        vm.changedImageView.effects = result.data.effects;
                    }
                }, (error: IResponse<any>) => {
                    vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                });
            }

            this.messageService.resetPageChange();

        };

        vm.imageSaveAsClick = () => {
            if (vm.viewList.length !== 7) {
                if (vm.changedImageView) {
                    let viewName = vm.getViewName();
                    let newView: IImageView = {
                        name: viewName,
                        viewType: vm.changedImageView.viewType,
                        effects: vm.changedImageView.effects
                    };

                    vm.analyzerService.createView(vm.case.caseId, newView).subscribe((result) => {
                        if (result.status === responseStatus.Success) {
                            newView.viewId = result.data.viewId;
                            newView.effects = result.data.effects;
                            newView.isOriginal = false;
                            vm.viewList.push(newView);
                            vm.selectedImageView = vm.viewList[vm.viewList.length - 1];
                            vm.changedImageView = {
                                viewId: vm.selectedImageView.viewId, name: vm.selectedImageView.name, viewType: vm.selectedImageView.viewType,
                                effects: vm.selectedImageView.effects, isOriginal: vm.selectedImageView.isOriginal
                            };
                            for (let i = 0; i < vm.viewList.length; i++) {
                                vm.viewList[i].isSelected = false;
                                if (vm.viewList[i].name === vm.changedImageView.name) {
                                    vm.viewList[i].isSelected = true;
                                }
                            }
                        }
                    }, (error: IResponse<any>) => {
                        vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                    });
                }
            }
            this.messageService.resetPageChange();
        };
        vm.onViewClick = (view: IImageView) => {
            //don't process further when the user clicks on the same view again
            if (view.name === vm.selectedImageView.name) {
                return;
            }
            if (!this.viewMode && vm.messageService.showLeaveMessage(action.imageViewClick)) {
                vm.newImageView = view;
                vm.messageService.LeaveMessage = { key: 'Image Analyzer', showMessage: true, type: action.imageViewClick, message: 'ImageSaveMessage' };
            }
            else {
                vm.viewClick(view);
                let index = vm.imageViews.findIndex(x => x.id === view.viewType);
                vm.selectedView = vm.imageViews[index];
            }
        };

        function showSelectedView() {
            if (vm.selectedImageView) {
                if (!vm.selectedImageView.effects) {
                    vm.selectedImageView.effects = [];
                }
                vm.changedImageView = {
                    viewId: vm.selectedImageView.viewId, name: vm.selectedImageView.name, viewType: vm.selectedImageView.viewType,
                    effects: vm.selectedImageView.effects, isOriginal: vm.selectedImageView.isOriginal
                };
                if (vm.selectedImageView && !vm.selectedImageView.isOriginal) {
                    //  vm.setDefaultValues();
                }
                for (let i = 0; i < vm.viewList.length; i++) {
                    vm.viewList[i].isSelected = false;
                    if (vm.viewList[i].name === vm.changedImageView.name) {
                        vm.viewList[i].isSelected = true;
                        // break;
                    }
                }
                vm.originalImageRestore.emit({ ImageViewProp: vm.selectedImageView, callback: applyChangesOnOriginalImageLoad });
                vm.messageService.resetPageChange();
                vm.selectedZoomOption = vm.zoomLevelOptions[0];
                vm.onZoomSelectionChange(vm.selectedZoomOption, false, false);
            }

        }

        function applyChangesOnOriginalImageLoad() {
            if (vm.selectedImageView && !vm.selectedImageView.isOriginal) {
                vm.setImageManupulationValues(vm.selectedImageView.effects, false);
            }
            else {
                vm.zoom(vm.zoomLevelOptions[0].id, true, false);
            }
        }
        vm.viewClick = (view: IImageView) => {
            vm.resetEffectValues();
            vm.selectedImageView = view;
            if (!vm.toggleColorListDropDownFlag) {
                // vm.toggleColorList(1);
                vm.initialPageReloadFlag = true;
            }
            if (this.changedImageView && this.changedImageView.isOriginal) {
                this.changedImageView.effects = [];
            }
            else {
                if (this.changedImageView && !this.changedImageView.effects) {
                    this.changedImageView.effects = [];
                }
            }
            if (vm.selectedImageView && !vm.selectedImageView.isOriginal) {
                vm.analyzerService.getViewDetailByViewId(vm.case.caseId, vm.selectedImageView.viewId).subscribe(result => {
                    if (result.status === responseStatus.Success) {
                        vm.selectedImageView.effects = result.data.effects;
                        showSelectedView();
                    }
                });
            }
            else {
                showSelectedView();
            }

        };

        vm.onLeaveMessageClick = (status: messageResponseType) => {
            if (status === messageResponseType.NoPopupShown) {
                // save image
                vm.saveImageOnLeavemessage();
            }
            else if (status === messageResponseType.PopupShown) {
                // show original image
                vm.ShowOriginalImageOnLeavemessage();
            }
            this.messageService.resetPageChange();
        };

        vm.saveImageOnLeavemessage = () => {
            vm.imageSaveAsClick();
        };

        vm.ShowOriginalImageOnLeavemessage = () => {
            if (vm.selectedImageView.isOriginal) {

                vm.selectedImageView.effects = [];
                if (this.changedImageView.effects.length > 0) {
                    for (let i = 0; i < this.changedImageView.effects.length; i++) {
                        switch (this.changedImageView.effects[i].effectType) {
                            case effectType.Zoom:
                                let zoomValue = (+this.changedImageView.effects[i].effectValue[0].propertyValue) * (-1);
                                vm.zoom(zoomValue, true, false);
                                break;
                        }
                    }
                }

                this.changedImageView = {
                    viewId: this.selectedImageView.viewId, name: this.selectedImageView.name, viewType: this.selectedImageView.viewType,
                    effects: this.selectedImageView.effects, isOriginal: this.selectedImageView.isOriginal
                };

                vm.setDefaultValues();

            }
            else {
                vm.analyzerService.getViewDetailByViewId(vm.case.caseId, vm.selectedImageView.viewId).subscribe(result => {
                    if (result.status === responseStatus.Success) {
                        vm.selectedImageView.effects = [];
                        if (this.changedImageView.effects.length > 0) {
                            for (let i = 0; i < this.changedImageView.effects.length; i++) {
                                switch (this.changedImageView.effects[i].effectType) {
                                    case effectType.Zoom:
                                        let zoomValue = (+this.changedImageView.effects[i].effectValue[0].propertyValue) * (-1);
                                        vm.zoom(zoomValue, true, false);
                                        break;
                                }
                            }
                        }
                        vm.selectedImageView.effects = result.data.effects;
                        this.changedImageView = {
                            viewId: this.selectedImageView.viewId, name: this.selectedImageView.name, viewType: this.selectedImageView.viewType,
                            effects: this.selectedImageView.effects, isOriginal: this.selectedImageView.isOriginal
                        };
                        if (this.selectedImageView && !this.selectedImageView.isOriginal) {
                            vm.setImageManupulationValues(vm.selectedImageView.effects, false);
                        }
                    }
                });
            }

            vm.messageService.resetPageChange();
        };

        /**
         * Use property value of effects array to implement on image
         */
        vm.setImageManupulationValues = (effects: IImageEffects[], isViewLoad: boolean) => {
            vm.setDefaultValues();
            if (effects) {
                effects.sort(function (val1, val2) {
                    return +val1.order - +val2.order;
                });
                if (effects.length > 0) {
                    for (let i = 0; i < effects.length; i++) {
                        switch (effects[i].effectType) {
                            case effectType.Zoom:
                                let savedDirection = +effects[i].effectValue[0].propertyValue;
                                vm.zoom(savedDirection, true, false);
                                if (vm.selectedImageView.isOriginal) {
                                    this.changeStateStore.previousvalue = 0;
                                } else {
                                    this.changeStateStore.previousvalue = this.changeStateStore.currentValue;
                                }
                                this.changeStateStore.currentValue = savedDirection;
                                let selZoom;
                                if (vm.options.zoom.value === 1) {

                                    selZoom = { name: vm.fitToView, id: 1 };
                                } else {
                                    let zoomValue = (vm.options.zoom.value * 100) + '%';
                                    selZoom = vm.zoomLevelOptions.find(x => x.name === zoomValue);
                                }

                                if (selZoom) {
                                    vm.selectedZoomOption = selZoom;
                                    vm.onZoomSelectionChange(vm.selectedZoomOption, true, false);
                                }
                                else {
                                    vm.onZoomSelectionChange({ id: vm.options.zoom.value }, true, false);
                                }
                                break;

                            case effectType.Brightness:
                                vm.brightnessLevel = +effects[i].effectValue[0].propertyValue;
                                vm.options.brightness.value = vm.brightnessLevel - 50;
                                vm.options.brightness.apply = true;
                                vm.imageService.applyTransform(vm.context, vm.reader, vm.options, vm.overlays, vm.picPos, true);
                                break;

                            case effectType.Contrast:
                                vm.contrastLevel = +effects[i].effectValue[0].propertyValue;
                                vm.options.contrast.value = vm.contrastLevel - 50;
                                vm.options.contrast.apply = true;

                                vm.imageService.applyTransform(vm.context, vm.reader, vm.options, vm.overlays, vm.picPos, true);
                                break;

                            case effectType.ColorPreset:
                                //comparing it with 'true' (string) as the boolean are typecasted to string in response
                                vm.toggleColorListDropDownFlag = effects[i].effectValue[1].propertyValue === 'true';
                                //parsing the stringified value
                                let effectProp = JSON.parse(effects[i].effectValue[0].propertyValue);
                                vm.selectedItem = effectProp;
                                if (vm.selectedItem && vm.selectedItem['name'] && vm.selectedItem['content']) {
                                    vm.imageService.appLyColorPresets(this.picPos, effectProp.name.toLowerCase(), vm.context, vm.context.canvas.width * this.options.zoom.value, vm.context.canvas.height * this.options.zoom.value, this.reader, this.options);
                                } else {
                                    vm.imageService.appLyColorPresets(this.picPos, null, vm.context, vm.context.canvas.width * this.options.zoom.value, vm.context.canvas.height * this.options.zoom.value, this.reader, this.options);
                                }

                                break;

                        }
                    }
                } else {
                    vm.zoom(0, true, false);
                }
            }
            vm.changedImageView.effects = [];
        };

        vm.messageService.OperationGoAhead.subscribe(item => {
            if (item && item.operationAllowed && item.from === action.imageVerdictSelectClick) {
                // save image functionlaity

                vm.selectedOption = vm.imageActionOptions[0];
                vm.messageService.resetPageChange();
            }
            else if (item && item.from === action.imageVerdictSelectClick) {
                // show the original image
                vm.ShowOriginalImageOnLeavemessage();
                vm.messageService.resetPageChange();
                vm.imageActionOptionChange(vm.selectedVerdictAction);
            }
            else if (item && item.operationAllowed && item.from === action.imageViewClick) {
                this.messageService.resetPageChange();
                vm.imageSaveAsClick();
            }
            else if (item && item.from === action.imageViewClick) {
                this.messageService.resetPageChange();
                vm.viewClick(vm.newImageView);
            }
        });

        vm.onImageActionOptionChange = (event: IKeyValue) => {
            if (this.messageService.showLeaveMessage(action.imageVerdictSelectClick)) {
                this.selectedVerdictAction = event;
                this.messageService.LeaveMessage = { key: 'Image Analyser', showMessage: true, type: action.imageVerdictSelectClick, message: 'ImageSaveMessage' };
            }
            else {
                vm.imageActionOptionChange(event);
            }
        };
        vm.caseInfoAction = (event: IKeyValue) => {
            if (event.id === 1) {
                vm.caseDetailsClick();
            }
            if (event.id === 3) {
                vm.openCase();
            }
            // Fix me: Need to add rest of the actions
        };
        function processClickOperation(actionType: number, event) {
            switch (actionType) {
                case caseStatus.Cleared:
                    vm.analysisPayload.comment = event.result;
                    vm.analysisPayload.caseId = [vm.generatedCaseId[0]];
                    vm.analysisPayload.assessment = assessmentTypes.Image;
                    vm.analysisPayload.result = assessmentResults.NotFound;
                    vm.analysisPayload.inspectionType = inspectionType.None;
                    vm.analysisPayload.source = verdictSources.Analyzer;
                    vm.analysisPayload.status = caseStatus.Cleared;
                    break;

                case caseStatus.Suspect:
                    vm.analysisPayload.comment = event.result;
                    vm.analysisPayload.caseId = [vm.generatedCaseId[0]];
                    vm.analysisPayload.assessment = assessmentTypes.Image;
                    vm.analysisPayload.result = assessmentResults.Found;
                    vm.analysisPayload.inspectionType = inspectionType.None;
                    vm.analysisPayload.source = verdictSources.Analyzer;
                    vm.analysisPayload.status = caseStatus.Suspect;
                    break;

                case caseStatus.InspectionRequested:
                    vm.analysisPayload.comment = event.result;
                    vm.analysisPayload.caseId = [vm.generatedCaseId[0]];
                    vm.analysisPayload.assessment = assessmentTypes.Image;
                    vm.analysisPayload.result = assessmentResults.Inconclusive;
                    vm.analysisPayload.inspectionType = inspectionType.None;
                    vm.analysisPayload.source = verdictSources.Analyzer;
                    vm.analysisPayload.status = caseStatus.InspectionRequested;
                    break;

                case caseStatus.AwaitingReAssessment:
                    vm.analysisPayload.comment = event.result;
                    vm.analysisPayload.caseId = [vm.generatedCaseId[0]];
                    vm.analysisPayload.assessment = assessmentTypes.Image;
                    vm.analysisPayload.result = assessmentResults.Inconclusive;
                    vm.analysisPayload.inspectionType = inspectionType.None;
                    vm.analysisPayload.source = verdictSources.Analyzer;
                    vm.analysisPayload.status = caseStatus.AwaitingReAssessment;
                    break;
                case caseStatus.ReScanRequested:
                    vm.analysisPayload.comment = event.result;
                    vm.analysisPayload.caseId = [vm.generatedCaseId[0]];
                    vm.analysisPayload.assessment = assessmentTypes.Image;
                    vm.analysisPayload.result = assessmentResults.Inconclusive;
                    vm.analysisPayload.inspectionType = inspectionType.None;
                    vm.analysisPayload.source = verdictSources.Analyzer;
                    vm.analysisPayload.status = caseStatus.ReScanRequested;
                    break;
            }
        }
        vm.onClearCasePopUpClick = (event: ICustomMessageResponse<string>) => {

            if (event.status === messageResponseType.Yes) {
                processClickOperation(caseStatus.Cleared, event);
                vm.caseAnalysisService.putCaseAnalysis(vm.analysisPayload).takeUntil(vm.ngUnsubscribe).subscribe((result) => {
                    this.toggleColorListDropDownFlag = true;
                    vm.refreshPage.emit();
                }, (error: IResponse<any>) => {
                    vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                });
            }
        };
        vm.onSuspectCasePopUpClick = (event: ICustomMessageResponse<string>) => {
            if (event.status === messageResponseType.Yes) {
                processClickOperation(caseStatus.Suspect, event);
                vm.caseAnalysisService.putCaseAnalysis(vm.analysisPayload).takeUntil(vm.ngUnsubscribe).subscribe((result) => {
                    vm.selectedItem = [vm.imageService.colorPresetList[0]];
                    vm.refreshPage.emit();
                }, (error: IResponse<any>) => {
                    vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                });
                this.resetMarkAreaControl();
            }
        };

        vm.backToInspection = () => {
            let navTo = vm.storageService.getItem('appName');
            this.router.navigate([navTo, { case: vm.case.caseId }]);
        };
        vm.backToVerdict = () => {
            this.caseVerdict.show();
        };

        vm.onInspectCallback = (event: ICustomMessageResponse<string>) => {
            if (event.status === messageResponseType.Yes) {
                vm.isRightPanelVisible = false;
                vm.isCaseButtonsVisible = true;
                vm.isActionsDisabled = true;
                vm.payLoad.cases[0].caseId = vm.generatedCaseId[0];
                vm.payLoad.status = CaseButtonStatusCode.InspectionRequested;
                vm.payLoad.reason = reasonType.StatusChange;
                vm.payLoad.notes = '';

                vm.caseService.updateCases(vm.payLoad).subscribe((result) => {
                    processClickOperation(caseStatus.InspectionRequested, event);
                    vm.caseAnalysisService.putCaseAnalysis(vm.analysisPayload).takeUntil(vm.ngUnsubscribe).subscribe((result) => {
                        vm.selectedItem = [vm.imageService.colorPresetList[0]];
                        vm.refreshPage.emit();
                        vm.isActionsDisabled = false;
                    }, (error: IResponse<any>) => {
                        vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                        vm.isActionsDisabled = false;
                    });
                }, (error: IResponse<any>) => {
                    vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                    vm.isActionsDisabled = false;
                });
                this.resetMarkAreaControl();

            }

            vm.inspectionCallBackPopUp.hide();

        };

        vm.onRequestAssessmentCallback = (event: ICustomMessageResponse<string>) => {
            if (event.status === messageResponseType.Yes) {
                vm.isRightPanelVisible = false;
                vm.isCaseButtonsVisible = true;
                vm.isActionsDisabled = true;
                vm.payLoad.cases[0].caseId = vm.generatedCaseId[0];
                vm.payLoad.status = CaseButtonStatusCode.AwaitingReAssessment;
                vm.payLoad.reason = reasonType.StatusChange;
                vm.payLoad.notes = '';

                vm.caseService.updateCases(vm.payLoad).takeUntil(vm.ngUnsubscribe).subscribe((result) => {
                    processClickOperation(caseStatus.AwaitingReAssessment, event);
                    vm.caseAnalysisService.putCaseAnalysis(vm.analysisPayload).takeUntil(vm.ngUnsubscribe).subscribe((result) => {
                        vm.selectedItem = [vm.imageService.colorPresetList[0]];
                        vm.refreshPage.emit();
                        vm.isActionsDisabled = false;
                    }, (error: IResponse<any>) => {
                        vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                        vm.isActionsDisabled = false;
                    });
                }, (error: IResponse<any>) => {
                    vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                    vm.isActionsDisabled = false;
                });
                this.resetMarkAreaControl();
            }

            vm.requestAssessmentPopUp.hide();

        };

        vm.onClearCallback = (event: ICustomMessageResponse<string>) => {
            if (event.status === messageResponseType.Yes) {
                vm.isRightPanelVisible = false;
                vm.isCaseButtonsVisible = true;
                vm.isActionsDisabled = true;
                vm.payLoad.cases[0].caseId = vm.generatedCaseId[0];
                vm.payLoad.status = CaseButtonStatusCode.ClearOnImage;
                vm.payLoad.reason = reasonType.StatusChange;
                vm.payLoad.notes = '';

                vm.caseService.updateCases(vm.payLoad).takeUntil(vm.ngUnsubscribe).subscribe((result) => {
                    processClickOperation(caseStatus.Cleared, event);
                    vm.caseAnalysisService.putCaseAnalysis(vm.analysisPayload).takeUntil(vm.ngUnsubscribe).subscribe((result) => {
                        vm.selectedItem = [vm.imageService.colorPresetList[0]];
                        vm.refreshPage.emit();
                        vm.isActionsDisabled = false;
                    }, (error: IResponse<any>) => {
                        vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                        vm.isActionsDisabled = false;
                    });
                }, (error: IResponse<any>) => {
                    vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                    vm.isActionsDisabled = false;
                });
                this.resetMarkAreaControl();
            }

            vm.modalCaseImagePopup.hide();
        };

        vm.onSuspectCallback = (event: ICustomMessageResponse<string>) => {
            if (event.status === messageResponseType.Yes) {
                vm.isRightPanelVisible = false;
                vm.isCaseButtonsVisible = true;
                vm.isActionsDisabled = true;
                vm.payLoad.cases[0].caseId = vm.generatedCaseId[0];
                vm.payLoad.status = CaseButtonStatusCode.SuspectOnImage;
                vm.payLoad.reason = reasonType.StatusChange;
                vm.payLoad.notes = '';

                vm.caseService.updateCases(vm.payLoad).takeUntil(vm.ngUnsubscribe).subscribe((result) => {
                    processClickOperation(caseStatus.Suspect, event);
                    vm.caseAnalysisService.putCaseAnalysis(vm.analysisPayload).takeUntil(vm.ngUnsubscribe).subscribe((result) => {
                        vm.selectedItem = [vm.imageService.colorPresetList[0]];
                        vm.refreshPage.emit();
                        vm.isActionsDisabled = false;
                    }, (error: IResponse<any>) => {
                        vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                        vm.isActionsDisabled = false;
                    });
                }, (error: IResponse<any>) => {
                    vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                    vm.isActionsDisabled = false;
                });
                this.resetMarkAreaControl();
            }

            vm.modalSuspectCaseImagePopup.hide();
        };
        vm.onReScanCallback = (event: ICustomMessageResponse<string>) => {
            if (event.status === messageResponseType.Yes) {
                vm.isRightPanelVisible = false;
                vm.isCaseButtonsVisible = true;
                vm.isActionsDisabled = true;
                vm.payLoad.cases[0].caseId = vm.generatedCaseId[0];
                vm.payLoad.status = CaseButtonStatusCode.ReScanRequest;
                vm.payLoad.reason = reasonType.StatusChange;
                vm.payLoad.notes = '';

                vm.caseService.updateCases(vm.payLoad).takeUntil(vm.ngUnsubscribe).subscribe((result) => {
                    processClickOperation(caseStatus.ReScanRequested, event);
                    vm.caseAnalysisService.putCaseAnalysis(vm.analysisPayload).takeUntil(vm.ngUnsubscribe).subscribe((result) => {
                        vm.selectedItem = [vm.imageService.colorPresetList[0]];
                        vm.refreshPage.emit();
                        vm.isActionsDisabled = false;
                    }, (error: IResponse<any>) => {
                        vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                        vm.isActionsDisabled = false;
                    });
                }, (error: IResponse<any>) => {
                    vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                    vm.isActionsDisabled = false;
                });
                this.resetMarkAreaControl();
            }

            vm.modalSuspectCaseImagePopup.hide();
        };

        vm.imageActionOptionChange = (event: IKeyValue) => {
            if (event.id === 11) {
                vm.inspectionCallBackPopUp.customContainerCSS = 'modal-generic modal-larger modal-warning';
                vm.inspectionCallBackPopUp.customCSS = 'modal-warning-header';
                vm.inspectionCallBackPopUp.show();
                vm.queryText = 'RequestCaseReInspection';
                vm.popUpButtonTitle = 'Inspect';
            } else if (event.id === 9) {
                vm.requestAssessmentPopUp.customContainerCSS = 'modal-generic modal-larger';
                vm.requestAssessmentPopUp.customCSS = 'modal-default-header';
                vm.requestAssessmentPopUp.show();
                vm.queryText = 'RequestCaseReAssess';
                vm.popUpButtonTitle = 'AwaitingReAssessment';
            } else if (event.id === 3) {
                vm.modalCaseImagePopup.customContainerCSS = 'modal-generic modal-larger modal-success';
                vm.modalCaseImagePopup.customCSS = 'modal-success-header';
                vm.modalCaseImagePopup.show();
                vm.queryText = 'ClearCase';
                vm.popUpButtonTitle = 'Clear';
            } else if (event.id === 14) {
                vm.modalSuspectCaseImagePopup.customContainerCSS = 'modal-generic modal-larger modal-error';
                vm.modalSuspectCaseImagePopup.customCSS = 'modal-error-header';
                vm.modalSuspectCaseImagePopup.show();
                vm.queryText = 'SuspectCaseId';
                vm.popUpButtonTitle = 'Suspect';
            }
            else if (event.id === 16) {
                //vm.reScanCallBackPopUp.customContainerCSS = 'modal-dialog';
                vm.reScanCallBackPopUp.show();
                vm.querydynamicId = this.generatedCaseId[0].toString();
                vm.queryText = this.translateService.instant('ReScanCaseId');
                vm.popUpButtonTitle = 'ReScan';
            }
        };
        vm.loadNextCaseClick = () => {
            vm.onloadNextCaseClick.emit(true);
            this.resetMarkAreaControl();
        };

        vm.onViewChange = (data: any) => {
            vm.selectedViewChange.emit(data);
        };



        vm.zoom = (direction, isRestoreImage: boolean, isRestoreStateStoreChange: boolean): void => {
            if (!this.scanFlag) {
                let findings = Object.assign([], this.imageFindings);
                // this.imageFindings = null;
                let reposition: IRePosition = { x: true, y: true };
                let oldZoom = this.options.zoom.value;
                if (vm.options && vm.reader) {
                    // this check is to avoid rendering image on reaching max/min zoom level
                    let newZoom = this.options.zoom.value + (this.options.zoom.step * direction);
                    if (oldZoom === newZoom) {
                        return;
                    }
                    vm.imageService.zoom(vm.context, vm.reader, vm.options, vm.overlays, vm.picPos, direction, findings, this.imageRulers, this.maxPosition, reposition, { x: this.marAreaWidth, y: this.marAreaHeight });

                    this.imageFindings = Object.assign([], findings);
                    if (this.options.zoom.value === this.options.zoom.min) {
                        this.maxPosition = {
                            x: this.context.canvas.offsetLeft, y: this.context.canvas.offsetTop, startX: this.context.canvas.offsetLeft,
                            startY: this.context.canvas.offsetTop, rightX: this.context.canvas.offsetLeft, rightY: this.context.canvas.offsetTop
                        };
                        this.picPos = { x: 0, y: 0 };
                    }
                }

                if (isRestoreStateStoreChange) {
                    this.changeStateStore.currentValue += direction;
                    if (this.changeStateStore.currentValue > 30) {
                        this.changeStateStore.currentValue = 30;
                    }
                    if (this.changeStateStore.currentValue < this.zoomLevelOptions[0].id) {
                        this.changeStateStore.currentValue = this.zoomLevelOptions[0].id;
                    }
                    this.changeStateStore.previousvalue = this.changeStateStore.currentValue;
                }

                if (reposition.x) {
                    this.maxPosition.lastDistanceX = this.maxPosition.x;
                }
                if (reposition.y) {
                    this.maxPosition.lastDistanceY = this.maxPosition.y;
                }

                this.adjustPan();
                vm.imageService.zoomMarks(this.reader, { x: this.marAreaWidth, y: this.marAreaHeight }, this.options, oldZoom, findings, this.picPos);
                vm.imageService.zoomRulers(this.reader, { x: this.marAreaWidth, y: this.marAreaHeight }, this.options, oldZoom, this.imageRulers, this.picPos);
                this.hemdOptions.zoom.value = (this.options.zoom) ? this.options.zoom.value : this.options.zoom.min;
                if (vm.toggleDiscriminationSwitchButtonFlag) {
                    this.imageService.applyTransform(this.contextHemd, this.hemdReader, this.hemdOptions, this.overlays, this.picPos, false, false);
                    if (this.contextHemd) {
                        this.contextHemd.globalAlpha = 0.6;
                    }
                }
                if (vm.changedImageView && !isRestoreImage) {
                    {
                        vm.addZoomEffects(direction);
                    }
                }
            }
        };


        vm.rotate = (direction) => {
            vm.imageService.rotate(vm.context, vm.reader, vm.options, vm.overlays, vm.picPos, direction);
            this.maxPosition.x = Math.abs(this.picPos.x);
            this.maxPosition.y = Math.abs(this.picPos.y);
            this.maxPosition.rightX = Math.abs(this.picPos.x);
            this.maxPosition.rightY = Math.abs(this.picPos.y);
        };

        vm.overLay = () => {
            vm.overlays = [{ x: 0, y: 0, w: vm.context.canvas.width, h: vm.context.canvas.height, color: '#00FF00' }];
            vm.imageService.overLay(vm.context, vm.reader, vm.options, vm.overlays, vm.picPos);
        };
        vm.sharpen = () => {
            this.options.sharpness.value += 10;
            vm.imageService.sharpen(vm.context, vm.context.canvas.width * this.options.zoom.value, vm.context.canvas.height * this.options.zoom.value, this.options.sharpness.value * 0.01, this.picPos);
        };

        vm.resizeTo = (value) => {
            this.maxPosition = {
                x: this.context.canvas.offsetLeft, y: this.context.canvas.offsetTop, startX: this.context.canvas.offsetLeft,
                startY: this.context.canvas.offsetTop, rightX: this.context.canvas.offsetLeft, rightY: this.context.canvas.offsetTop
            };
            vm.picPos = { x: 0, y: 0 };
            vm.options.zoom.value = 1;
            vm.imageService.resizeTo(vm.context, vm.reader, vm.options, vm.overlays, vm.picPos, value, this.marAreaWidth, this.marAreaHeight);
        };

        vm.annotate = () => {
            if (this.viewMode) {
                return;
            }
            if (!this.viewMode || this.editFinding) {
                vm.toAnnotate = !vm.toAnnotate;
                vm.pencilEnabled = vm.toAnnotate ? true : false;
                vm.rulerEnabled = false;
                vm.toRuler = false;
            }
        };

        vm.rulerDraw = () => {
            if (this.viewMode) {
                return;
            }
            if (!this.viewMode || this.editFinding) {
                vm.toRuler = !vm.toRuler;
                vm.pencilEnabled = false;
                vm.rulerEnabled = vm.toRuler ? true : false;
                vm.toAnnotate = false;
            }
        };
        vm.getSidePanelState = (status: boolean) => {
            vm.isMenuClose = status;
            if (!vm.isMenuClose && !this.viewMode) {
                this.panMarkDraw();
            }

        };

        vm.closeRightSidePanelState = (status: boolean) => {
            vm.isRightPanelVisible = status;
            vm.setTopbarActions();
            this.isMenuClose = false;
        };

        vm.onBrightnessChangeEvent = (event: number) => {
            vm.options.brightness.value = event - 50;
            vm.options.brightness.apply = true;
            vm.brightnessLevel = event;
            if (vm.presetCount === 2 || vm.presetCount === 0) {
                vm.imageService.doTransform = true;
                vm.imageService.applyTransform(vm.context, vm.reader, vm.options, vm.overlays, vm.picPos, true, false);
                vm.presetCount = 0;
            }
            if (vm.presetCount === 1) {
                vm.presetCount++;
            }
            vm.registerImageEffects(effectType.Brightness, vm.options.brightness.value, event);
            this.brightnessVal = vm.brightnessLevel;
            this.brigtnessContrassFlg = true;
        };

        vm.onContrastChangeEvent = (event: number) => {
            this.options.contrast.value = event - 50;
            vm.options.contrast.apply = true;
            vm.imageService.doTransform = true;
            vm.contrastLevel = event;
            if (vm.presetCount === 2 || vm.presetCount === 0) {
                vm.imageService.applyTransform(vm.context, vm.reader, vm.options, vm.overlays, vm.picPos, true, false);
                vm.presetCount = 0;
            }
            if (vm.presetCount === 1) {
                vm.presetCount++;
            }
            vm.registerImageEffects(effectType.Contrast, vm.options.contrast.value, event);
            this.contrastVal = vm.contrastLevel;
            this.brigtnessContrassFlg = true;
        };
        vm.presetChange = (brightness: number, contrast: number) => {
            this.brigtnessContrassFlg = true;
            this.brightnessVal = brightness;
            this.contrastVal = contrast;
            vm.presetCount = 1;
            vm.emitOnEffectChange = true;
            vm.options.contrast.apply = true;
            vm.options.brightness.apply = true;
            vm.brightnessLevel = this.brightnessVal;
            vm.contrastLevel = this.contrastVal;

        };
    }

    public ngOnChanges(changes: SimpleChanges): void {

        if (changes['case'] && changes['case']['currentValue']) {
            this.generatedCaseId = [changes['case']['currentValue']['caseId']];
        }

        if (changes['imagePath'] && changes['imagePath']['currentValue'] !== changes['imagePath']['previousValue']) {
            this.onChange();
        }
        if (this.selectorContext && changes['isNextButtonVisible'] && changes['isNextButtonVisible']['currentValue']) {
            this.selectorContext.clearRect(0, 0, this.selectorContext.canvas.width, this.selectorContext.canvas.height);
        }
        if (changes['imagePath'] && changes['imagePath']['firstChange']) {
            this.onChange();
        }

        if (changes['imageViews'] && !changes['imageViews']['firstChange']) {
            let selectedView = changes.selectedView.currentValue;
            let selectedViewId = this.imageViews.map(iView => iView.id).indexOf(selectedView.id);
            this.selectedView = this.imageViews[selectedViewId];
        }

        if (changes.selectedImageView && changes.selectedImageView.currentValue) {
            let selectedView = changes.selectedImageView.currentValue;
            this.selectedView = this.imageViews.find(x => x.id === selectedView.viewType);
        }
    }
    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
    showHideFindings() {
        this.showFindings = !this.showFindings;
    }
    showHideRulers() {
        this.showRulers = !this.showRulers;
    }
    onHemdLoadedData = () => {
        if (this.hemdReader.rendered) {
            this.imageService.applyTransform(this.contextHemd, this.hemdReader, this.hemdOptions, this.overlays, this.picPos, false);

            this.hemdImageLoader = true;
        }
    }
    onLoadedData = () => {
        if (this.reader == null) {
            return;
        }
        if (this.scanFlag) {
            // console.log(this.scan.scanId);
            this.selectedZoomOption = this.zoomLevelOptions[0];
        }
        this.resetEffectValues();
        this.resetMarkAreaControl();
        this.resetMarkArea = false;
        this.resetRulerArea = false;
        if (this.reader.rendered) {
            this.imageService.loadLuts();
            this.top = this.selectorContext.canvas.offsetTop;
            this.left = this.selectorContext.canvas.offsetLeft;
            this.mainLeft = 40; //TO DO Find how to get left and top starting position of canvas dynamically
            this.mainTop = 128;

            this.contextSize = { x: this.context.canvas.width, y: this.context.canvas.height };
            this.actualRatio = Math.min((window.innerWidth - this.mainLeft) / this.reader.width, (window.innerHeight - this.mainTop) / this.reader.height);
            this.marAreaWidth = this.actualRatio * this.reader.width;//window.innerWidth - this.mainLeft;
            this.marAreaHeight = this.actualRatio * this.reader.height;//window.innerHeight - this.mainTop;
            this.imageService.applyTransform(this.selectorContext, this.reader, this.selectorOptions, this.overLay, this.panPicPos, false);

            let actZoom = (this.actualRatio - 1) / this.options.zoom.step;
            this.zoomLevelOptions = [
                { name: this.fitToView, id: actZoom },
                { name: '100%', id: 1 },
                { name: '150%', id: 5 },
                { name: '200%', id: 10 },
                { name: '250%', id: 15 },
                { name: '300%', id: 20 },
                { name: '350%', id: 25 },
                { name: '400%', id: 30 }
            ];
            this.options.zoom.value += this.options.zoom.step * (actZoom);
            this.options.zoom.min = this.options.zoom.value;
            this.hemdOptions.zoom.min = this.options.zoom.min;
            this.hemdOptions.zoom.value = this.options.zoom.value;

            this.changeStateStore = {
                previousvalue: actZoom,
                currentValue: actZoom
            };
            this.imageService.applyTransform(this.context, this.reader, this.options, this.overLay, this.picPos, false);
            //console.log(actZoom, this.zoomLevelOptions);
            if (this.changedImageView && this.changedImageView.effects.length > 0) {
                if (this.selectedImageView && !this.selectedImageView.isOriginal) {
                    this.setImageManupulationValues(this.changedImageView.effects, false);
                }
            }
            if (this.selectedImageView) {
                this.changedImageView = {
                    viewId: this.selectedImageView.viewId, name: this.selectedImageView.name, viewType: this.selectedImageView.viewType,
                    effects: this.selectedImageView.effects, isOriginal: this.selectedImageView.isOriginal
                };
            }
            if (this.changedImageView) {
                if (this.changedImageView.isOriginal) {
                    this.changedImageView.effects = [];
                }
                else {
                    if (!this.changedImageView.effects) {
                        this.changedImageView.effects = [];
                    }
                }
            }
        } else {
            this.imageService.resizeTo(this.context, this.reader, this.options, this.overLay, this.picPos, this.options.controls.fit, this.marAreaWidth, this.marAreaHeight);
        }
        this.selMarkWidth = this.cropcanvas.nativeElement.offsetWidth;
        this.stampHeight = this.selMarkWidth / (this.marAreaWidth / this.marAreaHeight);
        this.selMarkHeight = this.stampHeight;

        this.zoomBounding = { width: this.selMarkWidth, height: this.selMarkHeight, left: 0, top: 0, bottom: 0, right: 0 };
        this.zoomMarks = [];
        let zoomMark: IMarkArea = { id: 1, width: this.selMarkWidth, height: this.selMarkHeight, left: 16, top: 0, displayButtons: false, zIndex: 100 };
        this.zoomMarks.push(zoomMark);
        this.canvasWidth = this.context.canvas.width;
        this.canvasHeight = this.context.canvas.height;
        this.maxPosition = {
            x: this.context.canvas.offsetLeft, y: this.context.canvas.offsetTop, startX: this.context.canvas.offsetLeft,
            startY: this.context.canvas.offsetTop, rightX: this.context.canvas.offsetLeft, rightY: this.context.canvas.offsetTop
        };
        if (this.case !== undefined && this.case !== null && this.selectedView !== undefined) {
            this.getExistingMarks(this.case);
        }
        //console.log(this.cropcanvas.nativeElement.offsetWidth, this.cropcanvas.nativeElement.offsetHeight, this.marAreaWidth , this.marAreaHeight);

        // Default zoom for new views if no zoom applied
        if (this.changedImageView) {
          this.addZoomEffects(1);
        }
        this.messageService.resetPageChange();
        this.showLoader.emit(false);
        /* setTimeout(() => {
            if (this.viewMode) {
                this.showRulers = false;
                this.showFindings = false;
            }
        }, 1000); */
    }

    onChange = () => {
        this.resetMarkAreaControl();
        this.picPos = { x: 0, y: 0 };
        this.panPicPos = { x: 0, y: 0 };
        this.imageService.doTransform = false;
        this.movedX = 0;
        this.movedY = 0;

        this.curPos = { x: 0, y: 0 };

        this.dragStart = { x: 0, y: 0 };
        this.options = {
            ctx: null,
            adsrc: null,
            zoom: {
                value: 1.0,
                step: 0.1,
                min: 1,
                max: 4
            },
            brightness: {
                value: 0,
                step: 1,
                min: 1,
                max: 100,
                apply: false
            },
            contrast: {
                value: 0,
                step: 1,
                min: 1,
                max: 100,
                apply: false
            },
            colorReset: {
                name: '',
                content: ''
            },
            rotate: {
                value: 0,
                step: 90
            },
            controls: {
                toolbar: true,
                image: true,
                sound: false,
                fit: 'page',
                disableZoom: false,
                disableMove: false,
                disableRotate: false,
                numPage: 1,
                totalPage: 1,
                filmStrip: false,
                enableOverlay: false
            },
            info: {}
        };
        this.selectorOptions = {
            ctx: null,
            adsrc: null,
            zoom: {
                value: 1.0,
                step: 0.1,
                min: 1,
                max: 4
            },
            brightness: {
                value: 0,
                step: 1,
                min: 1,
                max: 100
            },
            contrast: {
                value: 0,
                step: 1,
                min: 1,
                max: 100
            },
            colorReset: {
                name: '',
                content: ''
            },
            rotate: {
                value: 0,
                step: 90
            },
            controls: {
                toolbar: true,
                image: true,
                sound: false,
                fit: 'page',
                disableZoom: true,
                disableMove: true,
                disableRotate: true,
                numPage: 1,
                totalPage: 1,
                filmStrip: false,
                enableOverlay: false
            },
            info: {}
        };
        this.hemdOptions = Object.assign({}, this.selectorOptions);
        var canvas = this.imageViewer.nativeElement;
        this.context = canvas.getContext('2d');
        this.options.ctx = this.context;
        var selectorCanvas = this.cropcanvas.nativeElement;
        this.selectorContext = selectorCanvas.getContext('2d');
        this.options.ctx = this.context;
        var selectorCanvasSize = selectorCanvas.parentNode;
        this.selectorContext.canvas.width = selectorCanvasSize.clientWidth;
        this.selectorContext.canvas.height = selectorCanvasSize.clientHeight;
        this.selectorOptions.ctx = this.selectorContext;
        this.context.canvas.width = window.innerWidth;
        this.context.canvas.height = window.innerHeight;
        // HEMD
        if (this.imageViewerHemd) {
            var canvasHemd = this.imageViewerHemd.nativeElement;
            this.contextHemd = canvasHemd.getContext('2d');
            this.contextHemd.canvas.width = canvasHemd.parentNode.clientWidth;
            this.contextHemd.canvas.height = canvasHemd.parentNode.clientHeight;
            this.contextHemd.globalAlpha = 0.1;
        }

        if (this.imagePath && typeof (this.imagePath) === 'object') {
            if (this.imageReaderService.IsSupported(this.imagePath.type)) {
                this.reader = this.imageReaderService.createReader(this.imagePath.type, this.imagePath).create(this.imagePath, this.options, this.onLoadedData);
            }
        }
        else if (typeof (this.imagePath) === 'string') {
            var overImage = '';
            if (this.imageReaderService.createReader('', this.imagePath) !== null) {
                this.reader = this.imageReaderService.createReader('', this.imagePath).create(this.imagePath, this.options, this.onLoadedData, overImage);
            }
        } else {
            this.reader = '';
        }
        this.zoomMarks = [];
        let zoomMark: IMarkArea = { id: 1, width: this.selMarkWidth, height: this.selMarkHeight, left: this.left, top: this.top, displayButtons: false, zIndex: 100 };
        //console.log(zoomMark);
        this.zoomMarks.push(zoomMark);
    }
    isActionsDisabled: boolean = false;
    public updateButtonsEnableDisable(event: boolean) {
        this.isActionsDisabled = event ? true : false;
    }
    public disableRulerVisibleIcon(event: boolean) {
        if (event) {
            this.showRulers = false;
        }
    }
    public updateFindings(event: IFinding[]) {
        this.imageFindings = event;
        this.findingsCount = event.length;
        this.findingsExists = this.findingsCount > 0 ? true : false;
        let hiddenFindings = this.imageFindings.filter((param: IFinding) => param.markClass === 'hidden');
        if (hiddenFindings.length === event.length) {
            this.showFindings = false;
        } else {
            this.showFindings = true;
        }
    }
    public updateRuler(event: IRuler[]) {
        this.imageRulers = event;
        let hiddenRulers = this.imageRulers.filter((param: IRuler) => param.rulerClass === 'hidden');
        if (hiddenRulers.length === event.length) {
            this.showRulers = false;
        } else {
            this.showRulers = true;
        }
    }
    imageFindings: IFinding[] = [];
    public getExistingMarks(caseforDisplay: ICase): IFinding[] {

        let findings: IFinding[] = [];
        this.imageFindings = [];
        this.findingsList = [];
        this.imageRulers = [];
        this.rulersList = [];
        this.analyzerService.fetchImageFindings(caseforDisplay.caseId, this.selectedView.id).subscribe(result => {
            if (result.status === responseStatus.Success) {
                //let mapWidth = this.marAreaWidth / this.reader.width;
                //let mapHeight = this.marAreaHeight / this.reader.height;

                //let adj = 40;//will need to add the top bar height with case status buttons to get display height

                findings = result.data;
                this.caseFindings = result.data;
                for (let mark in this.caseFindings) {
                    let tempMark: IFinding = {
                        findingId: '',
                        width: 0,
                        height: 0,
                        displayButtons: false,
                        category: 0,
                        comment: '',
                        hsCode: '',
                        name: '',
                        goodsType: -1,
                        zIndex: 150,
                        viewType: 0,
                        source: 1,
                        displayBox: {
                            leftTopCoordinate: { x: 0, y: 0 },
                            rightBottomCoordinate: { x: 0, y: 0 }
                        },
                        boundingBox: {
                            leftTopCoordinate: { x: 0, y: 0 },
                            rightBottomCoordinate: { x: 0, y: 0 }
                        },
                        caseId: '',
                        markClass: '',
                        findingNumber: 0,
                        isVisible: 'block'
                    };
                    tempMark.findingId = this.caseFindings[mark].findingId;
                    tempMark.boundingBox = this.caseFindings[mark].boundingBox;
                    tempMark.displayBox.leftTopCoordinate.x = (tempMark.boundingBox.leftTopCoordinate.x * this.options.zoom.value) + this.picPos.x;
                    tempMark.displayBox.leftTopCoordinate.y = ((tempMark.boundingBox.leftTopCoordinate.y) * this.options.zoom.value) + this.picPos.y;
                    tempMark.displayBox.rightBottomCoordinate.x = (tempMark.boundingBox.rightBottomCoordinate.x * this.options.zoom.value) + this.picPos.x;
                    tempMark.displayBox.rightBottomCoordinate.y = ((tempMark.boundingBox.rightBottomCoordinate.y) * this.options.zoom.value) + this.picPos.y;
                    tempMark.displayWidth = tempMark.displayBox.rightBottomCoordinate.x - tempMark.displayBox.leftTopCoordinate.x;
                    tempMark.displayHeight = tempMark.displayBox.rightBottomCoordinate.y - tempMark.displayBox.leftTopCoordinate.y;

                    tempMark.displayButtons = true;
                    tempMark.hsCode = this.caseFindings[mark].hsCode;
                    tempMark.comment = this.caseFindings[mark].comment;
                    tempMark.category = this.caseFindings[mark].category;
                    tempMark.name = this.caseFindings[mark].name;
                    tempMark.goodsType = this.caseFindings[mark].goodsType;
                    tempMark.markClass = 'markfinder';
                    tempMark.caseId = this.case.caseId;
                    // tempMark.source = this.caseFindings[mark].source;
                    tempMark.viewType = this.caseFindings[mark].viewType;
                    tempMark.findingNumber = this.caseFindings[mark].findingNumber;
                    this.findingsList.push(tempMark);
                }
                this.findingsCount = this.caseFindings.length;

            }

            else {
                this.findingsCount = 0;
            }
            this.findingsExists = this.findingsCount > 0 ? true : false;
            this.showFindings = this.findingsCount > 0 ? true : false;
        });

        this.imageFindings = this.findingsList;


        this.analyzerService.fetchImageRulers(caseforDisplay.caseId, this.selectedView.id).subscribe(result => {
            if (result.status === responseStatus.Success) {
                let rulers: IRuler[] = result.data.rulers;
                this.rulersList = [];
                for (let ruler in rulers) {
                    let tempMark: IRuler = {
                        rulerId: rulers[ruler].rulerId,
                        height: 19,
                        rulerWidth: 0,
                        actualWidth: Number((rulers[ruler].length * this.options.zoom.value / imageConfig.scanResoution).toFixed(3)),
                        name: '',
                        displayCoordinates: {
                            startPoint: {
                                x: 0, y: 0
                            },
                            endPoint: {
                                x: 0, y: 0
                            }
                        },
                        coordinates: {
                            startPoint: { x: rulers[ruler].coordinates.startPoint.x, y: rulers[ruler].coordinates.startPoint.y },
                            endPoint: { x: rulers[ruler].coordinates.endPoint.x, y: rulers[ruler].coordinates.endPoint.y }
                        },
                        zIndex: 100,
                        rulerClass: (rulers[ruler].angle >= 90 && rulers[ruler].angle <= 270) ? 'rulerFlipHorizontal' : 'rulerNormal',
                        length: rulers[ruler].length,
                        angle: rulers[ruler].angle,
                        viewType: rulers[ruler].viewType
                    };
                    tempMark.displayCoordinates.startPoint.x = (tempMark.coordinates.startPoint.x * this.options.zoom.value) + this.picPos.x;
                    tempMark.displayCoordinates.startPoint.y = ((tempMark.coordinates.startPoint.y) * this.options.zoom.value) + this.picPos.y;
                    tempMark.displayCoordinates.endPoint.x = (tempMark.coordinates.endPoint.x * this.options.zoom.value) + this.picPos.x;
                    tempMark.displayCoordinates.endPoint.y = ((tempMark.coordinates.endPoint.y) * this.options.zoom.value) + this.picPos.y;
                    tempMark.rulerWidth = tempMark.actualWidth;// * this.marAreaWidth / this.context.canvas.width;
                    this.rulersList.push(tempMark);
                }
                this.imageRulers = this.rulersList;
                this.showRulers = this.imageRulers.length > 0 ? true : false;
            }

            else {
                this.rulersList = [];
            }

        });

        this.imageRulers = this.rulersList;
        return findings;
    }
    public widthCalculate(coordinates: IRulerCoordinates): number {
        let lengthX = coordinates.startPoint.x < coordinates.endPoint.x ? coordinates.endPoint.x - coordinates.startPoint.x : coordinates.startPoint.x - coordinates.endPoint.x;
        let lengthY = coordinates.startPoint.y < coordinates.endPoint.y ? coordinates.endPoint.y - coordinates.startPoint.y : coordinates.startPoint.y - coordinates.endPoint.y;
        let newLength = (lengthX * lengthX) + (lengthY * lengthY);
        newLength = Math.sqrt(newLength);
        return newLength;
    }

    public updateZoom(markMoved: IMarkAreaMove) {
        if (markMoved) {

            //zoomed canvas size
            let mainCanvasWidth = this.context.canvas.width * this.options.zoom.value;
            let mainCanvasHeight = this.context.canvas.height * this.options.zoom.value;
            let oldPos = Object.assign({}, this.picPos);
            //if main canvas is represented by stamp canvas(even on zoom) then what is the relative position of main canvas compared to position of pan
            //mutliplied by -1 and main canvas should move in opposite direction of the pan
            this.picPos.x = (markMoved.mark.left - this.left) * mainCanvasWidth * -1 / this.selMarkWidth; //+= newX;
            this.picPos.y = markMoved.mark.top * mainCanvasHeight * -1 / this.selMarkHeight;///newY;

            this.marks[0] = markMoved.mark;


            //udpdate the maximum the main canvas can be dragged towards left and right
            let diffX = (Math.abs(this.picPos.x - oldPos.x));
            let diffY = (Math.abs(this.picPos.y - oldPos.y));

            if (oldPos.x > this.picPos.x) {
                this.maxPosition.rightX -= diffX;
                this.maxPosition.x += diffX;
                if (this.maxPosition.rightX < 0) {
                    let diff = 0 - this.maxPosition.rightX;
                    this.maxPosition.rightX = 0;
                    this.picPos.x += diff;
                }
            }
            else {
                this.maxPosition.rightX += diffX;
                this.maxPosition.x -= diffX;
                if (this.maxPosition.x < 0) {
                    let diff = 0 - this.maxPosition.x;
                    this.maxPosition.x = 0;
                    this.picPos.x -= diff;
                }
            }
            if (oldPos.y > this.picPos.y) {
                this.maxPosition.rightY -= diffY;
                this.maxPosition.y += diffY;
                if (this.maxPosition.rightY < 0) {
                    let diff = 0 - this.maxPosition.rightY;
                    this.maxPosition.rightY = 0;
                    this.picPos.y += diff;
                }
            }
            else {
                this.maxPosition.rightY += diffY;
                this.maxPosition.y -= diffY;
                if (this.maxPosition.y < 0) {
                    let diff = 0 - this.maxPosition.y;
                    this.maxPosition.y = 0;
                    this.picPos.y -= diff;
                }
            }

            this.maxPosition.lastDistanceX = this.maxPosition.x;
            this.maxPosition.lastDistanceY = this.maxPosition.y;
            this.zoomBounding = { width: this.selMarkWidth, height: this.selMarkHeight, left: this.left, top: this.top, bottom: 0, right: 0 };
            this.imageService.applyTransform(this.context, this.reader, this.options, this.overlays, this.picPos, true, true);
            let actualMovedX = (this.picPos.x - oldPos.x);
            let actualMovedY = (this.picPos.y - oldPos.y);

            this.imageService.adjustMarksAndRulers(this.imageFindings, this.imageRulers, actualMovedX, actualMovedY);
            if (this.toggleDiscriminationSwitchButtonFlag) {
                this.imageService.applyTransform(this.contextHemd, this.hemdReader, this.hemdOptions, this.overlays, this.picPos, false, false);
            }
        }
    }

    public onSelectorMouseDown(event: MouseEvent): void {
        this.selMouseIsDown = true;
    }

    public onSelectorMouseUp(event: MouseEvent): void {
        this.panUpEvent(event.offsetX, event.offsetY);
    }

    public onPanUp(event: TouchEvent): void {
        var touch = event.touches[0] || event.changedTouches[0];
        this.panUpEvent(touch.pageX, touch.pageY);
    }

    panUpEvent(offsetX, offsetY) {
        if (this.selMouseIsDown) {
            var mark = this.zoomMarks[0];
            var startX = mark.left;
            var startY = mark.top;

            mark.left = offsetX - mark.width / 2 + this.left;
            mark.top = offsetY - mark.height / 2;
            if (mark.left < this.zoomBounding.left) {
                mark.left = this.zoomBounding.left;
            }
            if (mark.top < this.zoomBounding.top) {
                mark.top = this.zoomBounding.top;
            }
            if (mark.left + mark.width > this.zoomBounding.left + this.zoomBounding.width + 5) {
                mark.left = this.zoomBounding.width - mark.width + 16;
            }

            if (mark.top + mark.height > this.zoomBounding.top + this.zoomBounding.height) {
                mark.top = this.zoomBounding.height - mark.height;
            }
            let movedMark: IMarkAreaMove = { mark: mark, movedX: mark.left - startX, movedY: mark.top - startY };

            this.updateZoom(movedMark);

            this.selMouseIsDown = false;
        }
    }
    public onPanDown(event: TouchEvent): void {
        this.selMouseIsDown = true;
    }

    public onTouchMove(event: TouchEvent, mark?: IMarkArea): void {
        if (this.scanFlag) {
            return;
        }
        var touch = event.touches[0] || event.changedTouches[0];
        this.moveImage(touch.pageX, touch.pageY);
    }

    public onTouchStart(event: TouchEvent, mark?: IMarkArea): void {
        if (this.scanFlag) {
            return;
        }
        var touch = event.touches[0] || event.changedTouches[0];
        this.analyzerDownEvent(touch.pageX, touch.pageY);
    }

    public onTouchEnd(event: TouchEvent): void {
        if (event.touches.length === 2) {
            if (event.touches[0].pageY < this.dragStart.y) {
                this.zoom(1, true, true);
            }
            else {
                this.zoom(-1, true, true);
            }
        }
        else {
            var touch = event.touches[0] || event.changedTouches[0];
            this.analyzerUpEvent(touch.pageX, touch.pageY);
        }
    }

    public onCanvasMouseDown(event: MouseEvent): void {
        if (this.scanFlag) {
            return;
        }
        event.preventDefault();
        if (this.brigtnessContrassFlg) {
            this.presetCount = 1;
            this.emitOnEffectChange = false;
            this.options.contrast.apply = false;
            this.options.brightness.apply = false;
            this.brightnessLevel = this.brightnessVal;
            this.contrastLevel = this.contrastVal;
        }
        this.analyzerDownEvent(event.clientX - this.mainLeft, event.clientY - this.mainTop);
    }

    /* Bug 7895 */
    public onMouseWheel(event: MouseWheelEvent): void {
        if (this.scanFlag) {
            return;
        }
        var wheel = event.wheelDelta / 120;//n or -n
        this.zoom(wheel, false, true);
        event.preventDefault();
        event.stopPropagation();
    }
    private analyzerDownEvent(offsetX, offsetY) {
        if (!this.toAnnotate) {
            this.mouseIsDown = true;

            this.dragStart = { x: offsetX, y: offsetY };
            this.maxPosition.lastDistanceX = Math.abs(this.picPos.x);
            this.maxPosition.lastDistanceY = Math.abs(this.picPos.y);
        }
    }

    public onCanvasMouseMove(event: MouseEvent): void {
        if (this.scanFlag) {
            return;
        }
        event.preventDefault();
        this.moveImage(event.clientX - this.mainLeft, event.clientY - this.mainTop);
    }

    public onCanvasMouseUp(event: MouseEvent): void {
        if (this.scanFlag) {
            return;
        }
        event.preventDefault();
        if (this.brigtnessContrassFlg) {
            this.presetCount = 1;
            this.emitOnEffectChange = true;
            this.options.contrast.apply = true;
            this.options.brightness.apply = true;
            this.brightnessLevel = this.brightnessVal;
            this.contrastLevel = this.contrastVal;
        }
        this.moveImage(event.clientX - this.mainLeft, event.clientY - this.mainTop);
    }

    private moveImage(offsetX, offsetY) {
        if (this.mouseIsDown && this.reader) {
            let findings = Object.assign([], this.imageFindings);
            this.imageFindings = null;
            if (this.toggleDiscriminationSwitchButtonFlag) {
                this.imageService.applyTransform(this.contextHemd, this.hemdReader, this.hemdOptions, this.overlays, this.picPos, false, false);
            }
            this.maxPosition.lastDistanceX = (Math.abs(this.picPos.x));
            this.maxPosition.lastDistanceY = (Math.abs(this.picPos.y));
            if (this.reader.height > this.canvasHeight - this.canvasTopMargin) {
                let moved = this.imageService.adjustMovement(this.context, this.reader, this.options, this.overlays, this.picPos, this.maxPosition, this.dragStart, offsetX, offsetY, findings, this.imageRulers, { x: this.marAreaWidth, y: this.marAreaHeight });
                this.movedX += moved.x;
                this.movedY += moved.y;
            }

            this.imageFindings = findings;

            this.panMarkDraw();
            this.dragStart = { x: offsetX, y: offsetY };

        }
    }

    public onAnalyzerMouseLeave(event: MouseEvent): void {
        if (this.mouseIsDown) {
            this.mouseIsDown = false;
            this.selMouseIsDown = false;
        }
    }

    public onAnalyzerMouseUp(event: MouseEvent): void {
        this.analyzerUpEvent(event.clientX - this.mainLeft, event.clientY - this.mainTop);
    }

    analyzerUpEvent(offsetX, offsetY) {
        this.broadcastService.broadcast('broadcastMouseUp', true);
        this.mouseIsDown = false;
    }

    getMousePosition = function (evt) {
        return {
            x: evt.pageX - this.canvas.offsetLeft,
            y: evt.pageY - this.canvas.offsetTop
        };
    };

    hide(flagModified: boolean): void {
        //this.reset();
        this.visibleAnimate = false;
        if (flagModified === true) {
            //this.flagModified = true;
            this.closeAction.emit();
            this.broadcastService.broadcast(broadcastKeys[broadcastKeys.refreshCaseList], null);
        }
        setTimeout(() => this.visible = false, 1);
    }

    public panMarkDraw() {
        if (!this.isMenuClose && (this.movedX !== 0 || this.movedY !== 0)) {
            let mainCanvasWidth = this.options.zoom.value * this.context.canvas.width;
            let mainCanvasHeight = this.options.zoom.value * this.context.canvas.height;

            this.zoomMarks[0].left -= (this.movedX * this.selMarkWidth) / mainCanvasWidth;
            this.zoomMarks[0].top -= (this.movedY * this.selMarkHeight) / mainCanvasHeight;
            if (this.zoomMarks[0].left < this.left) {
                this.zoomMarks[0].left = this.left;
            }
            if (this.zoomMarks[0].top < this.top) {
                this.zoomMarks[0].top = this.top;
            }
            if (this.zoomMarks[0].left + this.zoomMarks[0].width > this.selMarkWidth + this.left) {
                this.zoomMarks[0].left = this.selMarkWidth - this.zoomMarks[0].width + this.left;
            }
            if (this.zoomMarks[0].top + this.zoomMarks[0].height > this.selMarkHeight + this.top) {
                this.zoomMarks[0].top = this.selMarkHeight - this.zoomMarks[0].height;
            }

            this.movedX = 0;
            this.movedY = 0;
        }
    }

    @HostListener('dblclick', ['$event'])
    public eventEmitDoubleClick(event): void {
        event.stopPropagation();
        event.preventDefault();
    }

    public resetMarkAreaControl() {
        this.findingsCount = 0;
        this.findingsExists = false;
        this.resetMarkArea = true;
        this.showFindings = true;
        this.toAnnotate = false;
        this.pencilEnabled = false;
        this.rulerEnabled = false;
        this.imageRulers = [];
        this.showRulers = true;
        this.resetRulerArea = true;
    }
    public ngOnInit(): void {
        this.getImageAnalyzerMetadata();
        this.toggleBottomPanelFlag = false;
        this.brigtnessContrassFlg = false;
        this.showFindings = true;
        this.showRulers = true;
        this.toAnnotate = false;
        this.pencilEnabled = false;
        this.rulerEnabled = false;
        this.resetEffectValues();
        this.imageRulers = [];
        this.initialPageReloadFlag = true;
        this.imageService.loadLuts();
        this.getSidePanelState(this.viewMode);
        if (this.viewMode) {
            this.isMenuClose = false;
            this.showFindings = false;
            this.showRulers = false;
            this.pencilEnabled = false;
            this.rulerEnabled = false;
        }
    }

    public adjustPan() {
        if (this.scanFlag) {
            return;
        }
        //width after zoom
        let mainCanvasWidth = this.context.canvas.width * this.options.zoom.value;
        let mainCanvasHeight = this.context.canvas.height * this.options.zoom.value;
        let minCanvasWidth = this.context.canvas.width * this.actualRatio;
        let minCanvasHeight = this.context.canvas.height * this.actualRatio;

        let oldW = this.zoomMarks[0].width;
        let oldH = this.zoomMarks[0].height;
        let useWidth = ((window.innerWidth - this.mainLeft) > minCanvasWidth) && minCanvasWidth !== mainCanvasWidth ? (window.innerWidth - this.mainLeft) : minCanvasWidth;
        let useHeight = ((window.innerHeight - this.mainTop) > minCanvasHeight) && minCanvasHeight !== mainCanvasHeight ? (window.innerHeight - this.mainTop) : minCanvasHeight;

        this.zoomMarks[0].width = useWidth * this.selMarkWidth / mainCanvasWidth;
        this.zoomMarks[0].height = useHeight * this.selMarkHeight / mainCanvasHeight;
        this.zoomMarks[0].left -= (this.zoomMarks[0].width - oldW) / 2;
        this.zoomMarks[0].top -= (this.zoomMarks[0].height - oldH) / 2;
        var maxReached = false;

        if (this.zoomMarks[0].left < this.left) {
            this.zoomMarks[0].left = this.left;
            maxReached = true;
        }
        if (this.zoomMarks[0].top < this.top) {
            this.zoomMarks[0].top = this.top;
            maxReached = true;
        }

        if (this.zoomMarks[0].left + this.zoomMarks[0].width > this.left + this.selMarkWidth) {
            this.movedX = (this.zoomMarks[0].left + this.zoomMarks[0].width - (this.left + this.selMarkWidth));
            this.zoomMarks[0].left -= this.movedX;

            maxReached = true;
        }
        if (this.zoomMarks[0].top + this.zoomMarks[0].height > this.top + this.selMarkHeight) {
            this.movedY = (this.zoomMarks[0].top + this.zoomMarks[0].height - (this.top + this.selMarkHeight));

            this.zoomMarks[0].top -= this.movedY;
            maxReached = true;
        }
        if (maxReached) {

            this.movedX = 0;
            this.movedY = 0;
        }
        this.picPos.x = (this.zoomMarks[0].left - this.left) * mainCanvasWidth * -1 / this.selMarkWidth;
        this.picPos.y = this.zoomMarks[0].top * mainCanvasHeight * -1 / this.selMarkHeight;
        this.imageService.applyTransform(this.context, this.reader, this.options, this.overlays, this.picPos, true);
    }
}
