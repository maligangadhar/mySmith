import { Pipe, PipeTransform, Inject } from '@angular/core';
import { ITranslateService } from '../interfaces/interfaces';  

@Pipe({
		name: 'sp3Translate',
		pure: false // impure pipe, update value when we change language
})

export class TranslatePipe implements PipeTransform {

		constructor( @Inject('ITranslateService') private translateService: ITranslateService) { }

		transform(value: string, args: string | string[]): any {
				return !value ? '' :this.translateService.instant(value, args);
		}
}
