import { Component, ViewChild, Inject } from '@angular/core';
import { settingsTabs, action  } from '../../models/enums';
import { CardLayoutControlComponent } from '../../controls/card.layout.control';
import { IMessageService, ITranslateService } from '../../interfaces/interfaces';
import { Subject } from 'rxjs';

@Component({
		selector: 'sp3-comp-settings',
		templateUrl: './settings.component.html'
})

export class SettingsComponent {
		selectedTab: settingsTabs;
		actionTab: any = settingsTabs;
    onTabChange: (selectedTab: settingsTabs) => void;
    ngUnsubscribe: Subject<any> = new Subject<any>();
    getMenuState: (status: boolean) => void;
    setLeaveMessage:(selectedTab: settingsTabs)=>void;
    selectedTabDetails:(key:string,action) => void;
		togglePanel: boolean = false;
    userApplications: any = [];
    tempSelectedTab:any;
    currentTab:number=1;
    previousTab:number=1;
		@ViewChild(CardLayoutControlComponent) modal: CardLayoutControlComponent;

		
		constructor(@Inject('IMessageService') private messageService: IMessageService,@Inject('ITranslateService') private translateService:ITranslateService) {
			var vm = this;
			vm.selectedTab = settingsTabs.settingsGeneral;
			vm.onTabChange = (selectedTab: settingsTabs) => {
        this.currentTab=selectedTab;
        this.tempSelectedTab=selectedTab;
        vm.setLeaveMessage(vm.selectedTab);
      };
      this.messageService.OperationGoAhead.takeUntil(this.ngUnsubscribe).subscribe(item => {
        if(item.operationAllowed){
          vm.selectedTab = this.tempSelectedTab;
          this.currentTab=vm.selectedTab;
        }else{
          vm.selectedTab=this.previousTab;
          this.currentTab=this.previousTab;
        }
      });
			vm.getMenuState = (status: boolean) => {
					vm.togglePanel = status;
      };
      vm.selectedTabDetails=(key,action) => {
        if (action && vm.messageService.showLeaveMessage(action)) {
          this.messageService.LeaveMessage = { key:key, showMessage: true, type: action };
        }else{
          vm.selectedTab = this.tempSelectedTab;
          this.previousTab=this.tempSelectedTab;
          this.currentTab=this.tempSelectedTab;
        }
      };
      vm.setLeaveMessage = (selectedTab:settingsTabs) => {
        if(this.previousTab===1){
          let key=this.translateService.instant('GeneralSettings');   
          vm.selectedTabDetails(key,action.generalSettingsChange);
        }else if(this.previousTab===2){
          let key=this.translateService.instant('User');   
          vm.selectedTabDetails(key,action.userEditCancelClick);
        }else if(this.previousTab===3){
          let key=this.translateService.instant('Roles');   
          vm.selectedTabDetails(key,action.roleEditCancelClick);
        }
        else if(this.previousTab===4){
          let key=this.translateService.instant('Apps');   
          vm.selectedTabDetails(key,action.appEdit);
        }
        else if(this.previousTab===5){
          let key=this.translateService.instant('Profiler');   
          vm.selectedTabDetails(key,action.profileEdit);
        }
        else if(this.previousTab===6){
          let key=this.translateService.instant('RAPPathwayInfo');          
          vm.selectedTabDetails(key,action.rapEdit);
        }
        else if(this.previousTab===7){
          let key=this.translateService.instant('DCSettings');   
          vm.selectedTabDetails(key,action.dcEdit);
        } else if(this.previousTab===8){
          vm.selectedTabDetails('location',action.locationEdit);
        }else if(this.previousTab===9){
          let key=this.translateService.instant('operationalDashboard');   
          vm.selectedTabDetails(key,action.devicesEdit);
        }else if(this.previousTab===10){
          let key=this.translateService.instant('operationalDashboard');   
          vm.selectedTabDetails(key,action.operationalEdit);
        }else{
          vm.selectedTabDetails('','');
        }
      };
  }
}
