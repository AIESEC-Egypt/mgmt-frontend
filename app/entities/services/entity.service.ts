import {config} from '../../config'
import {Injectable} from "@angular/core";

import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable}     from 'rxjs/Observable';

import {AuthService} from '../../auth/services/auth.service';

import {Entity} from '../entity';
import {Deserialization} from "../../deserialization";


@Injectable()
export class EntityService {
    constructor(private _authService: AuthService, private _http:Http) {}

    get(id:number | string) : Observable<Entity> {
        return this._authService.getToken().flatMap(token =>
            this._http.get(config.API_BASE + 'v1/entities/' + id + '.json?access_token=' + token)
                .map(res => <Entity>Deserialization.deserialize(res.json().entity, Entity))
                .catch(this.handleError)
        );
    }

    autocomplete(q:string):Observable<Entity[]> {
        return this._authService.getToken().flatMap(token =>
            this._http.get(config.API_BASE + 'v1/entities/autocomplete.json?q=' + q + '&access_token=' + token)
                .map(res => <Entity[]>Deserialization.deserializeArray(res.json().entities, Entity))
                .catch(this.handleError)
        );
    }

    private handleError (error: Response) {
        var e:string = 'Server error or invalid response';
        if(typeof error.json == "function" && typeof error.json().status != 'undefined' && typeof error.json().status.message != 'undefined') e = error.json().status.message;
        return Observable.throw(e);
    }
}