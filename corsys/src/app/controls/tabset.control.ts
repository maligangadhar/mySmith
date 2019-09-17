import { Component, Inject, OnInit, Input, OnDestroy } from '@angular/core';
import { TabDirective } from '../directives/tab.directive';
import { action, page } from '../models/enums';
import { IMessageService, IBroadcastService} from '../interfaces/interfaces';

@Component({
		selector: 'sp3-comp-tabset',
		templateUrl: './tabset.control.html'
})
export class TabsetComponent implements OnInit, OnDestroy {
		@Input() private get vertical() {
				return this._vertical;
		}

		@Input() private get justified() {
				return this._justified;
		}

		@Input() private get type() {
				return this._type;
		}

		private set vertical(value) {
				this._vertical = value;
				this.setClassMap();
		}

		private set justified(value) {
				this._justified = value;
				this.setClassMap();
		}

		private set type(value) {
				this._type = value;
				this.setClassMap();
		}

		private setClassMap() {
				this.classMap = {
						'nav-stacked': this.vertical,
						'nav-justified': this.justified,
						['nav-' + (this.type || 'tabs')]: true
				};
		}

		public tabs: Array<TabDirective> = [];

		private isDestroyed: boolean;
		private _vertical: boolean;
		private _justified: boolean;
		private _type: string;
		public  classMap: any = {};
		private newTab: TabDirective;
		constructor( @Inject('IMessageService') private messageService: IMessageService,
				@Inject('IBroadcastService') private broadcastService: IBroadcastService) {
				this.messageService.CurrentPage = page.generalSetting;

				this.messageService.OperationGoAhead.subscribe(item => {
						if (item && this.newTab && item.operationAllowed && item.from === action.roleTabChange) {
								this.newTab.active = true;
								this.messageService.CurrentPage = this.newTab.currentTab;
								this.messageService.resetPageChange();
						}
				});
		}

		ngOnInit() {
				this.type = this.type !== 'undefined' ? this.type : 'tabs';
		}

		ngOnDestroy() {
				this.isDestroyed = true;
		}
		public onTabClick(tab: any) {
				var flag = this.newTab ? (this.newTab.currentTab === tab.currentTab) : false;
				this.newTab = tab;
				switch (this.newTab.currentTab) {
						case page.role:
								!flag && this.broadcastService.broadcast('roleFilter', 0); 
								!flag && this.broadcastService.broadcast(page.role.toString(), true);
								break;
						case page.user:
								!flag && this.broadcastService.broadcast('userFilter', 0);
								!flag && this.broadcastService.broadcast(page.user.toString(), true);
								break;
						case page.applications:
								!flag && this.broadcastService.broadcast('appFilter', 0);  
								!flag && this.broadcastService.broadcast(page.applications.toString(), true);
				}
				if (this.messageService.showLeaveMessage(action.roleTabChange)) {
						this.messageService.LeaveMessage = { key: this.getKey(), showMessage: true, type: action.roleTabChange };
				}
						
				else {
						
						
						this.newTab.active = true;
						this.messageService.CurrentPage = this.newTab.currentTab;
				}
		}

		public getKey() {
				switch (this.messageService.CurrentPage) {
						case page.role:
								return 'Roles';
						case page.user:
								return 'User';
						case page.generalSetting:
								return 'GeneralSettings';
				}
		}
		
		public addTab(tab: TabDirective) {
				this.tabs.push(tab);
				tab.active = this.tabs.length === 1 && tab.active !== false;
		}

		public removeTab(tab: TabDirective) {
				let index = this.tabs.indexOf(tab);
				if (index === -1 || this.isDestroyed) {
						return;
				}
				if (tab.active && this.hasAvailableTabs(index)) {
						let newActiveIndex = this.getClosestTabIndex(index);
						this.tabs[newActiveIndex].active = true;
				}

				tab.removed.emit(tab);
				this.tabs.splice(index, 1);
		}

		private getClosestTabIndex(index: number): number {
				let tabsLength = this.tabs.length;
				if (!tabsLength) {
						return -1;
				}

				for (let step = 1; step <= tabsLength; step += 1) {
						let prevIndex = index - step;
						let nextIndex = index + step;
						if (this.tabs[prevIndex] && !this.tabs[prevIndex].disabled) {
								return prevIndex;
						}
						if (this.tabs[nextIndex] && !this.tabs[nextIndex].disabled) {
								return nextIndex;
						}
				}
				return -1;
		}

		private hasAvailableTabs(index: number) {
				let tabsLength = this.tabs.length;
				if (!tabsLength) {
						return false;
				}

				for (let i = 0; i < tabsLength; i += 1) {
						if (!this.tabs[i].disabled && i !== index) {
								return true;
						}
				}
				return false;
		}
}
