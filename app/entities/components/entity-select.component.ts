import {Component, EventEmitter, OnInit} from "@angular/core";
import {Control} from "@angular/common";
import {EntityService} from "../services/entity.service";
import {Entity} from "../entity";

@Component({
    selector: 'entity-select',
    template: `
        <div class="row">
            <div class="col-xs-12">
                <form class="form-inline">
                    <div class="form-group" style="width: 100%;">
                        <label class="sr-only" for="entity">Entity:</label>
                        <input type="text" class="form-control" id="entity" placeholder="entity" style="width: 100%;" [ngFormControl]="input" autocomplete="off">
                    </div>
                </form>
            </div>
        </div>
        <div *ngIf="error" class="row">
            <div class="col-xs-12">
                <p class="alert alert-danger">{{error}}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-xs-12">
                <ul class="list-group">
                    <a *ngFor="let entity of activeNotIn" class="list-group-item active" (click)="selectEntity(entity);">
                        {{entity.full_name}}
                    </a>
                    <a *ngFor="let entity of _entities" class="list-group-item" [class.active]="inActive(entity.id)" (click)="selectEntity(entity);">
                        {{entity.full_name}}
                    </a>
                </ul>
            </div>
        </div>
    `,
    providers: [EntityService],
    inputs: ['multiple', 'selected'],
    outputs: ['entity', 'entities']
})
export class entitySelectComponent implements OnInit {
    public entities : EventEmitter<Entity[]> = new EventEmitter<Entity[]>();
    public entity : EventEmitter<Entity> = new EventEmitter<Entity>();
    public multiple : boolean = false;

    private input : Control = new Control();
    private _entities : Entity[] = [];
    private active : Entity[] = [];
    private activeNotIn : Entity[] = [];
    private error : string;

    constructor(private _entityService : EntityService) {}

    set selected(entities : Entity[] | Entity | number[] | number | string[] | string) {
        if(typeof entities != 'undefined' && entities != null) {
            if(!Array.isArray(entities)) {
                entities = <any[]>[entities];
            }
            this.active = [];
            for(var i in <any[]>entities) {
                if(entities[i] instanceof Entity) {
                    if(!this.inActive(entities[i].id)) {
                        this.selectEntity(<Entity>entities[i]);
                    }
                } else {
                    this._entityService.get(entities[i]).subscribe(entity => {
                        if(!this.inActive(entity.id)) {
                            this.selectEntity(entity);
                        }
                    }, error => this.error);
                }
            }
        }
    }

    ngOnInit():void {
        this.input.valueChanges.debounceTime(300)
            .switchMap(q => this._entityService.autocomplete(q))
            .subscribe(
                entities => {
                    this._entities = entities;
                    this.error = null;
                    this.calcActiveNotIn();
                }, error => {
                    this.error = error;
                    this.ngOnInit();
                }
            );
    }

    calcActiveNotIn() {
        this.activeNotIn = [];
        for(var i = 0; i < this.active.length; i++) {
            let isIn:boolean = false;
            for(var j = 0; j < this._entities.length; j++) {
                if(!isIn && this._entities[j].id == this.active[i].id) {
                    isIn = true;
                }
            }
            if(!isIn) {
                this.activeNotIn.push(this.active[i]);
            }
        }
    }

    inActive(id : number) {
        for(var i = 0; i < this.active.length; i++) {
            if(this.active[i].id == id) {
                return true;
            }
        }
        return false;
    }

    selectEntity(entity) {
        if(this.multiple) {
            if(this.inActive(entity.id)) {
                for(var i = 0; i < this.active.length; i++) {
                    if(this.active[i].id == entity.id) {
                        this.active.splice(i, 1);
                    }
                }
            } else {
                this.active.push(entity);
            }
            this.entities.emit(this.active);
        } else {
            this.active = [entity];
            this.entity.emit(entity);
        }
        this.calcActiveNotIn();
    }
}