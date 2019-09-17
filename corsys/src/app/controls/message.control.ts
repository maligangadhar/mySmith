import { Component, Inject, Input } from '@angular/core';
import { IMessage } from '../models/viewModels';
import { IMessageService } from '../interfaces/interfaces';
import { messageType } from '../models/enums';

@Component({
		selector: 'sp3-comp-message-display',
		templateUrl: './message.control.html'
})

export class SpMessageDisplayComponent {
		@Input() public id: string;
		@Input() timer?: number = 5000;
		message: IMessage = {message : '',  showMessage : false, type : messageType.Success};
		onMessageAdded: (item: IMessage) => void;

		constructor( @Inject('IMessageService') private messageService: IMessageService) {
				var vm = this;
				vm.messageService.MessageAdded.subscribe(item => this.onMessageAdded(item));
				function triggerTimeOut() {
					setTimeout(function () {
						vm.message.showMessage = false;
					}, vm.timer);
				}
				vm.onMessageAdded = (item: IMessage) => {
						vm.message = item;
						triggerTimeOut();
				};
		}
}
