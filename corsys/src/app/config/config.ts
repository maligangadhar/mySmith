import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IAppParams } from '../interfaces/interfaces';

@Injectable()
 export class AppParams implements IAppParams {
  public getParams() {
    return environment;
  }
}
