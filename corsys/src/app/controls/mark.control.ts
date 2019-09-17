import { IMarkArea, IPosition, IMarkAreaOptions, BoundingRectangle, IKeyData, IMarkAreaMove } from '../models/viewModels';
import { Component, EventEmitter, Input, Output, Inject } from '@angular/core';
import { IBroadcastService } from '../interfaces/interfaces';
@Component({
    selector: 'sp3-comp-mark',
    templateUrl: './mark.control.html'
})

export class Sp3MarkControlComponent {
    //@ViewChild('myOverlayDiv') overlayDiv: ElementRef;
    @Input() public marks: IMarkArea[] = [];
    @Input() public offset: number = 0;
    @Input() public width: number;
    @Input() public height: number;
    @Input() public maxPosition: BoundingRectangle;
    @Input() public toAnnotate: boolean = false;
    @Output() updateMarks: EventEmitter<IMarkAreaMove> = new EventEmitter<IMarkAreaMove>();

    public iMarkAreaOptions: IMarkAreaOptions = { minSize: [10, 10], maxSize: [0, 0] };
    public iMarkArea: IMarkArea = { id: 0, width: 100, height: 100, left: 300, top: 400, displayButtons: false, zIndex: 150 };
    public iMarkObj: Object;
    public mouseIsDown: boolean = false;
    dragStart: IPosition;
    visible: boolean = false;

    constructor( @Inject('IBroadcastService') private broadcastService: IBroadcastService) {
        this.updateMarks = new EventEmitter<IMarkAreaMove>();

        this.broadcastService.DataChange.subscribe((result: IKeyData) => {
            if (result.key === 'broadcastMouseUp' && result.data) {
                this.mouseIsDown = false;
                //console.log('mouse down caught');
            }
        });
    }

    public onTouchMove(ev: TouchEvent, mark: IMarkArea): void {
        var touch = ev.touches[0] || ev.changedTouches[0];
        this.panMove(touch.pageX, touch.pageY, mark);
    }

    public onTouchEnd(event: TouchEvent, mark: IMarkArea): void {
        this.mouseIsDown = false;
    }

    public onTouchStart(ev: TouchEvent): void {
        var touch = ev.touches[0] || ev.changedTouches[0];
        this.panDown(touch.pageX, touch.pageY);
    }

    public onMouseMove(event: MouseEvent, mark: IMarkArea): void {
        this.panMove(event.offsetX, event.offsetY, mark);
    }

    public onMouseUp(event: MouseEvent, mark: IMarkArea): void {
        this.mouseIsDown = false;
    }

    public onMouseDown(event: MouseEvent): void {
        this.panDown(event.offsetX, event.offsetY);
    }
    public panMove(offsetX, offsetY, mark) {
        if (this.mouseIsDown) {
            let movedX = offsetX - this.dragStart.x;
            let movedY = offsetY - this.dragStart.y;
            mark.left += movedX;
            mark.top += movedY;

            if (mark.left < this.maxPosition.left) {
                mark.left = this.maxPosition.left;
            }
            if (mark.top < this.maxPosition.top) {
                mark.top = this.maxPosition.top;
            }
            //console.log('MM', this.offset, offsetX, movedX, movedY, mark.left , mark.width , this.maxPosition.left , this.maxPosition.width);
            if (mark.left + mark.width > this.maxPosition.left + this.maxPosition.width + this.offset) {
                mark.left = this.maxPosition.width - mark.width + this.offset;
            }

            if (mark.top + mark.height > this.maxPosition.top + this.maxPosition.height) {
                mark.top = this.maxPosition.height - mark.height;
            }
            let movedMark: IMarkAreaMove = { mark: mark, movedX: mark.left - this.dragStart.x, movedY: mark.top - this.dragStart.y };
            this.updateMarks.emit(movedMark);
        }
    }
    public panDown(offsetX, offsetY) {
        this.mouseIsDown = true;
        //console.log(this.dragStart);
        this.dragStart = { x: offsetX, y: offsetY };
    }
}
