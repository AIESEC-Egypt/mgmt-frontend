import {Entity} from "../entities/entity";
import {Deserialization} from "../deserialization";

export class Department implements Serializable<Department> {

    id:number;
    name:string;
    entity:Entity;
    created_at:Date;
    updated_at:Date;
    
    deserialize(input : Object) : Department {
        Deserialization.scalar(this, input, ['id', 'name']);
        Deserialization.dates(this, input, ['created_at', 'updated_at']);

        Deserialization.object(this, input, Entity, ['entity']);

        return this;

    }
}