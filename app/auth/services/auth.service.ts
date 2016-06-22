import {Injectable, EventEmitter} from "@angular/core";
import {Http, Headers} from '@angular/http';
import {CookieService} from 'angular2-cookie/core';

import {config} from '../../config'
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {AuthCookie} from "../auth-cookie";
import {Person} from "../../persons/person";

@Injectable()
export class AuthService {
    private oAuthCallbackUrl:string;
    private oAuthTokenUrl:string;
    private oAuthUserUrl:string;
    private authenticated:boolean = null;
    private token:string;
    private expires:Date;
    private userInfo:any = {};
    private expiresTimerId:any = null;

    private tokenWatcher:Subject<string>;
    private statusWatcher:Subject<boolean> = new Subject<boolean>();
    private personWatcher:Subject<Person> = new Subject<Person>();

    constructor(private http:Http, private _cookieService:CookieService) {
        this.oAuthCallbackUrl = config.auth.callbackUrl;
        this.oAuthTokenUrl = config.auth.implicitGrantUrl;
        this.oAuthTokenUrl = this.oAuthTokenUrl
            .replace('__callbackUrl__', config.auth.callbackUrl)
            .replace('__clientId__', config.auth.clientId)
            .replace('__scopes__', config.auth.scopes);
        this.oAuthUserUrl = config.auth.userInfoUrl;
    }

    public doLogin(href) {
        if (href != null) {
            if(typeof this.tokenWatcher == 'undefined') this.tokenWatcher = new Subject<string>();
            var re = /access_token=(.*)/;
            var found = href.match(re);
            if (found) {
                var parsed = this.parse(href.substr(this.oAuthCallbackUrl.length + 1));
                var expiresSeconds = Number(parsed.expires_in) || 1800;
                this.expires = new Date(new Date().getTime() + expiresSeconds*1000);

                this.token = parsed.access_token;

                this.fetchUserInfo();
            } else {
                window.location.href = this.oAuthTokenUrl;
            }
        } else {
            window.location.href = this.oAuthTokenUrl;
        }
    }

    private load() {
        if (this.authenticated === null) {
            let auth:AuthCookie = <AuthCookie>this._cookieService.getObject('aiesec-auth');
            if (typeof auth != 'undefined') {
                if (new Date(auth.expires).getTime() > new Date().getTime()) {
                    this.token = auth.token;
                    this.expires = new Date(auth.expires);
                    this.fetchUserInfo();
                } else {
                    this.authenticated = false;
                    this._cookieService.remove('aiesec-auth');
                    window.location.href = this.oAuthTokenUrl;
                }
            } else {
                window.location.href = this.oAuthTokenUrl;
            }
        }
    }

    private fetchUserInfo() {
        if (this.token != null) {
            this.http.get(this.oAuthUserUrl + '&access_token=' + this.token)
                .map(res => res.json())
                .subscribe(info => {
                    this.userInfo = info;
                    this.authenticated = true;
                    this.startExpiresTimer();
                    this.save();
                    this.statusWatcher.next(true);
                    this.tokenWatcher.next(this.token);
                    //noinspection TypeScriptUnresolvedVariable
                    this.personWatcher.next(<Person>info.person);
                }, err => {
                    if(err.status == 401) {
                        window.location.href = this.oAuthTokenUrl;
                    } else {
                        console.error("Failed to fetch user info:", err);
                    }
                });
        }
    }

    public doLogout() {
        this.authenticated = false;
        this.expiresTimerId = null;
        this.expires = new Date(0);
        this.token = null;
        this.statusWatcher.next(false);
        this._cookieService.remove('aiesec-auth');
    }

    public getToken() : Observable<string> {
        if(this.authenticated === null) {
            if(typeof this.tokenWatcher == 'undefined') {
                this.tokenWatcher = new Subject<string>();
                this.load();
            }
            return this.tokenWatcher.asObservable();
        } else if(this.authenticated) {
            //noinspection TypeScriptUnresolvedFunction
            return Observable.from([this.token]);
        } else {
            window.location.href = this.oAuthTokenUrl;
            return Observable.throw("Unauthenticated");
        }
    }

    public subscribe() : Observable<boolean> {
        return this.statusWatcher.asObservable();
    }

    public getCurrentPerson() : Observable<Person> {
        if(this.authenticated === null) {
            if(typeof this.tokenWatcher == 'undefined') {
                this.tokenWatcher = new Subject<string>();
                this.load();
            }
            return this.personWatcher.asObservable();
        } else if(this.authenticated) {
            //noinspection TypeScriptUnresolvedFunction
            return Observable.from([<Person>this.userInfo.person]);
        } else {
            window.location.href = this.oAuthTokenUrl;
            return Observable.throw("Unauthenticated");
        }
    }

    public getRedirectUrl() {
        return this.oAuthTokenUrl;
    }

    private startExpiresTimer() {
        if (this.expiresTimerId != null) {
            clearTimeout(this.expiresTimerId);
        }
        this.expiresTimerId = setTimeout(() => {
            this.doLogout();
        }, (this.expires.getTime() - new Date().getTime()));
    }

    private save() {
        if(this.authenticated === true) {
            this._cookieService.putObject('aiesec-auth', {token: this.token, expires: this.expires}, {expires: this.expires});
        }
    }

    private parse(str) { // lifted from https://github.com/sindresorhus/query-string
        if (typeof str !== 'string') {
            return {};
        }

        str = str.trim().replace(/^(\?|#|&)/, '');

        if (!str) {
            return {};
        }

        return str.split('&').reduce(function (ret, param) {
            var parts = param.replace(/\+/g, ' ').split('=');
            // Firefox (pre 40) decodes `%3D` to `=`
            // https://github.com/sindresorhus/query-string/pull/37
            var key = parts.shift();
            var val = parts.length > 0 ? parts.join('=') : undefined;

            key = decodeURIComponent(key);

            // missing `=` should be `null`:
            // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
            val = val === undefined ? null : decodeURIComponent(val);

            if (!ret.hasOwnProperty(key)) {
                ret[key] = val;
            } else if (Array.isArray(ret[key])) {
                ret[key].push(val);
            } else {
                ret[key] = [ret[key], val];
            }

            return ret;
        }, {});
    };
}