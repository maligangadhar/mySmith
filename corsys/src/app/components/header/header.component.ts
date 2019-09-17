import { Component, Inject, Input, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { IMessageService, IStorageService, IUserService, IBroadcastService, ICommonService, IAuditMessageService, IGeneralSettings } from '../../interfaces/interfaces';
import { action, messageType, responseStatus, metaDataSettings } from '../../models/enums';
import { Router } from '@angular/router';
import { IResponse, IKeyData, IUserDetail, IUserLocationValue, ICodeValue } from '../../models/viewModels';
import { Subject } from 'rxjs/Subject';
import { Adal4Service } from '@corsys/corsys-adal';

@Component({
    selector: 'sp3-comp-app-header',
    templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit, AfterViewInit {
    @Input() public logoUrl: string;
    @Input() public userName: string;
    navigateToHome: () => void;
    locationNameList: IUserLocationValue[] = [];
    selectedLocation: IUserLocationValue;
    isLocationDisabled: boolean = true;
    isShowDropdown: boolean = false;
    selectedLocationText: string;
    public userDetail: IUserDetail;
    loadLocations: () => void;
    checkSessionChange: () => void;
    checkLocationChange: () => void;
    selectedLocationCode: string = '';
    changeLocation: (param) => void;
    selectLocation: (param) => void;
    addSelectedLocation: () => void;
    userRoles: any;
    portListArr:  ICodeValue[];
    authorizedFlag: boolean = true;
    UserfullName: string;
    ngUnsubscribe: Subject<any> = new Subject<any>();
    logOut: () => void;
    showDropdown: () => void;
    @HostListener('window:focus', ['$event'])
    onFocus(event: any): void {
        this.checkSessionChange();
    }
    onBlur(event: any): void {
        this.checkSessionChange();
    }
    constructor( @Inject('IMessageService') private messageService: IMessageService,
        @Inject('IGeneralSettings') private generalSetting: IGeneralSettings,
        @Inject('IBroadcastService') private broadcastService: IBroadcastService,
        private router: Router,
        public service: Adal4Service,
        @Inject('IAuditMessageService') private auditMessageService: IAuditMessageService,
        @Inject('IUserService') private userService: IUserService,
        @Inject('ICommonService') public commonService: ICommonService,
        @Inject('IStorageService') private storageService: IStorageService) {
        var vm = this;
        this.storageService.setItem('appName', 'landing');
        this.messageService.OperationGoAhead.takeUntil(this.ngUnsubscribe).subscribe(item => {
            if (item && item.operationAllowed && item.from === action.homeButtonClick) {
                this.router.navigateByUrl('/landing');
            }
        });
        this.navigateToHome = () => {
            if (this.messageService.showLeaveMessage(action.homeButtonClick)) {
                this.messageService.LeaveMessage = { key: 'Home', showMessage: true, type: action.homeButtonClick };
            }
            else {
                this.router.navigateByUrl('/landing');
                this.isLocationDisabled = false;
            }
        };
        this.selectLocation = (param) => {
            let params = { 'locationCode': param.locationCode, 'name': param.name, 'id': param.id };
            this.changeLocation(params);
        };
        this.changeLocation = (param) => {
            if (param) {
                localStorage.setItem('locationCode', param.locationCode);
                localStorage.setItem('locationName', param.name);
                localStorage.setItem('locationValue', param.id);
                this.selectedLocationCode = param.locationCode;
                this.selectedLocationText = param.name;
                this.addSelectedLocation();
                vm.broadcastService.broadcast('roleChange', param.id);
                let user = { 'locationcode': param.locationCode, 'userId': this.commonService.UserAccess.userId };
                vm.userService.updateUserLocation(user).takeUntil(this.ngUnsubscribe).subscribe();
                vm.broadcastService.broadcast('roleData', this.userRoles);

            }
        };
        this.addSelectedLocation = () => {
            let locValue = +localStorage.getItem('locationValue');
            this.locationNameList.forEach((item, index) => {
                if (item.id === locValue) {
                    this.selectedLocation = this.locationNameList[index];
                }
            });
        };
        this.checkSessionChange = () => {
            if (this.selectedLocationCode && this.selectedLocationCode !== localStorage.getItem('locationCode')) {
                //this.router.navigateByUrl('/landing');
            }
            this.addSelectedLocation();
            this.checkLocationChange();
        };
        this.checkLocationChange = () => {
            setTimeout(() => {
                this.isLocationDisabled = (window.location.pathname === '/landing' || window.location.pathname === '/') ? false : true;
            }, 1000);
        };
        this.loadLocations = () => {
            let appName = this.storageService.getItem('appName');
            if (appName === 'landing') {
                this.isLocationDisabled = false;
                if (this.service.userInfo.username) {
                    this.commonService.UserDetailChange.subscribe(result => {
                        //commented below code b'cas user service called second time
                        //vm.userService.getUserByName(this.service.userInfo.username).takeUntil(this.ngUnsubscribe).subscribe(result => {
                        if (result.status === responseStatus.Success && result.data) {
                            this.locationNameList = [];
                            this.UserfullName = result.data.fullName;
                            let userData = result.data as IUserDetail;
                            this.commonService.UserAccess = { userId: userData.id.toString(), role: userData.roles[0] };
                            this.userRoles = result.data.roles;
                            if (result.data.assignedLicense) {
                                this.authorizedFlag = true;
                                this.generalSetting.fetchGeneralSettingsMetaData(metaDataSettings.GeneralSettings).takeUntil(this.ngUnsubscribe).subscribe(result => {
                                  let { data: { Ports: portList } } = result;
                                  this.portListArr=portList;
                                  userData.locations.forEach(user => {
                                      let locationNane = this.portListArr.filter(obj => {
                                        return obj.code === user.locationCode;
                                      })[0];
                                      this.locationNameList.push({ id: user.id, name: (locationNane && locationNane.name) ? locationNane.name :user.name,locationCode: user.locationCode });
                                  });
                                  let locValue = +localStorage.getItem('locationValue');
                                  if (locValue) {
                                      this.locationNameList.forEach((loc, index) => {
                                          if (loc.id === locValue) {
                                              this.selectedLocation = this.locationNameList[index];
                                          }
                                      });
                                  } else {
                                      this.selectedLocation = this.locationNameList[0];
                                  }
                                  if (!this.selectedLocation) {
                                      this.selectedLocation = this.locationNameList[0];
                                  }
                                  this.changeLocation(this.selectedLocation);
                              });
                            } else {
                                this.locationNameList = [];
                                this.authorizedFlag = false;
                                this.isLocationDisabled = true;
                            }
                        }
                        else {
                            vm.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
                        }
                    }, (error: IResponse<any>) => {
                        vm.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
                    }
                    );
                }
            } else {
                this.isLocationDisabled = true;
            }
        };
        vm.broadcastService.DataChange.takeUntil(this.ngUnsubscribe).subscribe((result: IKeyData) => {
            if (result.key === 'appSelected') {
                this.isLocationDisabled = true;
            }
            if (result.key === 'roleChange') {
                this.locationNameList.forEach((item, index) => {
                    if (item.id === result.data) {
                        this.selectedLocation = this.locationNameList[index];
                    }
                });
            }
        });

        vm.logOut = () => {
            this.storageService.clearStorage();
            this.auditMessageService.manageAuditMessages();
            this.service.logOut();
        };
        vm.showDropdown = () => {
            this.isShowDropdown = !this.isShowDropdown;
        };
    }
    ngOnInit(): void {
        if (window.parent === window) { // If it is not from adal IFrame
            this.checkLocationChange();
        }
    }
    ngAfterViewInit(): void {
        if (window.parent === window) { // If it is not from adal IFrame
            this.loadLocations();
        }
    }
}
