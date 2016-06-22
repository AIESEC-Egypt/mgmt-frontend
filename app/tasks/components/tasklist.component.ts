import {Component, Renderer} from "@angular/core";

import {PersonService} from "../../persons/services/person.service";
import {Task} from '../../tasks/task';
import {TaskService} from "../services/task.service";
import {TaskDoneComponent} from "./task-done.component";
import {TaskTimePipe} from "../pipes/task-time.pipe";

@Component({
    selector: 'tasklist',
    styles: [
        '.statusbox { font-size: 1.5em; margin-top: 0.3em; }',
        '.status-changable { opacity: 0.3; }',
        '.status-changable:hover { opacity: 1; }',
        '.fa-mark-done:before { content: \'\\f10c\'; }',
        '.fa-mark-done:hover:before { content:\'\\f05d\'; }',
        '.fa-approve:before { content:\'\\f05d\'; }',
        '.fa-approve:hover:before { content:\'\\f087\'; }',
        '.task { border: 1px solid #efefef; border-radius: 5px; margin-top: 1em; }',
        '.task:first-child { margin-top: 0; }'
    ],
    template: `
        <task-done *ngIf="doneTask" [task]="doneTask" (done)="proceedDone($event);" (close)="doneTask = null;"></task-done>
        <div class="container">
            <div class="row">
                <div *ngIf="error" class="alert alert-danger">{{error}}</div>
                <div *ngIf="tasks == null && !error">Loading tasks ...</div>
                <div *ngIf="tasks" class="col-xs-12">
                    <div *ngFor="let task of tasks" class="task row" #taskEl (dragstart)="dragStart($event, task);" (dragover)="dragOver($event, taskEl);" (drop)="drop($event, task);" (touchmove)="touchMove($event, taskEl);" [attr.data-taskId]="task.id">
                        <div class="col-xs-1 statusbox" (click)="status(task);">
                            <i class="fa fa-mark-done" [ngClass]="{'status-changable': !task.approved, 'fa-mark-done': !task.done, 'fa-approve': task.done && !task.approved, 'fa-thumbs-o-up': task.approved}" aria-hidden="true"></i>
                        </div>
                        <div class="col-xs-10">
                            <span>{{task.name}}</span><br />
                            <div class="clearfix">
                                <small *ngIf="!task.done" class="text-muted pull-xs-left">Estimated:&nbsp;{{task.estimated | TaskTime}}</small>
                                <small *ngIf="task.done && !task.approved" class="text-muted pull-xs-left">Waiting for approval</small>
                                <small *ngIf="task.due" class="text-muted pull-xs-right {{task.getDueClass()}}">Due:&nbsp;{{task.due | date}}</small>
                            </div>
                        </div>
                        <div class="col-xs-1" style="font-size: 1.5em;" (mousedown)="taskEl.draggable = true;" (mouseup)="taskEl.draggable = false;" (touchstart)="touchStart($event, task, taskEl);" (touchend)="touchEnd($event);">
                           <span>☰</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    directives: [TaskDoneComponent],
    providers: [PersonService, TaskService],
    pipes: [TaskTimePipe],
    inputs: ['personId', 'tasks']
})
export class tasklistComponent {
    private _personId : number;
    public tasks : Task[];
    private doneTask : Task;
    private error : string;

    // drag and drop
    private currentDndTask : Task;
    private currentDndTarget : HTMLElement;
    private currentTouchTarget : HTMLElement;
    private currentTouchShadow : HTMLElement;
    private offsetX : number;
    private offsetY : number;

    constructor(private _personService : PersonService, private _taskService:TaskService, private _renderer:Renderer) {}

    /**
     * Setter for person id to start loading the tasklist
     * @param id
     */
    set personId(id:number) {
        this._personId = id;
        this.load();
    }

    /**
     * load the task list
     */
    load() {
        this._personService.getTasks(this._personId).subscribe(tasks => this.tasks = tasks, error => this.error = error);
    }

    /**
     * proceed a status change event
     * @param task
     * @returns {boolean}
     */
    status(task) {
        if(!task.done) {
            this.doneTask = task;
        } else if(!task.approved) {
            this._taskService.approve(task.id).subscribe(task => {
                for(var i in this.tasks) {
                    if(this.tasks[i].id == task.id) {
                        this.tasks[i] = task;
                    }
                }
            }, error => this.error = error);
        } else {
            return false;
        }
    }

    /**
     * proceed the task done event on the task-done modal
     * @param task
     */
    proceedDone(task) {
        this.doneTask = null;
        for(var i in this.tasks) {
            if(this.tasks[i].id == task.id) {
                this.tasks[i] = task;
            }
        }
    }

    /**
     * proceed the touchStart event on a task (similar to dragStart on html5 dnd api, but we need to create the shadow by ourselves)
     *
     * @param event
     * @param task
     * @param taskEl
     */
    touchStart(event, task, taskEl) {
        event.preventDefault();
        this.currentDndTask = task;
        this.currentTouchTarget = event.target;
        this.currentTouchShadow = this._renderer.createElement(taskEl, 'div', null);
        this.currentTouchShadow.style.position = "fixed";
        this.currentTouchShadow.style.height = taskEl.clientHeight;
        this.currentTouchShadow.style.width = taskEl.clientWidth;
        this.currentTouchShadow.innerHTML = taskEl.innerHTML;

        this.offsetX = event.targetTouches[0].clientX - taskEl.getBoundingClientRect().left;
        this.offsetY = event.targetTouches[0].clientY - taskEl.getBoundingClientRect().top;

        this.currentTouchShadow.style.left = taskEl.getBoundingClientRect().left;
        this.currentTouchShadow.style.top = taskEl.getBoundingClientRect().top;
    }

    /**
     * proceed the touch move event (similar to dragOver on html5 dnd api, but we need to move our own shadow element and determine which element is our current target)
     *
     * @param event
     * @param taskEl
     * @returns {boolean}
     */
    touchMove(event, taskEl) {
        if(this.currentTouchTarget === event.target) {
            event.preventDefault();

            let target : HTMLElement = taskEl.ownerDocument.elementFromPoint(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
            while(target != null && target.className.indexOf('task') == -1) {
                target = target.parentElement;
            }
            this.proceedTarget(target);

            this.currentTouchShadow.style.left = String(event.targetTouches[0].clientX - this.offsetX);
            this.currentTouchShadow.style.top = String(event.targetTouches[0].clientY - this.offsetY);

            return false;
        }
    }

    /**
     * proceed touchEnd event (similar to drop on html dnd api, but we have to delete our shadow element)
     *
     * @param event
     */
    touchEnd(event) {
        if(this.currentTouchTarget === event.target) {
            this.currentTouchTarget = null;
            this.currentTouchShadow.parentElement.removeChild(this.currentTouchShadow);
            if(this.currentDndTarget != null) {
                this.proceedDrop(this.currentDndTarget.getAttribute('data-taskId'));
            }
        }
    }

    /**
     * proceed dragStart event on non-touch devices (html5 dnd api)
     *
     * @param e
     * @param task
     */
    dragStart(e, task) {
        this.currentDndTask = task;
        e.dataTransfer.effectAllowed = 'move';
    }

    /**
     * proceed dragOver event on non-touch devices (html5 dnd api)
     *
     * @param e
     * @param taskEl
     * @returns {boolean}
     */
    dragOver(e, taskEl) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        this.proceedTarget(taskEl);

        return false;
    }

    /**
     * proceed drop event on non-touch devices (html5 dnd api)
     * @param e
     * @param dropTask
     */
    drop(e, dropTask) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        this.proceedDrop(dropTask.id);
    }

    /**
     * helper function to proceed a target change, both on html5 dnd api and our own touch implementation
     *
     * @param targetEl
     */
    proceedTarget(targetEl) {
        if(targetEl != this.currentDndTarget) {
            if(this.currentDndTarget != null) {
                this.currentDndTarget.style.borderTop = "";
            }
            this.currentDndTarget = targetEl;
            if(targetEl != null) {
                targetEl.style.borderTop = "5px solid brown";
            }
        }
    }

    /**
     * helper function to proceed the drop by reordering the tasks and sending the new priorities to the backend
     *
     * @param targetId
     */
    proceedDrop(targetId) {
        if(this.currentDndTarget != null) {
            this.currentDndTarget.style.borderTop = "";
            this.currentDndTarget = null;
        }
        if(targetId != this.currentDndTask.id && targetId != null) {
            var order = [];
            for(var i in this.tasks) {
                if (this.tasks[i].id == this.currentDndTask.id) {
                    this.tasks.splice(parseInt(i), 1);
                    break;
                }
            }
            for(var i in this.tasks) {
                if(this.tasks[i].id == targetId) {
                    this.tasks.splice(parseInt(i), 0, this.currentDndTask);
                    break;
                }
                order.push(this.tasks[i].id);
            }
            this.currentDndTask = null;
            for(var j:number = order.length; j < this.tasks.length; j++) {
                order.push(this.tasks[j].id);
            }
            this._taskService.prioritize(order).subscribe(res => {
                this.error = null;
            }, error => {
                this.error = error;
                this.load();
            });
        }
    }
}