import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'sp3TypeFormatPipe'
})
export class TypeFormatPipe implements PipeTransform {
    transform(value: number, args: any) {
        if (typeof value === 'undefined') {
            return value;
        }
        if (typeof value !== 'number') {
            throw new Error('Invalid Pipe Argument '+ ' CategoryTypeFormatPipe ' + value);
        }
        return args[value] === 'Other' ? 'No': (!args[value] ? value: args[value]);
    }
}
