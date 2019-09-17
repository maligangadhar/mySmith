import { Component, Input, EventEmitter, Output } from '@angular/core';
import { MenuItemDirective } from '../directives/menuItem.directive';

@Component({
		selector: 'sp3-comp-side-menu',
		templateUrl: './sidemenu.control.html'
})
export class SideMenuComponent {

		public isMenuClose: boolean = true;
		public menuItems: Array<MenuItemDirective> = [];
		private _type: string;
		public newItem: MenuItemDirective;
        @Input() public header: string='';
		@Input() private get type() {
				return this._type;
		}
		@Output() sideMenuToggleState = new EventEmitter<boolean>();
		private set type(value) {
				this._type = value;
		}
		public onMenuItemClick(menuItem: any) {
				this.newItem = menuItem;
				this.newItem.active = true;
		}

		public openCloseMenu(event) {
				this.isMenuClose = !this.isMenuClose;
				this.sideMenuToggleState.emit(!this.isMenuClose);
		}

		public addItem(menuItem: MenuItemDirective) {
				this.menuItems.push(menuItem);
		}



}
