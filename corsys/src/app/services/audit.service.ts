import { Injectable, Inject } from '@angular/core';
import { IAppParams, IAuditMessageService } from '../interfaces/interfaces';
import { IAuditMessages } from '../models/viewModels';
import { SecureService } from './secure.adal.service';

@Injectable()
export class AuditService  implements IAuditMessageService{
  constructor( @Inject('IAppParams') public config: IAppParams, private http: SecureService,) { 
   
  }
  manageAuditMessages = () => {
    let params = { };
    return this.http.post<IAuditMessages>(this.config.getParams().auditUrl,params);
  }
}


