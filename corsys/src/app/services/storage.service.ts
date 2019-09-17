import { Injectable } from '@angular/core';
import { IStorageService } from '../interfaces/interfaces';

@Injectable()
export class StorageService implements IStorageService {
		setItem: (key: string, value: any) => void;
		getItem: (key: string) => any;
		clearItem: (key: string) => void;
		clearStorage: () => void;

		constructor() {
				var vm = this;

				vm.setItem = (key: string, value: any) => {
						sessionStorage.setItem(key, JSON.stringify(value));
				};

				vm.getItem = (key: string) => {
						let item = sessionStorage.getItem(key);
						return item ? JSON.parse(item) : '';
				};

				vm.clearItem = (key: string) => {
						sessionStorage.removeItem(key);
				};

				/**
         * Clean-Up sessionStorage and local storage.  Can be done during log-out
         */
				vm.clearStorage = () => {
            			sessionStorage.clear();
            			localStorage.clear();
				};
		}
}
