import {Person} from "../persons/person";
import {Deserialization} from "../deserialization";

export class Task implements Serializable<Task> {
    id:number;
    name:string;
    priority:number;
    added_by:Person;
    estimated:number;
    needed:number;
    due:Date;
    done:boolean;
    done_at:Date;
    approved:boolean;
    approved_by:Person;
    approved_at:Date;
    created_at:Date;
    updated_at:Date;

    deserialize(input : Object) : Task {
        let scalar = ['id', 'name', 'priority', 'estimated', 'needed', 'done', 'approved'];
        let dates = ['due', 'done_at', 'approved_at', 'created_at', 'updated_at'];
        let persons = ['added_by', 'approved_by'];

        Deserialization.scalar(this, input, scalar);
        Deserialization.dates(this, input, dates);
        Deserialization.object(this, input, Person, persons);

        return this;
    }

    getDueClass() : string{
        let now:Date = new Date();
        if(this.due.getTime() < now.getTime()) {
            return 'text-danger';
        } else if(this.due.getTime() < now.getTime() + 86400000) {
            return 'text-warning';
        } else {
            return '';
        }
    }
    
    setNeeded(input : string) {
        this.needed = Task.parseTimeStr(input);
    }
    
    setEstimated(input : string) {
        this.estimated = Task.parseTimeStr(input);
    }
    
    static parseTimeStr(input : string) : number {
        let hours = parseInt( input.substr(0, input.indexOf(':')) );
        let minutes = parseInt( input.substr(input.indexOf(':') + 1, input.length) );
        if(isNaN(hours) || isNaN(minutes)) {
            return 0;
        } else {
            return hours * 60 + minutes;
        }
    }
}