import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { IResponse, IAdditionalObject, ICaseCountResponse, InspectMetaData, ICaseAssignResponse, ICaseAssign, ICaseAssignRequest, IEvidence, IInspectCaseResponse } from '../models/viewModels';
import { IAppParams, ICacheStorageService } from '../interfaces/interfaces';
import { SecureService } from './secure.adal.service';

@Injectable()
export class InspectCaseService {
	getCases: (userId: string, pageNum?: number, pageSize?: number, filterCriteria?: number[], sortCriteria?: string[], primaryCondition?: string, additionalCondition?: IAdditionalObject) => Observable<IResponse<IInspectCaseResponse>>;
	getAwaitingInspectionCases: (pageNum?: number, pageSize?: number, filterCriteria?: number[], sortCriteria?: string[], primaryCondition?: string, additionalCondition?: IAdditionalObject) => Observable<IResponse<IInspectCaseResponse>>;
	getCasesCount: (userId: string, pageNum?: number, pageSize?: number, filterCriteria?: number[], sortCriteria?: string[], primaryCondition?: string, additionalCondition?: IAdditionalObject) => Observable<IResponse<ICaseCountResponse>>;
	getAwaitingInspectionCasesCount: (filterCriteria?: number[], primaryCondition?: string, additionalCondition?: IAdditionalObject) => Observable<IResponse<ICaseCountResponse>>;
	fetchMetadata: () => Observable<IResponse<InspectMetaData>>;
	assignToSelf: (userId: string, caseIds: string[]) => Observable<IResponse<ICaseAssignResponse[]>>;
	addEvidence:(caseId: string, Evidences:IEvidence[]) => Observable<IResponse<boolean>>;
	constructor(@Inject('IAppParams') private config: IAppParams, public http: SecureService, @Inject('ICacheStorageService') public cacheStorageService: ICacheStorageService) {
		var vm = this;
		vm.getCases = (userId, pageNum?: number, pageSize?: number, filterCriteria?: number[], sortCriteria?: string[], primaryCondition?: string, additionalCondition?: IAdditionalObject) => {
			let criteria = '';
			criteria = filterCriteria ? 'Status^IN^(' + filterCriteria.join(',') + ')' : null;
			criteria += '^AND^AssignedTo^=^' + userId;
      
      if (primaryCondition) {
        criteria+=primaryCondition;  
      }
      if(localStorage.getItem('locationCode') && localStorage.getItem('locationCode')!=='NA'){
        criteria+='^AND^LocationCode^=^'+localStorage.getItem('locationCode');
      }
			var params = {
				pageNo: pageNum,
				pageSize: pageSize,
				filter: criteria,
				sort: sortCriteria ? '(' + sortCriteria.join('|') + ')' : null,
      };
    
      if (additionalCondition && Object.keys(additionalCondition).length) {
        var srcObject = additionalCondition.srcObject;
        for(var prop in srcObject) {
           if (srcObject.hasOwnProperty(prop) && Array.isArray(srcObject[prop]) && srcObject[prop].length) {
             params[additionalCondition.targetValue] += '^AND^'+ prop + '(' + srcObject[prop].join(',') + ')';
           }
        }
      }
			return http.get<IInspectCaseResponse>(this.config.getParams().casesUrl+'/inspection', params);
		};
    vm.getCasesCount = (userId, pageNum?: number, pageSize?: number, filterCriteria?: number[], sortCriteria?: string[], primaryCondition?: string, additionalCondition?: IAdditionalObject) => {
			let criteria = '';
			criteria = filterCriteria ? 'Status^IN^(' + filterCriteria.join(',') + ')' : null;
			criteria += '^AND^AssignedTo^=^' + userId;
      
      if (primaryCondition) {
        criteria+=primaryCondition;  
      }
      if(localStorage.getItem('locationCode') && localStorage.getItem('locationCode')!=='NA'){
        criteria+='^AND^LocationCode^=^'+localStorage.getItem('locationCode');
      }
			var params = {
				filter: criteria
      };
    
      if (additionalCondition && Object.keys(additionalCondition).length) {
        var srcObject = additionalCondition.srcObject;
        for(var prop in srcObject) {
           if (srcObject.hasOwnProperty(prop) && Array.isArray(srcObject[prop]) && srcObject[prop].length) {
             params[additionalCondition.targetValue] += '^AND^'+ prop + '(' + srcObject[prop].join(',') + ')';
           }
        }
      }
			return http.get<ICaseCountResponse>(this.config.getParams().casesUrl+'/casecount', params);
		};

		vm.getAwaitingInspectionCases = (pageNum?: number, pageSize?: number, filterCriteria?: number[], sortCriteria?: string[], primaryCondition?: string, additionalCondition?: IAdditionalObject) => {
			let criteria = '';
			criteria = filterCriteria ? 'StatusIN(' + filterCriteria.join(',') + ')' : null;
      
      if (primaryCondition) {
        criteria+=primaryCondition;  
      }
      if(localStorage.getItem('locationCode') && localStorage.getItem('locationCode')!=='NA'){
        criteria+='ANDLocationCode='+localStorage.getItem('locationCode');
      }
			var params = {
				pageNo: pageNum,
				pageSize: pageSize,
				filter: criteria,
				sort: sortCriteria ? '(' + sortCriteria.join('|') + ')' : null,
      };
    
      if (additionalCondition && Object.keys(additionalCondition).length) {
        var srcObject = additionalCondition.srcObject;
        for(var prop in srcObject) {
           if (srcObject.hasOwnProperty(prop) && Array.isArray(srcObject[prop]) && srcObject[prop].length) {
             params[additionalCondition.targetValue] += 'AND'+ prop + '(' + srcObject[prop].join(',') + ')';
           }
        }
      }
			return http.get<IInspectCaseResponse>(this.config.getParams().casesUrl+'/inspection/awaitinginspection', params);
		};
		vm.getAwaitingInspectionCasesCount = (filterCriteria?: number[], primaryCondition?: string, additionalCondition?: IAdditionalObject) => {
			let criteria = '';
			criteria = filterCriteria ? 'StatusIN(' + filterCriteria.join(',') + ')' : null;
			// criteria += '^AND^AssignedTo^=^' + userId;
      
      if (primaryCondition) {
        criteria+=primaryCondition;  
      }
      if(localStorage.getItem('locationCode') && localStorage.getItem('locationCode')!=='NA'){
        criteria+='ANDLocationCode='+localStorage.getItem('locationCode');
      }
			var params = {
				filter: criteria
      };
    
      if (additionalCondition && Object.keys(additionalCondition).length) {
        var srcObject = additionalCondition.srcObject;
        for(var prop in srcObject) {
           if (srcObject.hasOwnProperty(prop) && Array.isArray(srcObject[prop]) && srcObject[prop].length) {
             params[additionalCondition.targetValue] += 'AND'+ prop + '(' + srcObject[prop].join(',') + ')';
           }
        }
      }
			return http.get<ICaseCountResponse>(this.config.getParams().analysisUrl+'/verdict/count', params);
		};
		vm.fetchMetadata = () => {
			//Handling cache with observable
			return new Observable(observable => {
				if(cacheStorageService.cacheAnalysisMetaData) {
					// tslint:disable-next-line:no-console
					console.log('fetchMetadata->Inspect.service.ts@data already available');
					observable.next(cacheStorageService.cacheAnalysisMetaData); 
					observable.complete();
				}else {
					// tslint:disable-next-line:no-console
					console.log('@fetchMetadata->Inspect.service.ts@send new request');
					this.http.get(this.config.getParams().analysisUrl + '/metadata')
					.subscribe(response =>  {
						cacheStorageService.cacheAnalysisMetaData = response;
						observable.next(cacheStorageService.cacheAnalysisMetaData); 
						observable.complete();
					});
				} 
			});
			//old code
			//return http.get(this.config.getParams().analysisUrl+'/metadata');
		};
		vm.assignToSelf = (userId: string, caseIds: string[]) => {
			let cases: ICaseAssign[] = [];

			for (let casetoAssign in caseIds) {
				let caseAssigned: ICaseAssign =
					{
						caseId: caseIds[casetoAssign],
						assignedTo: userId
					};
				cases.push(caseAssigned);
			}
			var params: ICaseAssignRequest = {
				cases: cases,
				notes: null,
				reason: null,
				status: 13
			};
			return http.patch<ICaseAssignResponse[]>(this.config.getParams().casesUrl, params);
		};
		vm.addEvidence=(caseId: string, Evidences:IEvidence[])=>{
			var params: any = {
				CaseId: caseId,
				Evidences: Evidences
				
			};
			return http.patch<boolean>(this.config.getParams().analysisUrl+'/'+caseId+'/evidences', params);
		};
	}
}
