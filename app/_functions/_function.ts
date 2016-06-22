import {Deserialization} from "../deserialization";

export class _Function implements Serializable<_Function> {

    id:number;
    name:string;
    created_at:Date;
    updated_at:Date;

    deserialize(input : Object) : _Function {
        Deserialization.scalar(this, input, ['id', 'name']);
        Deserialization.dates(this, input, ['created_at', 'updated_at']);

        return this;

    }
}