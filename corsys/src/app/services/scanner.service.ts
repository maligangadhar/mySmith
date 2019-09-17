import { Injectable, Inject } from '@angular/core';
import { IScannerService, IAppParams } from '../interfaces/interfaces';
import { Observable } from 'rxjs/Observable';
import { IResponse, IScannerBatchObject } from '../models/viewModels';
import { SecureService } from './secure.adal.service';

@Injectable()
export class ScannerService implements IScannerService {
    constructor(@Inject('IAppParams') private config: IAppParams,private http: SecureService){}
    getScanItemList =  (params: Object): Observable<IResponse<IScannerBatchObject>> => {
        return this.http.get<IScannerBatchObject>(this.config.getParams().scansUrl + '/scans', params);
    }
    mapScanToCase=(containerId:string, scanId:string): Observable<IResponse<any>> =>{
        let params={
            containerId:containerId,
            scanId:scanId
        };
        return this.http.patch<any>(this.config.getParams().scansUrl, params);
    }
}
