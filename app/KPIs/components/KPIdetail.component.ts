import {Component, OnInit} from '@angular/core';
import {RouteParams, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {CHART_DIRECTIVES} from 'ng2-charts/ng2-charts';
import {KPIService} from "../services/KPI.service";
import {KPI} from "../KPI";

@Component({
    selector: 'kpi-detail',
    styles : [
        '.chart { display : block; }'
    ],
    template: `
        <div class="row">
            <div class="col-xs-12">
                <h1>KPI Details</h1>
                <table *ngIf="kpi" class="table">
                    <tbody>
                        <tr>
                            <th>Type</th>
                            <th>Subtype</th>
                            <th>Measurable Type</th>
                            <th>Measurable Name</th>
                        </tr>
                        <tr>
                            <td>{{kpi.type}}</td>
                            <td>{{kpi.subtype}}</td>
                            <td>{{kpi.measurable_type}}</td>
                            <td *ngIf="kpi.measurable">{{kpi.measurable.getName()}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="row" *ngIf="kpi">
            <div class="col-xs-12 col-md-10">
                <base-chart class="chart" [datasets]="chartData" [labels]="chartLabels" chartType="line"></base-chart>
            </div>
            <div class="col-xs-12 col-md-2">
                <h2>Actions</h2>
                <ul class="list-group">
                    <a class="list-group-item" [routerLink]="['KPIcompare', {measurable_type: kpi.measurable_type, type: kpi.type, subtype: kpi.subtype, measurable_id_1: kpi.measurable.id}]">Compare</a>
                    <a class="list-group-item" [routerLink]="['KPIaggregate', {measurable_type: kpi.measurable_type, type: kpi.type, subtype: kpi.subtype, measurable_id_1: kpi.measurable.id}]">Aggregate</a>
                </ul>
            </div>
        </div>
    `,
    directives : [CHART_DIRECTIVES, ROUTER_DIRECTIVES],
    providers : [KPIService]
})
export class KPIdetailComponent implements OnInit {

    private kpi:KPI;
    private error:string;
    private chartData : Object[];
    private chartLabels : string[];

    constructor(private _params : RouteParams, private _kpiService:KPIService) {}

    ngOnInit() {
        this._kpiService.get(parseInt(this._params.get('id'))).subscribe(kpi => {
            this.kpi = kpi;
            let data : number[] = [];
            let labels : string[] = [];
            for(var i = kpi.values.length - 1, j = 0; i >= 0; i--, j++) {
                data[j] = kpi.values[i].value;
                labels[j] = kpi.values[i].date.date.toDateString();
            }
            this.chartData = [{data : data, label : kpi.unit}];
            this.chartLabels = labels;
        }, error => this.error = error);
    }
}