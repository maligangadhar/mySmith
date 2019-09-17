import { IPosition, IRuler, IKeyValue, ICase } from '../models/viewModels';
import { Component, OnInit, HostListener, Input, Output, EventEmitter, SimpleChange, OnChanges, Inject, ViewChild } from '@angular/core';
import { IAnalyzerService, IMessageService } from '../interfaces/interfaces';
import { responseStatus, messageResponseType, findingStatus, imageConfig, spinnerType } from '../models/enums';
import { ModalPromptComponent } from '../components/modal/modal.prompt.component';
import { ModalConfirmComponent } from '../components/modal/modal.confirm.component';
@Component({
    selector: 'sp3-comp-ruler',
    templateUrl: './ruler.control.html'
    //styleUrls: ['./ruler.control.scss']
})

export class Sp3RulerControlComponent implements OnInit, OnChanges {
    @ViewChild('modalPrompt') modalPrompt: ModalPromptComponent;
    @ViewChild('modalRulerCreationValidation') modalRulerCreationValidation: ModalConfirmComponent;
    public isRulerSelected: boolean = false;
    @Input() public toDrawRuler: boolean = false;
    public resetRuler: boolean = false;
    // private rulerMouseDown: boolean = false;
    private rulerMouseMove: boolean;
    disablePopUp: boolean = false;
    isRulersButtonsVisible: boolean = false;
    indexOfRulerButton: any = -1;
    rulerQuestion: string = '';
    rulerArrayManipulated: Object = {index: -1};
    @Input() public rulerArray: IRuler[] = [];
    @Input() public resetRulerArea: boolean = false;
    @Input() public toRuler: boolean = false;
    @Input() public selectedView: IKeyValue;
    @Input() public width: number;
    @Input() public height: number;
    @Input() public contextSize: IPosition;
    @Input() public viewMode?: boolean = false;
    @Input() public editFinding?: boolean = false;
    @Input() public case: ICase = null;
    @Input() public showHideAllRulers: boolean = false;
    @Input() public zoomValue: any = 1;
    @Input() public leftStart: number;
    @Input() public topStart: number;

    @Input() public picPos: IPosition;
    @Input() public readerWidth: number;
    @Input() public readerHeight: number;
    @Input() public actZoomValue: number;
    @Output() onRulerAddRemove: EventEmitter<IRuler[]> = new EventEmitter<IRuler[]>();
    @Output() onOpeningOfDetailsBox: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() hideRulers: EventEmitter<boolean> = new EventEmitter<boolean>();
    public rulerWidth: number;
    public cursorType: string = 'pointer';
    public dragStart: IPosition = { x: 0, y: 0 };
    public currentAngle: number;
    public selectedRulerIdx: number = -1;
    public initHideRuler: boolean = false;
    public rulerStartPos: IPosition = { x: 0, y: 0 };
    public lastMousePos: IPosition = { x: 0, y: 0 };
    isLoading: boolean = false;
    isCreationInProgress: boolean = false;
    indexOfCreation: any = -1;
    rulerHeight: number = 19;
    public iRuler: IRuler = {
        rulerId: '',
        height: 19,
        rulerWidth: 0,
        actualWidth: 0,
        name: '',
        displayCoordinates: {
            startPoint: { x: 0, y: 0 },
            endPoint: { x: 0, y: 0 }
        },
        coordinates: {
            startPoint: { x: 0, y: 0 },
            endPoint: { x: 0, y: 0 }
        },
        source: 1,
        zIndex: 100,
        rulerClass: '',
        length: 0,
        angle: 0,
        viewType: 0
    };
    constructor( @Inject('IAnalyzerService') private analyzerService: IAnalyzerService, @Inject('IMessageService') private messageService: IMessageService) {

    }

    @HostListener('mousedown', ['$event'])
    @HostListener('touchstart', ['$event'])
    public onMousedown(event) {
        if (this.modalPrompt.visible) {
            return;
        }
        if (this.toDrawRuler && !this.isCreationInProgress) {
            this.isCreationInProgress = true;
            let clientY = event.touches ? event.touches[0].clientY : event.clientY;
            let clientX = event.touches ? event.touches[0].clientX : event.clientX;

            this.dragStart = { x: clientX, y: clientY };
            //this.mouseLastEvt = eventde;
            this.lastMousePos.x = clientX;
            this.lastMousePos.y = clientY;
            // this.rulerMouseDown = true;
            this.iRuler = {
                rulerId: '',
                displayCoordinates: {
                    startPoint: { x: 0, y: 0 },
                    endPoint: { x: 0, y: 0 }
                },
                coordinates: {
                    startPoint: { x: 0, y: 0 },
                    endPoint: { x: 0, y: 0 }
                },
                height: 19,
                name: '',
                zIndex: 100,
                rulerClass: 'rulerNormal',
                angle: 0,
                length: 0,
                rulerWidth: 0,
                actualWidth: 0,
                source: 1,
                isVisible: 'block',
                viewType: this.selectedView.id
            };
            this.iRuler.displayCoordinates.startPoint.x = clientX - this.leftStart;
            // bug no #4065 remove vertical gap while draw the ruler
            this.iRuler.displayCoordinates.startPoint.y = clientY - 104;
            this.iRuler.height = this.rulerHeight * this.zoomValue;
            if (this.initHideRuler) {
                this.iRuler.isVisible = 'none';
            }
            this.rulerArray.push(this.iRuler);
            this.indexOfCreation = this.rulerArray.indexOf(this.iRuler);
            this.rulerMouseMove = true;
        }
    }
    @HostListener('mouseup', ['$event'])
    onmouseup(event: MouseEvent) {

        if (this.modalPrompt.visible) {
            return;
        }
        if (this.toDrawRuler && this.isCreationInProgress) {
            this.isLoading = true;
            this.disablePopUp = true;
            this.toDrawRuler = false;
            this.rulerMouseMove = false;
            if (this.iRuler.rulerWidth === 0 && this.rulerArray.indexOf(this.iRuler) !== undefined) {
                this.rulerArray.splice(this.rulerArray.indexOf(this.iRuler), 1);
                this.isLoading = false;
                this.toDrawRuler = true;
                this.disablePopUp = false;
                this.isCreationInProgress = false;
            }
            else if (this.iRuler.rulerWidth > 0 && this.iRuler.rulerWidth < 50 && this.rulerArray.indexOf(this.iRuler) !== undefined) {
                this.rulerArray.splice(this.rulerArray.indexOf(this.iRuler), 1);
                this.isLoading = false;
                this.modalRulerCreationValidation.show();

                this.disablePopUp = false;
                this.toDrawRuler = true;
                this.isCreationInProgress = false;
            }
            else {
                this.toDrawRuler = false;
                this.isLoading = true;
                this.iRuler.viewType = this.selectedView.id;
                this.analyzerService.addImageRuler(this.case.caseId, this.iRuler).subscribe(result => {

                    if (result.status === responseStatus.Success) {
                        this.rulerArray[this.rulerArray.indexOf(this.iRuler)].rulerId = result.data.rulerId;
                        this.rulerArrayManipulated['index'] = this.rulerArray.length -1;
                        this.onRulerAddRemove.emit(this.rulerArray);
                    }
                    else {
                        this.rulerArray.splice(this.rulerArray.length - 1, 1);
                    }
                    this.toDrawRuler = true;
                    this.isLoading = false;
                    this.disablePopUp = false;
                    this.isCreationInProgress = false;
                });
            }
        }
        this.isRulerSelected = false;
        for (let ruler in this.rulerArray) {
            if (this.rulerArray[ruler].rulerWidth < 50 ||
                (this.rulerArray[ruler].rulerId === '' &&
                    this.rulerArray.indexOf(this.rulerArray[ruler]) !== this.rulerArray.length - 1
                )
            ) {
                this.rulerArray.splice(this.rulerArray.indexOf(this.rulerArray[ruler]), 1);
            }
        }
    }

    @HostListener('mousemove', ['$event'])
    @HostListener('touchmove', ['$event'])
    onMousemove(event) {
        if (this.modalPrompt.visible) {
            return;
        }
        let clientY = event.touches ? event.touches[0].clientY : event.clientY;
        let clientX = event.touches ? event.touches[0].clientX : event.clientX;

        if (this.toDrawRuler) {
            if (this.rulerMouseMove && !this.isRulerSelected) {
                var position = this.calcPosition(clientX, clientY);
                var angle = this.calcAngle(position.horizontal, position.vertical);
                angle = this.getAreaFactor(clientX, clientY, angle);
                if (angle >= 90 && angle <= 270) {
                    this.iRuler.rulerClass = 'rulerFlipHorizontal';
                } else {
                    this.iRuler.rulerClass = 'rulerNormal';
                }
                this.iRuler.angle = Math.floor(angle);
                this.iRuler.displayCoordinates.endPoint.x = clientX - 640;
                this.iRuler.displayCoordinates.endPoint.y = clientY - 148;
                this.iRuler.coordinates.startPoint.x = ((this.iRuler.displayCoordinates.startPoint.x - this.picPos.x) / this.zoomValue);
                this.iRuler.coordinates.startPoint.y = ((this.iRuler.displayCoordinates.startPoint.y - this.picPos.y) / this.zoomValue);
                this.iRuler.coordinates.endPoint.x = ((this.iRuler.displayCoordinates.endPoint.x - this.picPos.x) / this.zoomValue);
                this.iRuler.coordinates.endPoint.y = ((this.iRuler.displayCoordinates.endPoint.y - this.picPos.y) / this.zoomValue);

            }
        }
        if (this.isRulerSelected) {
            //this.moveRuler(event);
        }
    }
    public validationOkClick = () => {
        //this.rulerArray.splice(this.rulerArray.length - 1, 1);
        this.modalRulerCreationValidation.hide();
    }
    public leaveRuler(event: MouseEvent) {
        this.initHideRuler = false;
    }
    //indexOfRulerToDelete: number = -1;
    public deleteRuler() {
        if (this.indexOfRulerButton !== -1) {
            this.modalPrompt.show();
        }
    }

    public modalPromptClick = (response) => {
        if (response.status === messageResponseType.Yes) {
            // this.toDrawRuler = false;
            this.messageService.LoaderMessage = { id: '', headerMessage: 'Loading', footerMessage: 'Ruler deleting...', showLoader: true, type: spinnerType.small };
            if (this.rulerArray[this.indexOfRulerButton].rulerId === '') {
                this.rulerArray.splice(this.indexOfRulerButton, 1);
                this.isRulerSelected = false;
                this.initHideRuler = false;
                this.closeRulerButtons();
            }
            else {
                this.analyzerService.deleteRuler(this.case.caseId, this.rulerArray[this.indexOfRulerButton].rulerId, findingStatus.Deleted).subscribe(result => {
                    if (result.status === responseStatus.Success) {
                        this.messageService.LoaderMessage = { id: '', headerMessage: 'Loading', footerMessage: 'Ruler deleting...', showLoader: false, type: spinnerType.small };
                        this.rulerArray.splice(this.indexOfRulerButton, 1);
                        this.isRulerSelected = false;
                        this.initHideRuler = false;
                    }
                    this.closeRulerButtons();

                });
            }
        }
        else {
            this.closeRulerButtons();
        }
        this.modalPrompt.hide();

    }

    public rulerMouseUp(event: MouseEvent) {
        this.rulerNotSelected();
    }

    public onTouchEnd(event: TouchEvent) {
        this.rulerNotSelected();
    }

    public rulerNotSelected() {
        this.isRulerSelected = false;
        this.initHideRuler = false;
    }

    public ruleredown(ruler: IRuler) {
        this.currentRuler(ruler);
    }

    public onTouchStart(event: TouchEvent, ruler: IRuler): void {
        this.currentRuler(ruler);
    }
    annotationBoxX: any = 0;
    annotationBoxY: any = 0;
    public calculateAnnotationBoxXY() {
        let angleRuler = this.rulerArray[this.indexOfRulerButton].angle * Math.PI / 180;
        //let widthofruler: any = Math.abs(this.rulerArray[this.indexOfRulerButton].coordinates.endPoint.x - this.rulerArray[this.indexOfRulerButton].coordinates.startPoint.x);
        this.annotationBoxX = this.rulerArray[this.indexOfRulerButton].displayCoordinates.startPoint.x + this.rulerArray[this.indexOfRulerButton].rulerWidth * Math.cos(angleRuler),
            this.annotationBoxY = this.rulerArray[this.indexOfRulerButton].displayCoordinates.startPoint.y + this.rulerArray[this.indexOfRulerButton].rulerWidth * Math.sin(angleRuler);

        if ((this.rulerArray[this.indexOfRulerButton].angle >= 0 && this.rulerArray[this.indexOfRulerButton].angle <= 90) ||
            (this.rulerArray[this.indexOfRulerButton].angle >= 270 && this.rulerArray[this.indexOfRulerButton].angle <= 360)) {
            this.annotationBoxX = this.annotationBoxX - 150;
            this.annotationBoxY = this.annotationBoxY + 35;
        }
        else if ((this.rulerArray[this.indexOfRulerButton].angle >= 180 && this.rulerArray[this.indexOfRulerButton].angle <= 270)) {
            this.annotationBoxY = this.annotationBoxY + 25;
        }

        if ((this.height - this.annotationBoxY) < 150) {
            this.annotationBoxY -= 200;
        }
    }
    public openRulerButtons(ruler: IRuler) {
        if (!this.isLoading) {
            this.isRulersButtonsVisible = !this.isRulersButtonsVisible;
            if (this.isRulersButtonsVisible) {
                this.indexOfRulerButton = this.rulerArray.indexOf(ruler);
                this.calculateAnnotationBoxXY();
                this.onOpeningOfDetailsBox.emit(true);
            }
            else {
                this.closeRulerButtons();
            }
        }
    }
    closeRulerButtons() {
        this.isRulersButtonsVisible = false;
        this.indexOfRulerButton = -1;
        this.onOpeningOfDetailsBox.emit(false);

    }
    public currentRuler(ruler: IRuler) {
        this.initHideRuler = true;
        this.rulerStartPos.x = ruler.displayCoordinates.startPoint.x;
        this.rulerStartPos.y = ruler.displayCoordinates.startPoint.y;
        setTimeout(() => {
            this.isRulerSelected = true;
            this.selectedRulerIdx = this.rulerArray.indexOf(ruler);
        }, 10);
    }

    public calcPosition(x, y) {

        let lengthX = this.lastMousePos.x < x ? x - this.lastMousePos.x : this.lastMousePos.x - x;
        let lengthY = this.lastMousePos.y < y ? y - this.lastMousePos.y : this.lastMousePos.y - y;

        let newLength = 0;
        if (lengthX === 0 || lengthY === 0) {
            newLength = lengthX === 0 ? lengthY : lengthX;
        }
        else {
            newLength = (lengthX * lengthX) + (lengthY * lengthY);
            newLength = Math.sqrt(newLength);
        }
        this.iRuler.rulerWidth = newLength;
        this.iRuler.actualWidth = newLength;// * this.contextSize.x / this.width;

        this.iRuler.length = Number((this.iRuler.actualWidth * (1 / this.zoomValue) * imageConfig.scanResoution).toFixed(3));
        return { horizontal: lengthX, vertical: lengthY };
    }

    public calcAngle(horizontal, vertical) {
        return Math.atan(horizontal / vertical) / (Math.PI / 180);
    }

    public getAreaFactor(clientX, clientY, angle) {
        let left = this.lastMousePos.x > clientX ? 'e' : 'w';
        let top = this.lastMousePos.y > clientY ? 'n' : 's';
        let area = left + top;
        let temp: any;
        let staticAngle: number = 90;
        switch (area) {
            case 'en':
                temp = (staticAngle * 2) + (staticAngle - angle);
                break;
            case 'wn':
                temp = (staticAngle * 3) + angle;
                break;
            case 'ws':
                temp = staticAngle - angle;
                break;
            case 'es':
                temp = (staticAngle * 2) - (staticAngle - angle);
                break;
        }
        return temp;
    }

    public moveRuler(event) {
        this.cancelEvent(event);
        let clientY = event.touches ? event.touches[0].clientY : event.clientY;
        let clientX = event.touches ? event.touches[0].clientX : event.clientX;
        focus();
        if (this.rulerArray[this.selectedRulerIdx] != undefined) {
            this.rulerArray[this.selectedRulerIdx].displayCoordinates.startPoint.x = clientX - (this.iRuler.displayCoordinates.startPoint.x - this.rulerStartPos.x);
            this.rulerArray[this.selectedRulerIdx].displayCoordinates.startPoint.y = clientY - (this.iRuler.displayCoordinates.startPoint.y - this.rulerStartPos.y);
        }
    }

    public cancelEvent(e) {
        var event = e || window.event || {};
        event.cancelBubble = true;
        event.returnValue = false;
        event.stopPropagation && event.stopPropagation(); // jshint ignore: line
        event.preventDefault && event.preventDefault(); // jshint ignore: line
    }
    hideRuler() {
        if (this.indexOfRulerButton !== -1) {
            this.rulerArray[this.indexOfRulerButton].rulerClass = 'hidden';
            this.isRulersButtonsVisible = false;
        }
        /* let flag: boolean = true;
        for (let ruler in this.rulerArray) {
            if (this.rulerArray[ruler].rulerClass !== 'hidden') {
                flag = false;
                break;
            }
        }
        if (flag === true) { */
            this.onRulerAddRemove.emit(this.rulerArray);
            
            // this.hideRulers.emit(true);

        // }
    }
    reset() {
        this.rulerArray = [];
        this.isRulersButtonsVisible = false;
        this.indexOfRulerButton = -1;
    }
    showHideRulers(value: boolean) {
        if (value === false) {
            this.rulerArray.forEach( (param: IRuler) => param.rulerClass = 'hidden');
            this.rulerArrayManipulated['index'] = -1;
            this.closeRulerButtons();
            return;
        }

        if (value === true && this.rulerArrayManipulated['index'] > -1) {
            let index = this.rulerArrayManipulated['index'];
            if (this.rulerArray[index].angle >= 90 && this.rulerArray[index].angle <= 270) {
                this.rulerArray[index].rulerClass = 'rulerFlipHorizontal';
            } else {
                this.rulerArray[index].rulerClass = 'rulerNormal';
            } 
            this.rulerArrayManipulated['index'] = -1;
            return;
        }
        if (value === true) {
            for (let ruler in this.rulerArray) {
                if (this.rulerArray[ruler].angle >= 90 && this.rulerArray[ruler].angle <= 270) {
                    this.rulerArray[ruler].rulerClass = 'rulerFlipHorizontal';
                } else {
                    this.rulerArray[ruler].rulerClass = 'rulerNormal';
                }
            }
            this.rulerArrayManipulated['index'] = -1;
            /* this.rulerArray.forEach( (param: IRuler) => param.rulerClass = 'hidden');
            this.rulerArrayManipulated['index'] = -1;
            this.closeRulerButtons();
            return; */
        }
        /* for (let ruler in this.rulerArray) {
            if (value) {
                if (this.rulerArray[ruler].angle >= 90 && this.rulerArray[ruler].angle <= 270) {
                    this.rulerArray[ruler].rulerClass = 'rulerFlipHorizontal';
                } else {
                    this.rulerArray[ruler].rulerClass = 'rulerNormal';
                }
            }
            else {
                this.rulerArray[ruler].rulerClass = 'hidden';
            }
        }
        this.closeRulerButtons(); */
    }
    ngOnInit() {
        this.rulerArray = [];
    }
    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            switch (propName) {
                case 'selectedView':
                    this.selectedView = changes[propName].currentValue;
                    break;
                case 'toDrawRuler':
                    this.toDrawRuler = changes[propName].currentValue;
                    this.cursorType = this.toDrawRuler ? 'crossHair' : 'pointer';
                    break;
                case 'rulerArray':
                    this.rulerArray = [];
                    this.rulerArray = changes[propName].currentValue;
                    break;
                case 'showHideAllRulers':
                    this.showHideRulers(changes[propName].currentValue);
                    break;
                case 'resetRulerArea':
                    if (changes[propName].currentValue) {
                        this.reset();
                    }
                    break;
                case 'zoomValue':
                    this.zoomValue = changes[propName].currentValue;
                case 'actZoomValue':
                    this.rulerHeight = 19 / changes[propName].currentValue;
            }

        }

    }
}
