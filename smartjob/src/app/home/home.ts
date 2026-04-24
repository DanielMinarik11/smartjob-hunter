import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from 'firebase/auth';

import { JoobleService } from '../jooble.service';
import { FirebaseAuthService } from '../firebase-auth.service';

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

export interface ProfileDraft {
  languages: string[];
  skills: string[];
  preferences: string[];
  desiredRoles: string[];
  preferredLocations: string[];
  experienceLevel: string;
  desiredSalary: string;
}

const INITIAL_JOBS: Job[] = [
  { id: 1, title: 'Predavač / Pokladník', company: 'Lidl Slovenská republika', location: 'Bratislava - Ružinov', salary: '1100€ - 1350€', salaryMin: 1100, salaryMax: 1350, datePosted: '2026-03-15' },
  { id: 2, title: 'Čašník / Servírka', company: 'Reštaurácia Staré Mesto', location: 'Košice / Centrum', salary: '900€ - 1050€', salaryMin: 900, salaryMax: 1050, datePosted: '2026-03-12' },
  { id: 3, title: 'Samostatný kuchár', company: 'Hotel Riverside', location: 'Poprad / Vysoké Tatry', salary: '1500€ - 2000€', salaryMin: 1500, salaryMax: 2000, datePosted: '2026-03-09' },
  { id: 4, title: 'Skladník / Vodič', company: 'Logistics Park', location: 'Senec', salary: '1200€ - 1450€', salaryMin: 1200, salaryMax: 1450, datePosted: '2026-03-10' },
  { id: 5, title: 'Barman', company: 'Sky Bar & Lounge', location: 'Bratislava', salary: '1000€ - 1200€', salaryMin: 1000, salaryMax: 1200, datePosted: '2026-03-08' },
  { id: 6, title: 'Upratovačka / Chyžná', company: 'Penzión Pohoda', location: 'Banská Bystrica', salary: '850€ - 950€', salaryMin: 850, salaryMax: 950, datePosted: '2026-03-11' },
  { id: 7, title: 'Recepčný / Recepčná', company: 'Hotel Central', location: 'Bratislava - Staré Mesto', salary: '1150€ - 1300€', salaryMin: 1150, salaryMax: 1300, datePosted: '2026-03-18' },
  { id: 8, title: 'Operátor výroby', company: 'Techline Slovakia', location: 'Trnava', salary: '1050€ - 1250€', salaryMin: 1050, salaryMax: 1250, datePosted: '2026-03-17' },
  { id: 9, title: 'Asistent/ka kancelárie', company: 'Office Support', location: 'Nitra', salary: '1200€ - 1400€', salaryMin: 1200, salaryMax: 1400, datePosted: '2026-03-16' },
  { id: 10, title: 'Kuriér / Rozvozca', company: 'DPD Slovakia', location: 'Bratislava - Petržalka', salary: '1000€ - 1300€', salaryMin: 1000, salaryMax: 1300, datePosted: '2026-03-14' },
  { id: 11, title: 'Učiteľ / Lektor', company: 'Jazyková škola Lingua', location: 'Prešov', salary: '900€ - 1100€', salaryMin: 900, salaryMax: 1100, datePosted: '2026-03-13' },
  { id: 12, title: 'Skladový operátor', company: 'Amazon Fulfillment', location: 'Senec', salary: '1250€ - 1500€', salaryMin: 1250, salaryMax: 1500, datePosted: '2026-03-19' },
  { id: 13, title: 'Zákaznícka podpora', company: 'HelpDesk Solutions', location: 'Košice', salary: '1050€ - 1250€', salaryMin: 1050, salaryMax: 1250, datePosted: '2026-03-20' },
  { id: 14, title: 'Šéfkuchár / Kuchár', company: 'Bistro Panorama', location: 'Žilina', salary: '1400€ - 1700€', salaryMin: 1400, salaryMax: 1700, datePosted: '2026-03-21' },
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
  authMessage = signal('');
  authError = signal('');
  authEmail = signal('');
  authPassword = signal('');
  authPanelOpen = signal(false);
  authMode = signal<'register' | 'login'>('register');
  currentUser = signal<User | null>(null);

  profileEditOpen = signal(false);
  profileDraft = signal<ProfileDraft>({
    languages: [],
    skills: [],
    preferences: [],
    desiredRoles: [],
    preferredLocations: [],
    experienceLevel: '',
    desiredSalary: '',
  });

  readonly languageOptions = [
    { value: '🇸🇰 Slovenčina', label: '🇸🇰 Slovenčina' },
    { value: '🇬🇧 Angličtina', label: '🇬🇧 Angličtina' },
    { value: '🇩🇪 Nemčina', label: '🇩🇪 Nemčina' },
    { value: '🇨🇿 Čeština', label: '🇨🇿 Čeština' },
    { value: '🇷🇺 Ruština', label: '🇷🇺 Ruština' },
    { value: '🇵🇱 Poľština', label: '🇵🇱 Poľština' },
    { value: '🇪🇸 Španielčina', label: '🇪🇸 Španielčina' },
  ];

  readonly skillOptions = [
    { value: 'Komunikácia', label: 'Komunikácia' },
    { value: 'Tímová práca', label: 'Tímová práca' },
    { value: 'Organizácia', label: 'Organizácia' },
    { value: 'Excel', label: 'Excel' },
    { value: 'Zákaznícky servis', label: 'Zákaznícky servis' },
    { value: 'Logistika', label: 'Logistika' },
  ];

  readonly preferenceOptions = [
    { value: 'Plný úväzok', label: 'Plný úväzok' },
    { value: 'Čiastočný úväzok', label: 'Čiastočný úväzok' },
    { value: 'Flexibilný čas', label: 'Flexibilný čas' },
    { value: 'Home office', label: 'Home office' },
    { value: 'Smenný režim', label: 'Smenný režim' },
  ];

  readonly roleOptions = [
    { value: 'Administratíva', label: 'Administratíva' },
    { value: 'Predaj', label: 'Predaj' },
    { value: 'Logistika', label: 'Logistika' },
    { value: 'Gastronómia', label: 'Gastronómia' },
    { value: 'IT a podpora', label: 'IT a podpora' },
    { value: 'Zákaznícky servis', label: 'Zákaznícky servis' },
  ];

  readonly locationOptions = [
    { value: 'Bratislava', label: 'Bratislava' },
    { value: 'Košice', label: 'Košice' },
    { value: 'Prešov', label: 'Prešov' },
    { value: 'Nitra', label: 'Nitra' },
    { value: 'Trnava', label: 'Trnava' },
    { value: 'Žilina', label: 'Žilina' },
  ];

  readonly experienceOptions = [
    { value: 'Žiadne skúsenosti', label: 'Žiadne skúsenosti' },
    { value: 'Junior', label: 'Junior' },
    { value: 'Stredná úroveň', label: 'Stredná úroveň' },
    { value: 'Senior', label: 'Senior' },
  ];

  readonly salaryOptions = [
    { value: 'do 1000€', label: 'do 1000€' },
    { value: '1000€ - 1400€', label: '1000€ - 1400€' },
    { value: '1400€ - 1800€', label: '1400€ - 1800€' },
    { value: 'nad 1800€', label: 'nad 1800€' },
  ];

  get selectedLanguages(): string[] {
    return this.profileDraft().languages;
  }

  get selectedSkills(): string[] {
    return this.profileDraft().skills;
  }

  get selectedPreferences(): string[] {
    return this.profileDraft().preferences;
  }

  get selectedRoles(): string[] {
    return this.profileDraft().desiredRoles;
  }

  get selectedLocations(): string[] {
    return this.profileDraft().preferredLocations;
  }

  get selectedExperience(): string {
    return this.profileDraft().experienceLevel;
  }

  get selectedSalary(): string {
    return this.profileDraft().desiredSalary;
  }

  toggleProfileItem(category: 'languages' | 'skills' | 'preferences' | 'desiredRoles' | 'preferredLocations', value: string): void {
    const current = this.profileDraft()[category] as string[];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    this.profileDraft.update((draft) => ({ ...draft, [category]: next } as ProfileDraft));
  }

  setProfileValue(field: 'experienceLevel' | 'desiredSalary', value: string): void {
    this.profileDraft.update((draft) => ({ ...draft, [field]: value } as ProfileDraft));
  }

  private readonly profileStoragePrefix = 'smartjob-user-profile:';

  private getProfileStorageKey(): string {
    const user = this.currentUser();
    return `${this.profileStoragePrefix}${user?.uid || user?.email || 'guest'}`;
  }

  private loadProfileDraft(user: User | null): void {
    const defaultDraft: ProfileDraft = {
      languages: [],
      skills: [],
      preferences: [],
      desiredRoles: [],
      preferredLocations: [],
      experienceLevel: '',
      desiredSalary: '',
    };
    if (!user) {
      this.profileDraft.set(defaultDraft);
      return;
    }

    const stored = localStorage.getItem(this.getProfileStorageKey());
    if (!stored) {
      this.profileDraft.set(defaultDraft);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<ProfileDraft>;
      const languages = Array.isArray(parsed.languages) ? parsed.languages : [];
      const skills = Array.isArray(parsed.skills) ? parsed.skills : [];
      const preferences = Array.isArray(parsed.preferences) ? parsed.preferences : [];
      const desiredRoles = Array.isArray(parsed.desiredRoles) ? parsed.desiredRoles : [];
      const preferredLocations = Array.isArray(parsed.preferredLocations) ? parsed.preferredLocations : [];
      const experienceLevel = typeof parsed.experienceLevel === 'string' ? parsed.experienceLevel : '';
      const desiredSalary = typeof parsed.desiredSalary === 'string' ? parsed.desiredSalary : '';
      this.profileDraft.set({ languages, skills, preferences, desiredRoles, preferredLocations, experienceLevel, desiredSalary });
    } catch {
      this.profileDraft.set(defaultDraft);
    }
  }

  toggleProfileEdit(): void {
    this.profileEditOpen.update((open) => !open);
    this.authMessage.set('');
    this.authError.set('');
  }

  saveProfile(): void {
    if (!this.currentUser()) {
      this.authError.set('Prihláste sa, aby ste mohli upraviť profil.');
      return;
    }

    localStorage.setItem(this.getProfileStorageKey(), JSON.stringify(this.profileDraft()));
    this.authMessage.set('Profil bol uložený.');
    this.profileEditOpen.set(false);
  }

  userName = computed(() => {
    const user = this.currentUser();
    if (!user) return 'Hosť';
    return user.displayName?.trim() || user.email || 'Používateľ';
  });

  userInitials = computed(() => {
    const user = this.currentUser();
    const value = user?.displayName?.trim() || user?.email || '';
    return value
      .split(/[@ ._\-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || 'U';
  });

  isLoggedIn = computed(() => !!this.currentUser());

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

  constructor(private joobleService: JoobleService, private authService: FirebaseAuthService) {}

  ngOnInit(): void {
    // Po otvorení stránky necháme predplnené filtre prázdne.
    // Volanie API vykoná používateľ kliknutím na tlačidlo Hľadať.
    this.authService.onAuthStateChanged((user) => {
      this.currentUser.set(user);
      if (user) {
        this.authPanelOpen.set(false);
        this.authMode.set('login');
      }
      this.loadProfileDraft(user);
    });
  }

  toggleAuthPanel(): void {
    this.authPanelOpen.update((open) => !open);
    this.authMessage.set('');
    this.authError.set('');
  }

  setAuthMode(mode: 'register' | 'login'): void {
    this.authMode.set(mode);
    this.authMessage.set('');
    this.authError.set('');
  }

  loginUser(): void {
    this.authMessage.set('');
    this.authError.set('');
    const email = this.authEmail().trim();
    const password = this.authPassword();

    if (!email || !password) {
      this.authError.set('Vyplňte email a heslo.');
      return;
    }

    this.isLoading.set(true);

    this.authService
      .login(email, password)
      .then((credential) => {
        this.authMessage.set('Prihlásenie bolo úspešné.');
        this.authEmail.set('');
        this.authPassword.set('');
        console.log('Firebase user signed in:', credential.user);
      })
      .catch((err) => {
        console.error('Firebase login error', err);
        this.authError.set(err?.message ?? 'Prihlásenie zlyhalo. Skúste to neskôr.');
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  logoutUser(): void {
    this.authMessage.set('');
    this.authError.set('');
    this.isLoading.set(true);

    this.authService
      .logout()
      .then(() => {
        this.authMessage.set('Boli ste úspešne odhlásený.');
        this.currentUser.set(null);
      })
      .catch((err) => {
        console.error('Firebase logout error', err);
        this.authError.set(err?.message ?? 'Odhlásenie zlyhalo. Skúste to neskôr.');
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  registerUser(): void {
    this.authMessage.set('');
    this.authError.set('');
    const email = this.authEmail().trim();
    const password = this.authPassword();

    if (!email || !password) {
      this.authError.set('Vyplňte email a heslo.');
      return;
    }

    this.isLoading.set(true);

    this.authService
      .register(email, password)
      .then((credential) => {
        this.authMessage.set('Registrácia prebehla úspešne. Skontrolujte svoju emailovú schránku.');
        this.authEmail.set('');
        this.authPassword.set('');
        console.log('Firebase user created:', credential.user);
      })
      .catch((err) => {
        console.error('Firebase registration error', err);
        this.authError.set(err?.message ?? 'Registrácia zlyhala. Skúste to neskôr.');
      })
      .finally(() => {
        this.isLoading.set(false);
      });
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

