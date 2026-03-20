import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { JoobleService } from '../jooble.service';

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  salaryMin: number;
  salaryMax: number;
  datePosted: string;
}

const INITIAL_JOBS: Job[] = [
  { id: 1, title: 'Predavač / Pokladník', company: 'Lidl Slovenská republika', location: 'Bratislava - Ružinov', salary: '1100€ - 1350€', salaryMin: 1100, salaryMax: 1350, datePosted: '2026-03-15' },
  { id: 2, title: 'Čašník / Servírka', company: 'Reštaurácia Staré Mesto', location: 'Košice / Centrum', salary: '900€ - 1050€', salaryMin: 900, salaryMax: 1050, datePosted: '2026-03-12' },
  { id: 3, title: 'Samostatný kuchár', company: 'Hotel Riverside', location: 'Poprad / Vysoké Tatry', salary: '1500€ - 2000€', salaryMin: 1500, salaryMax: 2000, datePosted: '2026-03-09' },
  { id: 4, title: 'Skladník / Vodič', company: 'Logistics Park', location: 'Senec', salary: '1200€ - 1450€', salaryMin: 1200, salaryMax: 1450, datePosted: '2026-03-10' },
  { id: 5, title: 'Barman', company: 'Sky Bar & Lounge', location: 'Bratislava', salary: '1000€ - 1200€', salaryMin: 1000, salaryMax: 1200, datePosted: '2026-03-08' },
  { id: 6, title: 'Upratovačka / Chyžná', company: 'Penzión Pohoda', location: 'Banská Bystrica', salary: '850€ - 950€', salaryMin: 850, salaryMax: 950, datePosted: '2026-03-11' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  isLoading = signal(false);
  errorMessage = signal('');

  jobs = signal<Job[]>(INITIAL_JOBS);

  query = signal({
    keywords: '',
    location: '',
    minSalary: undefined as number | undefined,
    maxSalary: undefined as number | undefined,
  });

  get keywords(): string {
    return this.query().keywords;
  }

  set keywords(value: string) {
    this.query.update((q) => ({ ...q, keywords: value }));
  }

  get location(): string {
    return this.query().location;
  }

  set location(value: string) {
    this.query.update((q) => ({ ...q, location: value }));
  }

  get minSalary(): number | undefined {
    return this.query().minSalary;
  }

  set minSalary(value: number | undefined) {
    this.query.update((q) => ({ ...q, minSalary: value }));
  }

  get maxSalary(): number | undefined {
    return this.query().maxSalary;
  }

  set maxSalary(value: number | undefined) {
    this.query.update((q) => ({ ...q, maxSalary: value }));
  }

  filteredJobs = computed(() => {
    const all = this.jobs();
    const q = this.query();
    return all.filter((job) => {
      const textMatch = `${job.title} ${job.company} ${job.location}`.toLowerCase().includes(q.keywords.toLowerCase());
      const locationMatch = !q.location || job.location.toLowerCase().includes(q.location.toLowerCase());
      const minMatch = q.minSalary == null || job.salaryMax >= q.minSalary;
      const maxMatch = q.maxSalary == null || job.salaryMin <= q.maxSalary;
      return textMatch && locationMatch && minMatch && maxMatch;
    });
  });

  constructor(private joobleService: JoobleService) {}

  ngOnInit(): void {
    // Po otvorení stránky necháme predplnené filtre prázdne.
    // Volanie API vykoná používateľ kliknutím na tlačidlo Hľadať.
  }

  private mapJoobleItem(item: any, idx: number): Job {
    const minCandidate = Number(item.salaryMin ?? item.minSalary ?? item.salary?.min ?? 0);
    const maxCandidate = Number(item.salaryMax ?? item.maxSalary ?? item.salary?.max ?? 0);
    const salaryMin = Number.isFinite(minCandidate) ? minCandidate : 0;
    const salaryMax = Number.isFinite(maxCandidate) ? maxCandidate : salaryMin;

    let salaryText = item.salary ?? item.salaryRange ?? '';
    if (!salaryText) {
      if (salaryMin && salaryMax) {
        salaryText = `${salaryMin}€ - ${salaryMax}€`;
      } else if (salaryMin) {
        salaryText = `${salaryMin}€`;
      } else {
        salaryText = 'Nezverejnené';
      }
    }

    return {
      id: Number(item.id ?? item.jobId ?? idx),
      title: item.title ?? item.position ?? 'Neznáma pozícia',
      company: item.company ?? item.companyName ?? 'Neznáma firma',
      location: item.location ?? item.address ?? 'Nepoznané miesto',
      salary: salaryText,
      salaryMin,
      salaryMax,
      datePosted: item.datePosted ?? item.publishedAt ?? new Date().toISOString().split('T')[0],
    };
  }

  loadJobsFromJooble(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const query = this.query();
    console.log('Jooble query:', query);
    this.joobleService
      .searchJobs({
        radius: "80",
        keywords: query.keywords || 'angular developer',
        location: query.location || 'Slovakia',
        salary_min: query.minSalary,
        salary_max: query.maxSalary,
      })
      .subscribe({
        next: (res: any) => {
          const jobs = Array.isArray(res?.jobs) ? res.jobs : Array.isArray(res) ? res : [];
          if (jobs.length === 0) {
            this.errorMessage.set('Jooble nevrátil žiadne výsledky, zobrazujem lokálne ukážkové ponuky.');
            this.jobs.set(INITIAL_JOBS);
          } else {
            this.jobs.set(jobs.map((item: any, idx: number) => this.mapJoobleItem(item, idx)));
          }
        },
        error: (err) => {
          console.error('Jooble API error', err);
          this.errorMessage.set('Chyba pri načítaní Jooble API, zobrazujem lokálne dáta.');
          this.jobs.set(INITIAL_JOBS);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
  }

  onFilterChange(): void {
    this.loadJobsFromJooble();
  }

  clearFilters(): void {
    this.query.set({ keywords: '', location: '', minSalary: undefined, maxSalary: undefined });
    this.loadJobsFromJooble();
  }
}

