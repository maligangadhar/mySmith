import { Injectable, Inject } from '@angular/core';
import { IProfilerSettingService, IAppParams } from '../interfaces/interfaces';
import { Observable } from 'rxjs/Rx';
import { IProfilerCategory, IResponse, IProfilerCategoryPatchFormat } from '../models/viewModels';
import { SecureService } from './secure.adal.service';

@Injectable()
export class ProfilerSettingService implements IProfilerSettingService {

  constructor(private http: SecureService, @Inject('IAppParams') private config: IAppParams){}

  getProfilerSetting = (): Observable<IResponse<IProfilerCategory[]>> => {
    return this.http.get<IProfilerCategory[]>(this.config.getParams().casesUrl+'/profiler/riskcategories');
  }

  patchProfilerSetting = (profilerSettings: IProfilerCategoryPatchFormat): Observable<IResponse<IProfilerCategory[]>> => {
    return this.http.patch<IProfilerCategory[]>(this.config.getParams().casesUrl+'/profiler/riskcategories', profilerSettings);
  }
}
