import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { IResponse, IAssessmentImage, IMetadataImages, IFinding, IImageView, IRuler, IRulerResponse } from '../models/viewModels';
import { IAnalyzerService, IAppParams, ICacheStorageService } from '../interfaces/interfaces';
import { findingStatus } from '../models/enums';
import { SecureService } from './secure.adal.service';

@Injectable()
export class AnalyzerService implements IAnalyzerService {
  fetchScanMetadata: () => Observable<IResponse<any>>;
  getScanDetails: (scanID: string) => Observable<IResponse<IAssessmentImage[]>>;
  getAnalyzerCaseDetails: (caseID: string) => Observable<IResponse<IAssessmentImage[]>>;
  getImageByScanId: (scanFolder: string, scanImageId: string, mimeType: string) => any;
  fetchImageAnalyzerMetaData: () => Observable<IResponse<IMetadataImages>>;
  fetchImageFindings: (caseId: string, viewType: number) => Observable<IResponse<IFinding[]>>;
  createView: <IImageView>(caseID: string, viewDetail: IImageView) => Observable<IResponse<IImageView>>;
  updateView: (caseID: string, viewDetail: IImageView) => Observable<IResponse<IImageView>>;
  getViews: (caseID: string) => Observable<IResponse<IImageView[]>>;
  getViewDetailByViewId: (caseID: string, viewID: string) => Observable<IResponse<IImageView>>;
  addImageFinding: (caseId: string, finding: IFinding) => Observable<IResponse<IFinding>>;
  updateImageFinding: (caseId: string, finding: IFinding) => Observable<IResponse<IFinding>>;
  deleteFinding: (caseId: string, findingId: string, status: findingStatus, VerdictComment?: string) => Observable<IResponse<any>>;
  fetchImageRulers: (caseId: string, viewType: number) => Observable<IResponse<IRulerResponse>>;
  addImageRuler: (caseId: string, ruler: IRuler) => Observable<IResponse<IRuler>>;
  deleteRuler: (caseId: string, rulerId: string, status: findingStatus) => Observable<IResponse<any>>;

  constructor(@Inject('IAppParams') private config: IAppParams, private http: SecureService,  @Inject('ICacheStorageService') public cacheStorageService: ICacheStorageService) {
    var vm = this;
    vm.getScanDetails = (scanId: string) => {
      var params = {
        scanId: scanId
      };
      return http.get<IAssessmentImage[]>(this.config.getParams().scansUrl, params);
    };
    vm.getAnalyzerCaseDetails = (caseId: string) => {
      var params = {
        caseId: caseId
      };
      return http.get<IAssessmentImage[]>(this.config.getParams().scansUrl, params);
    };

    vm.getImageByScanId = (scanFolder: string, scanImageID: string, mimeType: string) => {
      let url = this.config.getParams().attachmentUrl + '/' + scanImageID + '?fileFolder=';
      return this.http.getAttachment(url, mimeType);
    };

    vm.fetchImageAnalyzerMetaData = () => {
      //Handling cache with observable
      return new Observable(observable => {
				if(cacheStorageService.cacheAnalysisMetaData) {
					// tslint:disable-next-line:no-console
					console.log('fetchImageAnalyzerMetaData->analyzer.service.ts@data already available');
					observable.next(cacheStorageService.cacheAnalysisMetaData);
					observable.complete();
				}else {
					// tslint:disable-next-line:no-console
					console.log('fetchImageAnalyzerMetaData->analyzer.service.ts@send new request');
					this.http.get(this.config.getParams().analysisUrl + '/metadata')
					.subscribe(response =>  {
						cacheStorageService.cacheAnalysisMetaData = response;
						observable.next(cacheStorageService.cacheAnalysisMetaData);
						observable.complete();
					});
				}
      });
      //old code
      //return http.get(vm.config.getParams().analysisUrl + '/metadata');
    };

    vm.fetchScanMetadata = () => {
      //Handling cache with observable
      return new Observable(observable => {
        if(cacheStorageService.scanMetadata) {
          // tslint:disable-next-line:no-console
          console.log('fetchScanMetadata@data already available');
          observable.next(cacheStorageService.scanMetadata);
          observable.complete();
        }else {
          // tslint:disable-next-line:no-console
          console.log('@fetchScanMetadata@send new request');
          http.get(vm.config.getParams().scansUrl + '/metadata')
          .subscribe(response =>  {
            cacheStorageService.scanMetadata = response;
            observable.next(cacheStorageService.scanMetadata);
            observable.complete();
          });
        }
      });
      //old code
      //return http.get(vm.config.getParams().scansUrl + '/metadata');
    };

    vm.fetchImageFindings = (caseId: string, viewType?: number) => {
      //http://10.101.1.4/analysis/3123123/findings?viewType=0
      let getFindingsUrl: string = '';

      if (viewType === null) {
        getFindingsUrl = this.config.getParams().analysisUrl + '/' + caseId + '/findings';
      }
      else {
        getFindingsUrl = this.config.getParams().analysisUrl + '/' + caseId + '/findings?viewType=' + viewType;
      }

      return http.get<IFinding[]>(getFindingsUrl);
    };
    vm.fetchImageRulers = (caseId: string, viewType?: number) => {
      //http://10.101.1.4/analysis/3123123/findings?viewType=0
      let getRulerUrl: string = '';

      if (viewType === null) {
        getRulerUrl = this.config.getParams().analysisUrl + '/' + caseId + '/ruler';
      }
      else {
        getRulerUrl = this.config.getParams().analysisUrl + '/' + caseId + '/ruler?viewType=' + viewType;
      }

      return http.get<IRulerResponse>(getRulerUrl);
    };
    vm.addImageRuler = (caseId: string, finding: IRuler) => {
      return http.post<IRuler>(this.config.getParams().analysisUrl + '/' + caseId + '/ruler', finding);
    };
    vm.addImageFinding = (caseId: string, finding: IFinding) => {
      return http.post<IFinding>(this.config.getParams().analysisUrl + '/' + caseId + '/findings', finding);
    };
    vm.updateImageFinding = (caseId: string, finding: IFinding) => {
      return http.put<IFinding>(this.config.getParams().analysisUrl + '/' + caseId + '/findings', finding);
    };
    vm.createView = <IImageView>(caseID: string, viewDetail: IImageView) => {
      let url = this.config.getParams().analysisUrl + '/' + caseID + '/views';
      return http.post<IImageView>(url, viewDetail);
    };
    vm.updateView = <IImageView>(caseID: string, viewDetail: IImageView) => {
      let url = this.config.getParams().analysisUrl + '/' + caseID + '/views';
      return http.put<IImageView>(url, viewDetail);
    };
    vm.getViews = (caseID: string) => {
      let url = this.config.getParams().analysisUrl + '/' + caseID + '/views';
      return http.get<IImageView[]>(url);
    };
    vm.getViewDetailByViewId = (caseID: string, viewID: string) => {
      let url = this.config.getParams().analysisUrl + '/' + caseID + '/views/' + viewID;
      return http.get<IImageView>(url);
    };
    vm.deleteFinding = (caseId: string, findingId: string, status: findingStatus, VerdictComment?: string,source?:string) => {
      let param = { findingId: findingId, status: status, VerdictComment: VerdictComment ,source:source};
      return http.patch(this.config.getParams().analysisUrl + '/' + caseId + '/findings', param);
    };
    vm.deleteRuler = (caseId: string, rulerId: string, status: findingStatus) => {
      let param = { rulerId: rulerId, isDeleted: true };
      return http.patch(this.config.getParams().analysisUrl + '/' + caseId + '/ruler', param);
    };
  }
}
