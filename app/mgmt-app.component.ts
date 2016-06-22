import {Component} from '@angular/core';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from "@angular/router-deprecated";
import {HTTP_PROVIDERS} from "@angular/http";
import {CookieService} from 'angular2-cookie/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';

import 'rxjs/add/observable/from';
import 'rxjs/add/observable/throw';

import {AuthService} from './auth/services/auth.service';

import {CallbackComponent} from "./auth/components/callback.component";
import {dashboardComponent} from "./dashboard/components/dashboard.component";
import {personsMgmtComponent} from "./persons/component/persons-mgmt.component";
import {entitiesMgmtComponent} from "./entities/components/entities-mgmt.component";
import {teamsMgmtComponent} from "./teams/components/teams-mgmt.component";
import {KPIdetailComponent} from "./KPIs/components/KPIdetail.component";
import {KPIcompareComponent} from "./KPIs/components/KPIcompare.component";
import {KPIaggregateComponent} from "./KPIs/components/KPIaggregate.component";

@Component({
    selector: 'mgmt-app',
    styles: [
        'a.router-link-active { color: #fff !important; }'
    ],
    template: `
        <nav class="navbar navbar-dark navbar-fixed-top bg-inverse">
            <a class="navbar-brand">Management</a>
            <ul class="nav navbar-nav">
                <li class="nav-item">
                    <a class="nav-link" [routerLink]="['Dashboard']">Dashboard</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" [routerLink]="['Persons']">Persons</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" [routerLink]="['Teams']">Teams</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" [routerLink]="['Entities']">Entities</a>
                </li>
            </ul>
        </nav>
        <div class="container-fluid" style="display: block; margin-top: 5rem;">
            <router-outlet></router-outlet>
        </div>
    `,
    directives: [ROUTER_DIRECTIVES],
    providers: [ROUTER_PROVIDERS, AuthService, HTTP_PROVIDERS, CookieService]
})
@RouteConfig([
    {
        path: '/',
        name: 'Dashboard',
        component: dashboardComponent
    }, {
        path: '/persons',
        name: 'Persons',
        component: personsMgmtComponent
    }, {
        path: '/teams',
        name: 'Teams',
        component: teamsMgmtComponent
    }, {
        path: '/entities',
        name: 'Entities',
        component: entitiesMgmtComponent
    }, {
        path: '/kpis/:id',
        name: 'KPIdetail',
        component: KPIdetailComponent
    }, {
        path: 'kpis/compare/:measurable_type/:type/:subtype/:measurable_id_1',
        name : 'KPIcompare',
        component: KPIcompareComponent
    }, {
        path : 'kpis/aggregate/:measurable_type/:type/:subtype/:measurable_id_1',
        name : 'KPIaggregate',
        component: KPIaggregateComponent
    }, {
        path: '/signin',
        name: 'OAuth2Callback',
        component: CallbackComponent
    }
])
export class MgmtAppComponent {
    constructor() {}
}