import {Component, EventEmitter} from "@angular/core";
import {TaskService} from "../services/task.service";
import {Task} from '../task';

@Component({
    selector: 'task-done',
    template: `
        <div class="modal fade in" role="dialog" style="display: block;">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" aria-label="Close" (click)="closeMe($event);">
                            <span aria-hidden="true">×</span>
                        </button>
                        <h4 class="modal-title">Mark task as done</h4>
                    </div>
                    <div class="modal-body">
                        <p *ngIf="error" class="alert alert-error">{{error}}</p>
                        <p class="hidden-sm-down">You want to mark the task <i>{{task.name}}</i> as done.</p>
                        <p class="hidden-sm-down">We <b>optionally</b> would like to know how much time you spend on that task.</p>
                        <form class="form-inline">
                            <div class="form-group">
                                <small class="text-muted hidden-md-up">We <b>optionally</b> would like to know how much time you spend on that task.</small>
                                <div class="input-group">
                                    <div class="input-group-addon"><i class="fa fa-clock-o" aria-hidden="true"></i></div>
                                    <input type="time" class="form-control" placeholder="needed time" [(ngModel)]="needed">
                                    <div class="input-group-addon">needed</div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" (click)="proceed(true);">Skip</button>
                        <button type="button" class="btn btn-primary" (click)="proceed(false);">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    providers: [TaskService],
    inputs: ['task'],
    outputs: ['close', 'done']
})
export class TaskDoneComponent {
    public task:Task;
    public close:EventEmitter<void> = new EventEmitter<void>();
    public done:EventEmitter<Task> = new EventEmitter<Task>();

    private needed:string = "00:00";

    private error:string;

    constructor(private _taskService:TaskService) {}

    closeMe(event) {
        this.close.emit(event);
    }

    proceed(skip) {
        let needed:number = null;
        if(!skip) {
            this.task.setNeeded(this.needed);
            if(this.task.needed < 0) {
                this.error = "wrong time format";
                return;
            } else if(this.task.needed == 0) {
                this.task.needed = null;
            }
        }
        this._taskService.done(this.task.id, this.task.needed).subscribe(task => {
            this.needed = "00:00";
            this.done.emit(task);
        }, error => {
            this.error = error;
        });
    }

}