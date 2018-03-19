import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';


/*
  Generated class for the HttpProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HttpProvider {

  path : string = 'assets/data/youtube.json';

  constructor(public http: HttpClient) {
    console.log('Hello HttpProvider Provider');
  }

  loadUsers(){
    return this.http.get(this.path)
      .toPromise();
  }
}
