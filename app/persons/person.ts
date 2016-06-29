import {KPI} from "../KPIs/KPI";
import {Deserialization} from "../deserialization";
import {Entity} from "../entities/entity";
import {Measurable} from "../KPIs/measurable";

export class Person implements Serializable<Person>, Measurable {
    id:number;
    email:string;
    first_name:string;
    middle_name:string;
    last_name:string;
    full_name:string;
    dob:Date;
    interviewed:boolean;
    profile_picture_url:string;
    created_at:Date;
    updated_at:Date;
    kpis:KPI[];
    managers:Person[];
    home_entity:Entity;

    deserialize(input:Object):Person {
        Deserialization.scalar(this, input, ['id', 'email', 'first_name', 'middle_name', 'last_name', 'interviewed', 'profile_picture_url']);
        Deserialization.dates(this, input, ['dob', 'created_at', 'updated_at']);

        this.full_name = this.first_name + ((typeof this.middle_name == "string") ? ' ' + this.middle_name : '') + ' ' + this.last_name;

        Deserialization.objectArray(this, input, KPI, ['kpis']);

        Deserialization.objectArray(this, input, Person, ['managers']);
        Deserialization.object(this, input, Entity, ['home_entity']);

        return this;
    }

    getType() : string {
        return "Person";
    }

    getName() : string {
        return this.full_name;
    }

}