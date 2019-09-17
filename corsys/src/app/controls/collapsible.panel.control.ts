import { Component, Input, Output, EventEmitter } from '@angular/core';
import { collapsiblePanelType } from '../models/enums';

@Component({
    selector: 'sp3-comp-collapsible-panel',
    templateUrl: './collapsible.panel.control.html'
})
export class CollapsiblePanelComponent {
    @Input() public orientation = 1;
    @Input() public title = '';
    @Input() public isMenuClose: boolean = false;
    @Input() public enabled? = false;
    @Input() public type = collapsiblePanelType.Left;
  
    @Output() sidePanelToggleEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output() sidePanelCloseEvent: EventEmitter<any> = new EventEmitter<any>();

    panelType: any = collapsiblePanelType;
    public openCloseMenu(event) {
      if(!this.enabled){
        this.isMenuClose = !this.isMenuClose;
        this.sidePanelToggleEvent.emit(this.isMenuClose);
      }
    }

    public closeClick() {
        this.isMenuClose = true;
        this.sidePanelCloseEvent.emit(false);
    }
}
