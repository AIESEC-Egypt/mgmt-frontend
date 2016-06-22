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
    selector: 'kpi-compare',
    styles : [
        '.chart { display : block; }'
    ],
    template: `
        <div class="row">
            <div class="col-xs-12">
                <h1>KPI Compare</h1>
                <p *ngIf="error" class="alert alert-danger">{{error}}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-xs-12 col-md-3">
                <entity-select *ngIf="measurable_type=='Entity'" multiple="true" [selected]="selectInit" (entities)="prepMeasurables($event);"></entity-select>
                <person-select *ngIf="measurable_type=='Person'" multiple="true" [selected]="selectInit" (persons)="prepMeasurables($event);"></person-select>
                <team-select *ngIf="measurable_type=='Team'" multiple="true" [selected]="selectInit" (teams)="prepMeasurables($event);"></team-select>
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
                                    <th>Date Attribute</th>
                                    <th>Chart Type</th>
                                    <!--<th>Actions</th>-->
                                </tr>
                                <tr>
                                    <td>{{type}}</td>
                                    <td>{{subtype}}</td>
                                    <td>{{measurable_type}}</td>
                                    <td>
                                        <div class="dropdown" [class.open]="dateDropdownOpen">
                                            <button class="btn btn-secondary dropdown-toggle" type="button" (click)="dateDropdownOpen = !dateDropdownOpen">{{dateAttr}}</button>
                                            <div class="dropdown-menu">
                                                <button class="dropdown-item" type="button" *ngFor="let attr of dateAttrs" (click)="changeDateAttr(attr)">{{attr}}</button>
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
                                    <!-- Doesn't really work yet, most probably have to configure chart.js x axis to linear to make it work
                                    <td>
                                        <button class="btn btn-secondary" type="button" (click)="linearizeX()">Linearize X</button>
                                    </td>
                                    -->
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="row">
                    <div class="col-xs-12" *ngIf="kpis.length > 0">
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
export class KPIcompareComponent implements OnInit {
    private error:string;

    private type:string;
    private subtype:string;
    private measurable_type:string;
    private selectInit : number | string;

    private kpis:KPI[] = [];

    private chartData : any;
    private chartLabels : string[];

    private dateAttr : string = 'date';
    private dateAttrs : string[] = ['date', 'day', 'week', 'month', 'quarter', 'year', 'dayOfMonth', 'dayOfWeek', 'weekOfMonth', 'weekOfYear', 'monthOfYear', 'quarterOfYear'];
    private dateDropdownOpen : boolean = false;

    private chartType : string = "line";
    private chartTypes : string[] = ["line", "bar"];
    private chartTypeDropdownOpen : boolean = false;

    constructor(private _params:RouteParams, private _kpiService:KPIService) {}

    ngOnInit() {
        this.measurable_type = this._params.get('measurable_type');
        this.type = this._params.get('type');
        this.subtype = this._params.get('subtype');
        if(this._params.get('measurable_id_1') != null) {
            this.selectInit = this._params.get('measurable_id_1');
        }
    }

    changeDateAttr(dateAttr : string) {
        this.dateAttr = dateAttr;
        this.dateDropdownOpen = false;
        this.prepData();
    }

    prepMeasurables(measurables : Measurable[]) {
        this.error = null;
        let toLoad : number[] = [];
        for(var i = 0; i < measurables.length; i++) {
            let isIn : boolean = false;
            for(var j = 0; j < this.kpis.length; j++) {
                if(!isIn && this.kpis[j].measurable.id == measurables[i].id) {
                    isIn = true;
                }
            }
            if(!isIn) {
                toLoad.push(measurables[i].id);
            }
        }
        if(toLoad.length + this.kpis.length != measurables.length) {
            for(var i = 0; i < this.kpis.length; i++) {
                let isIn : boolean = false;
                for(var j = 0; j < measurables.length; j++) {
                    if(!isIn && measurables[j].id == this.kpis[i].measurable.id) {
                        isIn = true;
                    }
                }
                if(!isIn) {
                    this.kpis.splice(i, 1);
                }
            }

        }
        if(toLoad.length == 0) {
            this.prepData();
        } else {
            Observable.from(toLoad).flatMap(id =>
                this._kpiService.getBySubtypeAndMeasurable(this.type, this.subtype, this.measurable_type, id)
            ).subscribe(kpi => {
                this.kpis.push(kpi);
                if (this.kpis.length == measurables.length) {
                    this.prepData();
                }
            }, error => this.error = error);
        }
    }

    prepData() {
        let chartData : any = [];
        let chartLabels : string[] = [];
        for(var i = 0; i < this.kpis.length; i++) {
            chartData[i] = {label : this.kpis[i].measurable.getName(), data : []};
            for(var j = this.kpis[i].values.length - 1; j > 0; j--) {
                // get date attribute as string
                if(this.dateAttr == 'date') {
                    var date:string = this.kpis[i].values[j].date.date.toDateString();
                } else {
                    var date:string = String(this.kpis[i].values[j].date[this.dateAttr]);
                }

                // try to find the date attribute in the labels array
                var index = chartLabels.indexOf(date);

                // if it is not in there, add it
                if(index < 0) {
                    // handle left edge case
                    if(chartLabels.length > 0 && !KPIvalueDate.attributeLessThan(this.dateAttr, date, chartLabels[0])) {
                        // start on left side
                        index = 0;

                        // search for index
                        while (index < chartLabels.length && KPIvalueDate.attributeLessThan(this.dateAttr, chartLabels[index], date)) {
                            index++;
                        }
                    } else {
                        index = 0;
                    }

                    // insert the label
                    chartLabels.splice(index, 0, date);

                    // move the already inserted values
                    for(var k = 0; k < chartData.length - 1; k++) {
                        chartData[k].data.splice(index, 0, null);
                    }
                }
                
                // insert data at the right index
                chartData[i].data[index] = this.kpis[i].values[j].value;
            }
        }
        this.chartData = chartData;
        this.chartLabels = chartLabels;
    }

    linearizeX() {
        // reset error
        this.error = null;

        // get differences
        var diffs : number[] = [];
        for(var i = 1; i < this.chartLabels.length; i++) {
            var d : number = KPIvalueDate.getDifference(this.dateAttr, this.chartLabels[i-1], this.chartLabels[i]);
            if(diffs.indexOf(d) < 0) {
                diffs.push(d);
            }
        }

        // check if the spaces are different
        if(diffs.length == 1) {
            return;
        }

        // calculate highest common difference
        var diff : number = MathHelper.gcd_array(diffs);

        // check if we can linearize the values
        if(diff == 0) {
            this.error = "Could not find smallest common difference between X values";
        } else {
            // create temp copy of current data
            var chartData : any = this.chartData;
            var chartLabels : string[] = this.chartLabels;

            // go through all chart labels
            for(var i = 0; i < chartLabels.length - 1; i++) {
                // if the difference to the next one is bigger than the common factor
                if(KPIvalueDate.getDifference(this.dateAttr, chartLabels[i], chartLabels[i+1]) > diff) {
                    // add a new label inbetween
                    chartLabels.splice(i+1, 0, KPIvalueDate.add(this.dateAttr, chartLabels[i], diff));

                    // go through all datasets and add a null value inbetween
                    for(var j = 0; j < chartData.length; j++) {
                        chartData[j].data.splice(i+1, 0, null);
                    }
                }

                // loop limit to don't break the site
                if(i > 500) {
                    this.error = "Smallest Common difference between X values too small!";
                    return;
                }
            }
            this.chartLabels = chartLabels;
            this.chartData = chartData;
        }
    }
}