import { Pipe, PipeTransform, Inject } from '@angular/core';
import { IDateFormatService } from '../interfaces/interfaces';
@Pipe({
		name: 'sp3DateFormat',
		pure: true
})

export class DateFormatPipe implements PipeTransform {
		constructor( @Inject('IDateFormatService') private dateFormatService: IDateFormatService){}
		transform(value: string, arg?: string) {
				if (!value || value.length === 1) {
						return '';
				}
				let dateObject: Date = new Date(value);
				let isDate: boolean = typeof dateObject.getMonth === 'function';
				return isDate ? this.dateFormatService.formatDate(dateObject, arg? arg: ''): value;
		}

}
