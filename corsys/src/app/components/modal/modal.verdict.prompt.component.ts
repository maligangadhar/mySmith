import { Component, EventEmitter, Output, Input } from '@angular/core';
import { messageResponseType } from '../../models/enums';
@Component({
	selector: 'sp3-comp-modal-verdict-prompt',
	templateUrl: './modal.verdict.prompt.component.html'
})

export class ModalVerdictPromptComponent {
	@Input() public questionText: string;
	@Input() public querydynamicId?: string;
	@Input() public caseList: any;
	@Input() public headerText?: string = '';
	@Input() public customContainerCSS: string = '';
	@Input() public yesButtonTitle?: string = 'Yes';
	@Output() public confirmButtonStat = new EventEmitter<any>();
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

	public cancelAction(): void {
		this.confirmButtonStat.emit(messageResponseType.No);
		this.hide();
	}

	public confirmAction(): void {
		this.confirmButtonStat.emit({
			'status': messageResponseType.Yes
		});
		this.hide();
	}
}
