import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { IKeyDataValue } from '../models/viewModels';

@Component({
  selector: 'sp3-comp-splitbutton',
  templateUrl: './split.button.control.html'
})
export class SplitButtonComponent implements OnInit {
 	@Input() public items:IKeyDataValue[];   
  @Input() public title:string;
 	@Output() splitAction =new EventEmitter<any>();
  itemList:any[]=[];
  private loadlistInfo(){
    for (let m of this.items) {
        this.itemList.push({label: m.name +' ' + (m.value>=0? m.value :''), command: () => { 
          this.splitAction.emit(m);
        }});
     }
  }
  ngOnInit() {
    this.loadlistInfo();
  }
}

