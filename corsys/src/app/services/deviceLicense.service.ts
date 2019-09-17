import { Injectable, Inject } from '@angular/core';
import { IDeviceLicenseService, IAppParams } from '../interfaces/interfaces';
import { Observable } from 'rxjs/Observable';
import { IResponse, IDeviceLicenseDetail } from '../models/viewModels';
import { SecureService } from './secure.adal.service';

@Injectable()
export class DeviceLicenseService implements IDeviceLicenseService {
    constructor(@Inject('IAppParams') private config: IAppParams,private http: SecureService) {}
    get = (): Observable<IResponse<IDeviceLicenseDetail[]>> => {
        return this.http.get(this.config.getParams().deviceLicenseInfo);
    }

    getById = (deviceId: string): Observable<IResponse<IDeviceLicenseDetail>> => {
        return this.http.get(this.config.getParams().deviceLicenseInfo + '/' + deviceId);
    }

    patch = (payLoad: IDeviceLicenseDetail): Observable<IResponse<boolean>> => {
        return this.http.patch(this.config.getParams().deviceLicenseInfo, payLoad);
    }
    put =  (payLoad: IDeviceLicenseDetail): Observable<IResponse<IDeviceLicenseDetail[]>> => {
        return this.http.put(this.config.getParams().deviceLicenseInfo, payLoad);
    }
    post = (payLoad: IDeviceLicenseDetail): Observable<IResponse<IDeviceLicenseDetail[]>> => {
        return this.http.post(this.config.getParams().deviceLicenseInfo, payLoad);
    }
}
