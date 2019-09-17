/*import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { ISharedUserService } from '../interfaces/interfaces';

@Injectable()
export class SharedUserService implements ISharedUserService {
		private userFilter: number;
		private userFilterSubject: Subject<number> = new Subject<number>();

		setUserFilter(userFilter: number): void {
				this.userFilter = userFilter;
				this.userFilterSubject.next(userFilter);
			}

		getUserFilter(): Observable<number> {
				return this.userFilterSubject.asObservable();
		}
}

*/
