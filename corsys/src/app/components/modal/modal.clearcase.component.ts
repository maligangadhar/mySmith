import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { ICustomMessageResponse } from '../../models/viewModels';
import { messageResponseType } from '../../models/enums';
import { SpMultiTextComponent } from '../../controls/multitext.control';

@Component({
	selector: 'sp3-comp-modal-clear-case',
	templateUrl: './modal.clearcase.component.html'
})

export class ModalClearCasePopupComponent implements OnInit {

	@Output() confirmButtonStat = new EventEmitter<ICustomMessageResponse<string>>();
	@Input() public case: string[] = [];
	@Input() public questionText: string = '';
	@Input() public buttonTitle: string = '';
	@Input() public customContainerCSS: string = '';
	@Input() public customCSS: string = '';
	@ViewChild('textAreaSelector') spMultiText: SpMultiTextComponent;
	public visible = false;
	public visibleAnimate = false;
	public descriptionLengthLimit = 1200;
	public description: string = '';

	public closeClick(): void {
		this.hide();
		this.confirmButtonStat.emit({ status: messageResponseType.No, result: this.description });
	}

	public yesClick(): void {
		if (this.description && this.description.length > 0) {
			this.hide();
			this.confirmButtonStat.emit({ status: messageResponseType.Yes, result: this.description });
		}
		else {
			this.spMultiText.focusOut();
			return;
		}
	}

	public show(): void {
		this.description = '';
		this.visible = true;
		this.visibleAnimate = true;
	}

	public hide(): void {
		this.visible = false;
		this.visibleAnimate = false;
	}

	ngOnInit(): void {
		this.description = '';
	}
}
