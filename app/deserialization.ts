export class Deserialization {
    public static scalar(obj : Object, input : Object, scalar : string[]) : Object {
        if(typeof input == "object") {
            for (var i in scalar) {
                if (input.hasOwnProperty(scalar[i]) && input[scalar[i]] != null) {
                    obj[scalar[i]] = input[scalar[i]];
                } else {
                    obj[scalar[i]] = null;
                }
            }
        }
        return obj;
    }

    public static dates(obj : Object, input : Object, dates : string[]) : Object {
        if(typeof input == "object") {
            for (var i in dates) {
                if (input.hasOwnProperty(dates[i]) && input[dates[i]] != null) {
                    obj[dates[i]] = new Date(input[dates[i]]);
                } else {
                    obj[dates[i]] = null;
                }
            }
        }
        return obj;
    }

    public static object(obj : Object, input : Object, type, keys : string[]) : Object{
        if(typeof input == "object") {
            for (var i in keys) {
                if (input.hasOwnProperty(keys[i]) && input[keys[i]] != null) {
                    obj[keys[i]] = new type().deserialize(input[keys[i]]);
                } else {
                    obj[keys[i]] = null;
                }
            }
        }
        return obj;
    }

    public static objectArray(obj : Object, input : Object, type, keys : string[]) : Object {
        if(typeof input == "object") {
            for(var i in keys) {
                obj[keys[i]] = [];
                if(input.hasOwnProperty(keys[i]) && Array.isArray(input[keys[i]])) {
                    for(var j in input[keys[i]]) {
                        obj[keys[i]][j] = new type().deserialize(input[keys[i]][j]);
                    }
                }
            }
        }
        return obj;
    }

    public static deserialize(input : Object, type) : any {
        return new type().deserialize(input);
    }

    public static deserializeArray(input : Object, type) : any[] {
        var objects : any[] = [];
        for(var i in input) {
            objects[i] = new type().deserialize(input[i]);
        }
        return objects;
    }
}