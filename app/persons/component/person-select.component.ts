import {Component, EventEmitter, OnInit} from "@angular/core";
import {Control} from "@angular/common";
import {PersonService} from "../services/person.service";
import {Person} from "../person";

@Component({
    selector: 'person-select',
    template: `
        <div class="row">
            <div class="col-xs-12">
                <form class="form-inline">
                    <div class="form-group" style="width: 100%;">
                        <label class="sr-only" for="person">Person:</label>
                        <input type="text" class="form-control" id="person" placeholder="person" style="width: 100%;" [ngFormControl]="input" autocomplete="off">
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
                    <a *ngFor="let person of activeNotIn" class="list-group-item active" (click)="selectPerson(person);">
                        {{person.full_name}}
                    </a>
                    <a *ngFor="let person of _persons" class="list-group-item" [class.active]="inActive(person.id)" (click)="selectPerson(person);">
                        {{person.full_name}}
                    </a>
                </ul>
            </div>
        </div>
    `,
    providers: [PersonService],
    inputs: ['multiple', 'selected'],
    outputs: ['person', 'persons']
})
export class personSelectComponent implements OnInit {
    public persons : EventEmitter<Person[]> = new EventEmitter<Person[]>();
    public person : EventEmitter<Person> = new EventEmitter<Person>();
    public multiple : boolean = false;

    private input : Control = new Control();
    private _persons : Person[] = [];
    private active : Person[] = [];
    private activeNotIn : Person[] = [];
    private error : string;

    constructor(private _personService : PersonService) {}

    set selected(persons : Person[] | Person | number[] | number | string[] | string) {
        if(typeof persons != 'undefined' && persons != null) {
            if(!Array.isArray(persons)) {
                persons = <any[]>[persons];
            }
            this.active = [];
            for(var i in <any[]>persons) {
                if(persons[i] instanceof Person) {
                    if(!this.inActive(persons[i].id)) {
                        this.selectPerson(<Person>persons[i]);
                    }
                } else {
                    this._personService.get(persons[i]).subscribe(person => {
                        if(!this.inActive(person.id)) {
                            this.selectPerson(person);
                        }
                    }, error => this.error);
                }
            }
        }
    }

    ngOnInit():void {
        this.input.valueChanges.debounceTime(300)
            .switchMap(q => this._personService.autocomplete(q))
            .subscribe(
                persons => {
                    this._persons = persons;
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
            for(var j = 0; j < this._persons.length; j++) {
                if(!isIn && this._persons[j].id == this.active[i].id) {
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

    selectPerson(person) {
        if(this.multiple) {
            if(this.inActive(person.id)) {
                for(var i = 0; i < this.active.length; i++) {
                    if(this.active[i].id == person.id) {
                        this.active.splice(i, 1);
                    }
                }
            } else {
                this.active.push(person);
            }
            this.persons.emit(this.active);
        } else {
            this.active = [person];
            this.person.emit(person);
        }
        this.calcActiveNotIn();
    }
}