import { Injectable, EventEmitter } from '@angular/core';
import { IKeyData } from '../models/viewModels';
import { IBroadcastService } from '../interfaces/interfaces';

@Injectable()
export class BroadcastService implements IBroadcastService {
		broadcast: (key: string, data: any) => void;
		clear: () => void;

		public DataChange: EventEmitter<any>;
		appData: IKeyData[] = [];
		constructor() {
				var vm = this;
				vm.DataChange = new EventEmitter();

				vm.broadcast = (key: string, data: any) => {
						var keydata: IKeyData = { key: key, data: data };		
						vm.DataChange.emit(keydata);
				};
		}
}
