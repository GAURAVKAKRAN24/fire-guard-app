import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { CustomerService } from "../../core/services/customer";
import { Customer } from "../../core/models/customer.model";
import { Extinguisher } from "../../core/models/extinguisher.model";
import { ExtinguisherService } from "../../core/services/extinguisher";
import { NotificationService } from "../../core/services/notification";
@Component({
    selector: "app-extinguishers",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: "./extinguishers.html",
    styleUrl: "./operations.scss",
})
export class Extinguishers implements OnInit {
    items: Extinguisher[] = [];
    customers: Customer[] = [];
    showForm = false;
    editingId?: number;
    activeFilter: "all" | "due" | "upcoming" | "active" | "inactive" = "all";
    readonly filterOptions: Array<
        "all" | "due" | "upcoming" | "active" | "inactive"
    > = ["all", "due", "upcoming", "active", "inactive"];
    readonly form;

    constructor(
        fb: FormBuilder,
        private api: ExtinguisherService,
        private customerApi: CustomerService,
        private notice: NotificationService,
    ) {
        this.form = fb.group({
            customer_id: ["", Validators.required],
            extinguisher_no: ["", Validators.required],
            type: ["ABC", Validators.required],
            capacity: ["", Validators.required],
            purchase_date: [""],
            last_service_date: [""],
            next_service_date: [""],
            status: ["Active", Validators.required],
        });
    }

    ngOnInit() {
        this.load();
        this.customerApi
            .getCustomers(1, 100)
            .subscribe((r) => (this.customers = r.customers));
    }

    load() {
        this.api
            .getAll()
            .subscribe({
                next: (r) => (this.items = r.extinguishers),
                error: () => this.notice.error("Unable to load extinguishers."),
            });
    }

    get filteredItems(): Extinguisher[] {
        if (this.activeFilter === "all") return this.items;
        const filter = this.activeFilter as Exclude<
            typeof this.activeFilter,
            "all"
        >;
        return this.items.filter((item) => this.matchesFilter(item, filter));
    }

    getFilterCount(
        filter: "all" | "due" | "upcoming" | "active" | "inactive",
    ): number {
        return filter === "all"
            ? this.items.length
            : this.items.filter((item) => this.matchesFilter(item, filter))
                  .length;
    }

    getStatusLabel(item: Extinguisher): string {
        if (this.isDue(item)) return "Due";
        if (this.isUpcoming(item)) return "Upcoming";
        return item.status || "Active";
    }

    getStatusClass(item: Extinguisher): string {
        return this.getStatusLabel(item).toLowerCase();
    }

    getCustomer(customerId: number): Customer | undefined {
        return this.customers.find((customer) => customer.id === customerId);
    }

    private matchesFilter(
        item: Extinguisher,
        filter: Exclude<typeof this.activeFilter, "all">,
    ): boolean {
        if (filter === "due") return this.isDue(item);
        if (filter === "upcoming") return this.isUpcoming(item);
        return item.status.toLowerCase() === filter;
    }

    private isDue(item: Extinguisher): boolean {
        return (
            item.status.toLowerCase() === "due" ||
            (!!item.next_service_date && item.next_service_date <= this.today())
        );
    }

    private isUpcoming(item: Extinguisher): boolean {
        return (
            item.status.toLowerCase() !== "inactive" &&
            !!item.next_service_date &&
            item.next_service_date > this.today()
        );
    }

    private today(): string {
        return new Date().toISOString().slice(0, 10);
    }

    edit(item: Extinguisher) {
        this.editingId = item.id;
        this.form.patchValue({
            ...item,
            customer_id: String(item.customer_id),
        });
        this.showForm = true;
    }
    reset() {
        this.form.reset({ type: "ABC", status: "Active" });
        this.editingId = undefined;
        this.showForm = false;
    }
    save() {
        if (this.form.invalid) return;
        const data = {
            ...this.form.getRawValue(),
            customer_id: Number(this.form.value.customer_id),
        } as Extinguisher;
        const request = this.editingId
            ? this.api.update(this.editingId, data)
            : this.api.create(data);
        request.subscribe({
            next: () => {
                this.notice.success(
                    `Extinguisher ${this.editingId ? "updated" : "registered"} successfully.`,
                );
                this.reset();
                this.load();
            },
            error: () => this.notice.error("Unable to save extinguisher."),
        });
    }
}
