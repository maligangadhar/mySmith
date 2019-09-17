import { Component, Input, Inject, ViewChild, Output, EventEmitter } from '@angular/core';
import { IAttachment, ICustomMessageResponse } from '../models/viewModels';
import { IAttachmentService } from '../interfaces/interfaces';
import { ModalAttachcmentInputComponent } from '../components/modal/modal.attachmentdetails.component';
import { messageResponseType } from '../models/enums';
@Component({
		selector: 'sp3-comp-attachment-upload',
		templateUrl: './attachment.upload.control.html'
})

export class SPAttachmentUploadComponent {
		@Input() public isDisabled: boolean = false;
		@ViewChild('inputElem') inputElem:  any;
		@Input() public attachmentButtonTitle:string='Add New Attachment';
		@ViewChild('modalInputForm') modalInputForm: ModalAttachcmentInputComponent;
		@Output() confirmButtonStat = new EventEmitter<ICustomMessageResponse<IAttachment>>();
		public description: string;
		public file: Object = {};
		public acceptedMimeTypes: string = 'image/png, application/pdf, image/tiff, image/jpeg, application/vnd.openxmlformats-officedocument.wordprocessingml.document';
		constructor(@Inject('IAttachmentService') private attachmentService: IAttachmentService) {}

		onFileUpload = (event) => {
				this.file = event.dataTransfer ? event.dataTransfer.files[0] : event.target.files[0];
				var status = this.attachmentService.attachmentValidation(this.file, this.acceptedMimeTypes);
						if (status) {
								let name = this.file['name'];
								this.modalInputForm.filename = name;
								let fileTypeIndex = name.lastIndexOf('.');
								this.modalInputForm.title = fileTypeIndex > -1 ? name.substr(0, fileTypeIndex): name;
								this.modalInputForm.description = '';
								this.modalInputForm.show();
						} else {
							this.inputElem.nativeElement.value = '';
						}
		}

		modalInputClick = (response: Object) => {
				if (response['status'] === messageResponseType.Yes) {
								this.attachmentService.convertToByteArray(this.file, response['title'], response['description']).subscribe(result => {
										this.confirmButtonStat.emit({status: messageResponseType.Yes, result: result});
										this.inputElem.nativeElement.value = '';
								});
						} else {
							this.inputElem.nativeElement.value = '';
						}
		}
}
