import {Deserialization} from "../deserialization";
import {Entity} from '../entities/entity';

export class Term implements Serializable<Term> {

    id:number;
    entity:Entity;
    term_type:string;
    short_name:string;
    start_date:Date;
    end_date:Date;
    created_at:Date;
    updated_at:Date;

    deserialize(input : Object) : Term {
        Deserialization.scalar(this, input, ['id', 'term_type', 'short_name']);
        Deserialization.dates(this, input, ['start_date', 'end_date', 'created_at', 'updated_at']);

        Deserialization.object(this, input, Entity, ['entity']);

        return this;
    }

}