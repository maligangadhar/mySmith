import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { IDeviceLicenseService, IMessageService, ITranslateService } from '../../interfaces/interfaces';
import { IDeviceLicenseDetail, IResponse } from '../../models/viewModels';
import { spinnerType, messageType, responseStatus } from '../../models/enums';

@Component({
    selector: 'sp3-comp-devicelicense',
    templateUrl: './device.license.component.html'
})

export class DeviceLicenseComponent implements OnInit {
    innerControlHeight: number = window.innerHeight - 48;
    viewListHeight: number = window.innerHeight - 48;
    deviceList: IDeviceLicenseDetail[]= []; 
    selectedDevice: IDeviceLicenseDetail = {
        id: 0,
        manufacturer: '-',
        status: 0,
        modelName: '-',
        serialNumber: '-',
        latitude: '-',
        longitude: '-',
        assignedLicense: false,
        licenseAvailable: false,
        location: '-'
    };
    
    selectedIndex: number = 0;
    toggleLicenseFailure: boolean = false;
    constructor(
        @Inject('IDeviceLicenseService') private deviceLicenseService: IDeviceLicenseService,
        @Inject('IMessageService') private messageService: IMessageService,
       @Inject('ITranslateService') private translateService: ITranslateService) {}

    @HostListener('orientationchange', ['$event'])
    onOrientationChange() {
        let innerHeight = window.innerHeight;
        this.innerControlHeight = innerHeight - 48;
        this.viewListHeight = innerHeight - 48;
    }

    getDeviceInfo = (): void => {
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('DeviceLicenseInfo'), footerMessage: this.translateService.instant('DeviceDetailLoading'), showLoader: true, type: spinnerType.small };        
        this.deviceLicenseService.get().subscribe( (result) => {
          if (result.status === responseStatus.Success && result.data.length>0) {
            this.deviceList.length = 0;
            this.deviceList = result.data;
            this.selectedDevice = this.deviceList[0];
            this.selectedIndex = 0;
            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('DeviceLicenseInfo'), footerMessage: this.translateService.instant('DeviceDetailLoading'), showLoader: false, type: spinnerType.small };   
          } else{
            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('DeviceLicenseInfo'), footerMessage: this.translateService.instant('DeviceDetailLoading'), showLoader: false, type: spinnerType.small };            
            this.messageService.Message = { message: result.messageKey, showMessage: true, type: messageType.Error };
          }            
        }, (error: IResponse<any>) => {
            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('DeviceLicenseInfo'), footerMessage: this.translateService.instant('DeviceDetailLoading'), showLoader: false, type: spinnerType.small };            
            this.messageService.Message = { message: error.messageKey, showMessage: true, type: messageType.Error };
        });
    }

    updateDeviceInfo = (param: IDeviceLicenseDetail): void => {
        let requestPayLoad: IDeviceLicenseDetail = {id: param.id, status: param.status, assignedLicense: param.assignedLicense};
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('DeviceLicenseInfo'), footerMessage: this.translateService.instant('DeviceDetailSaving'), showLoader: true, type: spinnerType.small };        
        
        this.deviceLicenseService.patch(requestPayLoad).subscribe( (result) => {
        this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('DeviceLicenseInfo'), footerMessage: this.translateService.instant('DeviceDetailSaving'), showLoader: false, type: spinnerType.small };        
            if (result.status === responseStatus.Success && result.data) {
                this.toggleLicenseFailure = false;
                this.getDeviceInfo();
            } else {
                this.toggleLicenseFailure = true;   
                this.deviceList[this.selectedIndex].assignedLicense = !this.deviceList[this.selectedIndex].assignedLicense;
            }
        }, (error: IResponse<any>) => {
            // toggle the flag to let the user know that license cannot be applied
            this.toggleLicenseFailure = true;
            // reset back again
            this.deviceList[this.selectedIndex].assignedLicense = !this.deviceList[this.selectedIndex].assignedLicense;
            this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('DeviceLicenseInfo'), footerMessage: this.translateService.instant('DeviceDetailSaving'), showLoader: false, type: spinnerType.small };            
        });
    }

    public onSelectionChange = (event: IDeviceLicenseDetail, id: number): void => {
        this.selectedDevice = event;
        this.selectedIndex = id;
        this.toggleLicenseFailure = false;
    }

    public fetchButtonState = (event: boolean): void => {
        this.deviceList[this.selectedIndex].assignedLicense = event;
        this.updateDeviceInfo(this.deviceList[this.selectedIndex]);
    }

    ngOnInit(): void {
        this.getDeviceInfo();
        this.toggleLicenseFailure = false;
    }
}
