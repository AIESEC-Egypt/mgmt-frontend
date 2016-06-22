import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'TaskTime'})
export class TaskTimePipe implements PipeTransform {
    transform(value:number) : string {
        let hours = Math.floor(value / 60);
        let minutes = value % 60;
        return ((hours < 10) ? '0' + hours : hours) + ':' + ((minutes < 10) ? '0' + minutes : minutes);
    }
}