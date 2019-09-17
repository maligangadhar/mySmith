import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { IResponse, IRoleDetail } from '../models/viewModels';
import { IRoleService, IAppParams, ICacheStorageService, ICommonService } from '../interfaces/interfaces';
import { SecureService } from './secure.adal.service';

@Injectable()
export class RoleService implements IRoleService {
	private roleDetail: IRoleDetail;
	getRoleDetail(): IRoleDetail {
		return this.roleDetail; // Observable.create(() => { return this.roleDetail });
	}
	setRoleDetail(roleDetail: IRoleDetail): void {
		this.roleDetail = roleDetail;
	}
	getRoles: <IRole>() => Observable<IResponse<IRole[]>>;
	createRole: <IRoleCreate > (roleDetails: IRoleCreate) => Observable<IResponse<IRoleDetail>>;
	updateRole: <IRoleCreate> (roleDetails: IRoleCreate) => Observable<IResponse<IRoleDetail>>;
	getRole: (id: number) => Observable<IResponse<IRoleDetail>>;

	constructor( @Inject('IAppParams') private config: IAppParams, public http: SecureService, @Inject('ICacheStorageService') public cacheStorageService: ICacheStorageService, @Inject('ICommonService') public commonService: ICommonService, ) {
		var vm = this;

		vm.getRoles = <IRole>() => {
			//cache the roles data
			// tslint:disable-next-line:no-console
			console.log('commonService.roleModified:::', commonService.NewRoleAdded);
			return new Observable(observable => {
				if ((commonService.NewRoleAdded === undefined && cacheStorageService.cacheRoles === undefined) || commonService.NewRoleAdded === true) {
					// tslint:disable-next-line:no-console
					console.log('@getRoles@send new request');
					return http.get<IRole[]>(this.config.getParams().rolesUrl)
						.subscribe(response => {
							cacheStorageService.cacheRoles = response;
							observable.next(cacheStorageService.cacheRoles);
							observable.complete();
						});
				} else {
					// tslint:disable-next-line:no-console
					console.log('getRoles@data already available');
					setTimeout(() => {
						observable.next(cacheStorageService.cacheRoles);
						observable.complete();
					}, 250);
				}
			});
			//old code
			//return http.get<IRole[]>(this.config.getParams().rolesUrl);
		};
		vm.getRole = (id: number) => {
			return http.get<IRoleDetail>(this.config.getParams().rolesUrl + '/' + id.toString());
		};
		vm.createRole = <IRoleCreate>(roleDetails: IRoleCreate) => {
			return http.post<IRoleDetail>(this.config.getParams().rolesUrl, roleDetails);
		};
		vm.updateRole = <IRoleCreate>(roleDetails: IRoleCreate) => {
			return http.put<IRoleDetail>(this.config.getParams().rolesUrl, roleDetails);
		};
	}
}
