import {Deserialization} from "../deserialization";
import {Term} from '../terms/term';
import {Department} from '../departments/department';
import {_Function} from '../_functions/_function';
import {KPI} from "../KPIs/KPI";
import {Measurable} from "../KPIs/measurable";

export class Team implements Serializable<Team>, Measurable {
    id:number;
    title:string;
    team_type:string;
    subtitle:string;
    term:Term;
    department:Department;
    _function:_Function;
    kpis:KPI[];
    created_at:Date;
    updated_at:Date;

    deserialize(input : Object) : Team {
        Deserialization.scalar(this, input, ['id', 'title', 'team_type', 'subtitle']);
        Deserialization.dates(this, input, ['created_at', 'updated_at']);

        Deserialization.object(this, input, Term, ['term']);
        Deserialization.object(this, input, Department, ['department']);
        Deserialization.object(this, input, _Function, ['_function']);
        Deserialization.objectArray(this, input, KPI, ['kpis']);

        return this;
    }

    getName() : string {
        let r : string = this.title;
        if(this.term != null) {
            r += ' (' + this.term.short_name + ')';
        }
        if(this.term != null && this.term.entity != null) {
            r += ' - ' + this.term.entity.full_name;
        }
        return r;
    }

    getType() : string {
        return 'Team';
    }
}