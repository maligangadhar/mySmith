import { TestBed } from '@angular/core/testing';
import { DateTimeFormatService } from '../services/data-time.format.service';
import { IStorageService, IDateTimeFormatService, ITranslateService } from '../interfaces/interfaces';
import * as moment from 'moment';

/**
 * Helper Classes for Date-Time Format Service.Spec
 * 
 */

class StorageServiceStub implements IStorageService {
    setItem: (key: string, value: any) => void;
    clearItem: (key: string) => void;
    clearStorage: () => void;
    getItem = () => {
        return { 'dateFormat':'DD-MM-YYYY','timeFormat':'hh:mm:ss'};
    }
}

class TranslateServiceStub implements ITranslateService {
    CurrentLang: string;
    setDefaultLang: (lang: string) => void;
    enableFallback: (enable: boolean) => void;
    use: (lang: string) => void;
    replace: (word: string, words: string | string[]) => string;
    instant: (key: string, words?: string | string[]) => string;
   
}
let dateFormatServiceInstance: IDateTimeFormatService;
let translationServiceInstance: ITranslateService;
describe('Test-Case Date-Time Format Service ', ()=> {
    beforeEach( ()=> {
        TestBed.configureTestingModule({
            providers: [ DateTimeFormatService, 
                { provide: 'IStorageService', useClass: StorageServiceStub },
                { provide: 'ITranslateService', useClass: TranslateServiceStub }]
        });

        dateFormatServiceInstance = TestBed.get(DateTimeFormatService);
        translationServiceInstance = TestBed.get('ITranslateService');
    });
    
    it(' should be able to create an instance of Date-Format Service ', ()=> {
        expect(dateFormatServiceInstance instanceof DateTimeFormatService).toBeTruthy();
    });

    it (' should be able to format a date string using some format provided by Storage Service ', ()=> {
        translationServiceInstance.CurrentLang = 'en';
        let date  = new Date().toUTCString();
        let result = dateFormatServiceInstance.formatDateTime(date);
        let momentFormattedDate =  moment(date).format('DD-MM-YYYY hh:mm:ss');
        expect(result).toEqual(momentFormattedDate);
    });
});
