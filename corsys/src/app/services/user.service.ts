import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { IResponse, IUserDetail, IUser } from '../models/viewModels';
import { IUserService, IAppParams, ICacheStorageService, ICommonService, IBroadcastService } from '../interfaces/interfaces';
import { SecureService } from './secure.adal.service';

@Injectable()
export class UserService implements IUserService {
	getUserByName: (userName: string) => Observable<IResponse<IUserDetail>>;
	getUser: (userId: number) => Observable<IResponse<IUserDetail>>;
	getUsers: () => Observable<IResponse<IUser[]>>;
	createUser: (userDetails: IUserDetail) => Observable<IResponse<IUserDetail>>;
	updateUser: (userDetails: IUserDetail) => Observable<IResponse<IUserDetail>>;
	updateUserLocation: (userDetails: IUserDetail) => Observable<IResponse<IUserDetail>>;
	userRoles: any;
	constructor( @Inject('IAppParams') private config: IAppParams, 
	private http: SecureService, 
	@Inject('ICacheStorageService') public cacheStorageService: ICacheStorageService, 
	@Inject('ICommonService') public commonService: ICommonService, @Inject('IBroadcastService') private broadcastService: IBroadcastService
	) {
		var vm = this;
		vm.getUser = (userId: number) => {
			let url = this.config.getParams().userUrl;
			return this.http.get<IUserDetail>(url + '/' + userId.toString());
		};

		vm.getUserByName = (userName: string) => {
			//cache the user data
			return new Observable(observable => {
				if (cacheStorageService.cacheUserDetails) {
					observable.next(cacheStorageService.cacheUserDetails);
					this.userRoles = cacheStorageService.cacheUserDetails.data.roles;
					observable.complete();
					setTimeout(() => {
						vm.broadcastService.broadcast('roleData', this.userRoles);
					}, 60);
				} else {
					this.http.get<IUserDetail>(this.config.getParams().userUrl + '/' + userName)
						.subscribe(response => {
              if(response.data && response.data.roles){
                let roles=response.data.roles;
                sessionStorage.setItem('userRoles', JSON.stringify(roles));
              }
							cacheStorageService.cacheUserDetails = response;
							observable.next(cacheStorageService.cacheUserDetails);
              observable.complete();
						});
				}
			});
			//old code
			// return this.http.get<IUserDetail>(this.config.getParams().userUrl + '/' + userName);
		};

		vm.getUsers = () => {
      //cache the user data
    
			return new Observable(observable => {
				if ((commonService.UserChanged === undefined && (cacheStorageService.cacheUsers === undefined || cacheStorageService.cacheUsers === null)) || commonService.UserChanged === true) {
					this.http.get<IUser[]>(this.config.getParams().userUrl)
						.subscribe(response => {
							cacheStorageService.cacheUsers = response;
							observable.next(cacheStorageService.cacheUsers);
							observable.complete();
						});
				} else {
					// tslint:disable-next-line:no-console
					console.log('getUsers@data already available');
					setTimeout(() => {
						observable.next(cacheStorageService.cacheUsers);
						observable.complete();
					}, 250);
				}
			});
			//old code
			//return this.http.get<IUser[]>(this.config.getParams().userUrl);
		};

		vm.createUser = (userDetails: IUserDetail) => {
			return this.http.post<IUserDetail>(this.config.getParams().userUrl, userDetails);
		};
		vm.updateUser = (userDetails: IUserDetail) => {
      cacheStorageService.cacheUsers=null;
			return this.http.put<IUserDetail>(this.config.getParams().userUrl, userDetails);
		};
		vm.updateUserLocation = (userDetails: any) => {
      cacheStorageService.cacheUsers=null;
			return this.http.patch<IUserDetail>(this.config.getParams().userUrl, userDetails);
		};
	}
}
