import { Component, Input, Output, EventEmitter } from '@angular/core';
import { messageType } from '../../models/enums';

@Component({
    selector: 'sp3-comp-duplicate-action',
    templateUrl: './modal.duplicateAction.component.html'
})

export class ModalDuplicateActionComponent {
    @Input() duplicateActionMessage: string = 'DuplicateAction';
    @Output() closeAction = new EventEmitter<messageType>();
    visible: boolean = false;
    visibleAnimate: boolean = false;
    close = () => {
        this.visible = false;
        this.visibleAnimate = false;
        this.closeAction.emit(messageType.Success);
    }

    show = () => {
        this.visible = true;
        this.visibleAnimate = true;
    }
}
