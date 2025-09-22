import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Dish } from '../models/dish';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DishService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/dishes`;

  list(): Observable<Dish[]> {
    console.log('HTTP GET →', this.base);
    return this.http.get<Dish[]>(this.base).pipe(
      tap({
        next: res => console.log('HTTP OK, items:', Array.isArray(res) ? res.length : res),
        error: err => console.error('HTTP ERR', err)
      })
    );
  }
}
