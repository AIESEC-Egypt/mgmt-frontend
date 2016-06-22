import { Component } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router-deprecated';
import {OnInit} from '@angular/core';

@Component({
    selector: 'oauth2-callback',
    template: '<div class="row" *ngIf="!status"><div class="col-xs-6 col-xs-offset-3"><br /><p >Proceeding...</p></div></div><br />',
})
export class CallbackComponent implements OnInit {
    private status:Boolean = false;

    constructor(private authService:AuthService, private router:Router) {}

    ngOnInit() {
        this.authService.subscribe().subscribe(status => {
            if(status) {
                this.status = true;
                this.router.navigate(['Dashboard']);
            } else {
                status = true;
            }
        });
        this.authService.doLogin(window.location.href);
    }
}