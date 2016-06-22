import {Deserialization} from "../deserialization";

export class KPIvalueDate implements Serializable<KPIvalueDate> {
    id:number;
    date:Date;
    day:string;
    week:string;
    month:string;
    quarter:string;
    year:number;
    dayOfMonth:number;
    dayOfWeek:number;
    weekOfMonth:number;
    weekOfYear:number;
    monthOfYear:number;
    quarterOfYear:number;
    created_at:Date;
    updated_at:Date;

    deserialize(input:Object):KPIvalueDate {
        let scalar = ['id', 'day', 'week', 'month', 'quarter', 'year', 'dayOfMonth', 'dayOfWeek', 'weekOfMonth', 'weekOfYear', 'monthOfYear', 'quarterOfYear'];
        Deserialization.scalar(this, input, scalar);

        let dates = ['date', 'created_at', 'updated_at'];
        Deserialization.dates(this, input, dates);

        return this;
    }

    static attributeLessThan(attr : string, attr1:string, attr2:string) : boolean {
        switch(attr) {
            case 'year':
            case 'dayOfMonth':
            case 'dayOfWeek':
            case 'weekOfMonth':
            case 'weekOfYear':
            case 'monthOfYear':
            case 'quarterOfYear':
                return parseInt(attr1) < parseInt(attr2);

            case 'date':
                return Date.parse(attr1) < Date.parse(attr2);

            case 'day':
            case 'week':
            case 'month':
            case 'quarter':
                var attr_1 : string[] = attr1.split('-');
                var attr_2 : string[] = attr2.split('-');
                if(attr_1.length != attr_2.length) {
                    throw "Can not compare attributes of different length";
                }
                for(var i = 0; i < attr_1.length; i++) {
                    var a:number = parseInt(attr_1[i]);
                    var b:number = parseInt(attr_2[i]);

                    if(i == attr_1.length - 1) {
                        return a < b;
                    } else if(a > b) {
                        return false;
                    } else if(a < b) {
                        return true;
                    }
                }
        }
    }

    static getDifference(attr : string, attr1 : string, attr2 : string) : number {
        var inverter:number = 1;
        if(KPIvalueDate.attributeLessThan(attr, attr1, attr2)) {
            var tmp : string = attr1;
            attr1 = attr2;
            attr2 = tmp;
            inverter = -1;
        }
        switch(attr) {
            case 'year':
            case 'dayOfMonth':
            case 'dayOfWeek':
            case 'weekOfMonth':
            case 'weekOfYear':
            case 'monthOfYear':
            case 'quarterOfYear':
                return (parseInt(attr2) - parseInt(attr1)) * inverter;

            case 'date':
                return (Date.parse(attr2) - Date.parse(attr1)) * inverter;

            case 'day':
                return ((Date.parse(attr2) - Date.parse(attr1)) / 86400000) * inverter;

            case 'week':
                return KPIvalueDate.differenceHelper(attr1, attr2, 52) * inverter;

            case 'month':
                return KPIvalueDate.differenceHelper(attr1, attr2, 12) * inverter;

            case 'quarter':
                return KPIvalueDate.differenceHelper(attr1, attr2, 4) * inverter;
        }
    }

    private static differenceHelper(attr1 : string, attr2 : string, factor : number) : number {
        var attr_1 : string[] = attr1.split('-');
        var attr_2 : string[] = attr2.split('-');
        if(attr_1[0] == attr_2[0]) {
            return parseInt(attr_2[1]) - parseInt(attr_1[1]);
        } else {
            return ((parseInt(attr_2[0]) - parseInt(attr_1[0])) - 1) * factor + (factor - parseInt(attr_1[1])) + parseInt(attr_2[1]);
        }
    }

    static add(attr : string, base : string, sum : number) : string {
        switch(attr) {
            case 'year':
            case 'dayOfMonth':
            case 'dayOfWeek':
            case 'weekOfMonth':
            case 'weekOfYear':
            case 'monthOfYear':
            case 'quarterOfYear':
                return String(parseInt(base) + sum);

            case 'date':
                if(sum < 86400000) sum = 86400000;
                return new Date(Date.parse(base) + sum).toDateString();

            case 'day':
                var d:Date = new Date(Date.parse(base) + sum * 86400000);
                return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDay();

            case 'week':
                return KPIvalueDate.addHelper(base, sum, 52);

            case 'month':
                return KPIvalueDate.addHelper(base, sum, 12);

            case 'quarter':
                return KPIvalueDate.addHelper(base, sum, 4);
        }
    }

    private static addHelper(attr1 : string, sum : number, factor : number) : string {
        var attr_1 : string[] = attr1.split('-');
        var r : number = parseInt(attr_1[0]) * factor + parseInt(attr_1[1]) + sum;
        if(r % factor == 0) {
            return Math.floor(r / factor) + '-' + factor;
        } else {
            return Math.floor(r / factor) + '-' + r % factor;
        }
    }
}
