import { Component, EventEmitter, Input, Output } from '@angular/core';
import { messageResponseType } from '../../models/enums';

@Component({
	selector: 'sp3-comp-modal-case-alert',
	templateUrl: './modal.case.alert.component.html'
})

export class ModalCaseAlertComponent {
	@Input() public questionText: string;
	@Input() public caseList: any;
	@Input() public pageTitle: string;
	@Input() public button1Text: string = 'Yes';
	@Input() public button2Text: string = 'No';
	@Output() confirmButtonStat = new EventEmitter<messageResponseType>();
	public visible = false;
	public visibleAnimate = false;

	public show(): void {
		this.visible = true;
		setTimeout(() => this.visibleAnimate = true);
	}

	public hide(): void {
		this.visibleAnimate = false;
		setTimeout(() => this.visible = false, 300);
	}

	yesClick = () => {
		this.hide();
		this.confirmButtonStat.emit(messageResponseType.Yes);
	}

	noClick = () => {
		this.hide();
		this.confirmButtonStat.emit(messageResponseType.No);
	}

	closeClick = () => {
		this.hide();
		this.confirmButtonStat.emit(messageResponseType.No);
	}
}
