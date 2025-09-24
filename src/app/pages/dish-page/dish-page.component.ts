import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { DishService } from '../../services/dish.service';
import { Dish } from '../../models/dish';
import { Page } from '../../models/page';
import { DishFilter } from '../../models/dish-filter';

type SortDir = 'ASC' | 'DESC';

@Component({
    selector: 'app-restaurant-page',
    standalone: true,
    imports: [CommonModule, NgClass],
    templateUrl: './dish-page.component.html'
})
export class DishPageComponent {
    private api = inject(DishService);

    // --- UI state ---
    loading = signal(false);
    error = signal<string | null>(null);

    // --- Page data ---
    dishes = signal<Dish[]>([]);
    page = signal(0);
    size = signal(10);
    totalElements = signal(0);
    totalPages = signal(0);
    sort = signal<SortDir>('DESC');
    orderBy = signal<string>('createdDate');

    // --- Filters (binds to the sticky top bar) ---
    name = signal('');
    description = signal('');
    codeCSV = signal(''); // comma-separated, e.g. "DRINK,DESSERT"
    createdDateFrom = signal<string | undefined>(undefined); // yyyy-MM-dd
    createdDateTo = signal<string | undefined>(undefined);   // yyyy-MM-dd
    price = signal(''); // exact match, per backend
    stock = signal(''); // exact match, per backend

    ngOnInit() {
        this.fetch();
    }

    /** Build codes array from the CSV field (uppercased, trimmed) */
    private codesArray(): string[] {
        return this.codeCSV()
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
            .map(s => s.toUpperCase());
    }

    /** Fetch paged + filtered dishes */
    fetch() {
        this.loading.set(true);
        this.error.set(null);

        const filter: DishFilter = {
            name: this.name() || undefined,
            description: this.description() || undefined,
            price: this.price() || undefined,
            stock: this.stock() || undefined,
            code: this.codesArray().length ? this.codesArray() : undefined,
            createdDateFrom: this.createdDateFrom(),
            createdDateTo: this.createdDateTo()
        };

        this.api
            .listPaged({
                page: this.page(),
                size: this.size(),
                sort: this.sort(),
                orderBy: this.orderBy(),
                filter
            })
            .subscribe({
                next: (res: Page<Dish>) => {
                    this.dishes.set(res.content);
                    this.page.set(res.number);
                    this.size.set(res.size);
                    this.totalElements.set(res.totalElements);
                    this.totalPages.set(res.totalPages);
                    this.loading.set(false);
                },
                error: err => {
                    this.error.set(err?.error?.message ?? 'Failed to load dishes');
                    this.loading.set(false);
                }
            });
    }

    // --- Filter actions ---
    applyFilters() {
        this.page.set(0);
        this.fetch();
    }

    clearFilters() {
        this.name.set('');
        this.description.set('');
        this.price.set('');
        this.stock.set('');
        this.codeCSV.set('');
        this.createdDateFrom.set(undefined);
        this.createdDateTo.set(undefined);
        this.page.set(0);
        this.sort.set('DESC');
        this.orderBy.set('createdDate');
        this.fetch();
    }

    // --- Pagination ---
    setPage(n: number) {
        if (n < 0 || n >= this.totalPages()) return;
        this.page.set(n);
        this.fetch();
    }
    prevPage() {
        this.setPage(this.page() - 1);
    }
    nextPage() {
        this.setPage(this.page() + 1);
    }
    setSize(sz: number) {
        this.size.set(sz);
        this.page.set(0);
        this.fetch();
    }
    pageNumbers(): number[] {
        const n = this.totalPages();
        return n > 0 ? Array.from({ length: n }, (_, i) => i) : [];
    }

    // --- Sorting ---
    toggleSort(field: string) {
        if (this.orderBy() === field) {
            this.sort.set(this.sort() === 'ASC' ? 'DESC' : 'ASC');
        } else {
            this.orderBy.set(field);
            this.sort.set('ASC'); // default when switching field
        }
        this.page.set(0);
        this.fetch();
    }
    isSorted(field: string, dir: SortDir) {
        return this.orderBy() === field && this.sort() === dir;
    }

    // --- Helpers used by the template for "Showing X–Y of Z" ---
    get showingFrom() {
        return this.totalElements() === 0 ? 0 : this.page() * this.size() + 1;
    }
    get showingTo() {
        const end = (this.page() + 1) * this.size();
        return Math.min(end, this.totalElements());
    }

}