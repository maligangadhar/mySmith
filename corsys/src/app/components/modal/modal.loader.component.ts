import { Component, Inject } from '@angular/core';
import { IMessageService } from '../../interfaces/interfaces';
import { ILoaderMessage } from '../../models/viewModels';
//import { ILoaderMessage } from '../../models/viewmodels';

@Component({
		selector: 'sp3-comp-modal-loader',
		templateUrl: './modal.loader.component.html'
})

export class ModalLoaderComponent {
		public visible = false;
		public visibleAnimate = false;
		loaderMessage: ILoaderMessage;

		constructor( @Inject('IMessageService') public messageService: IMessageService) { 
				var vm = this;
				vm.messageService.LoaderMessageAdded.subscribe(item => {
						vm.loaderMessage = item;
						if (vm.loaderMessage.showLoader) {
								vm.show();
						} else {
								vm.hide();
						}
				});
		}

		public show(): void {
				this.visible = true;
				this.visibleAnimate = true;
		}

		public hide(): void {
				this.visibleAnimate = false;
				this.visible = false;
		}
}
