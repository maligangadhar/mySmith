import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { IResponse } from '../models/viewModels';
import { IUserAccessService } from '../interfaces/interfaces';

@Injectable()
export class UserAccessService implements IUserAccessService {

		getUserAccess: <IUserAccess>(useId: string) => Observable<IResponse<IUserAccess>>;
		
		constructor() {
				var vm = this;
				vm.getUserAccess = (userId: string) => {
						return null;//webRequest.getUserAccess<IUserAccess>(this.config.userAccessUrl);
				};
		}
}
