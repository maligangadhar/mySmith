import { Injectable, Inject } from '@angular/core';
import { IOperationDashboardSettingService, IAppParams } from '../interfaces/interfaces';
import { Observable } from 'rxjs/Observable';
import { IResponse, IOperationDashboardDetail } from '../models/viewModels';
import { SecureService } from './secure.adal.service';

@Injectable()
export class OperationDashboardSettingService implements IOperationDashboardSettingService {
    constructor(@Inject('IAppParams') private config: IAppParams, private http: SecureService){}
    get = (id?: string):  Observable<IResponse<IOperationDashboardDetail>> => {
        return this.http.get(id ? (this.config.getParams().opAdminUrl + '/' + id): this.config.getParams().opAdminUrl);
    }
    put = (payload: IOperationDashboardDetail):  Observable<IResponse<IOperationDashboardDetail>> => {
        return this.http.put(this.config.getParams().opAdminUrl, payload);
    }
    post = (payload: IOperationDashboardDetail):  Observable<IResponse<IOperationDashboardDetail>> => {
        return this.http.post(this.config.getParams().opAdminUrl, payload);
    }
    patch = (payload: IOperationDashboardDetail):  Observable<IResponse<IOperationDashboardDetail>> => {
        return this.http.patch(this.config.getParams().opAdminUrl, payload);
    }
}
