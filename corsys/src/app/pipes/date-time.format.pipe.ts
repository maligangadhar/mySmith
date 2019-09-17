import { Pipe, PipeTransform, Inject } from '@angular/core';
import { IDateTimeFormatService } from '../interfaces/interfaces';

@Pipe({
    name: 'sp3DateTimeFormat',
    pure:  true
})

export class DateTimeFormatPipe implements PipeTransform {
    constructor(@Inject('IDateTimeFormatService') private dateTimeFormatService: IDateTimeFormatService){}    

    transform(value: string | Date, arg?: string) {
        return !value ? '' : this.dateTimeFormatService.formatDateTime(value, arg ? arg: ''); 
    }
}
