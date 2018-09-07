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

  // public items: Array<any> = [];
  public httpReqestInProgress = false;

  // Source data
  private _done = new BehaviorSubject(false);
  private _loading = new BehaviorSubject(false);
  public _items = new BehaviorSubject([]);

  // Observable data
  public items: Observable<any> = this._items.asObservable();
  public done: Observable<boolean> = this._done.asObservable();
  public loading: Observable<boolean> = this._loading.asObservable();

  // private currentPage = 1;
  // private _lastPage = 1;
  // private _hasNext = new BehaviorSubject(false);
  // private _next = new BehaviorSubject('');
  // private _queryText = new BehaviorSubject('');
  // private _find = new BehaviorSubject('');
  public hasNext = new BehaviorSubject(false);
  public next = new BehaviorSubject('');
  public queryText = new BehaviorSubject('');
  public find = new BehaviorSubject('');

  private findfield = 'Approved';
  private limit = 2;

  // hasNext: boolean;
  // next: string;
  // queryText: string;
  // find: string;

  constructor(private http: HttpClient) { }

  public ngOnInit() {
    this.showFirst();
  }

  public showFirst() {
    this.find.next(this.findfield);
    this._loading.next(true);
    this.getItems(
      'first',
      this.limit,
      (items) => {
        this._items.next(this._items.getValue().concat(items.results));
        // this.items = await this.items.concat(items.results);
        this._loading.next(false);
        this.hasNext.next(items.hasNext);
        this.next.next(items.next);
        if (items.hasNext === false) {
          this._done.next(true);
        }
      });
  }

  onScrollDown(ev) {
    console.log('scrolled down!!', ev);
    console.log(this.next.getValue());
    console.log(this.hasNext.getValue());
    console.log(this._done.getValue());
    this.showNext();
  }

  public showNext() {
    if (this._done.getValue() === false) {
      this.find.next(this.findfield);
      this._loading.next(true);
      this.getItems(
        'next',
        this.limit,
        (items) => {
          this._items.next(this._items.getValue().concat(items.results));
          // this.items = await this.items.concat(items.results);
          this._loading.next(false);
          this.hasNext.next(items.hasNext);
          this.next.next(items.next);
          if (items.hasNext === false) {
            this._done.next(true);
          }
        });
    }
  }

  public getItems(ordinal,
    limit,
    saveResultsCallback: (items) => void) {
    const find = this.find.getValue();
    const next = this.next.getValue();
    switch (ordinal) {
      case 'first':
        // tslint:disable-next-line:max-line-length
        this.queryText.next(`http://localhost:3000/api/profile/accessapprovals?ordinal=${ordinal}&findtext=${find}&limit=${limit}&paginatedfield=accessdatetagged`);
        break;
      case 'next':
        // tslint:disable-next-line:max-line-length
        this.queryText.next(`http://localhost:3000/api/profile/accessapprovals?ordinal=${ordinal}&findtext=${find}&limit=${limit}&paginatedfield=accessdatetagged&next=${next}`);
        break;
    }

    return this.http.get(this.queryText.getValue(), this.httpOptions)
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
    let access: string;
    access = '';
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
