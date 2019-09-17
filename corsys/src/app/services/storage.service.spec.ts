import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
let service: StorageService;

describe('Test Storage Service', () => {
		beforeEach(() => {
				TestBed.configureTestingModule({
						providers: [StorageService]
				});

				service = TestBed.get(StorageService);
		});

		beforeEach( () => {
				var store = {};
				spyOn(window.sessionStorage, 'getItem').and.callFake( (key: string) => {
						return store[key] || null;
				});

				spyOn(window.sessionStorage, 'setItem').and.callFake( (key: string, value: any) => {
						return store[key] = value;
				});

				spyOn(window.sessionStorage, 'removeItem').and.callFake( (key: string) => {
						delete store[key];
				});

				spyOn(window.sessionStorage, 'clear').and.callFake( () => {
						store = {};
				});
				
		});
		
		it('should create an instance', () => {
				expect(service).toBeDefined();
		});

		it ('should be able to set item in storage when setItem is called ', () => {
				service.setItem('key', 'value');
				service.getItem('key');
				expect(window.sessionStorage.getItem).toHaveBeenCalled();
		});

		it ('should be able to get item from localstorage ', ()=> {
				service.setItem('key', 'value');
				let result = service.getItem('key');
				expect(window.sessionStorage.getItem).toHaveBeenCalled();
				expect(result).toEqual('value');
		});

		it ('should remove item from localStorage on removeItem', () => {
				service.setItem('key', 'value');
				let result = service.getItem('key');
				expect(window.sessionStorage.getItem).toHaveBeenCalled();
				expect(result).toEqual('value');
				service.clearItem('key');
				expect(service.getItem('key')).toBeFalsy();
		});

		it ('should clear the storage when clearStorage is called ', () => {
				service.setItem('key', 'value');
				service.setItem('key1', 'value1');
				expect(window.sessionStorage.setItem).toHaveBeenCalledTimes(2);
				service.clearStorage();
				expect(window.sessionStorage.clear).toHaveBeenCalled();
				expect(service.getItem('key')).toBeFalsy();
		});
});
