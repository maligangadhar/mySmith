import { Component, Inject, ViewChild, OnInit, OnDestroy } from '@angular/core';
// import { Router } from '@angular/router';
import { IAppParams, IMessageService, IStorageService, ITranslateService } from '../interfaces/interfaces';
import { ILeaveMessage } from '../models/viewModels';
import { action } from '../models/enums';
import { ModalConfirmComponent } from './modal/modal.confirm.component';
import { ModalLoaderComponent } from './modal/modal.loader.component';
import { ModalTimeoutComponent } from './modal/modal.session.timeout.component';
import { appLanguage } from '../businessConstants/businessConstants';
import { Adal4Service } from '@corsys/corsys-adal';
import { UserIdleService } from '../shared/user-idle.service';
import { PlatformLocation } from '@angular/common';
import * as moment from 'moment';
import { Subject } from 'rxjs';
@Component({
	selector: 'sp3-comp-app',
	templateUrl: './app.component.html',
})

export class AppComponent implements OnInit, OnDestroy {
	header: void;
	title = 'SP3';
	@ViewChild('modalDataChangeAlert') modalDataChangeAlert: ModalConfirmComponent;
	message: ILeaveMessage = { key: '', showMessage: false, type: action.homeButtonClick };
	@ViewChild('modalSp3Loader') modalSp3Loader: ModalLoaderComponent;
	@ViewChild('modalTimeout') modalTimeout: ModalTimeoutComponent;
	pageKey: string = 'Role';
	isDefaultMessage: boolean = true;
	isDefaultHomeMessage: boolean = false;
	sessionExpireFlag: boolean = false;
	newMessage: string;
	ngUnsubscribe: Subject<any> = new Subject<any>();
	onMessageAdded: (item: ILeaveMessage) => void;
	yesClick: () => void;
	noClick: () => void;
	constructor( @Inject('ITranslateService') private translateService: ITranslateService,
		@Inject('IMessageService') private messageService: IMessageService,
		private userIdle: UserIdleService,
		location: PlatformLocation,
		@Inject('IStorageService') private storageService: IStorageService,
		public service: Adal4Service, @Inject('IAppParams') public params: IAppParams) {
		var vm = this;
		vm.service.init(params.getParams().adalConfig);
		if (window.parent === window) { // If it is not from adal IFrame
			vm.translateService.setDefaultLang(appLanguage[1]);
			vm.translateService.use(appLanguage[this.storageService.getItem('generalFormat').language]);
			vm.translateService.enableFallback(true);
			vm.isDefaultMessage = true;
			vm.isDefaultHomeMessage = false;
			this.storageService.setItem('appName', 'landing');
			location.onPopState(() => {
				if (this.sessionExpireFlag) {
					this.service.logOut();
				}
			});
			vm.messageService.LeaveMessageAdded.subscribe(item => {
				vm.isDefaultMessage = true;
				vm.message = item;
				vm.pageKey = vm.message.key;
				if (vm.message.key === 'Home') {
					vm.isDefaultHomeMessage = true;
				} else {
					vm.isDefaultHomeMessage = false;
				}
				if (vm.message.message) {
					vm.isDefaultMessage = false;
					vm.newMessage = vm.message.message;
				}
				if (vm.message.showMessage) {
					vm.modalDataChangeAlert.show();
				}
				else {
					vm.modalDataChangeAlert.hide();
				}
			});

			vm.yesClick = () => {
				vm.messageService.OperationAllowed = true;
        vm.modalDataChangeAlert.hide();
        vm.messageService.resetPageChange();
			};

			vm.noClick = () => {
				vm.messageService.OperationAllowed = false;
				vm.modalDataChangeAlert.hide();
			};
		}
	}
	ngOnInit() {
		if (window.parent === window) { // If it is not from adal IFrame

			if (this.service.userInfo && this.service.userInfo.profile && this.service.userInfo.profile.exp) {
				let expDate = moment.utc(this.service.userInfo.profile.exp * 1000);
				var curTime = moment();
				let expiresIn = expDate.diff(curTime, 'seconds');
				this.userIdle.getConfigValue.apply({ idle: expiresIn });
			}
			//Start watching for user inactivity.
			this.userIdle.startWatching();
			// Start watching when user idle is starting.
			this.userIdle.onTimerStart().takeUntil(this.ngUnsubscribe).subscribe(count => {
				this.modalTimeout.show();
				this.sessionExpireFlag = true;
				this.service.clearCache();
				this.userIdle.stopWatching();
        this.userIdle.stopTimer();
        this.service.logOut();
				this.service.userInfo.authenticated = false;
			}
			);
		}
	}

	ngOnDestroy(): void {
		if (window.parent === window) {
			this.ngUnsubscribe.next();
			this.ngUnsubscribe.complete();
			this.userIdle.stopWatching();
			this.userIdle.stopTimer();
		}
	}
}
