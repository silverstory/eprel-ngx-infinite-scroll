import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { tap, skipWhile } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { Profile } from './profile';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      // tslint:disable-next-line:max-line-length
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhZTdjYThlOTAxYWQzZTM5Y2Y4Y2RjZiIsImlhdCI6MTUzNjEyMjU5NSwiZXhwIjoxNTM2NzI3Mzk1fQ.GSm7j_GHV_NL17AkTkLqhWx6Kz1N6ESF4mAAzCQz6N8`
    })
  };

  throttle = 300;
  scrollDistance = 1;

  public items: Array<any> = [];
  public httpReqestInProgress = false;

  // Source data

  // Observable data
  public done = false;
  public loading = false;

  public hasNext = false;
  public next = '';
  public queryText = '';
  public find = '';

  private findfield = 'Approved';
  private limit = 3;

  // hasNext: boolean;
  // next: string;
  // queryText: string;
  // find: string;

  constructor(private http: HttpClient) { }

  public ngOnInit() {
    this.showFirst();
  }

  public showFirst() {
    this.find = this.findfield;
    this.loading = true;
    this.getItems(
      'first',
      this.limit,
      (items) => {
        this.items = this.items.concat(items.results);
        this.loading = false;
        this.hasNext = items.hasNext;
        this.next = items.next;
        this.done = false;
        if (items.hasNext === false) {
          this.done = true;
        }
      });
  }

  onScrollDown(ev) {
    console.log('scrolled down!!', ev);
    console.log(this.next);
    console.log(this.hasNext);
    console.log(this.done);
    this.showNext();
  }

  public showNext() {
    if (this.hasNext === true) {
      this.find = this.findfield;
      this.loading = true;
      this.getItems(
        'next',
        this.limit,
        (items) => {
          this.items = this.items.concat(items.results);
          this.loading = false;
          this.hasNext = items.hasNext;
          this.next = items.next;
          this.done = false;
          if (items.hasNext === false) {
            this.done = true;
          }
        });
    }
  }

  public getItems(ordinal,
    limit,
    saveResultsCallback: (items) => void) {
    const find = this.find;
    const next = this.next;
    switch (ordinal) {
      case 'first':
        // tslint:disable-next-line:max-line-length
        this.queryText = `http://localhost:3000/api/profile/accessapprovals?ordinal=${ordinal}&findtext=${find}&limit=${limit}&paginatedfield=accessdatetagged`;
        break;
      case 'next':
        // tslint:disable-next-line:max-line-length
        this.queryText = `http://localhost:3000/api/profile/accessapprovals?ordinal=${ordinal}&findtext=${find}&limit=${limit}&paginatedfield=accessdatetagged&next=${next}`;
        break;
    }

    return this.http.get(this.queryText, this.httpOptions)
      .pipe(
        skipWhile(() => this.httpReqestInProgress),
        tap(() => { this.httpReqestInProgress = true; })
      )
      .subscribe((items: any[]) => {
        saveResultsCallback(items);
        this.httpReqestInProgress = false;
      });
  }

  getAccess(one, two, three, four): string {
    const a = ['', one, two, three, four];
    let access = '';
    for (let i = 1; i < 5; i++) {
      access = access + this.getCode(a[i], i.toString());
    }
    return access;
  }

  getCode(value, code): string {
    switch (value) {
      case 'notSelected':
        return '';
        case 'selected':
        return `Code ${code} ` ;
      }
  }
}
