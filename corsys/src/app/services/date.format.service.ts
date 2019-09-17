import { Injectable, Inject } from '@angular/core';
import { IDateFormatService, IStorageService, ITranslateService } from '../interfaces/interfaces';
import * as moment from 'moment';

@Injectable()
export class DateFormatService implements IDateFormatService {
		formatDate: (date: Object, format?: string) => string;
		formatDateforApi: (dateString: string|Object) => string;
		operationalDate: (dateString: string|Object) => Object;
		constructor(@Inject('IStorageService') storageService: IStorageService,
		@Inject('ITranslateService') private translateService: ITranslateService) {
				var vm = this;
				function _fetchFormatFromStorage(defaultDateFormat: string): string {
						let generalDateFormat: string = storageService.getItem('generalFormat').dateFormat;
						return generalDateFormat ? generalDateFormat: defaultDateFormat;
				}
				vm.formatDate = (date: Object, format?: string) => {
						let lang : string = this.translateService.CurrentLang;
						let dateFormat: string = 'MM-DD-YYYY';
						if (format) {
								dateFormat = format;   
						} else {
								dateFormat = _fetchFormatFromStorage(dateFormat);
						}
						//moment understands 'a' instead of 'tt'
						let newDateFormat: string = dateFormat.replace('tt', 'a');
						let formattedDate: string = moment(date).locale(lang).format(newDateFormat);
						return formattedDate;
				};

				vm.formatDateforApi = (dateString: string | Object) => {
						if (!dateString) {
							return;
						}
						else {
							return moment(dateString, moment.ISO_8601).format();
						}
						
				};

				vm.operationalDate = (dateString: string) =>
				{
					return moment(dateString, moment.ISO_8601);
				};
		}
}
