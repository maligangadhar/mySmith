import { Directive, OnInit, OnDestroy, Input, Output, HostBinding, TemplateRef, EventEmitter } from '@angular/core';
import { TabsetComponent } from '../controls/tabset.control';
import { page } from '../models/enums';

@Directive({ selector: 'tab, [tab]' })
export class TabDirective implements OnDestroy, OnInit {
		@Input() public heading: string;
		@Input() public controlId: string;
		@Input() public disabled: boolean;
		@Input() public removable: boolean;

		@HostBinding('class.active')
		@Input() public get active() {
				return this._active;
		}
		@HostBinding('class.currentTab')
		@Input() public get currentTab() {
				return this._currentTab;
		}
		public set currentTab(tabPage: page) {
				this._currentTab = tabPage;
		}
	
		@Output() public select: EventEmitter<TabDirective> = new EventEmitter();
		@Output() public deselect: EventEmitter<TabDirective> = new EventEmitter();
		@Output() public removed: EventEmitter<TabDirective> = new EventEmitter();

		public set active(active) {
				if (this.disabled && active || !active) {
						if (!active) {
								this._active = active;
						}

						this.deselect.emit(this);
						return;
				}

				this._active = active;
				this.select.emit(this);
				this.tabset.tabs.forEach((tab: TabDirective) => {
						if (tab !== this) {
								tab.active = false;
						}
				});
		}

		@HostBinding('class.tab-pane') addClass = true;

		private _active: boolean;
		private _currentTab: page;

		public headingRef: TemplateRef<any>;

		constructor(public tabset: TabsetComponent) {
				this.tabset.addTab(this);
		}

		ngOnInit() {
				this.removable = !!this.removable;
		}

		ngOnDestroy() {
				this.tabset.removeTab(this);
		}
}
