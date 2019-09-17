import { Injectable, EventEmitter } from '@angular/core';
import { IMessage, IPageChange, ILeaveMessage, ILoaderMessage, IOperationAllowed } from '../models/viewModels';
import { IMessageService } from '../interfaces/interfaces';
import { action, page } from '../models/enums';

@Injectable()
export class MessageService implements IMessageService {
    message: IMessage;
    pageChanged: IPageChange = { landing: false, roleCreate: false, roleEdit: false, userCreate: false, userEdit: false, generalEdit: false, appEdit: false, imageEdit: false, findingAdded: false,profileEdit:false,rapEdit:false,dcEdit:false,operationalEdit :false,locationEdit:false,devicesEdit:false};
		operationAllowed: boolean;
		currentPage: page;
		leaveMessage: ILeaveMessage = { key: '', showMessage: false, type: action.homeButtonClick };
		loaderMessage: ILoaderMessage;


		public MessageAdded: EventEmitter<IMessage>;
		public LeaveMessageAdded: EventEmitter<ILeaveMessage>;
		public LoaderMessageAdded: EventEmitter<ILoaderMessage>;

		public OperationGoAhead: EventEmitter<IOperationAllowed>;

		showLeaveMessage: (currentAction: action) => boolean;
		setPageChange: (currentAction: action, status: boolean) => void;
		resetPageChange: () => void;
		getPageChange: (currentAction: action) => boolean;

		get CurrentPage(): page {
				return this.currentPage;
		}

		set CurrentPage(value: page) {
				this.currentPage = value;
				//this.MessageAdded.emit(this.page);
		}

		get Message(): IMessage {
				return this.message;
		}

		set Message(value: IMessage) {
				this.message = value;
				this.MessageAdded.emit(this.message);
		}

		get LeaveMessage(): ILeaveMessage {
				return this.leaveMessage;
		}

		set LeaveMessage(value: ILeaveMessage) {
				this.leaveMessage = value;
				this.LeaveMessageAdded.emit(this.leaveMessage);
		}

		get LoaderMessage(): ILoaderMessage {
			// uncomment below line to remove loader for dev purpose
			//this.loaderMessage.showLoader = false;
				return this.loaderMessage;
		}

		set LoaderMessage(value: ILoaderMessage) {
				this.loaderMessage = value;
				// uncomment below line to remove loader for dev purpose
				//this.loaderMessage.showLoader = false;
				this.LoaderMessageAdded.emit(this.loaderMessage);
		}
		
		set OperationAllowed(value: boolean) {
				this.operationAllowed = value;
				this.OperationGoAhead.emit({ from: this.leaveMessage.type, operationAllowed: value });
		}

		constructor() {
				var vm = this;
				vm.MessageAdded = new EventEmitter();
				vm.LeaveMessageAdded = new EventEmitter();
				vm.OperationGoAhead = new EventEmitter();
				vm.LoaderMessageAdded = new EventEmitter();

				vm.setPageChange = (currentAction: action, status: boolean) => {
						switch (currentAction) {
								case action.roleEdit:
										vm.pageChanged.roleEdit = status;
										break;
								case action.roleCreate:
										vm.pageChanged.roleCreate = status;
										break;
								case action.userCreate:
										vm.pageChanged.userCreate = status;
										break;
								case action.userEdit:
										vm.pageChanged.userEdit = status;
										break;
								case action.generalSettingsChange:
										vm.pageChanged.generalEdit = status;
										break;
								case action.appEdit:
										vm.pageChanged.appEdit = status;
										break;                                       
								case action.imageEdit:
										vm.pageChanged.imageEdit = status;
                    break;
                case action.findingAdded:
                    vm.pageChanged.findingAdded = status;
                    break;
                case action.profileEdit:
                    vm.pageChanged.profileEdit = status;
                    break;
                case action.rapEdit:
                    vm.pageChanged.rapEdit = status;
                    break;
                case action.dcEdit:
                    vm.pageChanged.dcEdit = status;
                    break;
                case action.operationalEdit:
                    vm.pageChanged.operationalEdit = status;
                    break;
                case action.locationEdit:
                    vm.pageChanged.locationEdit = status;
                    break;
                case action.devicesEdit:
                    vm.pageChanged.devicesEdit = status;
                    break;
						}
				};
        vm.resetPageChange = () => {
            vm.pageChanged = { landing: false, roleCreate: false, roleEdit: false, userCreate: false, userEdit: false, generalEdit: false, appEdit: false, imageEdit: false, findingAdded: false,profileEdit:false,rapEdit:false,dcEdit:false,operationalEdit :false,locationEdit:false,devicesEdit:false };
				};
				vm.showLeaveMessage = (currentAction: action) => {
						switch (currentAction) {
								case action.roleTabChange:
										return vm.pageChanged.roleCreate || vm.pageChanged.roleEdit || vm.pageChanged.userCreate || vm.pageChanged.userEdit || vm.pageChanged.generalEdit || vm.pageChanged.appEdit;
								case action.roleChange:
								case action.roleFilterChange:
								case action.roleAddButtonClick:
								case action.roleSearch:
								case action.roleEditCancelClick:
										return vm.pageChanged.roleEdit;
								case action.userChange:
								case action.userFilterChange:
								case action.userAddButtonClick:
								case action.userSearch:
								case action.userEditCancelClick:
										return vm.pageChanged.userEdit;
								case action.userCreateCancelClick:
										return vm.pageChanged.userCreate;
								case action.generalSettingsChange:
										return vm.pageChanged.generalEdit;
								case action.appEdit:
										return vm.pageChanged.appEdit;
								case action.imageSuspectVerdictButtonClick:
								case action.imageClearVerdictButtonClick:
								case action.imageVerdictSelectClick:
								case action.imageViewClick:
                    return vm.pageChanged.imageEdit;
                case action.findingAdded:
                    return vm.pageChanged.findingAdded;
                case action.profileEdit:
                    return vm.pageChanged.profileEdit;
                case action.rapEdit:
                    return vm.pageChanged.rapEdit;
                case action.dcEdit:
                    return vm.pageChanged.dcEdit;
                case action.locationEdit:
                    return vm.pageChanged.locationEdit;
                case action.operationalEdit:
                    return vm.pageChanged.operationalEdit;
                case action.devicesEdit:
                   return vm.pageChanged.devicesEdit;
                case action.homeButtonClick:
                    return vm.pageChanged.landing || vm.pageChanged.roleCreate || vm.pageChanged.roleEdit || vm.pageChanged.userCreate || vm.pageChanged.userEdit || vm.pageChanged.generalEdit || vm.pageChanged.appEdit || vm.pageChanged.imageEdit || vm.pageChanged.findingAdded;
						}
						return false;
				};

				vm.getPageChange = (currentAction: action) => {
						switch (currentAction) {
								//case action.landing:
								//    return vm.pageChanged.landing;
								case action.roleCreate:
										return vm.pageChanged.roleCreate;
								case action.roleEdit:
										return vm.pageChanged.roleEdit;
								case action.userCreate:
										return vm.pageChanged.userCreate;
								case action.userEdit:
										return vm.pageChanged.userEdit;
								case action.generalSettingsChange:
										return vm.pageChanged.generalEdit;
								case action.appEdit:
										return vm.pageChanged.appEdit;
								case action.imageEdit:
                    return vm.pageChanged.imageEdit;
                case action.findingAdded:
                    return vm.pageChanged.findingAdded;
						}
						return false;
				};

		}
}
