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
  imports: [], // CommonModule už v Angular 21 často netreba pri novom flow
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  // Simulované dáta pomocou signálov
  isLoggedIn = signal(true);
  
  featuredJobs = signal<Job[]>([
    { id: 1, title: 'Senior Angular Developer', company: 'TechSolutions', location: 'Bratislava / Remote', salary: '3500€ - 5000€' },
    { id: 2, title: 'Frontend Lead', company: 'Innovate AI', location: 'Košice', salary: '4000€+' },
    { id: 3, title: 'Fullstack Dev (Node/Angular)', company: 'WebFlow', location: 'Remote', salary: '3000€ - 4500€' }
  ]);

  constructor() {}
}