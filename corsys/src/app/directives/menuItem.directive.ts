import { Directive, Input, Output, HostBinding, EventEmitter } from '@angular/core';
import { SideMenuComponent } from '../controls/sidemenu.control';
import { page } from '../models/enums';

@Directive({ selector: 'sp3-menu-item, [sp3-menu-item]' })
export class MenuItemDirective {
		@Input() public heading: string;
		@Input() public controlId: string;
		@Input() public imageSrc: string;
		@Input() public imageCss: string;
		@Input() public disabled: boolean;
		public _active: boolean;
		public _currentTab: page;
		@Output() public select: EventEmitter<MenuItemDirective> = new EventEmitter();
		@Output() public deselect: EventEmitter<MenuItemDirective> = new EventEmitter();

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

				this.sideMenu.menuItems.forEach((menuItem: MenuItemDirective) => {
						if (menuItem !== this) {
								menuItem.active = false;
						}
				});
		}

		constructor(public sideMenu: SideMenuComponent) {
				this.sideMenu.addItem(this);
		}
}
