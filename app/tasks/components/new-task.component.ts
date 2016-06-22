import {Component, EventEmitter} from "@angular/core";
import {TaskService} from "../services/task.service";
import {Task} from '../task';

@Component({
    selector: 'new-task',
    template: `
        <div class="container">
            <form class="row" [class.form-inline]="inline" (ngSubmit)="createTask()" style="background-color: #eee; padding-top: 1em;">
                <div *ngIf="error" class="col-xs-12">
                    <p class="alert alert-danger">{{error}}</p>
                </div>
                <div class="form-group" [ngClass]="{'col-xs-10': inline, 'col-xs-12': !inline}">
                    <label [class.sr-only]="inline" for="taskName">New Task *</label>
                    <div class="input-group" style="width: 100%">
                        <input type="text" class="form-control" id="taskName" placeholder="New Task *" required [(ngModel)]="newTask.name">
                    </div>
                </div>
                <div class="clearfix"></div>
                <div class="form-group" [ngClass]="{'col-xs-5': inline, 'col-xs-12': !inline}">
                    <label [class.sr-only]="inline" for="estimatedTime">Estimated time *</label>
                    <div class="input-group" style="width: 100%;">
                        <div class="input-group-addon"><i class="fa fa-clock-o" aria-hidden="true"></i></div>
                        <input type="time" id="estimatedTime" class="form-control" placeholder="estimated time" style="line-height: 1.5;" required [(ngModel)]="newTask.estimated">
                    </div>
                </div>
                <div *ngIf="!inline" class="clearfix"></div>
                <div class="form-group" [ngClass]="{'col-xs-5': inline, 'col-xs-12': !inline}">
                    <label [class.sr-only]="inline" for="dueDate">Due date</label>
                    <div class="input-group" style="width: 100%;">
                        <div class="input-group-addon"><i class="fa fa-calendar-o" aria-hidden="true"></i></div>
                        <input type="datetime-local" id="dueDate" class="form-control" placeholder="dd.mm.yyyy hh:mm" style="line-height: 1.5;" [(ngModel)]="newTask.due">
                    </div>
                </div>
                <div *ngIf="!inline" class="clearfix"></div>
                <div class="form-group" [ngClass]="{'col-xs-2': inline, 'col-xs-12': !inline}">
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Add</button>
                </div>
            </form>
        </div>
    `,
    providers: [TaskService],
    inputs: ['personId', 'inline'],
    outputs: ['tasks']
})
export class newTaskComponent {
    public personId:number;
    public inline:boolean;
    private tasks:EventEmitter<Task[]> = new EventEmitter<Task[]>();

    private error : string;
    private newTask : Task = new Task();

    constructor(private _taskService:TaskService) {}

    createTask() {
        this.error = null;

        let task : Task = new Task();
        task.name = this.newTask.name;
        task.setEstimated(String(this.newTask.estimated));
        task.due = this.newTask.due;

        if(task.estimated < 1) {
            this.error = "Error: estimated time has invalid format";
        } else {
            this._taskService.create(this.personId, task).subscribe(tasks => {
                this.newTask = new Task();
                this.tasks.emit(tasks);
            }, error => {
                this.error = error;
            });
        }
    }
}