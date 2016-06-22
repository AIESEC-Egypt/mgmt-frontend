import {config} from '../../config'
import {Injectable} from "@angular/core";

import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable}     from 'rxjs/Observable';

import {AuthService} from '../../auth/services/auth.service';

import {Task} from '../../tasks/task';
import {Person} from "../person";
import {Deserialization} from "../../deserialization";


@Injectable()
export class PersonService {
    constructor(private _authService: AuthService, private _http: Http) {}

    get(id:number | string) : Observable<Person> {
        return this._authService.getToken().flatMap(token =>
            this._http.get(config.API_BASE + 'v1/persons/' + id + '.json?access_token=' + token)
                .map(res => <Person>Deserialization.deserialize(res.json().person, Person))
                .catch(this.handleError)
        );
    }

    autocomplete(q:string):Observable<Person[]> {
        return this._authService.getToken().flatMap(token =>
            this._http.get(config.API_BASE + 'v1/persons/autocomplete.json?q=' + q + '&access_token=' + token)
                .map(res => <Person[]>Deserialization.deserializeArray(res.json().persons, Person))
                .catch(this.handleError)
        );
    }
    
    getTasks(id:number): Observable<Task[]> {
        return this._authService.getToken().flatMap(token =>
            this._http.get(config.API_BASE + 'v1/persons/' + id + '/tasks.json?access_token=' + token)
                .map(res => <Task[]>Deserialization.deserializeArray(res.json().tasks, Task))
                .catch(this.handleError)
        );
    }

    private handleError (error: Response) {
        var e:string = 'Server error or invalid response';
        if(typeof error.json == 'function' && typeof error.json().status != 'undefined' && typeof error.json().status.message != 'undefined') e = error.json().status.message;
        return Observable.throw(e);
    }
}