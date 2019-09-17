import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { IScannerObject } from '../../models/viewModels';
import { Router } from '@angular/router';
import { SpCaseListScannerComponent } from '../modal/modal.case.list.scanner';
@Component({
  selector: 'sp3-comp-loadscanimage',
  templateUrl: './loadScanImage.component.html'
})
export class LoadScanImageComponent implements OnInit {

  modalviewToggle: number = 0;
  ocrstatus: number = 1;
  isMapSuccess:boolean=false;
  isSearchDisabled:boolean=true;
  searchCases:boolean=false;
  containerValueToSearch:string='';
  @ViewChild('scannerCaseList') scannerCaseList: SpCaseListScannerComponent;
 
  @Input() public scanDetails:IScannerObject={scanId:'', scanDateTime:'',containerId:''};
  @Output() emitMessage = new EventEmitter<number>();
  constructor(private router: Router) {}
  moveToScannerList = () => {
    this.router.navigate(['ScanManagement', {mapSuccess: -1 }]);
   // this.scanDetails.scanDateTime
  }
  updateData(data) {
    //console.log("updatedata:"+data);
    this.containerValueToSearch='';

    this.containerValueToSearch = data;
    if(this.containerValueToSearch.trim()==='')
    {
      this.isSearchDisabled=true;
    }
    else
    {
      this.isSearchDisabled=false;
    }
  }
  showNoModalpopup = () => {
        this.searchCases=true;
    //console.log(this.containerValueToSearch);
    this.scannerCaseList.show(this.containerValueToSearch,this.scanDetails.scanId);
    
  }
  showMappingResponsemessage (event : any)
  {
    //console.log("event:"+event);
    this.scannerCaseList.hide();
    this.router.navigate(['ScanManagement', {mapSuccess: event }]);
    //this.isMapSuccess=event;
    //this.modalSuccess.show();
    //setTimeout(function(){  this.modalSuccess.hide(); }, 2000);
  }
//   onTextAdded =(value: any)=>{
// this.containerValueToSearch=value;
//   }
  dismissNoModalpopup = () =>{
    this.modalviewToggle = 0;
  }
  pairModalpopup = () =>{
    this.modalviewToggle = 1;
  }
  ocrnoncontainer = () =>{
    this.ocrstatus = 1;
  }
  ocravaicontainer = () =>{
    this.ocrstatus = 2;
  }
 
  //data: any[];
  //cols: any[];   
  ngOnInit() {
    
      /* this.data = [];
      this.cols = [
          { field: 'Col1', header: 'Col1', sortable: true, filter: true, filterMatchMode: 'contains', allowToggle: true, style: { 'vertical-align': 'top' } },
          { field: 'Col2', header: 'Col2', sortable: true, filter: true, filterMatchMode: 'contains', allowToggle: true, style: { 'vertical-align': 'top' } },            
          { field: 'Col3', header: 'Col3', sortable: true, filter: true, filterMatchMode: 'contains', allowToggle: true, style: { 'vertical-align': 'top' } },            
          { field: 'Col4', header: 'Col4', sortable: true, filter: true, filterMatchMode: 'contains', allowToggle: true, style: {  'vertical-align': 'top' } },
          { field: 'Col4', header: 'Col5', sortable: true, filter: true, filterMatchMode: 'contains', allowToggle: true, style: {  'vertical-align': 'top' } }
      ];
      
      
      for(var i = 0; i < 2; i++){
        this.data.push({Col1: 'Dov-112-125' + i, Col2: '03 May 2017', Col3: 'American President Lines (APL)', Col4: 'Salt Lake City'});
        
      } */
  }
}
