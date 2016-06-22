import {Component, OnInit} from "@angular/core";
import {ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {Control} from "@angular/common";

import {Person} from "../person";
import {PersonService} from "../services/person.service";
import {personSelectComponent} from "./person-select.component";
import {tasklistComponent} from "../../tasks/components/tasklist.component";
import {newTaskComponent} from "../../tasks/components/new-task.component";
import {TaskTimePipe} from "../../tasks/pipes/task-time.pipe";
import {Task} from "../../tasks/task";
import {KPIdeckComponent} from "../../KPIs/components/KPIdeck.component";

@Component({
    selector: 'persons-mgmt',
    template: `
        <div class="row">
            <div class="col-md-3" style="border-right: 1px solid #000;">
                <person-select (person)="selected.updateValue($event);"></person-select>
            </div>
            <div class="col-md-9">
                <div class="row">
                    <div *ngIf="error" class="col-xs-12">
                        <p class="alert alert-danger">{{error}}</p>
                    </div>
                    <div *ngIf="!person" class="col-xs-12">
                        <p class="alert alert-info">Please start typing the name of a person and then click on the person you want to view</p>
                    </div>
                    <div *ngIf="person" class="col-xs-12">
                        <h1>{{person.full_name}}</h1>
                        <kpi-deck [config]="KPIconfig" [kpis]="person.kpis"></kpi-deck>
                    </div>
                </div>
                <hr *ngIf="person" />
                <div class="row" *ngIf="person">
                    <div class="col-xs-12">
                        <h2>Tasks</h2>
                    </div>
                    <div class="col-xs-6">
                        <tasklist [personId]="person.id" [tasks]="tasks"></tasklist>
                    </div>
                    <div class="col-xs-6">
                        <new-task [inline]="false" [personId]="person.id" (tasks)="tasks = $event;"></new-task>
                    </div>
                </div>
            </div>
        </div>
    `,
    directives: [personSelectComponent, ROUTER_DIRECTIVES, newTaskComponent, tasklistComponent, KPIdeckComponent],
    pipes: [TaskTimePipe],
    providers: [PersonService]
})
export class personsMgmtComponent implements OnInit {
    private selected : Control = new Control();
    private person : Person;
    private tasks : Task[];
    private error : string;
    private KPIconfig : Object[];

    constructor(private _personService:PersonService) {
        this.KPIconfig = [
            {
                'type' : 'tasks',
                'name' : 'Task KPIs',
                'footer' : 'The Task KPIs are calculated on sunday morning for all persons with task activity in the last two weeks.',
                'subtypes' : [
                    {
                        'type' : 'single',
                        'subtype' : 'due_total',
                        'name' : 'Total Tasks due'
                    }, {
                        'type' : 'double',
                        'subtype' : 'due_missed',
                        'name' : 'Due missed'
                    }, {
                        'type' : 'combined',
                        'subtype1' : 'estimated_time_total',
                        'name1' : 'Estimated Time',
                        'subtype2' : 'estimated_time_approved',
                        'name2' : 'approved'
                    }, {
                        'type' : 'combined',
                        'subtype1' : 'needed_time_total',
                        'name1' : 'Needed Time',
                        'subtype2' : 'needed_time_approved',
                        'name2' : 'approved'
                    }
                ]
            }
        ];
    }

    ngOnInit() {
        this.selected.valueChanges.debounceTime(500)
            .switchMap(person => this._personService.get(person.id))
            .subscribe(person => this.person = person, error => {
                this.error = error;
                this.ngOnInit();
            });
    }
}