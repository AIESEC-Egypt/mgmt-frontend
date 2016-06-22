import {KPIvalue} from "./KPIvalue";
import {Deserialization} from "../deserialization";
import {Person} from "../persons/person";
import {Team} from "../teams/team";
import {Entity} from "../entities/entity";
import {Measurable} from "./measurable";

export class KPI implements Serializable<KPI> {
    id:number;
    type:string;
    subtype:string;
    measurable_type:string;
    measurable:Measurable;
    unit:string;
    latest_value:KPIvalue;
    values:KPIvalue[];
    created_at:Date;
    updated_at:Date;

    constructor() {}

    getLatestValueFormatted() {
        let r:string = null;
        if(this.latest_value != null) {
            r = String(this.latest_value.value);
        }
        if(r != null) {
            switch(this.unit) {
                case 'percentage':
                    r += '%';
                    break;

                case 'minutes':
                    let hours:number = Math.floor(this.latest_value.value / 60);
                    let min:number = this.latest_value.value % 60;
                    r = ((hours < 10) ? '0' : '') + hours + ':' + ((min < 10) ? '0' : '') + min + 'h';
                    break;
            }
        }
        return r;
    }

    deserialize(input:Object):KPI {
        let scalar = ['id', 'type', 'subtype', 'measurable_type', 'unit'];
        Deserialization.scalar(this, input, scalar);
        
        let dates = ['created_at', 'updated_at'];
        Deserialization.dates(this, input, dates);

        Deserialization.objectArray(this, input, KPIvalue, ['values']);
        Deserialization.object(this, input, KPIvalue, ['latest_value']);

        // deserialize measurable
        switch(this.measurable_type) {
            case 'Person':
                Deserialization.object(this, input, Person, ['measurable']);
                break;

            case 'Team':
                Deserialization.object(this, input, Team, ['measurable']);
                break;

            case 'Entity':
                Deserialization.object(this, input, Entity, ['measurable']);
                break;
        }

        return this;
    }
}