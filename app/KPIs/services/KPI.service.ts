import {config} from '../../config'
import {Injectable} from "@angular/core";

import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable}     from 'rxjs/Observable';

import {AuthService} from '../../auth/services/auth.service';

import {KPI} from '../KPI';
import {Deserialization} from "../../deserialization";
import {KPIvalue} from "../KPIvalue";
import {KPIvalueAggregated} from "../KPIvalueAggregated";

@Injectable()
export class KPIService {
    constructor(private _authService: AuthService, private _http:Http) {}

    get(id:number) : Observable<KPI> {
        return this._authService.getToken().flatMap(token =>
            this._http.get(config.API_BASE + 'v1/kpis/' + id + '.json?access_token=' + token)
                .map(res => <KPI>Deserialization.deserialize(res.json().kpi, KPI))
                .catch(this.handleError)
        );
    }

    getBySubtypeAndMeasurable(type:string, subtype:string, measurable_type:string, id:number | string) : Observable<KPI> {
        return this._authService.getToken().flatMap(token =>
            this._http.get(config.API_BASE + 'v1/kpis/bySubtypeAndMeasurable/' + type + '/' + subtype + '/' + measurable_type + '/' + id + '.json?access_token=' + token)
                .map(res => <KPI>Deserialization.deserialize(res.json().kpi, KPI))
                .catch(this.handleError)
        );
    }

    aggregate(kpi_type : string, kpi_subtype : string, measurable_type : string, aggregate_by: string, aggregate_function : string, measurables : number[], limit : number = null, offset : number = null) : Observable<KPIvalueAggregated[]> {
        let url:string = config.API_BASE + 'v1/kpis/aggregate/' + kpi_type + '/' + kpi_subtype + '/' + measurable_type + '/' + aggregate_by + '/' + aggregate_function + '.json?';
        if (limit != null) {
            url += 'limit=' + limit + '&';
        }
        if (offset != null) {
            url += 'offset=' + offset + '&';
        }
        for (var i = 0; i < measurables.length; i++) {
            url += 'measurable_ids[]=' + measurables[i] + '&';
        }
        return this._authService.getToken().flatMap(token =>
            this._http.get(url + 'access_token=' + token)
                .map(res => <KPIvalueAggregated[]>res.json().values)
                .catch(this.handleError)
        );
    }

    values(id:number, limit:number = null, offset : number = null) : Observable<KPIvalue[]> {
        let url : string = config.API_BASE + 'v1/kpis/' + id + '/values.json?';
        if(limit != null) {
            url += 'limit=' + limit + '&';
        }
        if(offset != null) {
            url += 'offset=' + offset + '&';
        }
        return this._authService.getToken().flatMap(token =>
            this._http.get(url + 'access_token=' + token)
                .map(res => <KPIvalue[]>Deserialization.deserializeArray(res.json().values, KPIvalue))
                .catch(this.handleError)
        );
    }

    private handleError (error: Response) {
        var e:string = 'Server error or invalid response';
        if(typeof error.json == "function" && typeof error.json().status != 'undefined' && typeof error.json().status.message != 'undefined') e = error.json().status.message;
        return Observable.throw(e);
    }
}