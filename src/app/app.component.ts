import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { tap, skipWhile } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  throttle = 300;
  scrollDistance = 1;

  public news: Array<any> = [];

  public httpReqestInProgress: boolean = false;

  // Source data
  private _done = new BehaviorSubject(false);
  private _loading = new BehaviorSubject(false);
  private _data = new BehaviorSubject([]);

  // Observable data
  data: Observable<any>;
  done: Observable<boolean> = this._done.asObservable();
  loading: Observable<boolean> = this._loading.asObservable();

  private currentPage = 1;
  private _lastPage = 1;

  constructor(private http: HttpClient) { }

  public ngOnInit() {
    this.getNews(
      this.currentPage,
      (news) => {
        this.news = this.news.concat(news);
      });
  }

  onScrollDown (ev): void {
    console.log('scrolled down!!', ev);
    this._loading.next(true);
    this.getNews(
      this.currentPage,
      (news) => {
        this.news = this.news.concat(news);
        this._loading.next(false);
        this._lastPage = this.currentPage;
        this.currentPage = this._lastPage + 1;
        console.log('page ' + this.currentPage);
      });
  }

  private getNews(page: number = 1, saveResultsCallback: (news) => void) {
    return this.http.get(`https://node-hnapi.herokuapp.com/news?page=${page}`).pipe(
      skipWhile(() => this.httpReqestInProgress),
      tap(() => { this.httpReqestInProgress = true; })
    ).subscribe((news: any[]) => {
        // this.currentPage++;
        saveResultsCallback(news);
        this.httpReqestInProgress = false;
      });
  }
}
