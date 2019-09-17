import { IResponse } from './../models/viewModels';
import { Injectable } from '@angular/core';
import { ICacheStorageService } from '../interfaces/interfaces';
//import { IMetaDataCaseNew, IResponse } from '../models/viewModels';
@Injectable()
export class CacheStorageService implements ICacheStorageService {
	//below getter setter used for
	//Service Name: case.service.ts
	//Method Name: fetchMetadata
	//URL: this.config.getParams().casesUrl + '/metadata'
	public _cacheMetaData:IResponse<any>;

	//below getter setter used for
	//Service Name: general.settings.service.ts
	//Method Name: getGenralSettings
	//URL: this.config.getParams().casesUrl + '/settings/general''
	public _cacheGeneralSettingMetaData:IResponse<any>;

	//below getter setter used for
	//Service Name: general.settings.service.ts
	//Method Name: fetchGeneralSettingsMetaData
	//URL: this.config.getParams().settingsMetadataUrl + '/platform/metadata''
	public _cacheGeneralSettingsMetaData:IResponse<any>;

	//below getter setter used for
	//Service Name: caseanalysis.service.ts, analyzer.service.ts
	//Method Name: fetchCaseAnalysisMetaData(), fetchImageAnalyzerMetaData()
	//URL: this.config.getParams().casesUrl + '/analysis/metadata''
	public _caseAnalysisMetaData:IResponse<any>;

	//below getter setter used for
	//Service Name: analyzer.service.ts
	//Method Name: fetchScanMetadata()
	//URL: this.config.getParams().analysis + '/scan/metadata''
	public _scanMetadata:IResponse<any>;

	//below getter setter used for
	//Service Name: user.service.ts
	//Method Name: getUserByName()
	//URL: this.config.getParams().userUrl + '/' + userName
	public _cacheUserDetails:IResponse<any>;

	//below getter setter used for
	//Service Name: case.service.ts
	//Method Name: fetchCaseCreateMetaData()
	//URL: this.config.getParams().settingsMetadataUrl, { 'metadataFor': 'Cases' }
	public _cacheCountryDetails:IResponse<any>;

	//below getter setter used for
	//Service Name: user.service.ts
	//Method Name: getUsers()
	//URL: this.config.getParams().userUrl
	public _cacheUsers:IResponse<any>;

	//below getter setter used for
	//Service Name: role.service.ts
	//Method Name: getRoles()
	//URL: this.config.getParams().rolesUrl
	public _cacheRoles:IResponse<any>;

	//below getter setter used for
	//Service Name: case.service.ts
	//Method Name: fetchCaseCountryData()
	//URL: this.config.getParams().settingsMetadataCountryUrl
	public _cacheCountries:IResponse<any>;

	//below getter setter used for
	//Service Name: application.service.ts
	//Method Name: getApplications()
	//URL: this.config.getParams().appsUrl
	public _cacheApplications:IResponse<any>;

	get cacheMetaData():IResponse<any>{
		return this._cacheMetaData;
	}

	set cacheMetaData(response:IResponse<any>){
		this._cacheMetaData = response;
	}

	get cacheGeneralSettingMetaData():IResponse<any>{
		return this._cacheGeneralSettingMetaData;
	}

	set cacheGeneralSettingMetaData(response:IResponse<any>){
		this._cacheGeneralSettingMetaData = response;
	}

	get cacheGeneralSettingsMetaData():IResponse<any>{
		return this._cacheGeneralSettingsMetaData;
	}

	set cacheGeneralSettingsMetaData(response:IResponse<any>){
		this._cacheGeneralSettingsMetaData = response;
	}

	get cacheAnalysisMetaData():IResponse<any>{
		return this._caseAnalysisMetaData;
	}

	set cacheAnalysisMetaData(response:IResponse<any>){
		this._caseAnalysisMetaData = response;
	}

	get scanMetadata():IResponse<any>{
		return this._scanMetadata;
	}

	set scanMetadata(response:IResponse<any>){
		this._scanMetadata = response;
	}

	get cacheUserDetails():IResponse<any>{
		return this._cacheUserDetails;
	}

	set cacheUserDetails(response:IResponse<any>){
		this._cacheUserDetails = response;
	}

	get cacheCountryDetails():IResponse<any>{
		return this._cacheCountryDetails;
	}

	set cacheCountryDetails(response:IResponse<any>){
		this._cacheCountryDetails = response;
	}

	get cacheUsers():IResponse<any>{
		return this._cacheUsers;
	}

	set cacheUsers(response:IResponse<any>){
		this._cacheUsers = response;
	}

	get cacheRoles():IResponse<any>{
		return this._cacheRoles;
	}

	set cacheRoles(response:IResponse<any>){
		this._cacheRoles = response;
	}

	get cacheCountries():IResponse<any>{
		return this._cacheCountries;
	}

	set cacheCountries(response:IResponse<any>){
		this._cacheCountries = response;
	}

	get cacheApplications():IResponse<any>{
		return this._cacheApplications;
	}

	set cacheApplications(response:IResponse<any>){
		this._cacheApplications = response;
	}
}
