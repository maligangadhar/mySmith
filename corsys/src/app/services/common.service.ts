import { Injectable, EventEmitter } from '@angular/core';
import { IRole, IApp, IRoleDetail, IUserDetail, IUserAccess } from '../models/viewModels';
import { ICommonService } from '../interfaces/interfaces';
// import { Headers } from '@angular/http';
@Injectable()
export class CommonService implements ICommonService {
	public NewRoleAddedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
	public NewUserAddedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
	public UserUpdatedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
	public UserDetailChange: EventEmitter<any> = new EventEmitter<any>();
	public _userDetailChanged: any;
	public rolesList: IRole[];
	public userAccess: IUserAccess;
	public applicationsList: IApp[];
	public newRoleAdded: boolean;
	public newUserAdded: boolean;
	public userUpdated: boolean;
	public roleUpdated: boolean;
	public userChanged: boolean;
	public newRole: IRoleDetail = null; // workaround to refresh role list, as service is not returning newly generated role id
	public newUser: IUserDetail = null;
	public roleModified: boolean = false;
	public sortTypes: any = { caseId:'CaseId', status: 'Status', priority: 'Priority', lastUpdatedDate: 'LastUpdatedDate', dateOfArrival: 'DateOfArrival' };

	get NewRoleAdded(): boolean {
		return this.newRoleAdded;
	}
	set NewRoleAdded(value: boolean) {
		this.newRoleAdded = value;
		this.NewRoleAddedChange.emit(value);
	}

	get NewUserAdded(): boolean {
		return this.newUserAdded;
	}

	set NewUserAdded(value: boolean) {
		this.newUserAdded = value;
		this.NewUserAddedChange.emit(value);
	}

	get UserUpdated(): boolean {
		return this.userUpdated;
	}

	set UserUpdated(value: boolean) {
		this.userUpdated = value;
		this.UserUpdatedChange.emit(value);
	}

	get UserChanged(): boolean {
		return this.userChanged;
	}

	//to remove two calls for the user
	set userdetailChanged(value: any) {
		this._userDetailChanged = value;
		this.UserDetailChange.emit(this._userDetailChanged);
	}

	get userdetailChanged(): any {
		return this._userDetailChanged;
	}

	set UserChanged(value: boolean) {
		this.userChanged = value;
	}

	get RoleUpdated(): boolean {
		return this.roleUpdated;
	}

	set RoleUpdated(value: boolean) {
		this.roleUpdated = value;
	}

	get RolesList(): IRole[] {
		return this.rolesList;
	}

	set RolesList(value: IRole[]) {
		this.rolesList = value;
	}

	get UserAccess(): IUserAccess {
		this.userAccess = JSON.parse(sessionStorage.getItem('userApp')) as IUserAccess;
		return this.userAccess;
	}

	set UserAccess(value: IUserAccess) {
		sessionStorage.setItem('userApp', JSON.stringify(value));
	}

	getRequestHeader: () => any;
	emailValidator: (email: string) => boolean;
	shipIdValidator: (shipId: string) => boolean;
	hsCodeValidator: (hsCode: string) => boolean;
	overAllWeightValidator: (overAllWeight: string) => boolean;
	containerIdValidator: (containerIdValue: string) => boolean;
	getAuthToken: () => any;
	constructor() {
		var vm = this;
		//vm.NewRoleAddedChange = new EventEmitter();
		//vm.NewUserAddedChange = new EventEmitter();

		vm.emailValidator = (email: string) => {
			var EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

			if (!EMAIL_REGEXP.test(email)) {
				return false;
			}
			return true;
		};
		vm.overAllWeightValidator = (overAllWeight: string) => {
			var Number_regex = /^[0-9]+(\.[0-9]{1,2})?$/;
			if (overAllWeight === '') {
				return true;
			}
			else if (!Number_regex.test(overAllWeight)) {
				return false;
			}
			return true;
		};
		vm.containerIdValidator = (containerIdValue: string) => {
			var Number_regex = /^[a-zA-Z0-9]+$/;
			if (containerIdValue === '') {
				return false;
			}
			else if (!Number_regex.test(containerIdValue)) {
				return false;
			}
			else {
				return true;
			}
		};
		vm.shipIdValidator = (shipId: string) => {
			var NUMBER_REGEXP = /^\d+$/;
			let shipIdText = shipId.trim();
			let multiplyNum: number = 7;
			let sum: number = 0;

			shipIdText = shipIdText.replace(/\s/g, '');
			if (shipIdText.length === 10) {
				if (shipIdText.substr(0, 3) === 'IMO') {
					let ShipIdNumbers = shipIdText.substr(3, 9);
					for (var i = 0, len = ShipIdNumbers.length - 1; i < len; i++) {
						var num = ShipIdNumbers.charAt(i);
						if (!NUMBER_REGEXP.test(num)) {
							return false;
						}
						else {
							var numToAdd = +num;
							sum = sum + (multiplyNum * numToAdd);
							multiplyNum -= 1;
						}
					}

					var lastnum = ShipIdNumbers.charAt(i);
					var lastdigit = sum.toString().charAt(sum.toString().length - 1);
					if (lastnum === lastdigit) {
						return true;
					}

				}
			}

			return false;
		};

		vm.hsCodeValidator = (hsCode: string) => {
			if (hsCode === '') {
				return true;
			}
			let hsCodeList: string[] = hsCode.split(',');
			for (let hscodeValue in hsCodeList) {
				let numberOfDecimals: number = hsCodeList[hscodeValue].split('.').length - 1;
				var HSCODE_REGEXP: any;
				//if(hsCodeList[hscodeValue])
				switch (numberOfDecimals) {
					case 0:
						HSCODE_REGEXP = /^\d{1,10}$/;
						if (!HSCODE_REGEXP.test(hsCodeList[hscodeValue])) {
							return false;
						}
						break;
					case 1: HSCODE_REGEXP = /^[0-9]+[.][0-9]+$/;
						if (hsCodeList[hscodeValue].length > 11 || !HSCODE_REGEXP.test(hsCodeList[hscodeValue])) {
							return false;
						}

						break;
					case 2:
						HSCODE_REGEXP = /^[0-9]+[.][0-9]+[.][0-9]+$/;
						if (hsCodeList[hscodeValue].length > 12 || !HSCODE_REGEXP.test(hsCodeList[hscodeValue])) {
							return false;
						}
						break;
					case 3:
						HSCODE_REGEXP = /^[0-9]+[.][0-9]+[.][0-9]+[.][0-9]+$/;
						if (hsCodeList[hscodeValue].length > 13 || !HSCODE_REGEXP.test(hsCodeList[hscodeValue])) {
							return false;
						}
						break;
					default: return false;
				}
			}
			return true;


		};
	}
}
