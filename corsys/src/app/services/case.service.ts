import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
	IResponse, ICaseCreateDetails, IMetadataCase, ICaseRequestFormat, ICaseGetResponse,
	IMetaDataCaseNew, ISearchGetResponseFormat, ITimeline, ICaseCountResponse
} from '../models/viewModels';
import { ICaseService, IAppParams, ICacheStorageService } from '../interfaces/interfaces';
import { metaDataSettings, controlCenterColumn } from '../models/enums';
import * as moment from 'moment';
import { SecureService } from './secure.adal.service';
import { Adal4Service } from '@corsys/corsys-adal';
@Injectable()
export class CaseService implements ICaseService {
  getSearchClearCasesCount: (timeDuration?: number, pageNum?: number, pageSize?: number, filterCriteria?: any[], searchAll?: boolean, appendUrl?: string) => Observable<IResponse<ICaseCountResponse>>;
  getSearchCasesCount: (filterCriteria?: any[], searchAll?: boolean, additionalCondition?: string) => Observable<IResponse<ICaseCountResponse>>;
  getCasesCount: (addCreatedBy: boolean, filterCriteria?: number[], additionalCondition?: string) => Observable<IResponse<ICaseCountResponse>>;
	updateCases: <ICaseIDResponseFormat>(caseStatus: ICaseRequestFormat) => Observable<IResponse<ICaseIDResponseFormat[]>>;
  getCases: (addCreatedBy: boolean, pageNum?: number, pageSize?: number, filterCriteria?: number[], sortCriteria?: string[], additionalCondition?: string) => Observable<IResponse<ICaseGetResponse>>;
	getCasesByStatus: (assignedTo: boolean, filterCriteria?: number[]) => Observable<IResponse<ICaseGetResponse>>;
	createCase: <ICaseCreateDetails>(caseDetail: ICaseCreateDetails) => Observable<IResponse<ICaseCreateDetails>>;
	updateCase: <ICaseCreateDetails>(caseDetail: ICaseCreateDetails) => Observable<IResponse<ICaseCreateDetails>>;
	fetchCaseCreateMetaData: (metadataFor: metaDataSettings) => Observable<IResponse<IMetadataCase>>;
	getCaseDetailById: (caseID: string) => Observable<IResponse<ICaseCreateDetails>>;
	fetchMetadata: () => Observable<IResponse<IMetaDataCaseNew>>;
	fetchCaseCountryData: () => Observable<IResponse<IMetadataCase>>;
  getSearchdata: (keyword: string, filterCriteria?: string[]) => Observable<IResponse<ISearchGetResponseFormat[]>>;
	getSearchCases: (pageNum?: number, pageSize?: number, filterCriteria?: any[], searchAll?: boolean, sortCriteria?: string[], additionalCondition?: string) => Observable<IResponse<ICaseGetResponse>>;
  getSearchClearCases: (timeDuration?: number, pageNum?: number, pageSize?: number, filterCriteria?: any[],sortCriteria?: string[], searchAll?: boolean, appendUrl?: string) => Observable<IResponse<ICaseGetResponse>>;
	getCaseTimeline: (caseId: string) => Observable<IResponse<ITimeline>>;
	constructor(http: SecureService, @Inject('IAppParams') private config: IAppParams, public service: Adal4Service, @Inject('ICacheStorageService') public cacheStorageService: ICacheStorageService) {
		var vm = this;
		vm.updateCases = <ICaseIDResponseFormat>(caseStatus: ICaseRequestFormat) => {
			return http.patch<ICaseIDResponseFormat[]>(this.config.getParams().casesUrl, caseStatus);
		};

		vm.createCase = <ICaseCreateDetails>(caseDetail: ICaseCreateDetails) => {
			return http.post<ICaseCreateDetails>(this.config.getParams().casesUrl, caseDetail);
		};

		vm.updateCase = <ICaseCreateDetails>(caseDetail: ICaseCreateDetails) => {
			return http.put<ICaseCreateDetails>(this.config.getParams().casesUrl, caseDetail);
		};

		vm.getCases = (addCreatedBy: boolean = false, pageNum?: number, pageSize?: number, filterCriteria?: number[], sortCriteria?: string[], additionalCondition?: string) => {
			let criteria = '';
			if (addCreatedBy) {
				criteria = filterCriteria ? 'Status^IN^(' + filterCriteria.join(',') + ')^AND^CreatedBy^=^' + vm.service.userInfo.username : null;
				criteria += (additionalCondition ? additionalCondition : '');
			} else {
				criteria = filterCriteria ? 'Status^IN^(' + filterCriteria.join(',') + ')' : null;
				criteria += (additionalCondition ? additionalCondition : '');
			}
			if (localStorage.getItem('locationCode') && localStorage.getItem('locationCode') !== 'NA') {
				criteria += '^AND^LocationCode^=^' + localStorage.getItem('locationCode');
			}
			var params = {
				pageNo: pageNum,
				pageSize: pageSize,
				filter: criteria,
				sort: sortCriteria ? '(' + sortCriteria.join('|') + ')' : null,
			};
			return http.get<ICaseGetResponse>(this.config.getParams().casesUrl, params);
    };
    vm.getCasesCount = (addCreatedBy: boolean = false, filterCriteria?: number[], additionalCondition?: string) => {
			let criteria = '';
			if (addCreatedBy) {
				criteria = filterCriteria ? 'Status^IN^(' + filterCriteria.join(',') + ')^AND^CreatedBy^=^' + vm.service.userInfo.username : null;
				criteria += (additionalCondition ? additionalCondition : '');
			} else {
				criteria = filterCriteria ? 'Status^IN^(' + filterCriteria.join(',') + ')' : null;
				criteria += (additionalCondition ? additionalCondition : '');
			}
			if (localStorage.getItem('locationCode') && localStorage.getItem('locationCode') !== 'NA') {
				criteria += '^AND^LocationCode^=^' + localStorage.getItem('locationCode');
			}
			var params = {
				filter: criteria
			};
			return http.get(this.config.getParams().casesUrl+'/casecount', params);
		};

		vm.getCasesByStatus = (assignedTo: boolean = false, filterCriteria?: number[]) => {
			let criteria = '';
			if (assignedTo) {
				criteria = filterCriteria ? 'Status^IN^(' + filterCriteria.join(',') + ')^AND^AssignedTo^=^' + vm.service.userInfo.username : null;
			} else {
				criteria = filterCriteria ? 'Status^IN^(' + filterCriteria.join(',') + ')' : null;
			}
			if (localStorage.getItem('locationCode') && localStorage.getItem('locationCode') !== 'NA') {
				criteria += '^AND^LocationCode^=^' + localStorage.getItem('locationCode');
			}
			criteria += '^AND^CaseAction^!=^2';

			let sortCriteria = ['-Priority','+LastUpdatedDate'];
			var params = {
				pageNo: 1,
				pageSize: 1,
				filter: criteria,
				sort:  sortCriteria ? '(' + sortCriteria.join('|') + ')' : null,
			};
			return http.get<ICaseGetResponse>(this.config.getParams().casesUrl, params);

		};

		vm.getSearchdata = (keyword: string, filterCriteria: string[]): Observable<IResponse<ISearchGetResponseFormat[]>> => {
			let locationCode: string = null;
			if (localStorage.getItem('locationCode') && localStorage.getItem('locationCode') !== 'NA') {
				locationCode = localStorage.getItem('locationCode');
			}
			var params = {
				keyword: keyword,
				search: filterCriteria ? '(' + filterCriteria.join('|') + ')' : null,
				locationCode: locationCode
			};
			return http.get(this.config.getParams().casesUrl + '/autocomplete/search', params);
    };
    vm.getSearchClearCasesCount = (timeDuration?: number, pageNum?: number, pageSize?: number, filterCriteria?: any[], searchAll?: boolean, appendUrl?: string) => {
			let lastModifiedFlag: boolean = false;
			for (let searchIndex = 0; searchIndex < filterCriteria.length; searchIndex++) {
				if (filterCriteria[searchIndex]['fieldName'] === 'LastModified') {
					lastModifiedFlag = true;
					break;
				}
			}
			// let tempstr: string = '';
			let criteria = '';
			let time = moment.duration(+timeDuration, 'h').asMilliseconds();
			let currentDate = new Date();
			let modifiedDate = moment(currentDate, moment.ISO_8601).subtract(time).format() + ','+ moment(currentDate, moment.ISO_8601).format();
			// let modifiedDate = moment().utc().subtract(time).format('YYYY-MM-DD HH:mm:ss') + ',' + moment(new Date()).utc().format('YYYY-MM-DD HH:mm:ss');
			for (let k in filterCriteria) {
				if (filterCriteria[k] && filterCriteria[k].fieldName === 'UpdatedDate') {
					modifiedDate = filterCriteria[k].fieldValue;
					filterCriteria.splice(+k, 1);
				}
			}
			if (searchAll) {
				criteria = '(';
				filterCriteria.forEach(item => {
					if (item.fieldName && item.fieldName !== 'Status') {
						criteria = criteria + item.fieldName + '^IN^(' + item.fieldValue + ')' + '^OR^';
					}
				});
				let lastItem = filterCriteria[filterCriteria.length - 1];
				if (lastItem && lastItem.fieldName && lastItem.fieldValue) {

				let extraOPeratorIndex = criteria.lastIndexOf('^OR^');
				let checkClosingBracketIndex = extraOPeratorIndex - 1;
				if (checkClosingBracketIndex > -1) {
					criteria = criteria.substring(0, criteria.lastIndexOf('^OR^'));
				}
				criteria += ')^AND^' + '('+lastItem.fieldName + '^IN^' + '(' + lastItem.fieldValue + ')';
				}
				if (!lastModifiedFlag) {
					criteria += '^AND^ClearedDateTime^IN^(' + modifiedDate + ')';
				}
				if (localStorage.getItem('locationCode') && localStorage.getItem('locationCode') !== 'NA') {
					criteria += '^AND^LocationCode^=^' + localStorage.getItem('locationCode');
				}

				if (appendUrl === 'override') {
					criteria += '^AND^UpdatedBy^=^System' + ')';
				}
			}
			else {
				for (let item in filterCriteria) {
					if (filterCriteria[item].fieldName !== null && filterCriteria[item].fieldName.trim() !== '' && filterCriteria[item].fieldName !== undefined) {
						let itemOccurancePos = criteria.indexOf(filterCriteria[item].fieldName+'^IN^');
						if (itemOccurancePos !== -1) {
							let openingBracPos = criteria.indexOf('(', itemOccurancePos);
							criteria = criteria.slice(0, openingBracPos+1) + filterCriteria[item].fieldValue + criteria.slice(openingBracPos+1);
						}
						else {
							if (filterCriteria[item].fieldName !== 'Status') {
								criteria += filterCriteria[item].fieldName + '^IN^(' + filterCriteria[item].fieldValue + ')^AND^';
							}
						}
					}
				}
				let lastItem = filterCriteria[filterCriteria.length - 1];
				criteria += lastItem.fieldName + '^IN^' + '(' + lastItem.fieldValue + ')';
				if (!lastModifiedFlag) {
					criteria += '^AND^ClearedDateTime^IN^(' + modifiedDate + ')';
				}
				if (localStorage.getItem('locationCode') && localStorage.getItem('locationCode') !== 'NA') {
					criteria += '^AND^LocationCode^=^' + localStorage.getItem('locationCode');
				}

				if (appendUrl === 'override') {
					criteria += '^AND^UpdatedBy^=^System';
				}

			}
			var params = {
				filter: criteria
			};
			let url = this.config.getParams().casesUrl+'/casecount';
			return http.get<ICaseCountResponse>(url, params);
		};
		vm.getSearchClearCases = (timeDuration?: number, pageNum?: number, pageSize?: number, filterCriteria?: any[],sortCriteria?: string[], searchAll?: boolean, appendUrl?: string) => {
			let lastModifiedFlag: boolean = false;
			for (let searchIndex = 0; searchIndex < filterCriteria.length; searchIndex++) {
				if (filterCriteria[searchIndex]['fieldName'] === 'LastModified') {
					lastModifiedFlag = true;
					break;
				}
			}
			// let tempstr: string = '';
			let criteria = '';
			let time = moment.duration(+timeDuration, 'h').asMilliseconds();
			let currentDate = new Date();
			let modifiedDate = moment(currentDate, moment.ISO_8601).subtract(time).format() + ','+ moment(currentDate, moment.ISO_8601).format();
			// let modifiedDate = moment().utc().subtract(time).format('YYYY-MM-DD HH:mm:ss') + ',' + moment(new Date()).utc().format('YYYY-MM-DD HH:mm:ss');
			for (let k in filterCriteria) {
				if (filterCriteria[k] && filterCriteria[k].fieldName === 'UpdatedDate') {
					modifiedDate = filterCriteria[k].fieldValue;
					filterCriteria.splice(+k, 1);
				}
			}
			if (searchAll) {
				criteria = '(';
				filterCriteria.forEach(item => {
					if (item.fieldName && item.fieldName !== 'Status') {
						criteria = criteria + item.fieldName + '^IN^(' + item.fieldValue + ')' + '^OR^';
					}
				});
				let lastItem = filterCriteria[filterCriteria.length - 1];
				if (lastItem && lastItem.fieldName && lastItem.fieldValue) {

				let extraOPeratorIndex = criteria.lastIndexOf('^OR^');
				let checkClosingBracketIndex = extraOPeratorIndex - 1;
				if (checkClosingBracketIndex > -1) {
					criteria = criteria.substring(0, criteria.lastIndexOf('^OR^'));
				}
				criteria += ')^AND^' + '('+lastItem.fieldName + '^IN^' + '(' + lastItem.fieldValue + ')';
				}
				if (!lastModifiedFlag) {
					criteria += '^AND^ClearedDateTime^IN^(' + modifiedDate + ')';
				}
				if (localStorage.getItem('locationCode') && localStorage.getItem('locationCode') !== 'NA') {
					criteria += '^AND^LocationCode^=^' + localStorage.getItem('locationCode');
				}

				if (appendUrl === 'override') {
					criteria += '^AND^UpdatedBy^=^System' + ')';
				}
			}
			else {
				for (let item in filterCriteria) {
					if (filterCriteria[item].fieldName !== null && filterCriteria[item].fieldName.trim() !== '' && filterCriteria[item].fieldName !== undefined) {
						let itemOccurancePos = criteria.indexOf(filterCriteria[item].fieldName+'^IN^');
						if (itemOccurancePos !== -1) {
							let openingBracPos = criteria.indexOf('(', itemOccurancePos);
							criteria = criteria.slice(0, openingBracPos+1) + filterCriteria[item].fieldValue + criteria.slice(openingBracPos+1);
						}
						else {
							if (filterCriteria[item].fieldName !== 'Status') {
								criteria += filterCriteria[item].fieldName + '^IN^(' + filterCriteria[item].fieldValue + ')^AND^';
							}
						}
					}
				}
				let lastItem = filterCriteria[filterCriteria.length - 1];
				criteria += lastItem.fieldName + '^IN^' + '(' + lastItem.fieldValue + ')';
				if (!lastModifiedFlag) {
					criteria += '^AND^ClearedDateTime^IN^(' + modifiedDate + ')';
				}
				if (localStorage.getItem('locationCode') && localStorage.getItem('locationCode') !== 'NA') {
					criteria += '^AND^LocationCode^=^' + localStorage.getItem('locationCode');
				}

				if (appendUrl === 'override') {
					criteria += '^AND^UpdatedBy^=^System';
				}

			}
			/* if (localStorage.getItem('locationCode') && localStorage.getItem('locationCode') !== 'NA') {
				criteria += '^AND^LocationCode^=^' + localStorage.getItem('locationCode');
			}

			if (appendUrl === 'override') {
				criteria += '^AND^UpdatedBy^=^System';
			} */
			var params = {
				pageNo: pageNum,
				pageSize: pageSize,
				sort: sortCriteria ? '(' + sortCriteria.join('|') + ')' : null,
				filter: criteria
			};
			let url = this.config.getParams().casesUrl;

			return http.get<ICaseGetResponse>(url, params);
		};
		vm.getSearchCases = (pageNum?: number, pageSize?: number, filterCriteria?: any[], searchAll?: boolean, sortCriteria?: string[], additionalCondition?: string) => {
			let criteria = '';
			if (searchAll) {
				filterCriteria.forEach(item => {
					if (item.fieldName === controlCenterColumn[controlCenterColumn.RiskRating]) {
						if (!(parseInt(item.fieldValue) !== NaN && parseInt(item.fieldValue) < 2147483647)) {
							item.fieldValue = -1;
						}
					}
					if (item.fieldName) {
						if (criteria.trim() === '') {
							criteria = item.fieldName + '^IN^(' + item.fieldValue + ')';
						}
						else {
							criteria = criteria + '^OR^' + item.fieldName + '^IN^(' + item.fieldValue + ')';
						}
					}
				});
			}
			else {
				let tempstr: string = '';
				for (let item in filterCriteria) {
					if (filterCriteria[item].fieldName !== null && filterCriteria[item].fieldName.trim() !== '' && filterCriteria[item].fieldName !== undefined) {
						if (criteria.indexOf(filterCriteria[item].fieldName) !== -1) {
							let valuetoAppend: string = filterCriteria[item].fieldValue;
							tempstr = filterCriteria[item].fieldName;
							let position: number = criteria.indexOf(filterCriteria[item].fieldName) + tempstr.length + 5;
							criteria = [criteria.slice(0, position), valuetoAppend,')'].join('');
						}
						else {
							if (criteria.trim() === '') {
								criteria = filterCriteria[item].fieldName + '^IN^(' + filterCriteria[item].fieldValue + ')';
							}
							else {
								criteria = criteria + '^AND^' + filterCriteria[item].fieldName + '^IN^(' + filterCriteria[item].fieldValue + ')';
							}
						}
					}
				}
			}
			if (localStorage.getItem('locationCode') && localStorage.getItem('locationCode') !== 'NA') {
				criteria += '^AND^LocationCode^=^' + localStorage.getItem('locationCode');
			}
			criteria += (additionalCondition ? additionalCondition : '');
			var params = {
				pageNo: pageNum,
				pageSize: pageSize,
				sort: sortCriteria ? '(' + sortCriteria.join('|') + ')' : null,
				filter: criteria
			};
			return http.get<ICaseGetResponse>(this.config.getParams().casesUrl, params);
    };
    vm.getSearchCasesCount = (filterCriteria?: any[], searchAll?: boolean, additionalCondition?: string) => {
			let criteria = '';
			if (searchAll) {
				filterCriteria.forEach(item => {
					if (item.fieldName === controlCenterColumn[controlCenterColumn.RiskRating]) {
						if (!(parseInt(item.fieldValue) !== NaN && parseInt(item.fieldValue) < 2147483647)) {
							item.fieldValue = -1;
						}
					}
					if (item.fieldName) {
						if (criteria.trim() === '') {
							criteria = item.fieldName + '^IN^(' + item.fieldValue + ')';
						}
						else {
							criteria = criteria + '^OR^' + item.fieldName + '^IN^(' + item.fieldValue + ')';
						}
					}
				});
			}
			else {
				let tempstr: string = '';
				for (let item in filterCriteria) {
					if (filterCriteria[item].fieldName !== null && filterCriteria[item].fieldName.trim() !== '' && filterCriteria[item].fieldName !== undefined) {
						if (criteria.indexOf(filterCriteria[item].fieldName) !== -1) {
							let valuetoAppend: string = filterCriteria[item].fieldValue;
							tempstr = filterCriteria[item].fieldName;
							let position: number = criteria.indexOf(filterCriteria[item].fieldName) + tempstr.length + 5;
							criteria = [criteria.slice(0, position), valuetoAppend,')'].join('');
						}
						else {
							if (criteria.trim() === '') {
								criteria = filterCriteria[item].fieldName + '^IN^(' + filterCriteria[item].fieldValue + ')';
							}
							else {
								criteria = criteria + '^AND^' + filterCriteria[item].fieldName + '^IN^(' + filterCriteria[item].fieldValue + ')';
							}
						}
					}
				}
			}
			if (localStorage.getItem('locationCode') && localStorage.getItem('locationCode') !== 'NA') {
				criteria += '^AND^LocationCode^=^' + localStorage.getItem('locationCode');
			}
			criteria += (additionalCondition ? additionalCondition : '');
			var params = {
				filter: criteria
			};
			return http.get<ICaseCountResponse>(this.config.getParams().casesUrl+'/casecount', params);
    };
		vm.fetchCaseCreateMetaData = (metadataFor: metaDataSettings.Cases) => {
			//Handling cache with observable
			return new Observable(observable => {
				if (cacheStorageService.cacheCountryDetails) {
					// tslint:disable-next-line:no-console
					console.log('fetchCaseCreateMetaData->@data already available');
					observable.next(cacheStorageService.cacheCountryDetails);
					observable.complete();
				} else {
					// tslint:disable-next-line:no-console
					console.log('@fetchCaseCreateMetaData->@send new request');
					return http.post(vm.config.getParams().settingsMetadataUrl, { 'metadataFor': 'Cases' })
						.subscribe(response => {
							cacheStorageService.cacheCountryDetails = response;
							observable.next(cacheStorageService.cacheCountryDetails);
							observable.complete();
						});
				}
			});
			//old code
			//return http.post(vm.config.getParams().settingsMetadataUrl, { 'metadataFor': 'Cases' });
		};

		vm.getCaseDetailById = (caseId: string) => {
			let params = { caseId: caseId };
			return http.get<ICaseCreateDetails>(vm.config.getParams().caseDetailUrl, params);
		};

		vm.fetchMetadata = () => {
			//Handling cache with observable
			return new Observable(observable => {
				if (cacheStorageService.cacheMetaData) {
					// tslint:disable-next-line:no-console
					console.log('fetchMetadata@data already available');
					observable.next(cacheStorageService.cacheMetaData);
					observable.complete();
				} else {
					// tslint:disable-next-line:no-console
					console.log('@fetchMetadata@send new request');
					http.get(this.config.getParams().casesUrl + '/metadata')
						.subscribe(response => {
							cacheStorageService.cacheMetaData = response;
							observable.next(cacheStorageService.cacheMetaData);
							observable.complete();
						});
				}
			});
			//old code
			//return http.get(this.config.getParams().casesUrl + '/metadata');
		};
		vm.fetchCaseCountryData = () => {
			//Handling cache with observable for countries
			return new Observable(observable => {
				if (cacheStorageService.cacheCountries) {
					// tslint:disable-next-line:no-console
					console.log('fetchCaseCountryData@data already available');
					observable.next(cacheStorageService.cacheCountries);
					observable.complete();
				} else {
					// tslint:disable-next-line:no-console
					console.log('@fetchCaseCountryData@send new request');
					http.get(vm.config.getParams().settingsMetadataCountryUrl)
						.subscribe(response => {
							cacheStorageService.cacheCountries = response;
							observable.next(cacheStorageService.cacheCountries);
							observable.complete();
						});
				}
			});
			//old code
			//return http.get(vm.config.getParams().settingsMetadataCountryUrl);
		};
		vm.getCaseTimeline = (caseId: string) => {
			return http.get(this.config.getParams().casesUrl + '/' + caseId + '/timeline');
		};
	}
}
