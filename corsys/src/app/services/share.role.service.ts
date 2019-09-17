/*mport { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Injectable, EventEmitter } from '@angular/core';

import { IRoleDetail } from '../models/viewModels';
import { ISharedRoleService } from '../interfaces/interfaces';

@Injectable()
export class SharedRoleService implements ISharedRoleService {
		public RoleCancelled: EventEmitter<boolean>;

		private roleFilter: number;
		private roleDetail: IRoleDetail;
		private subject: Subject<IRoleDetail> = new Subject<IRoleDetail>();
		private roleFilterSubject: Subject<number> = new Subject<number>();
		private cancelled: boolean;
		public  IsFilterChanged: boolean = false;

		get IsCancelled(): boolean {
				return this.cancelled; // Observable.create(() => { return this.roleDetail });
		}
		set IsCancelled(flag: boolean) {
				this.cancelled = flag;
				this.RoleCancelled.emit(flag);
		}
		setRoleDetail(roleDetail: IRoleDetail): void {
				this.roleDetail = roleDetail;
				this.subject.next(roleDetail);
		}

		getRoleDetail(): Observable<IRoleDetail> {
				return this.subject.asObservable();
		}
		setRoleFilter(roleFilter: number): void {
				this.roleFilter = roleFilter;
				this.roleFilterSubject.next(roleFilter);
			}

		getRoleFilter(): Observable<number> {
				return this.roleFilterSubject.asObservable();
		}
		constructor() {
				var vm = this;
				vm.RoleCancelled = new EventEmitter();

		}
}
*/

