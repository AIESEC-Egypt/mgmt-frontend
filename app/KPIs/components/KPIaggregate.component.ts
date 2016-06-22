import {Component, OnInit} from '@angular/core';
import {RouteParams} from '@angular/router-deprecated';
import {CHART_DIRECTIVES} from 'ng2-charts/ng2-charts';
import {Observable} from "rxjs/Observable";

import {KPI} from "../KPI";
import {KPIService} from "../services/KPI.service";
import {Measurable} from "../measurable";
import {entitySelectComponent} from "../../entities/components/entity-select.component";
import {KPIvalueDate} from "../KPIvalueDate";
import {MathHelper} from "../../mathHelper";
import {personSelectComponent} from "../../persons/component/person-select.component";
import {teamSelectComponent} from "../../teams/components/team-select.component";

@Component({
    selector: 'kpi-aggregate',
    styles : [
        '.chart { display : block; }'
    ],
    template: `
        <div class="row">
            <div class="col-xs-12">
                <h1>KPI Aggregate</h1>
                <p *ngIf="error" class="alert alert-danger">{{error}}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-xs-12 col-md-3">
                <entity-select *ngIf="measurableType=='Entity'" multiple="true" [selected]="selectInit" (entities)="measurables = $event; load();"></entity-select>
                <person-select *ngIf="measurableType=='Person'" multiple="true" [selected]="selectInit" (persons)="measurables = $event; load();"></person-select>
                <team-select *ngIf="measurableType=='Team'" multiple="true" [selected]="selectInit" (teams)="measurables = $event; load();"></team-select>
            </div>
            <div class="col-xs-12 col-md-9">
                <div class="row">
                    <div class="col-xs-12">
                        <table class="table">
                            <tbody>
                                <tr>
                                    <th>Type</th>
                                    <th>Subtype</th>
                                    <th>Measurable Type</th>
                                    <th>Aggregate Function</th>
                                    <th>Aggregate By</th>
                                    <th>Chart Type</th>
                                </tr>
                                <tr>
                                    <td>{{type}}</td>
                                    <td>{{subtype}}</td>
                                    <td>{{measurableType}}</td>
                                    <td>
                                        <div class="dropdown" [class.open]="aggregateFunctionDropdownOpen">
                                            <button class="btn btn-secondary dropdown-toggle" type="button" (click)="aggregateFunctionDropdownOpen = !aggregateFunctionDropdownOpen">{{aggregateFunction}}</button>
                                            <div class="dropdown-menu">
                                                <button class="dropdown-item" type="button" *ngFor="let function of aggregateFunctions" (click)="aggregateFunction = function; aggregateFunctionDropdownOpen = false; load();">{{function}}</button>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="dropdown" [class.open]="aggregateByDropdownOpen">
                                            <button class="btn btn-secondary dropdown-toggle" type="button" (click)="aggregateByDropdownOpen = !aggregateByDropdownOpen">{{aggregateBy}}</button>
                                            <div class="dropdown-menu">
                                                <button class="dropdown-item" type="button" *ngFor="let attr of aggregateByAttrs" (click)="aggregateBy = attr; aggregateByDropdownOpen = false; load();">{{(attr == 'Measurable') ? measurableType : attr}}</button>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="dropdown" [class.open]="chartTypeDropdownOpen">
                                            <button class="btn btn-secondary dropdown-toggle" type="button" (click)="chartTypeDropdownOpen = !chartTypeDropdownOpen">{{chartType}}</button>
                                            <div class="dropdown-menu">
                                                <button class="dropdown-item" type="button" *ngFor="let type of chartTypes" (click)="chartType = type; chartTypeDropdownOpen = false;">{{type}}</button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="row">
                    <div class="col-xs-12" *ngIf="chartData.length > 0">
                        <base-chart class="chart" [datasets]="chartData" [labels]="chartLabels" [chartType]="chartType"></base-chart>
                        <p class="text-warning">Attention: X values must not be linear!</p>
                    </div>
                </div>
            </div>
        </div>
    `,
    directives : [CHART_DIRECTIVES, entitySelectComponent, personSelectComponent, teamSelectComponent],
    providers : [KPIService]
})
export class KPIaggregateComponent implements OnInit {
    private error:string;

    private type:string;
    private subtype:string;
    private measurableType:string;
    private selectInit : string | number;
    private measurables : Measurable[] = [];

    private chartData : any = [];
    private chartLabels : string[];

    private aggregateFunction : string = 'Total';
    private aggregateFunctions : string[] = ['Average', 'Total', 'Maximum', 'Minimum', 'Standard Deviation', 'Standard Variance'];
    private aggregateFunctionDropdownOpen : boolean = false;
    
    private aggregateBy : string = 'date';
    private aggregateByAttrs : string[] = ['Measurable', 'date', 'day', 'week', 'month', 'quarter', 'year', 'dayOfMonth', 'dayOfWeek', 'weekOfMonth', 'weekOfYear', 'monthOfYear', 'quarterOfYear'];
    private aggregateByDropdownOpen : boolean = false;

    private chartType : string = "line";
    private chartTypes : string[] = ["line", "bar"];
    private chartTypeDropdownOpen : boolean = false;

    constructor(private _params:RouteParams, private _kpiService:KPIService) {}

    ngOnInit() {
        this.measurableType = this._params.get('measurable_type');
        this.type = this._params.get('type');
        this.subtype = this._params.get('subtype');
        if(this._params.get('measurable_id_1') != null) {
            this.selectInit = this._params.get('measurable_id_1');
        }
        this.load();
    }
    
    load() {
        this.error = null;
        let measurableIds : number[] = [];
        for(var i = 0; i < this.measurables.length; i++) {
            measurableIds.push(this.measurables[i].id);
        }

        if(measurableIds.length < 1) {
            this.error = "You need to select at least one " + this.measurableType;
            return;
        }

        this._kpiService.aggregate(this.type, this.subtype, this.measurableType, this.aggregateBy, this.aggregateFunction, measurableIds)
            .subscribe(values => {
                let chartData : any = [{label: this.aggregateFunction, data : []}];
                let chartLabels : string[] = [];

                for(var i = values.length - 1; i >= 0; i--) {
                    chartData[0].data.push(values[i].value);
                    chartLabels.push(values[i].dependent);
                }
                this.chartData = chartData;
                this.chartLabels = chartLabels;
            }, error => this.error = error);
    }
}