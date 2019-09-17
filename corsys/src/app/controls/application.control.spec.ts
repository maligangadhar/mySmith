import { TestBed, async, ComponentFixture, fakeAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SpApplicationsComponent } from './application.control';
import { IApplicationService } from '../interfaces/interfaces';
import { IApp, IResponse } from '../models/viewModels';
import { BroadcastService } from '../services/broadcast.service';
import { ENV_APP_MAP } from '../config/appMap/appMap';
import { StorageService } from '../services/storage.service';
import { CommonService } from '../services/common.service';

let comp: SpApplicationsComponent;
let fixture: ComponentFixture<SpApplicationsComponent>;
// let messageServiceStub: IMessageService;
// let broadcastServiceStub: IBroadcastService;
let applicationServiceStub: IApplicationService;
// let sortServiceStub: ISortService;
let navigateTo;

let mockApps: IApp[] = [{ id: 1, name: 'Arrival', code: 'arr', logourl: '/arrivals', status: 1 }];

let validResponse: IResponse<IApp[]> = {
		data: mockApps,
		status: 0,
		messageKey: 'key',
		apiUrl: '/arrivals'
};

let RouterStub = {
    navigateByUrl: jasmine.createSpy('navigateByUrl'),
    navigate: jasmine.createSpy('navigate')
};

describe('it should be able to test the application control component ', () => {
		describe(' Set Up application control Component', AppModuleModuleSetup);
});

function AppModuleModuleSetup() {
		beforeEach(async(() => {
				TestBed.configureTestingModule({
						declarations: [SpApplicationsComponent, MockTranslate],
						imports: [BrowserModule],
						schemas: [CUSTOM_ELEMENTS_SCHEMA, EventEmitter],
						providers: [
								{ provide: 'IApplicationService', useClass: ApplicationServiceStub },
								{ provide: 'IMessageService', useClass: MessageServiceStub },
								{ provide: 'ISortService', useClass: SortServiceStub },
								{ provide: 'IBroadcastService', useClass: BroadcastService },
								{ provide: 'IStorageService', useClass: StorageService },
								{ provide: 'ICommonService', useClass: CommonService },								
								{ provide: Router, useValue: RouterStub }
						]
				}).compileComponents();
		}));

		beforeEach(fakeAsync(() => {
				fixture = TestBed.createComponent(SpApplicationsComponent);
				comp = fixture.componentInstance;
				applicationServiceStub = fixture.debugElement.injector.get('IApplicationService');
				// sortServiceStub = fixture.debugElement.injector.get('IMessageService');
				// messageServiceStub = fixture.debugElement.injector.get('ISortService');
				// broadcastServiceStub = fixture.debugElement.injector.get('IBroadcastService');
				navigateTo = TestBed.get(Router);
		}));

		it('should test controlCenter route on its icon click ', fakeAsync(() => {
				spyOn(applicationServiceStub, 'getApplications').and.callFake(() => {
						return Observable.from(Promise.resolve(validResponse));
				});

				comp.allowNavigate = true;
				mockApps[0].code = ENV_APP_MAP.decisionCenter;
				comp.onAppNavigate(mockApps[0]);
				expect(navigateTo.navigate).toHaveBeenCalled();
		}));

}

@Pipe({ name: 'sp3Translate', pure: false })
class MockTranslate implements PipeTransform {
		transform(value: string, args: string): any {
				return value;
		}
}

class ApplicationServiceStub {
		getApplications(): Observable<IResponse<IApp[]>> {
				return Observable.from(Promise.resolve(validResponse));
		}
}

class MessageServiceStub {
}

class SortServiceStub {
}
