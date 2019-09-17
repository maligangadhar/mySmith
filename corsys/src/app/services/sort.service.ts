import { Injectable } from '@angular/core';
import { ISortService } from '../interfaces/interfaces';
import { sortOrder } from '../models/enums';

@Injectable()
export class SortService implements ISortService {
		sort: (data: any[], sortBy: string, orderType?: sortOrder) => any[];
		sortCaseIndependent: (data: any[], sortBy: string, orderType?: sortOrder) => any[];
		constructor() {
				var vm = this;

				vm.sort = (data: any[], sortBy: string, orderType?: sortOrder) => {
						data.sort(function (a, b) {
								if (orderType === sortOrder.Asc) {
										if (a[sortBy] < b[sortBy]) {
												return -1;
										}
												
										if (a[sortBy] > b[sortBy]) {
												return 1;
										}
												
										return 0;
								} else {
										if (a[sortBy] < b[sortBy]) {
												return 1;
										}
												
										if (a[sortBy] > b[sortBy]) {
												return -1;
										}
												
										return 0;
								}
						});
						return data;
				};
				vm.sortCaseIndependent = (data: any[], sortBy: string, orderType?: sortOrder) => {
						data.sort(function (a, b) {
								if (orderType === sortOrder.Asc) {
										if (a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) {
												return -1;
										}
												
										if (a[sortBy].toLowerCase() > b[sortBy].toLowerCase()) {
												return 1;
										}
												
										return 0;
								} else {
										if (a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) {
												return 1;
										}
												
										if (a[sortBy].toLowerCase() > b[sortBy].toLowerCase()) {
												return -1;
										}
												
										return 0;
								}
						});
						return data;
				};
		}
}
