/*import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

import { IAppDetail } from '../models/viewModels';
import { ISharedAppService } from '../interfaces/interfaces';

@Injectable()
export class SharedAppService implements ISharedAppService {
		private appFilter: number;
		private appDetail: IAppDetail;
		private subject: Subject<IAppDetail> = new Subject<IAppDetail>();
		private appFilterSubject: Subject<number> = new Subject<number>();
		public IsFilterChanged: boolean = false;

		setAppDetail(appDetail: IAppDetail): void {
				this.appDetail = appDetail;
				this.subject.next(appDetail);
		}

		getAppDetail(): Observable<IAppDetail> {
				return this.subject.asObservable();
		}

		setAppFilter(appFilter: number): void {
				this.appFilter = appFilter;
				this.appFilterSubject.next(appFilter);
		}

		getAppFilter(): Observable<number> {
				return this.appFilterSubject.asObservable();
		}
}
*/

