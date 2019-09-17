import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { IResponse, IGeneralSettingsMetadataResponse, IGeneralSettingsData, IAppSettingsDetails, IStatusMetaDataResponse } from '../models/viewModels';
import { IGeneralSettings, IAppParams, ICacheStorageService } from '../interfaces/interfaces';
import { metaDataSettings } from '../models/enums';
import { SecureService } from './secure.adal.service';

@Injectable()
export class GeneralSettingsService implements IGeneralSettings {
	fetchGeneralSettingsMetaData: (metadataFor: metaDataSettings) => Observable<IResponse<IGeneralSettingsMetadataResponse>>;
	fetchStatusMetaData: (metadataFor: string) => Observable<IResponse<IStatusMetaDataResponse>>;
	getGenralSettings: <IGeneralSettingsData>() => Observable<IResponse<IGeneralSettingsData>>;
	updateGeneralSettings: (setingsDetail: IGeneralSettingsData) => Observable<IResponse<IGeneralSettingsData>>;
	fetchOpAdminSettings: (appId?: number) => Observable<IResponse<IAppSettingsDetails>>;
	updateOpAdminSettings: (appDetails: IAppSettingsDetails) => Observable<IResponse<IAppSettingsDetails>>;

	constructor( @Inject('IAppParams') private config: IAppParams, http: SecureService, @Inject('ICacheStorageService') public cacheStorageService: ICacheStorageService
	) {
		var vm = this;
		vm.fetchGeneralSettingsMetaData = (metadataFor: metaDataSettings.GeneralSettings) => {
			//below code used to cache the general setting metadata
			return new Observable(observable => {
				if (cacheStorageService.cacheGeneralSettingsMetaData) {
					// tslint:disable-next-line:no-console
					console.log('fetchGeneralSettingsMetaData@data already available');
					observable.next(cacheStorageService.cacheGeneralSettingsMetaData);
					observable.complete();
				} else {
					// tslint:disable-next-line:no-console
					console.log('@fetchGeneralSettingsMetaData@send new request');
					http.post(vm.config.getParams().settingsMetadataUrl, { 'metadataFor': 'GeneralSettings' })
						.subscribe(response => {
							cacheStorageService.cacheGeneralSettingsMetaData = response;
							observable.next(cacheStorageService.cacheGeneralSettingsMetaData);
							observable.complete();
						});
				}
			});
			//old code
			//return http.post(vm.config.getParams().settingsMetadataUrl, { 'metadataFor': 'GeneralSettings' });
		};
		vm.fetchStatusMetaData = (metadataFor: string) => {
			return http.post(vm.config.getParams().settingsMetadataUrl, { 'metadataFor': metadataFor });
		};
		vm.getGenralSettings = <IGeneralSettingsData>() => {
			//below code used to cache the general setting metadata
			return new Observable(observable => {
				if (cacheStorageService.cacheGeneralSettingMetaData) {
					// tslint:disable-next-line:no-console
					console.log('getGenralSettings@data already available');
					observable.next(cacheStorageService.cacheGeneralSettingMetaData);
					observable.complete();
				} else {
					// tslint:disable-next-line:no-console
					console.log('@getGenralSettings@send new request');
					http.get<IGeneralSettingsData>(this.config.getParams().settingsUrl)
						.subscribe(response => {
							cacheStorageService.cacheGeneralSettingMetaData = response;
							observable.next(cacheStorageService.cacheGeneralSettingMetaData);
							observable.complete();
						});
				}
			});
			//old code
			//return http.get<IGeneralSettingsData>(this.config.getParams().settingsUrl);
		};
		vm.updateGeneralSettings = <IGeneralSettingsData>(setingsDetail: IGeneralSettingsData) => {
			return http.put<IGeneralSettingsData>(this.config.getParams().settingsUrl, setingsDetail);
		};
		vm.fetchOpAdminSettings = <IAppSettingsDetails>(appId: number) => {
			return http.get<IAppSettingsDetails>(this.config.getParams().opAdminUrl + '/' + appId);
		};
		vm.updateOpAdminSettings = <IAppSettingsDetails>(appDetails: IAppSettingsDetails) => {
			//console.log(JSON.stringify(appDetails));
			return http.patch<IAppSettingsDetails>(this.config.getParams().opAdminUrl, appDetails);
		};
	}
}
