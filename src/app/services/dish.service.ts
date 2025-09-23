import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Dish } from '../models/dish';
import { Page } from '../models/page';
import { DishFilter } from '../models/dish-filter';

@Injectable({ providedIn: 'root' })
export class DishService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/dishes`;

  list(): Observable<Dish[]> {
    return this.http.get<Dish[]>(this.base);
  }

  listPaged(opts: {
    page?: number; size?: number;
    sort?: 'ASC' | 'DESC';
    orderBy?: string;
    filter?: DishFilter;
  }): Observable<Page<Dish>> {
    const {
      page = 0,
      size = 10,
      sort = 'DESC',
      orderBy = 'createdDate',
      filter
    } = opts || {};

    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort)
      .set('orderBy', orderBy);

    if (filter) {
      const { name, description, price, stock, createdDateFrom, createdDateTo } = filter;
      if (name) params = params.set('name', name);
      if (description) params = params.set('description', description);
      if (price) params = params.set('price', price);
      if (stock) params = params.set('stock', stock);
      if (createdDateFrom) params = params.set('createdDateFrom', createdDateFrom);
      if (createdDateTo) params = params.set('createdDateTo', createdDateTo);

      // Backend accepts repeated code params OR comma-separated.
      if (filter.code?.length) {
        for (const c of filter.code) {
          if (c?.trim()) params = params.append('code', c.trim());
        }
      }
    }

    return this.http.get<Page<Dish>>(`${this.base}/paged`, { params });
  }

}