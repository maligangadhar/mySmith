import { TestBed, ComponentFixture, async, fakeAsync } from '@angular/core/testing';
import { DebugElement, Pipe, PipeTransform, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { BrowserModule, By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { SPButtonComponent } from './case.button.control';
import { ICaseService, IBroadcastService, ITranslateService} from '../interfaces/interfaces';
import { IResponse, ICaseIDResponseFormat, IKeyData, ISearchGetResponseFormat, IMetadataCase, ICaseCreateDetails, ICaseGetResponse, IMetaDataCaseNew, ICaseRequestFormat, ITimeline, ICaseCountResponse } from '../models/viewModels';
import { responseStatus, messageResponseType, broadcastKeys, metaDataSettings, caseButtonTypes } from '../models/enums';
import { BroadcastService } from '../services/broadcast.service';
import { MessageService } from '../services/message.service';
import { ModalCaseAlertComponent } from '../components/modal/modal.case.alert.component';
import { ModalCaseCancelReasonComponent } from '../components/modal/modal.casecancelreason.component';
import { ModalPromptComponent } from '../components/modal/modal.prompt.component';
let component: SPButtonComponent;
let fixture: ComponentFixture<SPButtonComponent>;
let caseServiceStub: ICaseService;
let broadcastServiceStub: IBroadcastService;
let page: Page;
let testInitialiser: TestInitialiser;
let mockClearAllResponse: IResponse<ICaseIDResponseFormat[]> = {
		data: [],
		status: responseStatus.Success,
		messageKey: ' This is a Clear All Response',
		apiUrl: '/cases'
};
describe('Initialising Case Button Component ', () => {
		describe(' Preparing Set-Up Case Button Component ', setUpCaseButton);
});

function setUpCaseButton() {
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SPButtonComponent, MockTranslate, ModalCaseAlertComponent, ModalCaseCancelReasonComponent, ModalPromptComponent],
			imports: [BrowserModule, FormsModule],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			providers: [
				{ provide: 'ICaseService', useClass: CaseServiceStub },
				{ provide: 'IBroadcastService', useClass: BroadcastService },
				{ provide: 'IMessageService', useClass: MessageService },
				{ provide: 'ITranslateService', useClass: TranslateServiceStub }
			]
		}).compileComponents();
	}));

	beforeEach(fakeAsync(() => {
		fixture = TestBed.createComponent(SPButtonComponent);
		component = fixture.componentInstance;
		caseServiceStub = fixture.debugElement.injector.get('ICaseService');
		broadcastServiceStub = fixture.debugElement.injector.get('IBroadcastService');
	}));

	it('should be able to run the test case ', () => {
			expect(true).toBe(true);
	});

	it('should check if ModalCaseAlertComponent is initialised ', () => {
			expect(component.modalCaseAlert).toBeDefined();
	});

	it('should check if the ModalCancelReason is initialised ', () => {
			expect(component.modalCancelReason).toBeDefined();
	});

	it('should check if ModalPrompt is initialised ', () => {
			expect(component.modalPrompt).toBeDefined();
	});

	it('should be able to set the button based on Input Parameters ClearAllSelected', async(() => {
			testInitialiser = new TestInitialiser();
			testInitialiser.addClearAllScenarios();
			fixture.detectChanges();
			page = new Page();
			page.addMasterButton();
			expect(page.spMasterButton.id).toBe(component.buttonid);
			expect(page.spMasterButton.innerText).toBe(component.buttontitle);
			expect(page.spMasterButton['disabled']).not.toBeTruthy();
			page.button.triggerEventHandler('click', null);

			spyOn(component, 'setQueryString').and.callThrough();
			spyOn(component, 'conditionalPopUpDisplay').and.callThrough();
			spyOn(component.modalCaseAlert, 'show').and.callThrough();
			component.onButtonClick();

			expect(component.setQueryString).toHaveBeenCalled();
			expect(component.query).toEqual('ClearAllSelectedQuestion');
			expect(component.conditionalPopUpDisplay).toHaveBeenCalled();
			expect(component.modalCaseAlert.show).toHaveBeenCalled();
			spyOn(caseServiceStub, 'updateCases').and.callFake(function () {
					return Observable.from(Promise.resolve(mockClearAllResponse));
			});
			spyOn(component, 'sendData').and.callThrough();
			component.modalCaseAlertClick(messageResponseType.Yes);
			expect(component.sendData).toHaveBeenCalled();
			broadcastServiceStub.DataChange.subscribe((result: IKeyData) => {
					expect(result.key === broadcastKeys[broadcastKeys.refreshCaseList]);
			});
	}));

}

///Helper Methods///
class CaseServiceStub implements ICaseService {
	getCases: (addCreatedBy: boolean, pageNum?: number, pageSize?: number, filterCriteria?: number[], sortCriteria?: string[], additionalCondition?: string) => Observable<IResponse<ICaseGetResponse>>;
	getCasesCount: (addCreatedBy: boolean, filterCriteria?: number[], additionalCondition?: string) => Observable<IResponse<ICaseCountResponse>>;
	getCasesByStatus: (assignedTo: boolean, filterCriteria?: number[]) => Observable<IResponse<ICaseGetResponse>>;
	createCase: <ICaseCreateDetails>(caseDetail: ICaseCreateDetails) => Observable<IResponse<ICaseCreateDetails>>;
	updateCase: <ICaseCreateDetails>(caseDetail: ICaseCreateDetails) => Observable<IResponse<ICaseCreateDetails>>;
	fetchCaseCreateMetaData: (metadataFor: metaDataSettings) => Observable<IResponse<IMetadataCase>>;
	fetchCaseCountryData: () => Observable<IResponse<IMetadataCase>>;
	getCaseDetailById: (caseID: string) => Observable<IResponse<ICaseCreateDetails>>;
	fetchMetadata: () => Observable<IResponse<IMetaDataCaseNew>>;
	getSearchdata: (keyword: string, filterCriteria?: string[]) => Observable<IResponse<ISearchGetResponseFormat[]>>;
	getSearchCasesCount: (filterCriteria?: any[], searchAll?: boolean, additionalCondition?: string) => Observable<IResponse<ICaseCountResponse>>;
	getSearchCases: (pageNum?: number, pageSize?: number, filterCriteria?: any[], searchAll?: boolean, sortCriteria?: string[], additionalCondition?: string) => Observable<IResponse<ICaseGetResponse>>;
	getSearchClearCases: (timeDuration?: number, pageNum?: number, pageSize?: number, filterCriteria?: any[], sortCriteria?: string[], searchAll?: boolean, appendUrl?: string) => Observable<IResponse<ICaseGetResponse>>;
	getCaseTimeline: (caseId: string) => Observable<IResponse<ITimeline>>;
	getSearchClearCasesCount: (timeDuration?: number, pageNum?: number, pageSize?: number, filterCriteria?: any[], searchAll?: boolean, appendUrl?: string) => Observable<IResponse<ICaseCountResponse>>;
	updateCases(caseStatus: ICaseRequestFormat) {
		return Observable.from(Promise.resolve(mockClearAllResponse));
	}
}

@Pipe({ name: 'sp3Translate', pure: false })
class MockTranslate implements PipeTransform {
		transform(value: string, args: string) {
				return value;
		}
}

class Page {
		button: DebugElement;
		spMasterButton: HTMLElement;
		addMasterButton() {
				this.button = fixture.debugElement.query(By.css('button#clearAllSelected'));
				this.spMasterButton = this.button.nativeElement;
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

class TestInitialiser {
		addClearAllScenarios() {
				component.buttontitle = 'ClearAllSelected';
				component.caseIds = ['ABCD00001'];
				component.disableButton = false;
				component.buttonClass = 'btn btn-secondary btn-green';
				component.buttonid = 'clearAllSelected';
				component.caseButtonType = caseButtonTypes.ClearAllSelected;
				component.reasonsTypes = [{ id: 1, name: 'Error' }, { id: 2, name: 'JourneyCancelled' }, { id: 3, name: 'NoArrival' }];
		}
}
