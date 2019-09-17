import { Injectable, Inject } from '@angular/core';
import { IAttachmentService, IAppParams } from '../interfaces/interfaces';
import { IAttachment, IResponse } from '../models/viewModels';
import { Observable } from 'rxjs/Rx';
import { messageType } from '../models/enums';
import { SecureService } from './secure.adal.service';

/**
 * Service for Attachments
 * Mime Types Reference:- https://www.sitepoint.com/web-foundations/mime-types-complete-list/
 * Default Accepted Mime Types:- .pdf, .png, .tiff, .jpg, .docx
 * pdf:- 'application/pdf'
 * png:- '"image/png"'
 * tiff:- 'image/tiff'
 * jpg:- 'image/jpeg'
 * .docx:- 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
 */

@Injectable()
export class AttachmentService implements IAttachmentService {
    constructor(@Inject('IAppParams') private config: IAppParams, private http: SecureService) { }
    getAttachmentByAttachmentId = (attachmentId: string, folderName: string, mimeType: string): void => {
        let url = this.config.getParams().attachmentUrl + '/' + attachmentId;
        let params = {fileFolder: folderName};
        this.http.getAttachment(url, mimeType, params).subscribe(response => {            
            var mediaType = response['_body']['type'] || mimeType;
            let result = response.blob();
            let blob = new Blob([result], { type: mediaType });
            let isIE = !!document['documentMode'] || /*@cc_on!@*/false;
            if (isIE) {
                window.navigator.msSaveOrOpenBlob(blob);
            } else {
                let url = window.URL.createObjectURL(blob);
                window.open(url);
            }
        }, (error: IResponse<any>) => {
            throw new Error(''+error.messageKey + '' + messageType.Error );
        });
    }

    postAttachment = (attachment: IAttachment[], caseId: string): Observable<IResponse<IAttachment>[]> => {

        let attachmentArray = attachment.map(item => {
            return this.http.post<IAttachment>(this.config.getParams().casesUrl + '/' + caseId + '/attachments', item);
        });
        return Observable.forkJoin(attachmentArray);
    }

    attachmentValidation = (fileObject, acceptableMimeTypes) => {
        return (acceptableMimeTypes.split(', ').indexOf(fileObject.type) > -1) ? true : false;
    }

    convertToByteArray = (fileObject, title: string, description: string): Observable<IAttachment> => {
        let computedFile: IAttachment = {
            id: '',
            title: '',
            fileName: '',
            description: '',
            fileType: '',
            fileSize: 0,
            fileContent: [],
            uploadedBy: '',
            uploadedDate: new Date(),
            downloadPath: '',
            isFileDeleted: false,
            isEditable: false
        };
        return new Observable(observable => {
            var reader = new FileReader();
            reader.onload = function (event) {
                let targetEvent = event.target;
                let targetResult = targetEvent['result'];
                let status = new Uint8Array(targetResult);
                computedFile.fileContent = [].slice.call(status);
                observable.next(computedFile);
                observable.complete();
            };
            computedFile.fileName = fileObject.name;
            computedFile.fileType = fileObject.type;
            computedFile.title = title;
            computedFile.description = description;
            computedFile.fileSize = fileObject.size;
            computedFile.rawFile = fileObject;
            reader.readAsArrayBuffer(fileObject);
        });
    }

    downloadLocalFile = (fileObject: IAttachment) => {
        let isIE = !!document['documentMode'] || /*@cc_on!@*/false;
        if (isIE) {
            window.navigator.msSaveOrOpenBlob(fileObject.rawFile);
        } else {
            let dataURI = window.URL.createObjectURL(fileObject.rawFile);
            window.open(dataURI);
        }
    }
}
