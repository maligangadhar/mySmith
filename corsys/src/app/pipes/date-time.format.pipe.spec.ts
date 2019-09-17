import { DateTimeFormatPipe } from './date-time.format.pipe';
import { IDateTimeFormatService } from '../interfaces/interfaces';
import * as moment from 'moment';
import { TestBed } from '@angular/core/testing';

class DateTimeFormatServiceStub implements IDateTimeFormatService{
    formatDateTime = (dateTime: string | Date, format?: string) => {
        let lang =  'en';
        let dateTimeFormat: string = 'MM-DD-YYYY HH:mm:ss'; 
        let dateFormat = 'MM-DD-YYYY';
        let timeFormat = 'HH:mm:ss'; 
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

let pipe;

describe( 'Unit test cases for date ', () => {
    beforeEach( () => {
        TestBed.configureTestingModule({
            providers: [ DateTimeFormatPipe, { provide: 'IDateTimeFormatService', useClass: DateTimeFormatServiceStub}],
        });
        pipe = TestBed.get(DateTimeFormatPipe);
    });

    it ('should be able to create an instance of DateTimeFormatPipe ', ()=> {
        expect(pipe instanceof DateTimeFormatPipe).toBeTruthy();
    });

    it ('should be able to format date time based on the format passed', () => {
        let date = new Date().toUTCString();
        let momentFormattedDate = moment(date).format('MM-DD-YYYY HH:mm:ss');
        let pipeResult = pipe.transform(date);
        expect(momentFormattedDate).toEqual(pipeResult);
    });
});


