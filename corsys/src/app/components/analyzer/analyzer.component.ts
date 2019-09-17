import { Component, OnInit, Inject, ViewChild, OnDestroy } from '@angular/core';
import { IKeyValue, IResponse, IImageOptions, ICase, ICaseRequestFormat, IAssessmentImage, IImageView, IMageViewCallBack, IScannerObject } from '../../models/viewModels';
import { IMessageService, ICaseService, IAnalyzerService, ITranslateService } from '../../interfaces/interfaces';
import { caseStatus, responseStatus, messageType, viewType, outputType, spinnerType } from '../../models/enums';
import { ModalConfirmComponent } from '../modal/modal.confirm.component';
import { ModalLoaderComponent } from '../modal/modal.loader.component';
import { ModalErrorComponent } from '../modal/modal.error.page.component';
import { ActivatedRoute } from '@angular/router';
import { Adal4Service } from '@corsys/corsys-adal';
import { Subject } from 'rxjs';
@Component({
    selector: 'sp3-comp-analyzer',
    templateUrl: './analyzer.component.html'
})

export class AnalyzerComponent implements OnInit, OnDestroy {

    @ViewChild('modalSp3Loader') modalSp3Loader: ModalLoaderComponent;
    @ViewChild('modalError') modalError: ModalErrorComponent;
    @ViewChild('modalImageAnalyzerValidation') modalImageAnalyzerValidation: ModalConfirmComponent;
    editFinding: boolean = false;
    readOnlyMode: boolean = false;
    caseId: string = '';
    public imagePath: Object;
    public data1: any;
    options: IImageOptions;
    isNextButtonVisible: boolean = false;
    filterCriteria: number[];
    imageViewList: IKeyValue[] = [];
    case: ICase;
    originalViewList: IImageView[] = [];
    viewList: IImageView[] = [];
    selectedImageView: IImageView;
    scanImageDetails: IAssessmentImage[] = [];
    selectedView: IKeyValue;
    hemdScanList: Object;
    hasHEMD: boolean = false;
    scanId: string = '';
    scan1: IScannerObject = { scanId: '', scanDateTime: '', containerId: '' };
    inspectiontype?: number;
    scanFlag: boolean = false;
    fileToOpen: string = '';
    ngUnsubscribe: Subject<any> = new Subject<any>();

    nextCaseButtonClick: (nextClick: boolean) => void;
    setImageViewList: () => void;
    addOriginalViews: (selectedScan: IAssessmentImage[]) => void;
    addExternalViews: () => void;
    showLoader: (showFlag: boolean) => void;
    validationOkClick: () => void;
    onViewChange: (selectedView: IKeyValue) => void;
    showOriginalImageView: (param: IMageViewCallBack) => void;
    fetchDetails: () => void;
    fetchSelectedCaseDetails: () => void;
    setAnalyzerScanDetails: () => void;
    setAnalyzerScannedImagesDetails: (scanId: string) => void;
    loadCaseDetails: () => void;
    onImageLoadError: () => void;

    constructor( @Inject('IMessageService') private messageService: IMessageService,
        @Inject('ITranslateService') private translateService: ITranslateService,
        @Inject('ICaseService') private caseService: ICaseService,
        private route: ActivatedRoute,
        public service: Adal4Service,
        @Inject('IAnalyzerService') private analyzerService: IAnalyzerService, ) {
        var vm = this;
        this.route.params.takeUntil(this.ngUnsubscribe).subscribe(params => {
            vm.readOnlyMode = (params.case) ? true : (params.scanToOpen) ? true : false;
            vm.caseId = params.case;
            vm.editFinding = (params.edit === 'true') ? true : false;
            vm.scanId = params.scanToOpen;
            vm.scan1 = { scanId: params.scanToOpen, containerId: params.scanContainer, scanDateTime: params.scanDate };
            vm.scanFlag = params.scanToOpen ? true : false;
            vm.inspectiontype = params.inspectiontype;
            vm.fileToOpen = params.file;
        });
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

        this.messageService.resetPageChange();

        vm.showLoader = (showFlag: boolean) => {
            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: showFlag, type: spinnerType.small };
        };

        vm.validationOkClick = () => {
            vm.modalImageAnalyzerValidation.hide();
            vm.isNextButtonVisible = true;
        };

        vm.showOriginalImageView = (param: IMageViewCallBack) => {
            let selectedView = param.ImageViewProp;
            vm.hasHEMD = false;
            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: true, type: spinnerType.small };
            let selectedScan;
            if (vm.scanFlag) {
                for (let index = 0; index < this.scanImageDetails.length; index++) {
                    // let orgView =
                    if (vm.scanImageDetails[index].category === outputType.OCR && param.ImageViewProp.name === vm.scanImageDetails[index].fileName) {
                        selectedScan = { name: vm.scanImageDetails[index].fileName, viewType: vm.scanImageDetails[index].viewType, effects: null, isOriginal: true };
                        selectedScan.scanImageId = vm.scanImageDetails[index].scanImageId;
                    }
                }
            } else {
                selectedScan = vm.scanImageDetails.find(r => r.viewType === selectedView.viewType && r.category !== outputType.HEMD);
            }
            if (vm.scanImageDetails) {
                if (!vm.scanFlag) {
                    if (selectedView.viewType === viewType.ToporBottom) {
                        this.hemdScanList = vm.scanImageDetails.find(d => d.category === outputType.HEMD && d.viewType === viewType.ToporBottom);
                    } else if (selectedView.viewType === viewType.Left) {
                        this.hemdScanList = vm.scanImageDetails.find(d => d.category === outputType.HEMD && d.viewType === viewType.Left);
                    }
                    vm.hasHEMD = this.hemdScanList && Object.keys(this.hemdScanList).length > 0;
                }

                if (selectedScan.image) {
                    let tempImage = selectedScan.image;
                    vm.selectedImageView = null;
                    this.imagePath = null;
                    this.imagePath = tempImage;
                    vm.selectedImageView = selectedView;
                    selectedScan.image = tempImage;
                    if (param.callback) {
                        param.callback();
                        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                    }
                }
                else {
                    this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: true, type: spinnerType.small };
                    this.analyzerService.getImageByScanId(selectedScan.scanFolder, selectedScan.scanImageId, selectedScan.fileType).takeUntil(this.ngUnsubscribe).subscribe((response) => {
                        selectedScan.image = response.blob();
                        this.imagePath = null;
                        this.imagePath = selectedScan.image;
                        if (param.callback) {
                            param.callback();
                            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                        }
                    }, (error: IResponse<any>) => {
                        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                        this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                    });
                }

            }
        };

        vm.onViewChange = (selectedView: IKeyValue) => {
            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: true, type: spinnerType.small };
            if (selectedView) {
                let selectedScan = vm.scanImageDetails.find(r => r.viewType === selectedView.id && r.category !== outputType.HEMD);
                if (selectedView.id === viewType.ToporBottom) {
                    this.hemdScanList = vm.scanImageDetails.find(d => d.category === outputType.HEMD && d.viewType === viewType.ToporBottom);
                } else if (selectedView.id === viewType.Left) {
                    this.hemdScanList = vm.scanImageDetails.find(d => d.category === outputType.HEMD && d.viewType === viewType.Left);
                }
                vm.hasHEMD = this.hemdScanList && Object.keys(this.hemdScanList).length > 0;
                this.analyzerService.getImageByScanId(selectedScan.scanFolder, selectedScan.scanImageId, selectedScan.fileType).takeUntil(this.ngUnsubscribe).subscribe((response) => {
                    this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                    let result = response.blob();
                    this.imagePath = null;
                    this.imagePath = result;
                    let view = vm.viewList.find(x => x.isOriginal && x.viewType === selectedScan.viewType);
                    if (view) {
                        for (let i = 0; i < vm.viewList.length; i++) {
                            vm.viewList[i].isSelected = false;
                            if (vm.viewList[i].name === view.name) {
                                vm.viewList[i].isSelected = true;
                            }
                        }
                    }
                    vm.selectedImageView = view;

                }, (error: IResponse<any>) => {
                    this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                    this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                });
            }
        };

        vm.setImageViewList = () => {
            vm.imageViewList = [];
            if (vm.scanImageDetails) {
                for (let index = 0; index < vm.scanImageDetails.length; index++) {
                    let view: IKeyValue = {
                        id: 0,
                        name: ''
                    };
                    view.id = vm.scanImageDetails[index].viewType;
                    view.name = viewType[view.id];
                    if (vm.scanImageDetails[index].category === outputType.Xray) {
                        vm.imageViewList.push(view);
                    }
                    if (view.id === viewType.Left) {
                        this.selectedView = view;
                    } else {
                        this.selectedView = view;
                    }
                }
            }
        };

        vm.nextCaseButtonClick = (nextClick: boolean) => {
            vm.imagePath = null;
            vm.data1 = {};
            vm.viewList = [];
            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: true, type: spinnerType.small };
            vm.filterCriteria = [caseStatus.AwaitingAssessment];
            vm.caseService.getCasesByStatus(false, vm.filterCriteria).takeUntil(this.ngUnsubscribe).subscribe(result => {
                if (result.data.cases.length > 0) {
                    vm.case = result.data.cases[0];

                    let caseRequest: ICaseRequestFormat = {
                        cases: [{ caseId: vm.case.caseId, caseAction: null, assignedTo: this.service.userInfo.username }],
                        status: caseStatus.AssessmentInProgress,
                        reason: null,
                        notes: ''
                    };
                    vm.caseService.updateCases(caseRequest).takeUntil(this.ngUnsubscribe).subscribe((requestResult) => {
                        if (requestResult.status === responseStatus.Success) {
                            vm.setAnalyzerScanDetails();
                        }
                        else {
                            if (requestResult.status === responseStatus.APIError && requestResult.messageKey === 'SACM30004') {
                                this.messageService.LoaderMessage = { id: '', headerMessage: '', footerMessage: '', showLoader: false, type: spinnerType.small };
                                this.isNextButtonVisible = true;
                            }
                        }
                    }, (error: IResponse<any>) => {
                        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                        vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                    });
                }
                else {
                    this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                    // Show error message
                    vm.modalImageAnalyzerValidation.show();

                }
            }, (error: IResponse<any>) => {
                this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
            });
        };

        vm.addOriginalViews = (selectedScan: IAssessmentImage[]) => {
            // let orgView = vm.originalViewList.find(x => x.viewType === selectedScan.viewType);
            // if (orgView === undefined) {
            let categoryType = vm.scanFlag ? outputType.OCR : outputType.Xray;
            for (let index = 0; index < selectedScan.length; index++) {
                // let orgView =
                if (selectedScan[index].category === categoryType) {
                    let orgView = { name: selectedScan[index].fileName, viewType: selectedScan[index].viewType, effects: null, isOriginal: true };
                    vm.viewList.push(orgView);
                }
                // let orgView = { name: selectedScan[index].fileName, viewType: selectedScan[index].viewType, effects: null, isOriginal: true };
                // vm.viewList.push(orgView);
            }

            // }
        };

        vm.addExternalViews = () => {
            if (vm.case && vm.case.caseId) {
                vm.caseId = vm.case.caseId;
            }
            vm.analyzerService.getViews(vm.caseId).takeUntil(this.ngUnsubscribe).subscribe(result => {
                if (result.status === responseStatus.Success) {
                    if (result.data != null) {
                        for (let view in result.data) {
                            vm.viewList.push(result.data[view]);
                        }
                    }
                }
            }, (error: IResponse<any>) => {
                this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
            });
        };
        vm.fetchSelectedCaseDetails = () => {
            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: true, type: spinnerType.small };
            this.case = { caseId: this.caseId, containerIds: [], harmonisedSystemCodes: [''], from: '', to: '', status: 0, dateCreated: new Date, shippingCompany: '', dateOfArrival: new Date, shipId: '', checked: false };
            vm.setAnalyzerScanDetails();
        };
        vm.fetchDetails = () => {
            this.imagePath = null;
            this.data1 = {};
            vm.viewList = [];
            this.isNextButtonVisible = false;
            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: true, type: spinnerType.small };
            this.filterCriteria = [caseStatus.AssessmentInProgress];
            this.caseService.getCasesByStatus(true, this.filterCriteria).takeUntil(this.ngUnsubscribe).subscribe(result => {
                if (result.status === responseStatus.Success) {
                    if (result.data.cases.length > 0) {
                        this.case = result.data.cases[0];
                        vm.setAnalyzerScanDetails();
                    }
                    else {
                        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                        this.isNextButtonVisible = true;
                    }

                }

            }, (error: IResponse<any>) => {
                this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                vm.modalError.show();
            });
        };

        vm.setAnalyzerScannedImagesDetails = (scanId: string) => {
            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: true, type: spinnerType.small };
            this.analyzerService.getScanDetails(scanId).takeUntil(this.ngUnsubscribe).subscribe((requestResult) => {
                if (requestResult.status === responseStatus.Success) {
                    this.scanImageDetails = requestResult.data;
                    vm.addOriginalViews(this.scanImageDetails);

                    let selectedScan = this.scanImageDetails.find(r => r.category === outputType.OCR);
                    //this.setImageViewList();
                    if (selectedScan && selectedScan !== undefined) {
                        // Show image
                        this.analyzerService.getImageByScanId(selectedScan.scanFolder, selectedScan.scanImageId, requestResult.data[0].fileType).takeUntil(this.ngUnsubscribe).subscribe((response) => {
                            //this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false };
                            let result = response.blob();
                            selectedScan.image = result;
                            // vm.addOriginalViews([selectedScan]);
                            if (vm.viewList.length > 0) {
                                let selectedView = vm.viewList.find(x => x.name === selectedScan.fileName);

                                if (selectedView) {
                                    vm.selectedImageView = selectedView;
                                    vm.viewList.find(x => x.name === selectedScan.fileName).isSelected = true;
                                }
                                else {
                                    vm.selectedImageView = vm.viewList[0];
                                    vm.viewList[0].isSelected = true;
                                }
                            }
                            this.imagePath = result;
                            // selectedScan = this.scanImageDetails.find(r => r.viewType === viewType.ToporBottom);
                            selectedScan.image = null;
                            // vm.addOriginalViews(selectedScan);
                            vm.addExternalViews();
                        }, (error: IResponse<any>) => {
                            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                            this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                        });

                        vm.isNextButtonVisible = false;
                    } else {
                        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                        //this.messageService.Message = { message: , showMessage: true, type: messageType.Error };
                    }
                }

            }, (error: IResponse<any>) => {
                this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
            });
        };

        vm.setAnalyzerScanDetails = () => {
            this.analyzerService.getAnalyzerCaseDetails(this.case.caseId).takeUntil(this.ngUnsubscribe).subscribe((requestResult) => {
                if (requestResult.status === responseStatus.Success) {
                    this.scanImageDetails = requestResult.data;
                    vm.addOriginalViews(this.scanImageDetails);

                    // we need to open the file which is requested from DC or Inspection app or we fallback to default values.
                    let selectedScan = this.fileToOpen ?
                        this.scanImageDetails.find(r => r.fileName === this.fileToOpen) :
                        this.scanImageDetails.find(r => r.viewType === viewType.Left && r.category !== outputType.HEMD && r.category !== outputType.OCR);

                    // check for  TOP if side view doesnt exist
                    if (!selectedScan) {
                        selectedScan = this.scanImageDetails.find(r => r.viewType === viewType.Top && r.category !== outputType.HEMD && r.category !== outputType.OCR);
                    }
                    // HEMD
                    this.hemdScanList = this.scanImageDetails.find(d => d.category === outputType.HEMD);
                    vm.hasHEMD = this.hemdScanList && Object.keys(this.hemdScanList).length > 0;
                    this.setImageViewList();
                    if (selectedScan && selectedScan !== undefined) {
                        // Show image
                        this.analyzerService.getImageByScanId(selectedScan.scanFolder, selectedScan.scanImageId, requestResult.data[0].fileType).takeUntil(this.ngUnsubscribe).subscribe((response) => {
                            //this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false };
                            let result = response.blob();
                            selectedScan.image = result;
                            // vm.addOriginalViews([selectedScan]);
                            if (vm.viewList.length > 0) {
                                let selectedView = vm.viewList.find(x => x.name === selectedScan.fileName);

                                if (selectedView) {
                                    vm.selectedImageView = selectedView;
                                    vm.viewList.find(x => x.name === selectedScan.fileName).isSelected = true;
                                }
                                else {
                                    vm.selectedImageView = vm.viewList[0];
                                    vm.viewList[0].isSelected = true;
                                }
                            }
                            this.imagePath = result;
                            // selectedScan = this.scanImageDetails.find(r => r.viewType === viewType.ToporBottom);
                            // selectedScan.image = null;
                            // vm.addOriginalViews(selectedScan);
                            vm.addExternalViews();
                        }, (error: IResponse<any>) => {
                            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                            this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                            vm.modalError.show();
                        });
                        vm.isNextButtonVisible = false;
                    } else {
                        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                        //this.messageService.Message = { message: , showMessage: true, type: messageType.Error };
                    }
                }

            }, (error: IResponse<any>) => {
                this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: false, type: spinnerType.small };
                this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
            });
        };

        vm.onImageLoadError = () => {
            vm.modalError.hide();
            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ImageLoading'), showLoader: true, type: spinnerType.small };
            vm.setAnalyzerScanDetails();
        };
    }

    ngOnInit() {
        //this.imagePath = document.location.origin + '/assets/images/test.jpg';
        var vm = this;
        setTimeout(() => {
            if (this.caseId) {
                vm.fetchSelectedCaseDetails();
            } else if (this.scanId) {
                vm.setAnalyzerScannedImagesDetails(this.scanId);

            } else {
                vm.fetchDetails();
            }
        }, 10);
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
