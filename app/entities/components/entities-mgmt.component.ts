import {Component} from "@angular/core";
import {Control} from '@angular/common';
import {ROUTER_DIRECTIVES} from '@angular/router-deprecated';

import {EntityService} from "../services/entity.service";
import {entitySelectComponent} from "./entity-select.component";
import {Entity} from "../entity";
import {KPIdeckComponent} from "../../KPIs/components/KPIdeck.component";

@Component({
    selector: 'entities-mgmt',
    template: `
        <div class="row">
            <div class="col-md-3" style="border-right: 1px solid #000;">
                <entity-select (entity)="error = null; selected.updateValue($event);"></entity-select>
            </div>
            <div class="col-md-9">
                <div class="row">
                    <div *ngIf="error" class="col-xs-12">
                        <p class="alert alert-danger">{{error}}</p>
                    </div>
                    <div *ngIf="!entity" class="col-xs-12">
                        <div class="alert alert-info">Please start typing the name of an entity and then click on the entity you want to view</div>
                    </div>
                    <div *ngIf="entity" class="col-xs-12">
                        <h2>{{entity.full_name}}</h2>
                        <kpi-deck [config]="KPIconfig" [kpis]="entity.kpis"></kpi-deck>
                    </div>
                </div>
            </div>
        </div>
    `,
    providers: [EntityService],
    directives: [entitySelectComponent, ROUTER_DIRECTIVES, KPIdeckComponent]
})
export class entitiesMgmtComponent {
    private selected : Control = new Control();
    private entity : Entity;
    private error : string;
    private KPIconfig : Object[];

    constructor(private _entityService:EntityService) {
        this.KPIconfig = [
            {
                'type' : 'teams',
                'name' : 'Team KPIs',
                'footer' : 'The Team KPIs are calculated every sunday morning',
                'subtypes' : [
                    {
                        'type' : 'single',
                        'subtype' : 'total',
                        'name' : 'Total'
                    }
                ]
            }, {
                'type' : 'positions',
                'name' : 'Position KPIs',
                'footer' : 'The Position KPIs are calculated every sunday morning',
                'subtypes' : [
                    {
                        'type' : 'single',
                        'subtype' : 'total',
                        'name' : 'Total'
                    }, {
                        'type' : 'double',
                        'subtype' : 'leader',
                        'name' : 'Leader Pos.'
                    }, {
                        'type' : 'vs',
                        'subtype1' : 'leader_teamleader',
                        'name1' : 'Team',
                        'subtype2' : 'leader_subteamleader',
                        'name2' : 'Subteam'
                    }, {
                        'type' : 'double',
                        'subtype' : 'teamleader',
                        'name' : 'Team Leader'
                    }, {
                        'type' : 'double',
                        'subtype' : 'subteamleader',
                        'name' : 'Subteam Leader'
                    }, {
                        'type' : 'double',
                        'subtype' : 'member',
                        'name' : 'Member'
                    }, {
                        'type' : 'double',
                        'subtype' : 'matched',
                        'name' : 'Matched'
                    }, {
                        'type' : 'double',
                        'subtype' : 'leader_matched',
                        'name' : 'Leader Matched'
                    }, {
                        'type' : 'double',
                        'subtype' : 'teamleader_matched',
                        'name' : 'Team Leader Matched'
                    }, {
                        'type' : 'double',
                        'subtype' : 'subteamleader_matched',
                        'name' : 'Subteam Leader Matched'
                    }, {
                        'type' : 'double',
                        'subtype' : 'member_matched',
                        'name' : 'Member Matched'
                    }
                ]
            }, {
                'type' : 'persons',
                'name' : 'Person KPIs',
                'footer' : 'The Person KPIs are calculated every sunday morning',
                'subtypes' : [
                    {
                        'type' : 'single',
                        'subtype' : 'total',
                        'name' : 'Total'
                    }, {
                        'type' : 'double',
                        'subtype' : 'active',
                        'name' : 'Active'
                    }, {
                        'type' : 'double',
                        'subtype' : 'active_approved',
                        'name' : 'Active Approved'
                    }
                ]
            }
        ];
    }

    ngOnInit() {
        this.selected.valueChanges.debounceTime(500)
            .switchMap(entity => this._entityService.get(entity.id))
            .subscribe(
                entity => {
                    this.entity = entity;
                    this.error = null;
                }, error => {
                    this.error = error;
                    this.ngOnInit();
                }
            );
    }
}