import {KPIvalueDate} from "./KPIvalueDate";
import {Deserialization} from "../deserialization";

export class KPIvalue implements Serializable<KPIvalue> {
    id:number;
    date:KPIvalueDate;
    value:number;
    calculated_at:Date;
    created_at:Date;
    updated_at:Date;

    deserialize(input:Object):KPIvalue {
        let scalar = ['id', 'value'];
        Deserialization.scalar(this, input, scalar);

        let dates = ['calculated_at', 'created_at', 'updated_at'];
        Deserialization.dates(this, input, dates);

        Deserialization.object(this, input, KPIvalueDate, ['date']);

        return this;
    }
}