import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {KPI} from "../KPI";

@Component({
    selector: 'kpi-deck',
    template: `
        <div *ngIf="config" class="card-deck-wrapper">
            <div class="card-deck">
                <div *ngFor="let type of config" class="card">
                    <div *ngIf="type.name" class="card-header">
                        {{type.name}}
                    </div>
                    <div class="card-block">
                        <p *ngIf="!_kpis[type.type]" class="alert alert-warning">No KPIs or you are not allowed to view them.</p>
                        <table *ngIf="_kpis[type.type]" class="table table-sm">
                            <tbody>
                                <tr *ngFor="let subtype of type.subtypes">
                                    <th [ngSwitch]="subtype.type">
                                        <span *ngSwitchCase="'double'">
                                            <a *ngIf="_kpis[type.type][subtype.subtype + '_absolute']" [routerLink]="['KPIdetail', {id: _kpis[type.type][subtype.subtype + '_absolute'].id}]">{{subtype.name}}</a>&nbsp;
                                            <a *ngIf="_kpis[type.type][subtype.subtype + '_relative']" [routerLink]="['KPIdetail', {id: _kpis[type.type][subtype.subtype + '_relative'].id}]">(rel)</a>
                                        </span>
                                        <span *ngSwitchCase="'vs'">
                                            <a *ngIf="_kpis[type.type][subtype.subtype1]" [routerLink]="['KPIdetail', {id: _kpis[type.type][subtype.subtype1].id}]">{{subtype.name1}}</a>
                                            &nbsp;vs.&nbsp;
                                            <a *ngIf="_kpis[type.type][subtype.subtype2]" [routerLink]="['KPIdetail', {id: _kpis[type.type][subtype.subtype2].id}]">{{subtype.name2}}</a>
                                        </span>
                                        <span *ngSwitchCase="'combined'">
                                            <a *ngIf="_kpis[type.type][subtype.subtype1]" [routerLink]="['KPIdetail', {id: _kpis[type.type][subtype.subtype1].id}]">{{subtype.name1}}</a>
                                            &nbsp;
                                            <a *ngIf="_kpis[type.type][subtype.subtype2]" [routerLink]="['KPIdetail', {id: _kpis[type.type][subtype.subtype2].id}]">({{subtype.name2}})</a>
                                        </span>
                                        <span *ngSwitchDefault>
                                            <a *ngIf="_kpis[type.type][subtype.subtype]" [routerLink]="['KPIdetail', {id: _kpis[type.type][subtype.subtype].id}]">{{subtype.name}}</a>
                                        </span>
                                    </th>
                                    <td [ngSwitch]="subtype.type">
                                        <span *ngSwitchCase="'double'">
                                            <span *ngIf="_kpis[type.type][subtype.subtype + '_absolute']">{{_kpis[type.type][subtype.subtype + '_absolute'].getLatestValueFormatted()}}</span>
                                            <span *ngIf="_kpis[type.type][subtype.subtype + '_relative']">&nbsp;({{_kpis[type.type][subtype.subtype + '_relative'].getLatestValueFormatted()}})</span>
                                        </span>
                                        <span *ngSwitchCase="'vs'">
                                            <span *ngIf="_kpis[type.type][subtype.subtype1]">{{_kpis[type.type][subtype.subtype1].getLatestValueFormatted()}}</span>
                                            &nbsp;vs.&nbsp;
                                            <span *ngIf="_kpis[type.type][subtype.subtype2]">{{_kpis[type.type][subtype.subtype2].getLatestValueFormatted()}}</span>
                                        </span>
                                        <span *ngSwitchCase="'combined'">
                                            <span *ngIf="_kpis[type.type][subtype.subtype1]">{{_kpis[type.type][subtype.subtype1].getLatestValueFormatted()}}</span>
                                            <span *ngIf="_kpis[type.type][subtype.subtype2]">&nbsp;({{_kpis[type.type][subtype.subtype2].getLatestValueFormatted()}})</span>
                                        </span>
                                        <span *ngSwitchDefault>
                                            <span *ngIf="_kpis[type.type][subtype.subtype]">{{_kpis[type.type][subtype.subtype].getLatestValueFormatted()}}</span>
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <small *ngIf="type.footer" class="text-muted">{{type.footer}}</small>
                    </div>
                </div>

            </div>
        </div>
    `,
    directives: [ROUTER_DIRECTIVES],
    inputs: ['kpis', 'config']
})
export class KPIdeckComponent {
    public config : Object = {};
    private _kpis : Object;

    set kpis (kpis : KPI[]) {
        this._kpis = {};
        if(Array.isArray(kpis)) {
            for(var i in kpis) {
                if(typeof this._kpis[kpis[i].type] == "undefined") {
                    this._kpis[kpis[i].type] = {};
                }
                this._kpis[kpis[i].type][kpis[i].subtype] = kpis[i];
            }
        }
    }
}