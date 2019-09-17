import { Component } from '@angular/core';

@Component({
		selector: 'sp3-comp-modal-confirm',
		templateUrl: './modal.confirm.component.html'
})

export class ModalConfirmComponent {

	public visible = false;
	public visibleAnimate = false;

	public show(): void {
		this.visible = true;
		//console.log("inside show");
		setTimeout(() => this.visibleAnimate = true);
	}

	public hide(): void {
		this.visibleAnimate = false;
		setTimeout(() => this.visible = false, 300);
	}
}
