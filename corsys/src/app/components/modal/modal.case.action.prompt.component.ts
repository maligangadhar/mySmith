//import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { messageResponseType } from '../../models/enums';
@Component({
		selector: 'sp3-comp-modal-case-action',
		templateUrl: './modal.case.action.prompt.component.html'
})

export class ModalCasePromptComponent {
		@Input() public questionText: string;
		@Input() public caseList: any;
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
		
		public closeClick(): void {
				this.hide();
		}      

		public confirmAction(): void {
				this.confirmButtonStat.emit({
						'status': messageResponseType.Yes
						});
				this.hide();
		}
}
