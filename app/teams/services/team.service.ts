import {config} from '../../config'
import {Injectable} from "@angular/core";

import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable}     from 'rxjs/Observable';

import {AuthService} from '../../auth/services/auth.service';

import {Team} from '../team';
import {Deserialization} from "../../deserialization";


@Injectable()
export class TeamService {
    constructor(private _authService: AuthService, private _http:Http) {}

    get(id:number | string) : Observable<Team> {
        return this._authService.getToken().flatMap(token =>
            this._http.get(config.API_BASE + 'v1/teams/' + id + '.json?access_token=' + token)
                .map(res => <Team>Deserialization.deserialize(res.json().team, Team))
                .catch(this.handleError)
        );
    }
    
    autocomplete(q:string):Observable<Team[]> {
        return this._authService.getToken().flatMap(token =>
            this._http.get(config.API_BASE + 'v1/teams/autocomplete.json?q=' + q + '&access_token=' + token)
                .map(res => <Team[]>Deserialization.deserializeArray(res.json().teams, Team))
                .catch(this.handleError)
        );
    }

    private handleError (error: Response) {
        var e:string = 'Server error or invalid response';
        if(typeof error.json == "function" && typeof error.json().status != 'undefined' && typeof error.json().status.message != 'undefined') e = error.json().status.message;
        return Observable.throw(e);
    }
}