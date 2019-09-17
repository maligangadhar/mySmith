import { Component } from '@angular/core';
import { ILeaveMessage } from '../../models/viewModels';

@Component({
		selector: 'sp3-comp-modal-leave-message',
		templateUrl: './modal.leave.message.component.html'
})

export class ModalLeaveMessageComponent {
		pageKey: string;
		public visible = false;
		private visibleAnimate = false;

		public show(message: ILeaveMessage): void {
				this.visible = true;
				this.pageKey = message.key;
				setTimeout(() => this.visibleAnimate = true);
		}

		public hide(): void {
				this.visibleAnimate = false;
				setTimeout(() => this.visible = false, 300);
    }
    
    public yesClick(): void {
      this.visible = true;
      setTimeout(() => this.visibleAnimate = true);
    }

    public noClick(): void {
      this.hide();
    }
}
