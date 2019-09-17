import { Injectable, Inject } from '@angular/core';
import { IDateTimeFormatService, IStorageService, ITranslateService } from '../interfaces/interfaces';
import * as moment from 'moment';

@Injectable()
export class DateTimeFormatService implements IDateTimeFormatService {
    constructor(@Inject('IStorageService') public storageService: IStorageService,
    @Inject('ITranslateService') public translateService: ITranslateService){}
     formatDateTime = (dateTime: Date | string, format?: string): string => {
        let lang : string = this.translateService.CurrentLang;
        let dateTimeFormat: string = 'MM-DD-YYYY HH:mm:ss'; 
        let dateFormat = this.storageService.getItem('generalFormat').dateFormat;
        let timeFormat = this.storageService.getItem('generalFormat').timeFormat;
        if (format) {
            let result = moment(dateTime).locale(lang).format(format);
            return  result === 'Invalid date' ? '': result;
        } else if (dateFormat && timeFormat) {
            dateTimeFormat = dateFormat + ' ' + timeFormat.replace('tt', 'a'); 
            let result = moment(dateTime).locale(lang).format(dateTimeFormat);
            return  result === 'Invalid date' ? '': result;   
        } else {
            let result = moment(dateTime).locale(lang).format(dateTimeFormat);
            return  result === 'Invalid date' ? '': result;
        }
     }   
}
