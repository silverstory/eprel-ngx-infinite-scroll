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

  public httpReqestInProgress: boolean = false;

  // Source data
  private _done = new BehaviorSubject(false);
  private _loading = new BehaviorSubject(false);
  private _data = new BehaviorSubject([]);

  // Observable data
  data: Observable<any>;
  done: Observable<boolean> = this._done.asObservable();
  loading: Observable<boolean> = this._loading.asObservable();

  // private currentPage = 1;
  // private _lastPage = 1;
  // private _hasNext = new BehaviorSubject(false);
  // private _next = new BehaviorSubject('');
  // private _queryText = new BehaviorSubject('');
  // private _find = new BehaviorSubject('');
  private findfield = 'Approved';
  private limit = 2;

  hasNext: boolean;
  next: string;
  queryText: string;
  find: string;

  constructor(private http: HttpClient) { this.items = []; }

  public ngOnInit() {
    this.items = [];
    this.find = this.findfield;
    this._loading.next(true);
    this.getItems(
      'first',
      this.limit,
      (items) => {
        this.items = this.items.concat(items.results);
        this._loading.next(false);
        this.hasNext = items.hasNext;
        this.next = items.next;
        if (this.hasNext === false) {
          this._done.next(true);
        }
      });
  }

  onScrollDown(ev): void {
    if (this._done.getValue() === false) {
      // console.log('scrolled down!!', ev);
      this.find = this.findfield;
      this._loading.next(true);
      this.getItems(
        'next',
        this.limit,
        (items) => {
          this.items = this.items.concat(items.results);
          this._loading.next(false);
          this.hasNext = items.hasNext;
          this.next = items.next;
          if (this.hasNext === false) {
            this._done.next(true);
          }
        });
    }

    // this.done
    // .pipe
    //   (tap(() => {}))
    // .subscribe
    //   ((done) => {
    //     if (done === false) {
    //       // console.log('scrolled down!!', ev);
    //       this.find = this.findfield;
    //       this._loading.next(true);
    //       this.getItems(
    //         'next',
    //         this.limit,
    //         (items) => {
    //           this.items = this.items.concat(items.results);
    //           this._loading.next(false);
    //           this.hasNext = items.hasNext;
    //           this.next = items.next;
    //           if (this.hasNext === false) {
    //             this._done.next(true);
    //           }
    //         });
    //     }
    // });
  }

  private getItems(ordinal,
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
}
