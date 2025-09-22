import { Routes } from '@angular/router';
import { DishPageComponent } from './pages/dish-page/dish-page.component';


export const routes: Routes = [
{ path: '', pathMatch: 'full', redirectTo: 'dishes' },
{ path: 'dishes', component: DishPageComponent },
{ path: '**', redirectTo: 'dishes' }
];