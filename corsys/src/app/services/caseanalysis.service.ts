import { Inject, Injectable } from '@angular/core';
import { ICaseAnalysisService, IAppParams, ICacheStorageService } from '../interfaces/interfaces';
import { IAnalysisDetails, IResponse, IMetaDataAnalysisCase } from '../models/viewModels';
import { Observable } from 'rxjs/Rx';
import { SecureService } from './secure.adal.service';

@Injectable()
export class CaseAnalysisService implements ICaseAnalysisService {
	putCaseAnalysis: (payLoad: IAnalysisDetails) => Observable<IResponse<IAnalysisDetails>>;
	fetchCaseAnalysisMetaData: () => Observable<IResponse<IMetaDataAnalysisCase>>;

	constructor( @Inject('IAppParams') private config: IAppParams, private http: SecureService, @Inject('ICacheStorageService') public cacheStorageService: ICacheStorageService) {

		this.putCaseAnalysis = (payLoad: IAnalysisDetails) => {
			return this.http.put(this.config.getParams().analysisUrl + '/verdict', payLoad);
		};

		this.fetchCaseAnalysisMetaData = () => {
			//Handling cache with observable
			return new Observable(observable => {
				if(cacheStorageService.cacheAnalysisMetaData) {
					// tslint:disable-next-line:no-console
					console.log('fetchCaseAnalysisMetaData@data already available');
					observable.next(cacheStorageService.cacheAnalysisMetaData); 
					observable.complete();
				}else {
					// tslint:disable-next-line:no-console
					console.log('@fetchCaseAnalysisMetaData@send new request');
					this.http.get(this.config.getParams().analysisUrl + '/metadata')
					.subscribe(response =>  {
						cacheStorageService.cacheAnalysisMetaData = response;
						observable.next(cacheStorageService.cacheAnalysisMetaData); 
						observable.complete();
					});
				} 
			});
			//old code
			//return this.http.get(this.config.getParams().analysisUrl + '/metadata');
		};
	}
}
