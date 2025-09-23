import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DishService } from '../../services/dish.service';
import { Dish } from '../../models/dish';


@Component({
    selector: 'app-restaurant-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dish-page.component.html'
})
export class DishPageComponent {
    private api = inject(DishService);


    loading = signal(false);
    error = signal<string | null>(null);
    dishes = signal<Dish[]>([]);


    ngOnInit() {
        console.log('DishPageComponent init → calling fetch()');
        this.fetch();
    }


    fetch() {
        this.loading.set(true);
        this.error.set(null);
        this.api.list().subscribe({
            next: data => { this.dishes.set(data); this.loading.set(false); },
            error: err => { this.error.set(err?.error?.message ?? 'Failed to load dishes'); this.loading.set(false); }
        });
    }
}