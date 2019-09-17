import { Injectable, Inject } from '@angular/core';
import { ILocationService, IAppParams } from '../interfaces/interfaces';
import { Observable } from 'rxjs/Observable';
import { IResponse, ILocationsDetail } from '../models/viewModels';
import { SecureService } from './secure.adal.service';

@Injectable()
export class LocationService implements ILocationService {
    constructor(@Inject('IAppParams') private config: IAppParams, private http: SecureService) {}
    get = (): Observable<IResponse<ILocationsDetail[]>> => {
        return this.http.get(this.config.getParams().locationsInfo);
    }
}
