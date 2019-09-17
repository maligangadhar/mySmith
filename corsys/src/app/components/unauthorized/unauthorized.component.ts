import { Component } from '@angular/core';
@Component({
	selector: 'sp3-comp-unauthorized',
	template: '<div class="body-container"> <div class="row"> <div class="col-sm-12 text-center unauthorised"> <h3>{{"UnauthorisedAccess" | sp3Translate}}</h3> <p>{{"AdminContactMessage" | sp3Translate}}</p> </div> </div> </div>'
})

export class UnAuthorizedComponent {}
