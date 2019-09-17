import { Component, Input, Output, EventEmitter } from '@angular/core';
import { messageResponseType } from '../../models/enums';

@Component({
		selector: 'sp3-comp-modal-input',
		templateUrl: './modal.attachmentdetails.component.html'
})

export class ModalAttachcmentInputComponent {
		@Input() public title: string;
		@Input() public description: string;
		@Input() public filename: string;
		@Output() confirmButtonStat = new EventEmitter<Object>();

		public visible = false;
		public visibleAnimate = false;
		public titleLengthLimit = 255;
		public descriptionLengthLimit = 1200;
		public show(): void {
				this.visible = true;
				setTimeout(() => {
						this.visibleAnimate = true;
				});
		}

		public hide(): void {
				this.visibleAnimate = false;
				setTimeout(() => this.visible = false, 300);
		} 

		yesClick = () => {
				this.hide();
				this.confirmButtonStat.emit({status: messageResponseType.Yes, title: this.title, description: this.description});
		}

		noClick = () => {
				this.hide();
				this.confirmButtonStat.emit({status: messageResponseType.No, title: this.title, description: this.description});
		} 

		closeClick = () => {
				this.hide();
				this.confirmButtonStat.emit({status: messageResponseType.No, title: this.title, description: this.description});
		}

}
