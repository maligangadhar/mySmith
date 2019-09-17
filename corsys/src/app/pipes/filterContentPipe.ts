import { Pipe, PipeTransform } from '@angular/core';

import { IUser } from '../models/viewModels';

@Pipe({
		name: 'sp3FilterContent'
})

export class FilterListContentPipe implements PipeTransform{
		transform(users: IUser[], filterBy: string): IUser[] {
				
				filterBy = filterBy ? filterBy.toLocaleLowerCase() : null;
				
				return filterBy ? users.filter( (user: IUser) => {
						return user.fullName.toLocaleLowerCase().indexOf(filterBy) !== -1;
				} ): users;

		}
}
