import { Pipe, PipeTransform } from '@angular/core';
import { categoryType, Weapons, Drugs } from '../models/enums';
import { IInspectionEvidenceDetails } from '../models/viewModels';

@Pipe ({
    name: 'sp3CaseDetailCustomPipe'
})

export class CaseDetailCustomPipe implements PipeTransform {
    transform(value: IInspectionEvidenceDetails) {
        if (typeof value === 'undefined') {
            return value;
        }
        if (value.category === categoryType.undeclared) {
            return value.hsCode;
        } else {
            let result = (value.category === categoryType.weapons) ? Weapons[value.goodsType] : Drugs[value.goodsType];
            return result;
        }
    }
}
