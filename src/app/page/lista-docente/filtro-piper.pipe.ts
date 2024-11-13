import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterList'
})
export class FilterListPipe implements PipeTransform {

    transform(items: any[], searchTerm: string): any[] {
        if (!items || !searchTerm) {
            return items;
    }
    return items.filter(item => 
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } 
}
