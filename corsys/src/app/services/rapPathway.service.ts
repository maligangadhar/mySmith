import { Injectable, Inject } from '@angular/core';
import { IRAPPathwayService, IAppParams } from '../interfaces/interfaces';
import { Observable } from 'rxjs/Rx';
import { IRAPScore, IResponse, IRAPScorePatchFormat } from '../models/viewModels';
import { SecureService } from './secure.adal.service';

@Injectable()
export class RAPPathwayService implements IRAPPathwayService {

  constructor(private http: SecureService, @Inject('IAppParams') private config: IAppParams){}

  getRAPScore = (lang: string): Observable<IResponse<IRAPScore[]>> => {
    return this.http.get<IRAPScore[]>(this.config.getParams().casesUrl+'/profiler/rapscores', {lang: lang});
  }
  patchRAPScore = (riskScores: IRAPScorePatchFormat): Observable<IResponse<IRAPScore[]>> => {
    return this.http.patch<IRAPScore[]>(this.config.getParams().casesUrl+'/profiler/rapscores', riskScores);
  }
}
