import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { BrowserModule } from '@angular/platform-browser';
// import { LazyLoadEvent } from 'primeng/primeng';
import { CaseDetailComponent } from './case.detail.component';
import { ICaseService,  ITranslateService, ICaseAnalysisService, IProfilerSettingService, IAnalyzerService, IDateFormatService } from '../../interfaces/interfaces';
import { ICaseCreateDetails, ICase, IResponse, ICaseGetResponse, IMetadataCase, IMetaDataCaseNew, IAnalysisDetails, IMetaDataAnalysisCase, IProfilerCategory, IAssessmentImage, IMetadataImages, IFinding, IImageView, IRulerResponse, IRuler } from '../../models/viewModels';
import { responseStatus, metaDataSettings, verdictSources, assessmentTypes, assessmentResults, findingStatus, Weapons } from '../../models/enums';
import { BroadcastService } from '../../services/broadcast.service';
import { Router } from '@angular/router';

let comp: CaseDetailComponent;
let fixture: ComponentFixture<CaseDetailComponent>;
let caseServiceStub: ICaseService;
let caseAnalysisServiceStub: ICaseAnalysisService;
let profilerSettingServiceStub: IProfilerSettingService;
/* let messageServiceStub: IMessageService;
let broadcastServiceStub: IBroadcastService;
let translateServiceStub: ITranslateService;
let navigateTo; */

let mockCases: ICase[] = [{
caseId: '2017123456',
containerIds: ['1', '2'],
harmonisedSystemCodes: ['123456'],
from: 'AF',
to:'IN',
status: 1,
dateCreated: new Date(new Date().getTime()),
lastUpdatedDate: new Date(new Date().getTime()),
shippingCompany: 'Test Company',
dateOfArrival: new Date(new Date().getTime()),
shipId: 'IMO8420945',
checked: false
},
{
    caseId: '2017123457',
    containerIds: ['1'],
    harmonisedSystemCodes: [],
    from: 'AF',
    to:'IN',
    status: 1,
    dateCreated: new Date(new Date().getTime()),
    lastUpdatedDate: new Date(new Date().getTime()),
    shippingCompany: 'Test Company 11',
    dateOfArrival: new Date(new Date().getTime()),
    shipId: 'IMO8420945',
    checked: false
}];

let mockCaseCreateDetails: ICaseCreateDetails = {
        caseId: '123456',
        locationcode: 'IN',
        originPortCode: 'IN',
        destinationPortCode: 'IN',
		cargoType: 0,
		senderName: 'Test',
		senderAddress: 'Test',
		from: 'AF',
		to: 'AF',
		dateOfArrival: '2015/12/12',
		overallWeight: 0,
		notes: 'Test',
		shipping: {
            shipId: 'IMO8420945',
            shippingCompany: 'Test',
            contactDetails: 'Test',
            nationality: 'AF'
		},
		vehicle: {
            licensePlateNumber: '1234',
            make: '1234',
            driverName: 'Test',
            company: 'Test',
            model: 'Test',
            driverLicenseNumber: 'Test'
		},
		containers: null,
		lastUpdateDate: '2015/12/12',
		lastUpdatedBy: 'supevisor',
        status: 1,
        assessmentDetails: {
            overAllRiskRating: 1,
            riskColor: 1,
            riskCategories: [ {categoryId: 1, category: '1', categoryScore: 1, thresholdScore: 1, breach: false, breachValue: 'qw'}],
            inspectionVerdict: [{ assessment: 'test', comment: 'we', result: 1}],
            inspectionEvidenceDetails: [{
                id: 'string',
                Name: 'string',
                category: 2,
                comment: 'string',
                source: 'asdads',
                attachments: [],
                includes: 123,
                hsCode: 'hscode',
                goodsType: Weapons.Explosives
            }],
            findings: [{
                id: 'string',
                Name: 'string',
                category: 2,
                comment: 'string',
                source: 'asdads',
                attachments: [],
                includes: 123,
                hsCode: 'hscode',
                goodsType: Weapons.Explosives
            }]
        },
        riskAssessmentDetails: {
            overAllRiskRating: 3,
            riskColor: 2,
            riskCategories: [ 
                { categoryId: 0, category: 'Categor 1', categoryScore: 22, thresholdScore: 80, breach: false, breachValue: 'N' },
                { categoryId: 1, category: 'Categor 2', categoryScore: 30, thresholdScore: 20, breach: true, breachValue: 'Y' } 
            ]
        }

};

let mockCaseAnalysisDetails: IAnalysisDetails = {
    caseId: ['123456'],
    source: verdictSources.DecisionCentre,
    assessment: assessmentTypes.None,
    result: assessmentResults.Inconclusive,
    comment: 'test',
    inspectionType: 1,
    status: 0
};

let metadataCreateCase: IMetadataCase = {
    CargoStatus: [{ id: 1, name: 'Awaiting Scanning' }, { id: 5, name: 'Draft' }],
    CargoType: [{ id: 1, name: 'Ship Case' }],
    Country: [{ code: 'AF', name: 'Afganisthan' }, { code: 'IN', name: 'India' }],
    ReasonType: [{ id: 1, name: 'Error' }],
    RegionState: [{ code: 'TS', name: 'Telengana', id: 1 }]
};

let metaDataCase : IMetaDataCaseNew = {
     CargoStatus: [{ id: 1, name: 'Awaiting Scanning' }, { id: 5, name: 'Draft' }],
    CargoType: [{ id: 1, name: 'Ship Case' }],   
    ReasonType: [{ id: 1, name: 'Error' }],   
    RiskColor: [{ id: 0, name: 'No Risk' }, { id: 1, name: 'Moderate' },  { id: 2, name: 'High Risk' }]
};

let metaDataAnalysisCase : IMetaDataAnalysisCase = {
         PhysicalInspectionTypes: [{ id: 1, name: 'Type 1'}, { id: 2, name: 'Type 2'}]
};

let mockCategoryList : IProfilerCategory[] = [
    { id: 1, name: 'Category 1',  threshold: 80},
    { id: 2, name: 'Category 2',  threshold: 60},
    { id: 3, name: 'Category 3',  threshold: 20},
];

let getCasesMockResponse: IResponse<ICaseGetResponse> = {
		data: { cases: mockCases,count: 2 },
		status: responseStatus.Success,
		messageKey: 'This is get cases success response',
		apiUrl: '/case'
};

let getMetadataCreateCaseMockResponse: IResponse<IMetadataCase> = {
		data: metadataCreateCase,
		status: responseStatus.Success,
		messageKey: 'This is metadata for create cases',
		apiUrl: '/metadata'
};  

let getMetadataCaseMockResponse: IResponse<IMetaDataCaseNew> = {
		data: metaDataCase,
		status: responseStatus.Success,
		messageKey: 'This is metadata for cases',
		apiUrl: '/metadata'
};

let getMetadataAnalysisCaseMockResponse: IResponse<IMetaDataAnalysisCase> = {
        data: metaDataAnalysisCase,
        status: responseStatus.Success,
		messageKey: 'This is metadata for analysis cases',
		apiUrl: '/metadata'
};

let getCaseResponse: IResponse<ICaseCreateDetails> = {
		data: mockCaseCreateDetails,
		status: responseStatus.Success,
		messageKey: 'This is get cases success response',
		apiUrl: '/case'
};

let getAnalysisCaseDetailsMockResponse: IResponse<IAnalysisDetails> = {
		data: mockCaseAnalysisDetails,
		status: responseStatus.Success,
		messageKey: 'This is get case analysis detail success response',
		apiUrl: '/verdict'
};

let getProfilerSettingMockResponse: IResponse<IProfilerCategory[]> = {
    data: mockCategoryList,
    status: responseStatus.Success,
    messageKey: 'This is get category list success response',
    apiUrl: '/cases/profiler/riskcategories'
};

let RouterStub = {
    navigateByUrl: jasmine.createSpy('navigateByUrl'),
    navigate: jasmine.createSpy('navigate')
};

describe('it should be able to test the Case detail Component ', () => {
		describe(' Set Up Case View Component', CaseDetailModuleSetup);
});

function CaseDetailModuleSetup() {
		beforeEach(() => {
				TestBed.configureTestingModule({
                    declarations: [CaseDetailComponent, MockTranslate, MockDateFormat, MockDateTimeFormat, MockTypeFormatPipe, MockCaseDetailCustomPipe],
                    imports: [BrowserModule, FormsModule],
                    schemas: [CUSTOM_ELEMENTS_SCHEMA],
                    providers: [
                        { provide: 'IMessageService', useClass: MessageServiceStub },
                        { provide: 'IBroadcastService', useClass: BroadcastService },
                        { provide: 'ITranslateService', useClass: TranslateServiceStub },
                        { provide: 'IAttachmentService', useClass: AttachmentServiceStub },
                        { provide: 'ICaseService', useClass: CaseServiceStub },
                        { provide: 'ICaseAnalysisService', useClass: CaseAnalysisServiceStub },
                        { provide: 'IDateFormatService', useClass: DateFormatServiceStub },
                        { provide: 'IProfilerSettingService', useClass: ProfilerSettingServiceStub },
                        { provide: 'IAnalyzerService', useClass: AnalyzerServiceStub },
                        { provide: Router, useValue: RouterStub }						
                    ]
                });
                fixture = TestBed.createComponent(CaseDetailComponent);
				comp = fixture.componentInstance;

                caseServiceStub = fixture.debugElement.injector.get('ICaseService');
                caseAnalysisServiceStub = fixture.debugElement.injector.get('ICaseAnalysisService');			
                profilerSettingServiceStub = fixture.debugElement.injector.get('IProfilerSettingService');
		});

		beforeEach( () => {
            spyOn(comp, 'reset').and.callThrough();
            spyOn(caseServiceStub, 'fetchMetadata').and.callFake( () => {
                return Observable.from(Promise.resolve(getMetadataCaseMockResponse));
            });

            spyOn(profilerSettingServiceStub, 'getProfilerSetting').and.callFake( () => {
                return Observable.from(Promise.resolve(getProfilerSettingMockResponse));
            });

            spyOn(comp, 'getAnalyzerCaseDetails').and.callFake( () => { return true;});
            spyOn(caseAnalysisServiceStub, 'fetchCaseAnalysisMetaData').and.callFake( () => {
                return Observable.from(Promise.resolve(getMetadataAnalysisCaseMockResponse));
            });
            
            spyOn(comp, 'getCaseDetails').and.callFake( () => { return true; });
            spyOn(caseServiceStub, 'fetchCaseCreateMetaData').and.callFake( () => {
                return Observable.from(Promise.resolve(getMetadataCreateCaseMockResponse));
            });
        });

        it ('should fetch getCaseMetaData on oninit ', async( () => {
            
            expect(comp.isDisabled).toBeTruthy();
            
            fixture.detectChanges();
    
            fixture.whenStable().then( () => {
                expect(comp.reset).toHaveBeenCalled();
                expect(caseServiceStub.fetchMetadata).toHaveBeenCalled();
                expect(profilerSettingServiceStub.getProfilerSetting).toHaveBeenCalled();
                expect(comp.getAnalyzerCaseDetails).toHaveBeenCalled();
                expect(comp.getCaseDetails).toHaveBeenCalled();
                expect(comp.caseStatusList.length).toEqual(2);
            });

        }));

        
}

 class CaseServiceStub  {
        getCaseDetailById(caseID: string): Observable<IResponse<ICaseCreateDetails>> {
				return Observable.from(Promise.resolve(getCaseResponse));
        }
        getCases(userId: string, pageNum?: number, pageSize?: number, filterCriteria?: number[], sortCriteria?: string[], additionalCondition?: string):  Observable<IResponse<ICaseGetResponse>>
        {
            return Observable.from(Promise.resolve(getCasesMockResponse));
        }       
        fetchCaseCreateMetaData(metadataFor: metaDataSettings): Observable<IResponse<IMetadataCase>> {
				return Observable.from(Promise.resolve(getMetadataCreateCaseMockResponse));
        }    
        fetchMetadata(): Observable<IResponse<IMetaDataCaseNew>> {
				return Observable.from(Promise.resolve(getMetadataCaseMockResponse));
        }      
    }
        
    class CaseAnalysisServiceStub  {
       fetchCaseAnalysisMetaData() {
           return Observable.from(Promise.resolve(getMetadataAnalysisCaseMockResponse));
       }

       putCaseAnalysis = (payLoad: IAnalysisDetails) => {
           return Observable.from(Promise.resolve(getAnalysisCaseDetailsMockResponse));						
	    }
    }

    
    class ProfilerSettingServiceStub {
        getProfilerSetting = (lang: string) => {
            return Observable.from(Promise.resolve(getProfilerSettingMockResponse));	
        }
    }

@Pipe({ name: 'sp3Translate', pure: false })
class MockTranslate implements PipeTransform {
		transform(value: string, args: string): any {
				return value;
		}
}

@Pipe({ name: 'sp3TypeFormatPipe', pure: false })
class MockTypeFormatPipe implements PipeTransform {
		transform(value: string, args: string): any {
				return value;
		}
}

@Pipe({ name: 'sp3CaseDetailCustomPipe', pure: false })
class MockCaseDetailCustomPipe implements PipeTransform {
		transform(value: string, args: string): any {
				return value;
		}
}

@Pipe({ name: 'sp3DateFormat', pure: false })
class MockDateFormat implements PipeTransform {
		transform(value: string, args: string): any {
				return value;
		}
}

@Pipe({ name: 'sp3DateTimeFormat', pure: false })
class MockDateTimeFormat implements PipeTransform {
		transform(value: string, args: string): any {
				return value;
		}
}

 class TranslateServiceStub implements ITranslateService {
		CurrentLang: string;
		setDefaultLang: (lang: string) => void;
		enableFallback: (enable: boolean) => void;
		use: (lang: string) => void;
		replace: (word: string, words: string | string[]) => string;
		instant(key: string, words?: string | string[]) {
				return key;
		}
}

class MessageServiceStub {
}


class AttachmentServiceStub {
}

class DateFormatServiceStub implements IDateFormatService {
    operationalDate: (utcDateTimeValue: string | Object) => Object;
    formatDate: (date: Date, format?: string) => string;
    formatDateforApi: (dateString: string | Date) => string;
    convertUTCToLocalDateTime = (utcDateTimeValue: string): string => {
        return utcDateTimeValue;
    }
}

class AnalyzerServiceStub implements IAnalyzerService {
    getScanDetails: (scanID: string) => Observable<IResponse<IAssessmentImage[]>>;
    getAnalyzerCaseDetails: (caseID: string) => Observable<IResponse<IAssessmentImage[]>>;
    getImageByScanId: (scanFolder: string, scanImageId: string, mimeType: string) => any;
    fetchImageAnalyzerMetaData: () => Observable<IResponse<IMetadataImages>>;
    fetchImageFindings: (caseId: string, viewType: number) => Observable<IResponse<IFinding[]>>;
    createView: <IImageView>(caseID: string, viewDetail: IImageView) => Observable<IResponse<IImageView>>;
    updateView: (caseID: string, viewDetail: IImageView) => Observable<IResponse<IImageView>>;
    getViews: (caseID: string) => Observable<IResponse<IImageView[]>>;
    getViewDetailByViewId: (caseID: string, viewID: string) => Observable<IResponse<IImageView>>;
    addImageFinding: (caseId: string, finding: IFinding) => Observable<IResponse<IFinding>>;
    updateImageFinding: (caseId: string, finding: IFinding) => Observable<IResponse<IFinding>>;
    deleteFinding: (caseId: string, findingId: string, status: findingStatus, VerdictComment?: string, source?: string) => Observable<IResponse<any>>;
    fetchImageRulers: (caseId: string, viewType: number) => Observable<IResponse<IRulerResponse>>;
    addImageRuler: (caseId: string, ruler: IRuler) => Observable<IResponse<IRuler>>;
    deleteRuler: (caseId: string, rulerId: string, status: findingStatus) => Observable<IResponse<any>>;
    fetchScanMetadata: () => Observable<IResponse<any>>;
    /* updateView(caseID: string, viewDetail: IImageView): Observable<IResponse<IImageView>>{
        return Observable.from(Promise.resolve(mockPutViewResponse));
    }
    createView(caseID: string, viewDetail: IImageView): Observable<IResponse<IImageView>>{
        return Observable.from(Promise.resolve(mockViewCreationResponse));
    }
    getViewDetailByViewId(caseID: string, viewID: string): Observable<IResponse<IImageView>>{
         return Observable.from(Promise.resolve(mockViewCreationResponse));
    } */
}
