import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { IApp, IAppDetail, IGeneralFormat, ILoaderMessage, IResponse, IRole, IUserAccess, IRoleWithApps } from '../../models/viewModels';
import { IGeneralSettings, IMessageService, IStorageService, ITranslateService, IUserService, ICommonService, IBroadcastService } from '../../interfaces/interfaces';
import { responseStatus, messageType, metaDataSettings, spinnerType } from '../../models/enums';
import { Router } from '@angular/router';
import { ENV_APP_MAP } from '../../config/appMap/appMap';
import { appLanguage } from '../../businessConstants/businessConstants';
import { Adal4Service } from '@corsys/corsys-adal';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';

@Component({
	selector: 'sp3-comp-landing',
	templateUrl: './landing.component.html'
})

export class LandingComponent implements OnInit, OnDestroy {
	title: string;
	userAccessDetails: IUserAccess;
	userRole: IRole = { name: '', id: 0, status: 1 };
	userApplications: IApp[] = [];
	totalApplications: IApp[] = [];
	message: string;
	showError: boolean;
	welcomeMessage: string;
	customerLogo: string;
	assignedLicense: boolean = true;
	ngUnsubscribe: Subject<any> = new Subject<any>();


	loaderMessage: ILoaderMessage = { id: '', headerMessage: this.translateService.instant('Loading'), footerMessage: this.translateService.instant('ApplicationLoading'), showLoader: true, type: spinnerType.small };

	constructor(
		@Inject('IUserService') private userService: IUserService,
		private router: Router,
		@Inject('IBroadcastService') private broadcastService: IBroadcastService,
		@Inject('ITranslateService') private translateService: ITranslateService,
		@Inject('IMessageService') private messageService: IMessageService,
		@Inject('IGeneralSettings') private generalSetting: IGeneralSettings,
		@Inject('IStorageService') private storageService: IStorageService,
		@Inject('ICommonService') public commonService: ICommonService,
		public service: Adal4Service,
		public location: Location
	) { }

	getUser = () => {
		this.userService.getUserByName(this.service.userInfo.username).takeUntil(this.ngUnsubscribe).subscribe(result => {
			if (result.status === responseStatus.Success) {
				this.assignedLicense = result.data.assignedLicense;
				let locationValue = +localStorage.getItem('locationValue');
				//emit the location list to header component
				this.commonService.userdetailChanged = result;
				if (this.assignedLicense) {
					if (result.data && result.data.roles) {
						for (var i = 0; i < result.data.roles.length; i++) {
							var role = result.data.roles[i];
							if (role.apps) {
								for (var j = 0; j < role.apps.length; j++) {
									var roleApp = role.apps[j];
									if (this.exists(roleApp) === -1) {
										this.totalApplications.push(roleApp);
									}
								}
								if (locationValue) {
									if (locationValue === role.locationId) {
										for (var k = 0; k < role.apps.length; k++) {
											var locApp = role.apps[k];
											if (this.exists(locApp) === -1) {
												this.userApplications.push(locApp);
											}
										}
									}
								} else {
									for (var m = 0; m < role.apps.length; m++) {
										var app = role.apps[m];
										if (this.exists(app) === -1) {
											this.userApplications.push(app);
										}
									}
								}
							}
						}


						let userRole: IRoleWithApps = result.data.roles[0];
						userRole.apps = this.userApplications;
						this.commonService.UserAccess = { userId: result.data.id.toString(), role: userRole } as IUserAccess;

						this.userApplications = this.userApplications.sort((a, b) => a.name.localeCompare(b.name));
						this.fetchGeneralSettings();
						this.broadcastService.broadcast('roleData', result.data.roles);
					}
					else {
						this.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
						this.loaderMessage.showLoader = false;
						this.messageService.LoaderMessage = this.loaderMessage;
					}
				}
				else {
					this.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
					this.loaderMessage.showLoader = false;
					this.messageService.LoaderMessage = this.loaderMessage;
					this.commonService.UserAccess = undefined;
				}
      } else{
        this.assignedLicense=false;
        this.loaderMessage.showLoader = false;
        this.messageService.LoaderMessage=this.loaderMessage;
      }
		},
			(error: IResponse<any>) => {
				this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
				this.loaderMessage.showLoader = false;
				this.messageService.LoaderMessage = this.loaderMessage;
			}
		);
	}

	onAppSelect = (app: IAppDetail) => {
		switch (app.appCode) {
			case ENV_APP_MAP.dashboard:
				this.router.navigate(['dashboard']);
				break;
			case ENV_APP_MAP.case:
				this.router.navigate(['caseview']);
				break;
			default:
				break;
		}
	}

	exists(app: IApp): number {
		for (var i = 0; i < this.userApplications.length; i++) {
			if (this.userApplications[i].id === app.id) {
				return i;
			}

		}
		return -1;
	}

	fetchGeneralSettings = () => {

		this.generalSetting.fetchGeneralSettingsMetaData(metaDataSettings.GeneralSettings).takeUntil(this.ngUnsubscribe).subscribe(settingsMetaData => {
			if (settingsMetaData.status === responseStatus.Success) {

				this.generalSetting.getGenralSettings().takeUntil(this.ngUnsubscribe).subscribe(result => {
					let { data: { DateFormat: dateFormatList, TimeFormat: timeFormatList, Language: languageList } } = settingsMetaData;
					let { data: { dateFormat: dateFormatKey, timeFormat: timeFormatKey, language: languageKey } } = result;
					let dateFormat = dateFormatList.filter(param => param.id === dateFormatKey)[0];
					let timeFormat = timeFormatList.filter(param => param.id === timeFormatKey)[0];
					let languageFormat = languageList.filter(param => param.id === languageKey)[0];
					let generalFormat: IGeneralFormat = {
						dateFormat: dateFormat.name,
						timeFormat: timeFormat.name,
						language: languageFormat.id
					};
					this.storageService.setItem('generalFormat', generalFormat);
					this.translateService.use(appLanguage[this.storageService.getItem('generalFormat').language]);
				}, (error) => {
					this.loaderMessage.showLoader = false;
					this.messageService.LoaderMessage = this.loaderMessage;
				});

				this.loaderMessage.showLoader = false;
				this.messageService.LoaderMessage = this.loaderMessage;
			}
		}, (error) => {
			this.loaderMessage.showLoader = false;
			this.messageService.LoaderMessage = this.loaderMessage;
		});
	}

	public ngOnInit(): void {

		if (window.location.hash !== '') {
			this.service.handleWindowCallback();
		}

		if (!this.service.userInfo.authenticated) {
			this.service.login();
		}
		if (this.service.userInfo.authenticated) {
			// If it is not from adal IFrame (window inherits from window.parent && api calls should be prevented when the urls have header tokens)
			// if ((window.location.href.indexOf('#id_token') === -1) && (window.location.href.indexOf('#access_token') === -1) && (this.location.path() === '/landing') ) {
			if ((window.parent === window) && (this.location.path() === '/landing')) {
				this.loaderMessage.showLoader = true;
				this.messageService.LoaderMessage = this.loaderMessage;
				this.getUser();
			}
		}
	}

	ngOnDestroy(): void {
		//do not wait for window.frame to be equal to window.  Destroy when the component is destroyed
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
