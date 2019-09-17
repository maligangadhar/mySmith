import { FilterRoleListContentPipe } from './filterRoleContentPipe';
import { IRole } from '../models/viewModels';
describe('Pipe: FilterRoleContentPipe', () => {
	let pipe = new FilterRoleListContentPipe();
	let roles: IRole[] = [{id: 1, name: 'AAA', status: 1}, {id: 2, name: 'BBB', status: 2}];

	
	it ('FilterRoleListContentPipe: should return an array containing \'AAA\' when predicate is \'AAA\'', () => {
		let text = 'AAA';
		let expectArray = [{id: 1, name: 'AAA', status: 1}];
		expect(pipe.transform(roles, text)).toEqual(expectArray);
	});

	it ('FilterRoleListContentPipe: should do a case insensitive search of name ', () => {
		let text = 'aaa';
		let expectArray = [{id: 1, name: 'AAA', status: 1}];
		expect(pipe.transform(roles, text)).toEqual(expectArray);
	});

	it ('FilterRoleListContentPipe: should return the entire content when no predicate is passed ', () => {
		expect(pipe.transform(roles, '')).toEqual(roles);
	});

	it ('FilterRoleListContentPipe: should return empty array when predicate doesn\'t match', () => {
		let text = 'randomData';
		expect(pipe.transform(roles, text)).toEqual([]);
	});

	it ('FilterRoleListContentPipe: should not return empty array when predicate doesn\'t match', () => {
		let text = 'randomData';
		expect(pipe.transform(roles, text)).not.toEqual([{id: 2, name: 'BBB', status: 2}]);
	});
});
