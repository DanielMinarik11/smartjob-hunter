import { Component, signal } from '@angular/core';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [], 
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
 
  isLoggedIn = signal(true);
  
  featuredJobs = signal<Job[]>([
  { 
    id: 1, 
    title: 'Predavač / Pokladník', 
    company: 'Lidl Slovenská republika', 
    location: 'Bratislava - Ružinov', 
    salary: '1100€ - 1350€' 
  },
  { 
    id: 2, 
    title: 'Čašník / Servírka', 
    company: 'Reštaurácia Staré Mesto', 
    location: 'Košice / Centrum', 
    salary: '900€ + tringelty' 
  },
  { 
    id: 3, 
    title: 'Samostatný kuchár', 
    company: 'Hotel Riverside', 
    location: 'Poprad / Vysoké Tatry', 
    salary: '1500€ - 2000€' 
  },
  { 
    id: 4, 
    title: 'Skladník / Vodič ', 
    company: 'Logistics Park', 
    location: 'Senec', 
    salary: '1200€ - 1450€' 
  },
  { 
    id: 5, 
    title: 'Barman', 
    company: 'Sky Bar & Lounge', 
    location: 'Bratislava', 
    salary: '1000€ + bonusy' 
  },
  { 
    id: 6, 
    title: 'Upratovačka / Chyžná', 
    company: 'Penzión Pohoda', 
    location: 'Banská Bystrica', 
    salary: '850€ - 950€' 
  }
]);

  constructor() {}
}