import { Injectable, Inject } from '@angular/core';
import { Http, Headers, RequestOptionsArgs, RequestOptions, RequestMethod, URLSearchParams, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Adal4Service } from '@corsys/corsys-adal';
import { IResponse, IAPIResponse } from '../models/viewModels';
import { responseStatus, spinnerType } from '../models/enums';
import { IMessageService } from '../interfaces/interfaces';

/**
 *
 *
 * @export
 * @class SecureService
 */
@Injectable()
export class SecureService {

  static factory(http: Http, service: Adal4Service,messageService: IMessageService) {
    return new SecureService(http, service,messageService);
  }

  constructor(
    private http: Http,
    private service: Adal4Service,
    @Inject('IMessageService') public messageService: IMessageService,
  ) { }

  get<T>(url: string, data?: any, options?: RequestOptionsArgs): Observable<IResponse<T>> {
    let options1 = this.getRequestOption(RequestMethod.Get, data);
    options1 = Object.assign(options1, options);
    return this.sendRequest<T>(url, options1);
  }

  post<T>(url: string, data: any, options?: RequestOptionsArgs): Observable<IResponse<T>> {
    let options1 = this.getRequestOption(RequestMethod.Post, data);
    options1 = Object.assign(options1, options);
    return this.sendRequest<T>(url, options1);
  }

  delete<T>(url: string, options?: RequestOptionsArgs): Observable<IResponse<T>> {
    let options1 = new RequestOptions({ method: RequestMethod.Delete });
    options1 = Object.assign(options1, options);
    return this.sendRequest<T>(url, options1);
  }

  patch<T>(url: string, body: any, options?: RequestOptionsArgs): Observable<IResponse<T>> {
    let options1 = this.getRequestOption(RequestMethod.Patch, body);
    options1 = Object.assign(options1, options);
    return this.sendRequest<T>(url, options1);
  }

  put<T>(url: string, body: any, options?: RequestOptionsArgs): Observable<IResponse<T>> {
    let options1 = this.getRequestOption(RequestMethod.Put, body);
    options1 = Object.assign(options1, options);
    return this.sendRequest<T>(url, options1);
  }

  head<T>(url: string, options?: RequestOptionsArgs): Observable<IResponse<T>> {
    let options1 = new RequestOptions({ method: RequestMethod.Head });
    options1 = Object.assign(options1, options);
    return this.sendRequest<T>(url, options1);
  }

  private fetchAuthToken(resource: string): Observable<any> {
    let isAuthenticated = this.service.userInfo.authenticated;
    if (!isAuthenticated) {
      return Observable.throw(new Error('User Not Authenticated.'));
    }
    return this.service.acquireToken(resource);
  }

  private sendRequest<T>(url: string, options: RequestOptionsArgs): Observable<IResponse<T>> {
    let options1 = new RequestOptions();
    options1.method = options.method;
    options1 = options1.merge(options);
    let resource = this.service.GetResourceForEndpoint(url);

    return this.fetchAuthToken(resource)
      .map((token: string) => {
        return token.toString();
      }, (error) => {
        return Observable.throw(new Error('Unable to fetch Auth Token'));
      }).flatMap((data: string) => {
        if (options1.headers == null) {
          options1.headers = new Headers();
        }
        if (!options1.headers.has('Content-Type')) {
          options1.headers.append('Content-Type', 'application/json');
        }
        options1.headers.append('Authorization', 'Bearer ' + data);
        return this.http.request(url, options1)
          .map((response: any) => {
            var apiResponse: IAPIResponse<T> = response.json();
            var result = this.handleAPIResponse<T>(apiResponse, url);
            let token = this.service.getCachedToken(resource);
            if (token.length === 0 && (window.location.hash !== '')) {//if token renewal request is made in an iframe
              this.service.handleWindowCallback();
            }
            return result;
          }, (error) => {
            return this.handleError<T>(error.status, url);
          }).catch((error) => {
            return this.handleError<T>(error.status, url);
          });
      }).catch((error) => {
        return this.handleError<T>(error.status, url);
      });
  }

  public getAttachment<T>(url: string, mimeType: string, params?: Object) {
    let resource = this.service.GetResourceForEndpoint(url);

    return this.fetchAuthToken(resource)
      .map((token: string) => {
        return token.toString();
      }, (error) => {
        return Observable.throw(new Error('Unable to fetch Auth Token'));
      }).flatMap((data: string) => {
        var headerParams = {
          'Content-Type': 'application/json',
          'Accept': mimeType,
          'Authorization': 'Bearer ' + data.toString()
        };
        let urlParams = new URLSearchParams();
        for (let key in params) {
          urlParams.set(key, params[key]);
        }
        let headers = new Headers(headerParams);
        let options = new RequestOptions({ headers: headers, params: urlParams, responseType: ResponseContentType.Blob, method: RequestMethod.Get });
        return this.http.request(url, options);
      }).catch((error) => {
        //console.log("error:::",error);        
        if(error.type===3){
          //console.log('Image not downloaded...');
          this.messageService.LoaderMessage = { id: '', headerMessage: '', footerMessage: '', showLoader: false, type: spinnerType.small };
        }
        return this.handleError<T>(error.status, url).catch((error) => {
          return this.handleError<T>(error.status, url);
        });
      });
  }

  public logOut = () => {
    this.service.logOut();
  }

  /**
   *  Helper Methods
   */
  private getRequestOption(method: any, data?: any, headerParam?: Object) {
    let urlParams = new URLSearchParams();
    let headers = new Headers(headerParam);
    for (let key in data) {
      urlParams.set(key, data[key]);
    }

    if (headerParam && Object.keys(headerParam).length) {
      for (let key in headerParam) {
        headers.set(key, headerParam[key]);
      }
    }
    if (method === RequestMethod.Get) {
      return new RequestOptions({ method: method, search: urlParams, headers: headers });
    }
    else {
      return new RequestOptions({ method: method, body: JSON.stringify(data), headers: headers });
    }
  }

  private handleAPIResponse<T>(apiResponse: IAPIResponse<any>, url: string) {
    let result: IResponse<T> = {
      apiUrl: url,
      data: null,
      messageKey: '',
      status: responseStatus.Success,
      message: ''
    };
    result.messageKey = apiResponse.code;
    result.message = apiResponse.message;
    if (apiResponse.code.slice(6, 9) === '000' || apiResponse.code === 'SACM10001') {
      result.data = apiResponse.data;
    }
    else if (apiResponse.code.slice(6, 9) === '005') {
      result.status = responseStatus.Timeout;
    }
    else {
      result.status = responseStatus.APIError;
    }

    return result;
  }

  private handleError<T>(status: any, url: string) {
    let result: IResponse<T> = {
      apiUrl: url,
      data: null,
      messageKey: 'DefaultError',
      status: responseStatus.Failure
    };
    if (status === 500) {
      result.status = responseStatus.Failure;
    }
    else if (status === 401 || status === 403) {
      result.status = responseStatus.NotAuthorized;
      result.messageKey = 'NotAuthorized';
    }
    else if (status === 404 || status === 503) {
      result.status = responseStatus.ApiNotAvailable;
    }
    //log the error
    return Observable.throw(result);
  }

  /**
   * Helper Methods end here
   */
}
