//import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Component, Inject, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IBroadcastService } from '../../interfaces/interfaces';
import { messageResponseType } from '../../models/enums';
import { IKeyValue } from '../../models/viewModels';
import { SpSelectComponent } from '../../controls/select.control';
@Component({
		selector: 'sp3-comp-modal-cancelreason',
		templateUrl: './modal.casecancelreason.component.html'
})

export class ModalCaseCancelReasonComponent {
		@Output() public confirmButtonStat = new EventEmitter<any>();
		@Input() public reasonsTypes: IKeyValue[];
		@ViewChild('cancelReason') cancelReason: SpSelectComponent;
		public selectedReason: IKeyValue = {id: 0, name: ''};
		public reasonNotes;
		public visible = false;
		public visibleAnimate = false;
		constructor( @Inject('IBroadcastService') private broadcastService: IBroadcastService) {
		}
		public show(): void {
				this.visible = true;
				this.selectedReason = { id: 0, name: '' };
				this.reasonNotes = '';
				setTimeout(() => this.visibleAnimate = true);
		}

		public hide(): void {
				this.visibleAnimate = false;
				setTimeout(() => this.visible = false, 300);
		}     

		yesClick = () => {
				this.broadcastService.broadcast(this.cancelReason.controlId, this.cancelReason.selectedValue);
				if (this.cancelReason.selectedValue.id) {
						this.hide();
						this.confirmButtonStat.emit({
								'status': messageResponseType.Yes,
								'selectedReason': this.cancelReason.selectedValue.id,
								'notes': this.reasonNotes
						});
				}
				}

		noClick = () => {
				this.hide();
				this.confirmButtonStat.emit({
						'status': messageResponseType.No,
						'selectedReason': null,
						'notes': ''
						});
		} 
		closeClick = () => {
				this.hide();
				this.confirmButtonStat.emit({
						'status': messageResponseType.NoWithCondition,
						'selectedReason': null,
						'notes': ''
				});
		} 
}
