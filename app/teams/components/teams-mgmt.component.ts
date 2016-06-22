import {Component, OnInit} from "@angular/core";
import {ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {Control} from "@angular/common";

import {Team} from "../team";
import {TeamService} from "../services/team.service";
import {teamSelectComponent} from "./team-select.component";
import {KPIdeckComponent} from "../../KPIs/components/KPIdeck.component";

@Component({
    selector: 'teams-mgmt',
    template: `
        <div class="row">
            <div class="col-md-3" style="border-right: 1px solid #000;">
                <team-select (team)="error = null; selected.updateValue($event);"></team-select>
            </div>
            <div class="col-md-9">
                <div class="row">
                    <div *ngIf="error" class="col-xs-12">
                        <p class="alert alert-danger">{{error}}</p>
                    </div>
                    <div *ngIf="!team" class="col-xs-12">
                        <div class="alert alert-info">Please start typing the name of a team and then click on the team you want to view</div>
                    </div>
                    <div *ngIf="team" class="col-xs-12">
                        <h1>{{team.title}}<span *ngIf="team.term">&nbsp;({{team.term.short_name}})</span><small *ngIf="team.term && team.term.entity">&nbsp;{{team.term.entity.full_name}}</small></h1>
                        <kpi-deck [config]="KPIconfig" [kpis]="team.kpis"></kpi-deck>
                    </div>
                </div>
            </div>
        </div>
    `,
    providers: [TeamService],
    directives: [teamSelectComponent, ROUTER_DIRECTIVES, KPIdeckComponent]
})
export class teamsMgmtComponent {
    private selected : Control = new Control();
    private team : Team;
    private error : string;
    private KPIconfig : Object[];
    
    constructor(private _teamService : TeamService) {
        this.KPIconfig = [
            {
                'type': 'positions',
                'name': 'Position KPIs',
                'footer': 'The Position KPIs are calculated every sunday morning for all teams of the current Term',
                'subtypes': [
                    {
                        'type': 'single',
                        'subtype': 'total',
                        'name': 'Total'
                    }, {
                        'type': 'double',
                        'subtype': 'matched',
                        'name': 'Matched'
                    }
                ]
            }, {
                'type': 'persons',
                'name': 'Person KPIs',
                'footer': 'The Person KPIs are calculated every sunday morning for all teams of the current Term',
                'subtypes': [
                    {
                        'type': 'single',
                        'subtype': 'total',
                        'name': 'Total'
                    }, {
                        'type' : 'double',
                        'subtype' : 'active',
                        'name' : 'Active'
                    }, {
                        'type' : 'double',
                        'subtype' : 'active_approved',
                        'name' : 'Active approved'
                    }
                ]
            }
        ];
    }

    ngOnInit() {
        this.selected.valueChanges.debounceTime(500)
            .switchMap(team => this._teamService.get(team.id))
            .subscribe(team => this.team = team, error => {
                this.error = error;
                this.ngOnInit();
            });
    }
}