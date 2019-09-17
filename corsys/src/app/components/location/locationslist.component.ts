import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ILocationService, IMessageService, ITranslateService } from '../../interfaces/interfaces';
import { ILocationsDetail } from '../../models/viewModels';
import { spinnerType, action } from '../../models/enums';

@Component({
  selector: 'sp3-comp-app-locationslist',
  templateUrl: './locationslist.component.html'
})

export class locationComponent implements OnInit {
  searchFormControl = new FormControl();
  innerControlHeight: number = window.innerHeight - 48;
  locationList: ILocationsDetail[]= []; 
  selectedLocation: ILocationsDetail = {
    locationName: '',
    id: 0,
    name: '',
    locationCode : '',
    locationStatus: 0,
    status: 0,
  };
  selectedIndex: number = 0;
  constructor(@Inject('ILocationService') private locationService: ILocationService, 
              @Inject('ITranslateService') private translateService: ITranslateService,
              @Inject('IMessageService') private messageService: IMessageService) {}


  @HostListener('orientationchange', ['$event'])
  onOrientationChange() {
      let innerHeight = window.innerHeight;
      this.innerControlHeight = innerHeight - 48;
  }

  fetchLocationInfo = (): void => {
    this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('LocationsInformation'), footerMessage: this.translateService.instant('LocationLoading'), showLoader: true, type: spinnerType.small };    
      this.locationService.get().subscribe( (result) => {
          this.locationList = result.data;
          this.selectedLocation = this.locationList[0];
          this.selectedIndex = 0;
          this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('LocationsInformation'), footerMessage: this.translateService.instant('LocationLoading'), showLoader: false, type: spinnerType.small };    
          this.messageService.setPageChange(action.locationEdit, false); 
      });
  }

  public onSelectionChange = (event: ILocationsDetail, id: number): void => {
    this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('LocationsInformation'), footerMessage: this.translateService.instant('LocationLoading'), showLoader: true, type: spinnerType.small };    
      this.selectedLocation = event;
      this.selectedIndex = id;
      this.messageService.LoaderMessage = { id: '', headerMessage: this.translateService.instant('LocationsInformation'), footerMessage: this.translateService.instant('LocationLoading'), showLoader: false, type: spinnerType.small };    
  }

  ngOnInit(): void {
      this.fetchLocationInfo();
  }
}

