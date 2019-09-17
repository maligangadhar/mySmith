import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import moment from 'moment/src/moment';
import { Set } from 'd3';
import { IOperationalChartService, IAppParams, IDateFormatService } from '../interfaces/interfaces';
import { SecureService } from './secure.adal.service';
import { IOperationalineChartStructure, IOperationalUserChart, ITimeSeriesRequestFormat, IResponse, ITimeSeriesResponse, IKPIChart, IUserList, IHistogramChart } from '../models/viewModels';

@Injectable()
export class OperationChartService implements IOperationalChartService {
  public actualUserList=[];
  public targetUserList=[];
  public timeSlot=[];
  public colorObj = {};
  public colors=[];
  public formattedObject = {
    columns: []
  };
  constructor(@Inject('IDateFormatService') private dateFormatService: IDateFormatService,
    private http: SecureService, @Inject('IAppParams') private config: IAppParams) { }

  formatData = (obj: IOperationalineChartStructure, selectedUser: Set, colorPatterns: IOperationalUserChart[],filterBy,userList:IUserList[]) => {
      this.formattedObject = {
        columns: []
      };
      this.colorObj={};
      this.timeSlot=[];
      this.actualUserList=[];
      this.targetUserList=[];
      this.colors=[];
      this.timeSlot.push('date');
      for (var prop in obj) {
        var index = selectedUser.has(prop);
        if (!index) {
          continue;
        } else {
          let userNameToDisplay='';
          userList.forEach( (user: IUserList) => {
            if(user.name===prop){
              userNameToDisplay=user.fullName;
            }
          });
         this.populateUSerData(userNameToDisplay,obj[prop],index,filterBy);
         this.formattedObject.columns.push(this.timeSlot);
         this.setColorPalette(userNameToDisplay,colorPatterns);
         this.formattedObject['colors'] =this.colors;
        }
      }
      this.formattedObject['colors'] =this.colors;
      return this.formattedObject;
  }
  setColorPalette= (user,colorPatterns) => {
     colorPatterns.forEach( (param: IOperationalUserChart) => {
        if(user===param.fullName){
            this.colors.push(param.colour);
            this.colors.push(param.colour);
        }
     });
  }
  populateUSerData= (user,userValues,index,filterBy) => {
    this.actualUserList.push(user);
    this.targetUserList.push(user+' ');
    userValues.forEach((childItem) => {
        var roundDown = moment(childItem.timeslot).startOf('hour');
        let timeSlot = JSON.parse(JSON.stringify(roundDown));
        let formattedDate = this.dateFormatService.formatDate(new Date(timeSlot),'LT');
        switch(filterBy){
          case 'today':{
             if(moment(timeSlot).isAfter(moment().startOf('day')) && moment(timeSlot).isBefore(moment()) ){
                this.targetUserList.push(childItem.actual);
                this.actualUserList.push(childItem.target);
                this.timeSlot.push(formattedDate);
              }
              break;
          }
          case 'last24hours':{
            if(moment(timeSlot).isAfter(moment().subtract(1,'days')) && moment(timeSlot).isBefore(moment()) ){
              this.targetUserList.push(childItem.actual);
              this.actualUserList.push(childItem.target);
              this.timeSlot.push(formattedDate);
            }
            break;
          }
        }
    });
    this.formattedObject.columns.push(this.targetUserList);
    this.formattedObject.columns.push(this.actualUserList);
    this.actualUserList=[];
    this.targetUserList=[];
  }
  getTotalScanData = (obj: ITimeSeriesRequestFormat): Observable<IResponse<ITimeSeriesResponse>> => {
   return this.http.get<ITimeSeriesResponse>(this.config.getParams().operationDashboardKPI+ '/assessment/timeseries?'+obj.users+'timePeriod='+obj.duration);
 }
  getOPerationKPI = (params: Object): Observable<IResponse<IKPIChart>> => {
   return this.http.get<IKPIChart>(this.config.getParams().operationDashboardKPI+ '/kpis', params);
  }

  getUserData = (params: Object): Observable<IResponse<IUserList[]>> => {
     return this.http.get(this.config.getParams().userUrl+ '/Search/appFilter='+params);
  }
  getHistogramData = (obj: ITimeSeriesRequestFormat): Observable<IResponse<IHistogramChart>> => {
    return this.http.get<IHistogramChart>(this.config.getParams().historgramUrl +'?timePeriod='+ obj.duration);
 }
}

