import {Component, EventEmitter, OnInit} from "@angular/core";
import {Control} from "@angular/common";
import {TeamService} from "../services/team.service";
import {Team} from "../team";

@Component({
    selector: 'team-select',
    template: `
        <div class="row">
            <div class="col-xs-12">
                <form class="form-inline">
                    <div class="form-group" style="width: 100%;">
                        <label class="sr-only" for="team">Team:</label>
                        <input type="text" class="form-control" id="team" placeholder="team" style="width: 100%;" [ngFormControl]="input" autocomplete="off">
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
                    <a *ngFor="let team of activeNotIn" class="list-group-item active" (click)="selectTeam(team);">
                        {{team.title}}<br />
                        <small *ngIf="team.term && team.term.entity" class="text-muted">{{team.term.entity.full_name}}</small>
                        <small *ngIf="team.term" class="text-muted">&nbsp;({{team.term.short_name}})</small>
                    </a>
                    <a *ngFor="let team of _teams" class="list-group-item" [class.active]="inActive(team.id)" (click)="selectTeam(team);">
                        {{team.title}}<br />
                        <small *ngIf="team.term && team.term.entity" class="text-muted">{{team.term.entity.full_name}}</small>
                        <small *ngIf="team.term" class="text-muted">&nbsp;({{team.term.short_name}})</small>
                    </a>
                </ul>
            </div>
        </div>
    `,
    providers: [TeamService],
    inputs: ['multiple', 'selected'],
    outputs: ['team', 'teams']
})
export class teamSelectComponent implements OnInit {
    public teams : EventEmitter<Team[]> = new EventEmitter<Team[]>();
    public team : EventEmitter<Team> = new EventEmitter<Team>();
    public multiple : boolean = false;

    private input : Control = new Control();
    private _teams : Team[] = [];
    private active : Team[] = [];
    private activeNotIn : Team[] = [];
    private error : string;

    constructor(private _teamService : TeamService) {}

    set selected(teams : Team[] | Team | number[] | number | string[] | string) {
        if(typeof teams != 'undefined' && teams != null) {
            if(!Array.isArray(teams)) {
                teams = <any[]>[teams];
            }
            this.active = [];
            for(var i in <any[]>teams) {
                if(teams[i] instanceof Team) {
                    if(!this.inActive(teams[i].id)) {
                        this.selectTeam(<Team>teams[i]);
                    }
                } else {
                    this._teamService.get(teams[i]).subscribe(team => {
                        if(!this.inActive(team.id)) {
                            this.selectTeam(team);
                        }
                    }, error => this.error);
                }
            }
        }
    }

    ngOnInit():void {
        this.input.valueChanges.debounceTime(300)
            .switchMap(q => this._teamService.autocomplete(q))
            .subscribe(
                teams => {
                    this._teams = teams;
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
            for(var j = 0; j < this._teams.length; j++) {
                if(!isIn && this._teams[j].id == this.active[i].id) {
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

    selectTeam(team) {
        if(this.multiple) {
            if(this.inActive(team.id)) {
                for(var i = 0; i < this.active.length; i++) {
                    if(this.active[i].id == team.id) {
                        this.active.splice(i, 1);
                    }
                }
            } else {
                this.active.push(team);
            }
            this.teams.emit(this.active);
        } else {
            this.active = [team];
            this.team.emit(team);
        }
        this.calcActiveNotIn();
    }
}