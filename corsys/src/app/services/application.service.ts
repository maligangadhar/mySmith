import { IApplicationService, IAppParams, ICacheStorageService } from '../interfaces/interfaces';
import { Inject, Injectable } from '@angular/core';
import { IAppDetail, IApp } from '../models/viewModels';
import { SecureService } from './secure.adal.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ApplicationsService implements IApplicationService {
  constructor( @Inject('IAppParams') public config: IAppParams,
    @Inject('ICacheStorageService') public cacheStorageService: ICacheStorageService,
    public http: SecureService) { }
  getApplications = () => {
    //cache the applications
    return new Observable(observable => {
      if (this.cacheStorageService.cacheApplications) {
        // tslint:disable-next-line:no-console
        console.log('getApplications@data already available');
        observable.next(this.cacheStorageService.cacheApplications);
        observable.complete();
      } else {
        // tslint:disable-next-line:no-console
        console.log('getApplications@send new request');
        return this.http.get<IApp[]>(this.config.getParams().appsUrl)
          .subscribe(response => {
            this.cacheStorageService.cacheApplications = response;
            observable.next(this.cacheStorageService.cacheApplications);
            observable.complete();
          });
      }
    });
    //old code
    //return this.http.get<IApp[]>(this.config.getParams().appsUrl);
  }

  getApplication = (id: number) => {
    return this.http.get<IAppDetail>(this.config.getParams().appsUrl + '/' + id.toString());
  }

  updateApplication = (appDetails: IAppDetail) => {
    return this.http.put<IAppDetail>(this.config.getParams().appsUrl, appDetails);
  }
}
