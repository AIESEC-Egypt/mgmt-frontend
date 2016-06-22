import {Deserialization} from "../deserialization";
import {KPI} from "../KPIs/KPI";
import {Measurable} from "../KPIs/measurable";

export class Entity implements Serializable<Entity>, Measurable {

    id:number;
    name:string;
    full_name:string;
    email:string;
    parent:Entity;
    type:string;
    created_at:Date;
    updated_at:Date;
    kpis:KPI[];

    deserialize(input : Object) : Entity {
        Deserialization.scalar(this, input, ['id', 'name', 'full_name', 'email', 'type']);
        Deserialization.dates(this, input, ['created_at', 'updated_at']);

        Deserialization.object(this, input, Entity, ['parent']);
        Deserialization.objectArray(this, input, Entity, ['childs']);
        Deserialization.objectArray(this, input, KPI, ['kpis']);

        return this;

    }

    getName() : string {
        return this.full_name;
    }

    getType() : string {
        return 'Entity';
    }
}