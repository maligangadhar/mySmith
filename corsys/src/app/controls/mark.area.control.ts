import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Inject,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChange,
    ViewChild,
} from '@angular/core';

import { ModalPromptComponent } from '../components/modal/modal.prompt.component';
import { IAnalyzerService, IMessageService, ITranslateService } from '../interfaces/interfaces';
import { action, findingStatus, messageResponseType, responseStatus, spinnerType } from '../models/enums';
import { BoundingRectangle, ICase, IFinding, IKeyValue, IMetadataImages, IPosition } from '../models/viewModels';
import { SpSelectComponent } from './select.control';

@Component({
    selector: 'sp3-comp-mark-area',
    templateUrl: './mark.area.control.html'
})

export class Sp3MarkAreaControlComponent implements OnInit, OnChanges {
    @ViewChild('myOverlayDiv') overlayDiv: ElementRef;
    @ViewChild('findingCategory') findingCategory: SpSelectComponent;
    @ViewChild('findingSubCategory') findingSubCategory: SpSelectComponent;
    @ViewChild('modalPrompt') modalPrompt: ModalPromptComponent;
    @Input() public imageMarks: IFinding[] = [];
    @Input() public width: number;
    @Input() public leftStart: number;
    @Input() public topStart: number;
    @Input() public zoomValue: number;

    @Input() public picPos: IPosition;
    @Input() public readerWidth: number;
    @Input() public readerHeight: number;
    @Input() public actZoomValue: number;
    @Input() public height: number;
    @Input() public case: ICase = null;
    @Input() public selectedView: IKeyValue;
    @Input() public viewMode?: boolean = false;
    @Input() public editFinding?: boolean = false;
    @Input() public metadataImages: IMetadataImages = {
        AnnotationShapes: [], assessmentResults: [], assessmentTypes: [],
        CategoryTypes: [], Drugs: [], EffectType: [], PreliminaryAssessments: [], Weapons: []
    };
    @Input() public toAnnotate: boolean = false;
    @Input() public resetMarkArea: boolean = false;
    @Input() public showHideAllFindings: boolean = false;
    @Output() onFindingsAddRemove: EventEmitter<IFinding[]> = new EventEmitter<IFinding[]>();
    @Output() onOpeningOfDetailsBox: EventEmitter<boolean> = new EventEmitter<boolean>();
    isCreationInProgress: boolean = false;
    public iMarkArea: IFinding = {
        findingId: '',
        findingNumber: 0,
        width: 0,
        height: 0,
        displayWidth: 0,
        displayHeight: 0,
        displayButtons: false,
        category: 0,
        comment: '',
        hsCode: '',
        name: '',
        goodsType: -1,
        zIndex: 100,
        viewType: 0,
        source: 1,
        boundingBox: {
            leftTopCoordinate: { x: 0, y: 0 },
            rightBottomCoordinate: { x: 0, y: 0 }
        },
        displayBox: {
            leftTopCoordinate: { x: 0, y: 0 },
            rightBottomCoordinate: { x: 0, y: 0 }
        },
        caseId: '',
        markClass: '',
        isVisible: 'block'

    };
    mouseDown: boolean = false;
    public cursorType: string = 'pointer';
    private mouseMoveFlg: boolean;
    isDetailsModalVisible: boolean = false;
    visible: boolean = false;
    public comments: string = '';
    public tempMark: IFinding;
    heading: string = 'Add Finding';
    subCategoryDisplay: boolean = false;
    subCategoryMandatory: boolean = false;
    subCategoryList: IKeyValue[] = [];
    categoryList: IKeyValue[] = [];
    public currentPosition: number = -1;
    public markIsClicked: boolean = false;
    selectedCategory: IKeyValue;
    selectedSubCategory: IKeyValue;
    markHsCode: string = '';
    isMessageShown: boolean = false;
    isCloseDisabled: boolean = false;
    isDeleteAndDetailsDisabled: boolean = false;
    isSaveDisabled: boolean = false;
    globalMarkHolder = {};
    public markZIdx: number;
    public popupBtnZIdx: number;
    public lastMousePos: IPosition = { x: 0, y: 0 };
    public isMarkVisible: boolean = false;
    findingArrayManipulated: Object = {index: -1};
    constructor( @Inject('IAnalyzerService') private analyzerService: IAnalyzerService,
        @Inject('ITranslateService') public translateService: ITranslateService,
        @Inject('IMessageService') private messageService: IMessageService) {
        this.selectedCategory = this.metadataImages.CategoryTypes[0];
        this.subCategoryDisplay = false;
        this.subCategoryMandatory = false;
        this.subCategoryList = [];
        this.isSaveDisabled = false;
    }
    public reset() {
        this.imageMarks = [];
        this.isDetailsModalVisible = false;
        this.isSaveDisabled = false;
        this.toAnnotate = false;
        this.selectedCategory = this.metadataImages.CategoryTypes[0];
        this.subCategoryDisplay = false;
        this.subCategoryMandatory = false;
        this.subCategoryList = [];
        this.isDeleteAndDetailsDisabled = false;
        this.index = -1;
        this.messageService.setPageChange(action.findingAdded, false);
    }

    @HostListener('mousedown', ['$event'])
    @HostListener('touchstart', ['$event'])
    public onMousedown(event) {
        if (this.modalPrompt.visible) {
            return;
        }
        if (this.toAnnotate && !this.isDetailsModalVisible && !this.isCreationInProgress) {
            this.isCreationInProgress = true;
            let clientY = event.touches ? event.touches[0].clientY : event.clientY;
            let clientX = event.touches ? event.touches[0].clientX : event.clientX;
            this.lastMousePos.x = clientX;
            this.lastMousePos.y = clientY;
            this.mouseDown = true;
            this.iMarkArea = {
                findingId: '',
                width: 0,
                height: 0,
                displayWidth: 0,
                displayHeight: 0,
                displayButtons: false,
                category: 0,
                comment: '',
                hsCode: '',
                name: '',
                goodsType: -1,
                zIndex: 100,
                viewType: 0,
                source: 1,
                boundingBox: {
                    leftTopCoordinate: { x: 0, y: 0 },
                    rightBottomCoordinate: { x: 0, y: 0 }
                },
                displayBox: {
                    leftTopCoordinate: { x: 0, y: 0 },
                    rightBottomCoordinate: { x: 0, y: 0 }
                },
                caseId: '',
                markClass: '',
                findingNumber: 0,
                isVisible: 'block'
            };

            this.iMarkArea.displayBox.leftTopCoordinate.x = (clientX - 44);
            this.iMarkArea.displayBox.leftTopCoordinate.y = (clientY - 90);
            if (this.isMarkVisible) {
                this.iMarkArea.isVisible = 'none';
            }
            this.imageMarks.push(this.iMarkArea);
            this.iMarkArea.markClass = 'markfinder marking ';
            this.mouseMoveFlg = true;
            this.visible = true;
        }
    }

    @HostListener('mousemove', ['$event'])
    @HostListener('touchmove', ['$event'])
    onMousemove(event) {
        if (this.modalPrompt.visible) {
            return;
        }
        if (this.toAnnotate && !this.isDetailsModalVisible) {
            if (this.mouseMoveFlg && !this.markIsClicked) {
                let clientX = event.touches ? event.touches[0].clientX : event.clientX;
                let clientY = event.touches ? event.touches[0].clientY : event.clientY;
                this.resizeSelection((clientX), (clientY));
            }
        }

    }
  
    @HostListener('mouseup', ['$event'])
    @HostListener('touchend', ['$event'])
    onmouseup(event) {
        if (this.modalPrompt.visible) {
            return;
        }
        this.markIsClicked = false;
        if (this.toAnnotate && !this.isDetailsModalVisible && this.isCreationInProgress) {
            this.mouseMoveFlg = false;
            this.visible = false;
            if ((this.iMarkArea.displayHeight < 75 || this.iMarkArea.displayWidth < 75)) {
                this.imageMarks.splice(this.imageMarks.length - 1, 1);
                this.isCreationInProgress = false;
            }
            else {
                this.iMarkArea.displayButtons = true;
                this.iMarkArea.zIndex = 152;
                this.isCreationInProgress = false;
                this.iMarkArea.displayBox.rightBottomCoordinate.x = this.iMarkArea.displayBox.leftTopCoordinate.x + this.iMarkArea.displayWidth;
                this.iMarkArea.displayBox.rightBottomCoordinate.y = this.iMarkArea.displayBox.leftTopCoordinate.y + this.iMarkArea.displayHeight;
                this.iMarkArea.boundingBox.leftTopCoordinate.x = ((this.iMarkArea.displayBox.leftTopCoordinate.x - this.picPos.x) / this.zoomValue);
                this.iMarkArea.boundingBox.leftTopCoordinate.y = ((this.iMarkArea.displayBox.leftTopCoordinate.y - this.picPos.y) / this.zoomValue);
                this.iMarkArea.boundingBox.rightBottomCoordinate.x = ((this.iMarkArea.displayBox.rightBottomCoordinate.x - this.picPos.x) / this.zoomValue);
                this.iMarkArea.boundingBox.rightBottomCoordinate.y = ((this.iMarkArea.displayBox.rightBottomCoordinate.y - this.picPos.y) / this.zoomValue);
               
                this.openDetailsBox(this.iMarkArea);

            }
            this.iMarkArea.markClass = 'markfinder';
        }

    }

    public selectMarkAreamousedown(mark: IFinding) {
        this.currentMark(mark);
    }

    public onTouchStart(event: TouchEvent, mark: IFinding): void {
        this.currentMark(mark);
    }

    public onTouchEnd(event: TouchEvent) {
        this.deSelectMark();
    }

    public currentMark(mark: IFinding) {
        this.isMarkVisible = true;
        setTimeout(() => {
            this.markIsClicked = true;
            this.currentPosition = this.imageMarks.indexOf(mark);
        }, 10);
    }

    public selectMarkAreaMouseUp(event: MouseEvent) {
        this.deSelectMark();
    }

    public deSelectMark() {
        this.markIsClicked = false;
        this.isMarkVisible = false;
    }

    public moveMarkArea(event) {
        this.cancelEvent(event);
        let clientY = event.touches ? event.touches[0].clientY : event.clientY;
        let clientX = event.touches ? event.touches[0].clientX : event.clientX;
        focus();
        if (this.imageMarks[this.currentPosition] != undefined) {
            this.imageMarks[this.currentPosition].displayBox.leftTopCoordinate.x = (clientX) - (this.imageMarks[this.currentPosition].displayWidth) / 2;
            this.imageMarks[this.currentPosition].displayBox.leftTopCoordinate.y = (clientY) - (this.imageMarks[this.currentPosition].displayHeight) / 2;
            this.imageMarks[this.currentPosition].boundingBox.leftTopCoordinate.x = ((this.imageMarks[this.currentPosition].displayBox.leftTopCoordinate.x - this.picPos.x) / this.zoomValue);
            this.imageMarks[this.currentPosition].boundingBox.leftTopCoordinate.y = ((this.imageMarks[this.currentPosition].displayBox.leftTopCoordinate.y - this.picPos.y) / this.zoomValue);

        }
        this.onFindingsAddRemove.emit(this.imageMarks);

    }

    public resizeSelection(clientX, clientY) {
        this.cancelEvent(event);
        focus();
        var width = clientX - this.lastMousePos.x;
        var height = clientY - this.lastMousePos.y;
        this.iMarkArea.displayWidth = width;
        this.iMarkArea.displayHeight = height;
    }

    public openPopUpForDelete(mark: IFinding) {
        this.modalPrompt.show();
    }

    public modalPromptClick = (response) => {
        if (response.status === messageResponseType.Yes) {
            this.messageService.LoaderMessage = { id: '', headerMessage: 'Loading', footerMessage: 'Mark deleting...', showLoader: true, type: spinnerType.small };
            if (this.imageMarks[this.currentPosition].findingId === '' || this.imageMarks[this.currentPosition].findingId === undefined) {
                this.imageMarks.splice(this.currentPosition, 1);
                this.index = -1;
                this.onOpeningOfDetailsBox.emit(false);
                this.messageService.LoaderMessage = { id: '', headerMessage: 'Loading', footerMessage: 'Mark deleting...', showLoader: false, type: spinnerType.small };
            }
            else {
                this.analyzerService.deleteFinding(this.case.caseId, this.imageMarks[this.currentPosition].findingId, findingStatus.Deleted).subscribe(result => {
                    if (result.status === responseStatus.Success) {
                        this.messageService.LoaderMessage = { id: '', headerMessage: 'Loading', footerMessage: 'Mark deleting...', showLoader: false, type: spinnerType.small };
                        this.imageMarks.splice(this.currentPosition, 1);
                        this.onFindingsAddRemove.emit(this.imageMarks);
                    }
                });
            }
            this.isDetailsModalVisible = false;
            this.messageService.setPageChange(action.findingAdded, false);
            this.isSaveDisabled = false;
        }
        this.modalPrompt.hide();

    }
    public deleteMarkArea(mark: IFinding) {
        if (!mark && this.imageMarks[this.imageMarks.length - 1].findingId === '') {
            this.imageMarks.pop();
            this.markIsClicked = false;
            this.isMarkVisible = false;
            this.globalMarkHolder = {};
            return;
        }
        if (!this.viewMode || this.editFinding) {
            if (Object.keys(this.globalMarkHolder).length === 0 && this.globalMarkHolder.constructor === Object) {
                mark = mark;
            } else {
                mark = this.globalMarkHolder as IFinding;
            }
            this.currentPosition = this.imageMarks.indexOf(mark);
            if (this.isDetailsModalVisible) {
                if (this.currentPosition.toString() === this.index.toString()) {
                    this.openPopUpForDelete(mark);
                }
            }
            else {
                this.openPopUpForDelete(mark);
            }
            this.markIsClicked = false;
            this.isMarkVisible = false;
            this.globalMarkHolder = {};
        }
    }

    public cancelEvent(e) {
        var event = e || window.event || {};
        event.cancelBubble = true;
        event.returnValue = false;
        event.stopPropagation && event.stopPropagation(); // jshint ignore: line
        event.preventDefault && event.preventDefault(); // jshint ignore: line
    }

    //is this used anywhere?
    public getElementRect(element: ElementRef) {
        const boundingRect: BoundingRectangle = element.nativeElement.getBoundingClientRect();
        return {
            height: boundingRect.height,
            width: boundingRect.width,
            top: boundingRect.top,
            bottom: boundingRect.bottom,
            left: boundingRect.left,
            right: boundingRect.right
        };
    }

    onCategoryChange(event: IKeyValue) {

        let selectedcategoryId: number = event.id;
        switch (selectedcategoryId) {
            case 0: this.subCategoryDisplay = true;
                this.subCategoryMandatory = true;
                this.subCategoryList = [];
                this.subCategoryList = this.metadataImages.Weapons;
                this.selectedSubCategory = this.subCategoryList[0];
                this.markHsCode = '';
                break;
            case 1: this.subCategoryDisplay = true;
                this.subCategoryMandatory = true;
                this.subCategoryList = [];
                this.subCategoryList = this.metadataImages.Drugs;
                this.selectedSubCategory = this.subCategoryList[0];
                this.markHsCode = '';
                break;
            case 2: this.subCategoryDisplay = false;
                this.subCategoryMandatory = false;
                this.subCategoryList = [];
                this.selectedSubCategory = undefined;
                this.markHsCode = '';
                break;

        }
        if (this.categoryList.find(this.findDefaultValue)) {
            this.categoryList.splice(0, 1);
        }

        //this.selectedCategory = event;
    }

    findDefaultValue(valueToFind) {
        return valueToFind.id === -1;
    }

    onTextAdded(event: string) {
        this.markHsCode = event;
    }

    index: any = -1;
    openDetailsBox(event: IFinding) {
        this.globalMarkHolder = event;
        this.isMessageShown = false;
        this.markIsClicked = false;
        this.index = Object.keys(this.imageMarks).find(k => this.imageMarks[k] === event);
        if (!this.isDetailsModalVisible) {

            if (this.imageMarks[this.index].findingId) {
                if (this.categoryList.find(this.findDefaultValue)) {
                    this.categoryList.splice(0, 1);
                }
                this.selectedCategory = this.categoryList[Object.keys(this.categoryList).find(k => this.categoryList[k].id === event.category)];

                this.comments = this.imageMarks[this.index].comment;
                this.heading = 'Mark ' + this.imageMarks[this.index].findingNumber;
                this.isCloseDisabled = true;
                switch (this.selectedCategory.id) {
                    case 0:
                        this.subCategoryDisplay = true;
                        this.subCategoryList = this.metadataImages.Weapons;
                        if (Object.keys(this.subCategoryList).find(k => this.subCategoryList[k].id === this.imageMarks[this.index].goodsType)) {
                            this.selectedSubCategory = this.subCategoryList[Object.keys(this.subCategoryList).find(k => this.subCategoryList[k].id === this.imageMarks[this.index].goodsType)];
                        }
                        else {
                            this.selectedSubCategory = undefined;
                        }
                        this.markHsCode = '';
                        break;
                    case 1:
                        this.subCategoryDisplay = true;
                        this.subCategoryList = this.metadataImages.Drugs;
                        if (Object.keys(this.subCategoryList).find(k => this.subCategoryList[k].id === this.imageMarks[this.index].goodsType)) {
                            this.selectedSubCategory = this.subCategoryList[Object.keys(this.subCategoryList).find(k => this.subCategoryList[k].id === this.imageMarks[this.index].goodsType)];
                        }
                        else {
                            this.selectedSubCategory = undefined;
                        }
                        this.markHsCode = '';
                        break;
                    case 2:
                        this.subCategoryDisplay = false;
                        this.selectedSubCategory = undefined;
                        this.markHsCode = this.imageMarks[this.index].hsCode;
                }
            }
            else {
                this.isCloseDisabled = false;
                if (!this.categoryList.find(this.findDefaultValue)) {
                    this.categoryList.unshift({ id: -1, name: this.translateService.instant('SelectFromList') });
                }
                this.selectedCategory = this.categoryList[0];
                this.markHsCode = '';
                this.comments = '';
                this.heading = this.translateService.instant('AddMark');
                this.subCategoryList = [];
                this.selectedSubCategory = undefined;

            }
            this.isDetailsModalVisible = true;
            this.isSaveDisabled = false;
            this.isDeleteAndDetailsDisabled = true;
            this.onOpeningOfDetailsBox.emit(true);
            this.messageService.setPageChange(action.findingAdded, true);
        }
        else {
            this.isDeleteAndDetailsDisabled = false;
            this.isSaveDisabled = false;
            return;
        }
    }

    addUpdateDetails() {
        this.isSaveDisabled = true;
        if (this.imageMarks[this.index] !== null && this.imageMarks[this.index] !== undefined) {

            if (this.checkDetailsValues()) {
                this.messageService.LoaderMessage = { id: '', headerMessage: 'Mark Information', footerMessage: 'Saving...', showLoader: true, type: spinnerType.small };
                let tempFinding: IFinding = {
                    comment: this.comments,
                    category: this.selectedCategory.id,
                    goodsType: this.selectedSubCategory ? this.selectedSubCategory.id : -1,
                    hsCode: this.markHsCode,
                    name: '',
                    source: 1,
                    isVisible: 'block',
                    viewType: this.selectedView.id,
                    displayBox: {
                        leftTopCoordinate: {
                            x: this.imageMarks[this.index].displayBox.leftTopCoordinate.x,
                            y: this.imageMarks[this.index].displayBox.leftTopCoordinate.y

                        },
                        rightBottomCoordinate: {
                            x: this.imageMarks[this.index].displayBox.leftTopCoordinate.x + this.imageMarks[this.index].displayWidth,
                            y: this.imageMarks[this.index].displayBox.leftTopCoordinate.y + this.imageMarks[this.index].displayHeight

                        }
                    },
                    boundingBox: {
                        leftTopCoordinate: {
                            x: this.imageMarks[this.index].boundingBox.leftTopCoordinate.x,
                            y: this.imageMarks[this.index].boundingBox.leftTopCoordinate.y

                        },
                        rightBottomCoordinate: {
                            x: this.imageMarks[this.index].boundingBox.rightBottomCoordinate.x,
                            y: this.imageMarks[this.index].boundingBox.rightBottomCoordinate.y
                        }
                    }

                };

                if (this.imageMarks[this.index].findingId === '' || this.imageMarks[this.index].findingId === undefined) {
                    this.analyzerService.addImageFinding(this.case.caseId, tempFinding).subscribe(result => {
                        if (result.status === responseStatus.Success) {
                            this.findingArrayManipulated['index'] = this.imageMarks.length - 1;
                            this.messageService.LoaderMessage = { id: 'Mark Information', headerMessage: 'Saving...', footerMessage: '', showLoader: false, type: spinnerType.small };
                            this.setMarks(result.data);

                            this.onFindingsAddRemove.emit(this.imageMarks);
                        }
                    });
                }
                else {

                    tempFinding.findingId = this.imageMarks[this.index].findingId;
                    tempFinding.caseId = this.case.caseId;
                    this.analyzerService.updateImageFinding(this.case.caseId, tempFinding).subscribe(result => {
                        if (result.status === responseStatus.Success) {
                            this.messageService.LoaderMessage = { id: 'Mark Information', headerMessage: 'Saving...', footerMessage: '', showLoader: false, type: spinnerType.small };
                            this.setMarks(result.data);
                        }
                    });
                }
            }
            else {
                this.isSaveDisabled = false;
            }
        }

    }

    setMarks(addedfinding: IFinding): void {
        this.imageMarks[this.index].findingId = addedfinding.findingId;
        this.imageMarks[this.index].hsCode = addedfinding.hsCode;
        this.imageMarks[this.index].comment = addedfinding.comment;
        this.imageMarks[this.index].category = addedfinding.category;
        this.imageMarks[this.index].name = addedfinding.name;
        this.imageMarks[this.index].goodsType = addedfinding.goodsType;
        this.imageMarks[this.index].findingNumber = addedfinding.findingNumber;
        this.closeDetails();
    }

    checkDetailsValues(): boolean {
        if (this.selectedCategory.id === -1) {
            this.findingCategory.isEmpty = true;
            return false;
        }
        else {

            switch (this.selectedCategory.id) {
                case 0:
                case 1:
                    if (this.selectedSubCategory === undefined) {
                        this.findingSubCategory.isEmpty = true;
                        return false;
                    }
                    else {
                        this.findingSubCategory.isEmpty = false;
                    }
                    break;
                case 2:
                    if (this.markHsCode.trim() === '') {
                        this.isMessageShown = true;
                        return false;
                    }
                    else {
                        this.isMessageShown = false;
                    }
                    break;
            }
        }
        return true;
    }

    closeDetails() {
        this.markIsClicked = false;
        this.isDetailsModalVisible = false;
        this.isSaveDisabled = false;
        this.index = -1;
        this.onOpeningOfDetailsBox.emit(false);
        this.messageService.setPageChange(action.findingAdded, false);
    }
    updateMetaData(value: IMetadataImages) {
        this.metadataImages = value;
        if (this.metadataImages !== null && this.metadataImages !== undefined) {
            this.categoryList = [];
            this.categoryList = this.metadataImages.CategoryTypes;
            if (!this.categoryList.find(this.findDefaultValue)) {
                this.categoryList.unshift({ id: -1, name: this.translateService.instant('SelectFromList') });
            }
        }

        this.categoryList = this.metadataImages.CategoryTypes;
    }
    ngOnInit() {
        this.imageMarks = [];

    }
    hideFinding(mark: IFinding) {
        this.imageMarks[this.imageMarks.indexOf(mark)].markClass = 'hidden';
        if (this.isDetailsModalVisible) {
            if (this.index.toString() === this.imageMarks.indexOf(mark).toString()) {
                this.closeDetails();
            }
        }
        this.onFindingsAddRemove.emit(this.imageMarks);
        
    }
    showHideFindings(value: boolean) {
        if (value === false) {
            for (let finding in this.imageMarks) {
                if (this.imageMarks[finding].findingId !== '') {
                    
                    this.imageMarks[finding].markClass = 'hidden';
                }
    
            }
            this.findingArrayManipulated['index'] = -1;
            
            return;
        }
        
        if ((value === true) && this.findingArrayManipulated['index'] > -1) {
            this.imageMarks[this.findingArrayManipulated['index']]['markClass'] = 'markfinder';
            this.findingArrayManipulated['index'] = -1;
            return;          
        }

        if (value === true) {
            for (let finding in this.imageMarks) {
                if (this.imageMarks[finding].findingId !== '') {
                    
                    this.imageMarks[finding].markClass = 'markfinder';
                }
    
            }
            this.findingArrayManipulated['index'] = -1;
            
            return;
        }

        
        
        if (this.isDetailsModalVisible) {
            if (this.index && this.index !== -1) {
                if (this.imageMarks[this.index].findingId !== '') {
                    this.closeDetails();
                }
            }
            this.findingArrayManipulated['index'] = -1;
            
        }

    }
    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            switch (propName) {
                case 'showHideAllFindings':
                    this.showHideFindings(changes[propName].currentValue);
                    break;
                case 'metadataImages':
                    this.updateMetaData(changes[propName].currentValue);
                    break;
                case 'selectedView':
                    this.selectedView = changes[propName].currentValue;
                    break;
                case 'imageMarks':
                    this.imageMarks = [];
                    this.imageMarks = changes[propName].currentValue;
                    break;
                case 'toAnnotate':
                    this.toAnnotate = changes[propName].currentValue;
                    this.cursorType = this.toAnnotate ? 'crossHair' : 'pointer';
                    break;
                case 'resetMarkArea':
                    if (changes[propName].currentValue) {
                        this.reset();
                    }
            }
        }
    }
}
