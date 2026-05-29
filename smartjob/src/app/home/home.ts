import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from 'firebase/auth';

import { JoobleService } from '../jooble.service';
import { FirebaseAuthService } from '../firebase-auth.service';
import { ApplicationPanelComponent } from './application-panel.component';

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  salaryMin: number;
  salaryMax: number;
  datePosted: string;
  description: string;
  employmentType: string;
  experience: string;
  requirements: string[];
  benefits: string[];
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
  { id: 1, title: 'Predavač / Pokladník', company: 'Lidl Slovenská republika', location: 'Bratislava - Ružinov', salary: '1100€ - 1350€', salaryMin: 1100, salaryMax: 1350, datePosted: '2026-03-15', description: 'Hľadáme spoľahlivého predavača s dobrými komunikačnými zručnosťami.', employmentType: 'Plný úväzok', experience: 'Junior - Stredná úroveň', requirements: ['Zodpovednosť a punktuálnosť', 'Tímový duch', 'Komunikačné zručnosti', 'Flexibilita pri zmene horára'], benefits: ['Stabilný plat', 'Benefitný program', 'Pracovný odev bezplatne', 'Zľavy na nákupy'] },
  { id: 2, title: 'Čašník / Servírka', company: 'Reštaurácia Staré Mesto', location: 'Košice / Centrum', salary: '900€ - 1050€', salaryMin: 900, salaryMax: 1050, datePosted: '2026-03-12', description: 'Rodinná reštaurácia hľadá skúseného čašníka/čašníčku s láskou k hosťom.', employmentType: 'Plný úväzok', experience: 'Stredná úroveň - Senior', requirements: ['Skúsenosti v gastronómii', 'Príjemný vzhľad a prístup', 'Poznalosť typov jedál a nápojov', 'Schopnosť pracovať v tíme'], benefits: ['Smenný režim', 'Bezplatné jedlá počas zmeny', 'Stabilný príjem z mzdy a spropitného', 'Pažba a atmosféra'] },
  { id: 3, title: 'Samostatný kuchár', company: 'Hotel Riverside', location: 'Poprad / Vysoké Tatry', salary: '1500€ - 2000€', salaryMin: 1500, salaryMax: 2000, datePosted: '2026-03-09', description: 'Hotel hľadá skúseného kuchára na prípravu tradičných a moderných jedál.', employmentType: 'Plný úväzok', experience: 'Senior', requirements: ['5+ rokov praxe v kuchyni', 'Závodné certifikáty', 'Vedenie tímu kurátorov', 'Kreativita a inovácii v gastronómii'], benefits: ['Vysoký plat', 'Hotelové ubytovanie so zľavou', 'Možnosť vzdelávania v Európe', 'Prestížne pracovné miesto'] },
  { id: 4, title: 'Skladník / Vodič', company: 'Logistics Park', location: 'Senec', salary: '1200€ - 1450€', salaryMin: 1200, salaryMax: 1450, datePosted: '2026-03-10', description: 'Moderný logistický park hľadá kvalifikovaného skladníka s vodičským oprávnením.', employmentType: 'Plný úväzok + nadčasy', experience: 'Junior - Stredná úroveň', requirements: ['Vodičský preukaz kategórie B minimálne', 'Fyzická zdatnosť', 'Presnosť pri evidencii zásielok', 'Bezpečnosť v doprave'], benefits: ['Príspevok na dopravu', 'Stabilné zamestnanie', 'Pojištění vozidla', 'Tréning a sertifikácia'] },
  { id: 5, title: 'Barman', company: 'Sky Bar & Lounge', location: 'Bratislava', salary: '1000€ - 1200€', salaryMin: 1000, salaryMax: 1200, datePosted: '2026-03-08', description: 'Luxusný bar hľadá skúseného barmana so znalosťou koktailov a barových techník.', employmentType: 'Flexibilný čas / Nočné smeny', experience: 'Stredná úroveň - Senior', requirements: ['Znalosť koktailov a klasických drink receptov', 'Flair bartending', 'Anglicky jazyk', 'Prezentabilný vzhľad'], benefits: ['Vysoké spropitné', 'Bezplatné nápoje počas zmeny', 'Zľavy v baroch siete', 'Prestížna reputácia'] },
  { id: 6, title: 'Upratovačka / Chyžná', company: 'Penzión Pohoda', location: 'Banská Bystrica', salary: '850€ - 950€', salaryMin: 850, salaryMax: 950, datePosted: '2026-03-11', description: 'Rodinný penzión hľadá starostlivú upratovačku na údržbu izieb a spoločných priestorov.', employmentType: 'Plný úväzok', experience: 'Junior - Stredná úroveň', requirements: ['Sviedomitosť a pozornosť k detailom', 'Fyzická zdatnosť', 'Jazykové vedomosti (SK, EN)', 'Ochota pracovať v tíme'], benefits: ['Stabilný príjem', 'Príspevok na dopravu', 'Rodinné prostredie', 'Bezplatné ubytovanie možné'] },
  { id: 7, title: 'Recepčný / Recepčná', company: 'Hotel Central', location: 'Bratislava - Staré Mesto', salary: '1150€ - 1300€', salaryMin: 1150, salaryMax: 1300, datePosted: '2026-03-18', description: 'Moderný hotel v centre Bratislavy hľadá profesionálneho recepčného s dobrými komunikačnými schopnosťami.', employmentType: 'Plný úväzok / Posúvňa', experience: 'Stredná úroveň', requirements: ['Skúsenosti v hotelierste', 'Anglický jazyk minimálne', 'Počítačové znalosti (rezervačný systém)', 'Príjemný vzhľad a manýry'], benefits: ['Zdravotné poistenie', 'Zľavy na ubytovanie a reštauráciu', 'Možnosti školenia', 'Prestížna lokalita'] },
  { id: 8, title: 'Operátor výroby', company: 'Techline Slovakia', location: 'Trnava', salary: '1050€ - 1250€', salaryMin: 1050, salaryMax: 1250, datePosted: '2026-03-17', description: 'Technologická spoločnosť hľadá operátora na prevádzku výrobných zariadení.', employmentType: 'Plný úväzok / Zmeny', experience: 'Junior - Stredná úroveň', requirements: ['Základné počítačové vedomosti', 'Presnosť a pozornosť', 'Ochota pracovať v zmenách', 'Bezpečnosť pri práci'], benefits: ['Stabilný príjem', 'Soškolenie na pracovisku', 'Sociálne benefity', 'Možnosť napredovania'] },
  { id: 9, title: 'Asistent/ka kancelárie', company: 'Office Support', location: 'Nitra', salary: '1200€ - 1400€', salaryMin: 1200, salaryMax: 1400, datePosted: '2026-03-16', description: 'Moderná kancelária hľadá administratívneho asistenta na kompletnú agendu kancelárie.', employmentType: 'Plný úväzok', experience: 'Junior - Stredná úroveň', requirements: ['MS Office (Word, Excel, Outlook)', 'Organizačné schopnosti', 'Telefonická komunikácia', 'Spolupráca s vedením'], benefits: ['Stabilný plat', 'Flexibilný čas', 'Rozvoj kariéry', 'Príjemné pracovné prostredie'] },
  { id: 10, title: 'Kuriér / Rozvozca', company: 'DPD Slovakia', location: 'Bratislava - Petržalka', salary: '1000€ - 1300€', salaryMin: 1000, salaryMax: 1300, datePosted: '2026-03-14', description: 'Kuriérska služba hľadá spoľahlivého kuriéra na rozvoz balíkov v Bratislave.', employmentType: 'Plný úväzok', experience: 'Junior - Stredná úroveň', requirements: ['Vodičský preukaz kategórie B', 'Dobrá orientácia v meste', 'Fyzická zdatnosť', 'Vozidlo (môžeme poskytnúť)'], benefits: ['Vozidlo poskytneme', 'Bezplatné palivo', 'Inovatívne mapovanie trás', 'Stabilný príjem + provisie'] },
  { id: 11, title: 'Učiteľ / Lektor', company: 'Jazyková škola Lingua', location: 'Prešov', salary: '900€ - 1100€', salaryMin: 900, salaryMax: 1100, datePosted: '2026-03-13', description: 'Jazyková škola hľadá kvalifikovaného učiteľa angličtiny s pedagogickými skúsenosťami.', employmentType: 'Flexibilný čas / Plný úväzok', experience: 'Stredná úroveň - Senior', requirements: ['Pedagogické vzdelanie / certifikát', 'Angličtina na najmenej B2 úroveň', 'Skúsenosti s rôznymi vekmi', 'Metodika výuky'], benefits: ['Flexibilný pracovný čas', 'Možnosť online lekcií', 'Príspevok na školenie', 'Atraktívny plat'] },
  { id: 12, title: 'Skladový operátor', company: 'Amazon Fulfillment', location: 'Senec', salary: '1250€ - 1500€', salaryMin: 1250, salaryMax: 1500, datePosted: '2026-03-19', description: 'Veľké logistické centrum hľadá operátorov na triedenie, balenie a expedíciu zásielok.', employmentType: 'Plný úväzok / Zmeny', experience: 'Junior - Stredná úroveň', requirements: ['Fyzická zdatnosť', 'Schopnosť pracovať v tíme', 'Presnosť pri manual tímovaní', 'Ochota na zmeny'], benefits: ['Vysoký plat', 'Jednoduché brigádne miesta', 'Soškolenie na pracovisku', 'Perspektíva na rast'] },
  { id: 13, title: 'Zákaznícka podpora', company: 'HelpDesk Solutions', location: 'Košice', salary: '1050€ - 1250€', salaryMin: 1050, salaryMax: 1250, datePosted: '2026-03-20', description: 'Call centrum hľadá podporu zákazníkov s výnimočnými komunikačnými schopnosťami.', employmentType: 'Plný úväzok / Home office', experience: 'Junior - Stredná úroveň', requirements: ['Skúsenosti v call centre (vítané)', 'Anglický jazyk', 'Strplivosť a empatia', 'IT základy'], benefits: ['Home office režim', 'Stabilný plat + bonus', 'Tréning a mentoring', 'Kariérny rast'] },
  { id: 14, title: 'Šéfkuchár / Kuchár', company: 'Bistro Panorama', location: 'Žilina', salary: '1400€ - 1700€', salaryMin: 1400, salaryMax: 1700, datePosted: '2026-03-21', description: 'Elegantné bistro hľadá kreátívneho kuchára na prípravu európskej kuchyne.', employmentType: 'Plný úväzok', experience: 'Senior', requirements: ['3+ roky skúsenosti v reštaurácii', 'Fyzická zdatnosť', 'Vedenie tímu', 'Tvorba jedálneho lístka'], benefits: ['Vysoký plat', 'Prestížne prostredie', 'Možnosť vzdelávania', 'Stabilná pozícia'] },
  { id: 15, title: 'Stážista v marketingu', company: 'Bluebird Media', location: 'Bratislava', salary: '700€ - 900€', salaryMin: 700, salaryMax: 900, datePosted: '2026-03-22', description: 'Marketingová agentúra hľadá nadšeného stážistu na tvorbu obsahu a správu sociálnych sietí.', employmentType: 'Stáž', experience: 'Junior', requirements: ['Tvorba obsahu', 'Základy sociálnych sietí', 'Kreativita', 'Organizačné schopnosti'], benefits: ['Praktické skúsenosti', 'Mentoring', 'Flexibilný čas', 'Možnosť ďalšieho zamerania'] },
  { id: 16, title: 'Technik údržby', company: 'Facility Pro', location: 'Považská Bystrica', salary: '1150€ - 1400€', salaryMin: 1150, salaryMax: 1400, datePosted: '2026-03-23', description: 'Spoločnosť hľadá technika na preventívnu údržbu a opravy zariadení.', employmentType: 'Plný úväzok', experience: 'Stredná úroveň', requirements: ['Technické zručnosti', 'Bezpečnosť pri práci', 'Schopnosť pracovať samostatne', 'Príprava servisných záznamov'], benefits: ['Stabilná práca', 'Materiálové vybavenie', 'Možnosť školení', 'Príjemné prostredie'] },
  { id: 17, title: 'Grafický dizajnér', company: 'Pixel Studio', location: 'Bratislava - Karlova Ves', salary: '1300€ - 1700€', salaryMin: 1300, salaryMax: 1700, datePosted: '2026-03-24', description: 'Kreatívna agentúra hľadá grafického dizajnéra s citom pre vizuálnu komunikáciu.', employmentType: 'Plný úväzok', experience: 'Stredná úroveň - Senior', requirements: ['Adobe Creative Cloud', 'Základy UI/UX', 'Týmová spolupráca', 'Rýchla adaptácia'], benefits: ['Kreatívny tím', 'Práca na rôznych projektoch', 'Náročné zaujímavé úlohy', 'Flexibilný čas'] },
  { id: 18, title: 'Elektrikár', company: 'Electro Service', location: 'Nitra', salary: '1400€ - 1650€', salaryMin: 1400, salaryMax: 1650, datePosted: '2026-03-25', description: 'Technická firma hľadá skúseného elektrikára pre inštalácie a servis.', employmentType: 'Plný úväzok', experience: 'Senior', requirements: ['Oprávnenie a prax', 'Znalosť elektroinštalácií', 'Presnosť', 'Schopnosť čítať schémy'], benefits: ['Atraktívny plat', 'Pracovné vybavenie', 'Kariérny rast', 'Stabilné zamestnanie'] },
  { id: 19, title: 'Výrobca potravín', company: 'Fresh Food Factory', location: 'Trnava', salary: '980€ - 1180€', salaryMin: 980, salaryMax: 1180, datePosted: '2026-03-26', description: 'Potravinársky závod hľadá pracovníka na výrobu a balenie potravín.', employmentType: 'Plný úväzok / Zmeny', experience: 'Junior', requirements: ['Fyzická zdatnosť', 'Dodržiavanie hygieny', 'Tímová práca', 'Presnosť'], benefits: ['Zmenový režim', 'Bezplatné školenie', 'Sociálne benefity', 'Pracovné oblečenie'] },
  { id: 20, title: 'Správca webu', company: 'WebAcme', location: 'Banská Bystrica', salary: '1250€ - 1500€', salaryMin: 1250, salaryMax: 1500, datePosted: '2026-03-27', description: 'Rastúca spoločnosť hľadá správcu webu pre údržbu a optimalizáciu e-shopu.', employmentType: 'Plný úväzok', experience: 'Stredná úroveň', requirements: ['WordPress', 'SEO základ', 'Analytika', 'Kreatívnosť'], benefits: ['Moderný tím', 'Pružné hodiny', 'Možnosť rozvoja', 'Práca na zaujímavých projektoch'] },
  { id: 21, title: 'Sociálny pracovník', company: 'Centrum pomoci', location: 'Košice', salary: '1150€ - 1350€', salaryMin: 1150, salaryMax: 1350, datePosted: '2026-03-28', description: 'Sociálny inštitút hľadá empatického pracovníka pre kontakt s klientmi.', employmentType: 'Plný úväzok', experience: 'Stredná úroveň', requirements: ['Empatia', 'Komunikácia', 'Organizačné schopnosti', 'Vzťah k ľuďom'], benefits: ['Smysluplná práca', 'Zdravotné poistenie', 'Supervízia', 'Stabilný pracovný tím'] },
  { id: 22, title: 'Montážnik', company: 'Assembly Line', location: 'Prešov', salary: '1180€ - 1400€', salaryMin: 1180, salaryMax: 1400, datePosted: '2026-03-29', description: 'Výrobná firma hľadá montážnika na montáž komponentov a kontrolu kvality.', employmentType: 'Plný úväzok', experience: 'Junior - Stredná úroveň', requirements: ['Ruka v ruke s detailom', 'Schopnosť čítať montážne postupy', 'Precíznosť', 'Pracovná disciplína'], benefits: ['Bezpečné prostredie', 'Pracovné oblečenie', 'Tréning', 'Možnosť kariéry'] },
  { id: 23, title: 'Kniha vedúca', company: 'Book House', location: 'Bratislava - Stred', salary: '930€ - 1100€', salaryMin: 930, salaryMax: 1100, datePosted: '2026-03-30', description: 'Knižný obchod hľadá pomocníka prevádzky a správcu objednávok.', employmentType: 'Plný úväzok', experience: 'Junior', requirements: ['Organizácia', 'Komunikácia', 'Pozornosť k detailom', 'Príjemný prístup'], benefits: ['Stabilný plat', 'Knižný benefit', 'Pracovný tím', 'Typické obchodné prostredie'] },
  { id: 24, title: 'Pediatra', company: 'Clinic Harmony', location: 'Žilina', salary: '2600€ - 3200€', salaryMin: 2600, salaryMax: 3200, datePosted: '2026-03-31', description: 'Mestská klinika hľadá pediatra s ochotou pracovať v ambulancii a na oddelení.', employmentType: 'Plný úväzok', experience: 'Senior', requirements: ['Lekárske vzdelanie', 'Praxis v pediatrii', 'Komunikácia s deťmi', 'Profesionalita'], benefits: ['Vysoký plat', 'Zdravotné služby', 'Prestížne pracovisko', 'Možnosti školení'] },
  { id: 25, title: 'Stážista IT', company: 'DevLab', location: 'Bratislava', salary: '800€ - 1000€', salaryMin: 800, salaryMax: 1000, datePosted: '2026-04-01', description: 'Startup hľadá stážistu na pomoc s IT podporou a interným vývojom.', employmentType: 'Stáž', experience: 'Junior', requirements: ['Základy HTML/CSS', 'Ochota učiť sa', 'Píle', 'Tímová práca'], benefits: ['Možnosť skúseností', 'Moderný startup', 'Mentoring', 'Práca s novými technológiami'] },
  { id: 26, title: 'Operátor linky', company: 'Manufacture Plus', location: 'Lučenec', salary: '1030€ - 1240€', salaryMin: 1030, salaryMax: 1240, datePosted: '2026-04-02', description: 'Výrobný podnik hľadá operátora linky pre montáž a kontrolu produktu.', employmentType: 'Plný úväzok / Zmeny', experience: 'Junior - Stredná úroveň', requirements: ['Precíznosť', 'Bezpečnosť', 'Tímová spolupráca', 'Schopnosť naučiť sa postupy'], benefits: ['Tréning', 'Stabilné zamestnanie', 'Pracovné oblečenie', 'Sociálne benefity'] },
  { id: 27, title: 'Osobný asistent', company: 'Executive Support', location: 'Bratislava', salary: '1220€ - 1450€', salaryMin: 1220, salaryMax: 1450, datePosted: '2026-04-03', description: 'Vedenie spoločnosti hľadá osobného asistenta na koordináciu úloh a komunikáciu.', employmentType: 'Plný úväzok', experience: 'Stredná úroveň', requirements: ['Organizačné zručnosti', 'Priateľský prístup', 'MS Office', 'Konzistentnosť'], benefits: ['Kariérny rast', 'Moderná kancelária', 'Zdravotné poistenie', 'Flexibilný čas'] },
  { id: 28, title: 'Kozmetička', company: 'Beauty Corner', location: 'Košice', salary: '1180€ - 1450€', salaryMin: 1180, salaryMax: 1450, datePosted: '2026-04-04', description: 'Kozmetický salón hľadá energickú kozmetičku na služby a starostlivosť o klientov.', employmentType: 'Plný úväzok', experience: 'Stredná úroveň', requirements: ['Kozmetické zručnosti', 'Empatia', 'Príjemný vzhľad', 'Práca s klientmi'], benefits: ['Vzdelávanie', 'Benefitný program', 'Miniatury', 'Pracovná atmosféra'] },
  { id: 29, title: 'Svetelný technik', company: 'Stage Light Studio', location: 'Bratislava', salary: '1450€ - 1750€', salaryMin: 1450, salaryMax: 1750, datePosted: '2026-04-05', description: 'Hudobné a eventové štúdio hľadá svetelného technika pre prípravu výstupov.', employmentType: 'Nadčasové / eventy', experience: 'Stredná úroveň - Senior', requirements: ['Technické zručnosti', 'Samostatnosť', 'Schopnosť pracovať pod tlakom', 'Práca so zariadením'], benefits: ['Zaujímavé projekty', 'Nadčasové odmeny', 'Tréning', 'Kreatívne prostredie'] },
  { id: 30, title: 'Fyzikálny terapeut', company: 'MoveFit Clinic', location: 'Trnava', salary: '1700€ - 2200€', salaryMin: 1700, salaryMax: 2200, datePosted: '2026-04-06', description: 'Rehabilitačná klinika hľadá fyzikálneho terapeuta pre individuálnu aj skupinovú terapiu.', employmentType: 'Plný úväzok', experience: 'Senior', requirements: ['Diplom zdravotnej zložky', 'Práca s klientmi', 'Empatia', 'Komunikácia'], benefits: ['Prestížna klinika', 'Zdravotné poistenie', 'Možnosti školení', 'Smysluplná práca'] },
  { id: 31, title: 'Správca skladu', company: 'Depot Logistics', location: 'Žilina', salary: '1120€ - 1350€', salaryMin: 1120, salaryMax: 1350, datePosted: '2026-04-07', description: 'Logistická spoločnosť hľadá správcu skladu s orientáciou na bezpečnosť a organizáciu.', employmentType: 'Plný úväzok', experience: 'Stredná úroveň', requirements: ['Organizácia', 'Bezpečnosť', 'Píle', 'Práca v zmenách'], benefits: ['Sociálne benefity', 'Stabilné zamestnanie', 'Pracovné vybavenie', 'Kariérny rast'] },
  { id: 32, title: 'Tester softvéru', company: 'QA Flow', location: 'Bratislava', salary: '1500€ - 1850€', salaryMin: 1500, salaryMax: 1850, datePosted: '2026-04-08', description: 'Softvérová firma hľadá testera na kontrolu kvality a zlepšovanie produktov.', employmentType: 'Plný úväzok', experience: 'Stredná úroveň', requirements: ['Základy testovania', 'Jira', 'Analytické myslenie', 'Tímová spolupráca'], benefits: ['Moderný tech stack', 'Možnosti školení', 'Pružný režim', 'Inovácie'] },
  { id: 33, title: 'Vývozca tovaru', company: 'Cargo World', location: 'Košice', salary: '990€ - 1180€', salaryMin: 990, salaryMax: 1180, datePosted: '2026-04-09', description: 'Nákladná spoločnosť hľadá pracovníka na expedíciu a príjem zásielok.', employmentType: 'Plný úväzok', experience: 'Junior', requirements: ['Organizácia', 'Fyzická zdatnosť', 'Práca s dokumentáciou', 'Punktualita'], benefits: ['Stabilný plat', 'Zmenový režim', 'Bezpečné prostredie', 'Sociálne benefity'] },
  { id: 34, title: 'Editorka obsahu', company: 'Content Craft', location: 'Bratislava', salary: '1200€ - 1450€', salaryMin: 1200, salaryMax: 1450, datePosted: '2026-04-10', description: 'Media spoločnosť hľadá editorku obsahu pre redakčné práce a SEO články.', employmentType: 'Plný úväzok', experience: 'Stredná úroveň', requirements: ['Písanie', 'SEO základ', 'Angličtina', 'Kreativita'], benefits: ['Redakčný tím', 'Možnosť autorského priestoru', 'Kariérny rast', 'Pružný čas'] },
  { id: 35, title: 'Monter', company: 'Build Expert', location: 'Púchov', salary: '1200€ - 1450€', salaryMin: 1200, salaryMax: 1450, datePosted: '2026-04-11', description: 'Stavebná firma hľadá montéra na zhotovovanie a inštalácie stavebných prvkov.', employmentType: 'Plný úväzok', experience: 'Stredná úroveň', requirements: ['Ručné zručnosti', 'Bezpečnosť', 'Práca s nástrojmi', 'Konzistentnosť'], benefits: ['Stabilná práca', 'Pracovné oblečenie', 'Sociálne benefity', 'Možnosť rozvoja'] },
  { id: 36, title: 'Digitálny marketér', company: 'AdVantage', location: 'Bratislava', salary: '1350€ - 1650€', salaryMin: 1350, salaryMax: 1650, datePosted: '2026-04-12', description: 'Digitálna agentúra hľadá marketéra na PPC, social a analýzy.', employmentType: 'Plný úväzok', experience: 'Stredná úroveň', requirements: ['Google Ads', 'Facebook Ads', 'Analytika', 'Kreativita'], benefits: ['Moderné projekty', 'Dynamický tím', 'Možnosť školení', 'Pružný čas'] },
  { id: 37, title: 'Podporný pracovník', company: 'Service Hub', location: 'Nitra', salary: '990€ - 1180€', salaryMin: 990, salaryMax: 1180, datePosted: '2026-04-13', description: 'Služby pre klientov hľadajú podporného pracovníka pre telefonické a emailové kontakty.', employmentType: 'Plný úväzok', experience: 'Junior', requirements: ['Komunikácia', 'Strplivosť', 'Práca so systémom', 'Tímová spolupráca'], benefits: ['Tréning', 'Stabilný príjem', 'Home office možnosť', 'Atraktívny pracovný tím'] },
  { id: 38, title: 'Hasič / Bezpečnostný technik', company: 'SafeGuard', location: 'Košice', salary: '1500€ - 1800€', salaryMin: 1500, salaryMax: 1800, datePosted: '2026-04-14', description: 'Bezpečnostné centrum hľadá technika pre monitorovanie a interakciu s klientmi.', employmentType: 'Plný úväzok', experience: 'Stredná úroveň', requirements: ['Bezpečnostná zodpovednosť', 'Pozornosť k detailom', 'Kompromis', 'Stabilita'], benefits: ['Prísne procesy', 'Zdravotné poistenie', 'Kariérny rast', 'Prestížna zodpovednosť'] },
  { id: 39, title: 'Pracovník recepcie', company: 'Hotel Eco', location: 'Čadca', salary: '1040€ - 1210€', salaryMin: 1040, salaryMax: 1210, datePosted: '2026-04-15', description: 'Hotel hľadá recepčného pracovníka na vedenie recepcie a komunikáciu s hosťami.', employmentType: 'Plný úväzok', experience: 'Junior - Stredná úroveň', requirements: ['Príjemnosť', 'Počítačové zručnosti', 'Organizácia', 'Službovosť'], benefits: ['Ubytovanie zľava', 'Stabilný plat', 'Práca s ľuďmi', 'Mierna flexibilita'] },
  { id: 40, title: 'Systematizátor dokumentov', company: 'Paper Flow', location: 'Trnava', salary: '900€ - 1100€', salaryMin: 900, salaryMax: 1100, datePosted: '2026-04-16', description: 'Spoločnosť hľadá pracovníka na spracovanie, archiváciu a evidenciu dokumentov.', employmentType: 'Plný úväzok', experience: 'Junior', requirements: ['Organizačné schopnosti', 'Precíznosť', 'MS Office', 'Dodržiavanie termínov'], benefits: ['Stabilný pracovný režim', 'Bezpečné prostredie', 'Kariérny rast', 'Príjemná kancelária'] },
  { id: 41, title: 'Digitálny asistent', company: 'Remote Desk', location: 'Bratislava', salary: '1050€ - 1280€', salaryMin: 1050, salaryMax: 1280, datePosted: '2026-04-17', description: 'Remote spoločnosť hľadá digitálneho asistenta pre podporu zákazníkov a operácií.', employmentType: 'Plný úväzok / Remote', experience: 'Junior - Stredná úroveň', requirements: ['Online komunikácia', 'Organizácia', 'Vstavaný prístup', 'IT základ'], benefits: ['Remote práca', 'Pružné hodiny', 'Mentoring', 'Rýchly rast'] },
  { id: 42, title: 'Maloobchodný predajca', company: 'Fashion Point', location: 'Bratislava - Vajnory', salary: '930€ - 1120€', salaryMin: 930, salaryMax: 1120, datePosted: '2026-04-18', description: 'Maloobchodný obchod hľadá predajcu s ochotou pomáhať zákazníkom a pracovať v tíme.', employmentType: 'Plný úväzok', experience: 'Junior', requirements: ['Predajný talent', 'Príjemný prístup', 'Pozornosť k detailom', 'Kompetentnosť'], benefits: ['Spropitné', 'Zľavy pre zamestnancov', 'Priateľské prostredie', 'Rýchly rozvoj'] },
  { id: 43, title: 'Biologický laborant', company: 'Life Lab', location: 'Bratislava', salary: '1600€ - 1950€', salaryMin: 1600, salaryMax: 1950, datePosted: '2026-04-19', description: 'Laboratórium hľadá biológického laboranta na analýzy a evidenciu výsledkov.', employmentType: 'Plný úväzok', experience: 'Stredná úroveň', requirements: ['Laboratórne zručnosti', 'Precíznosť', 'Bezpečnosť', 'Dokumentácia'], benefits: ['Moderné vybavenie', 'Zdravotné poistenie', 'Kariérny rast', 'Kvalitný tím'] },
  { id: 44, title: 'Školiteľ jazykov', company: 'Lingua Plus', location: 'Prešov', salary: '1050€ - 1300€', salaryMin: 1050, salaryMax: 1300, datePosted: '2026-04-20', description: 'Jazyková škola hľadá školiteľa na skupinové a individuálne kurzy.', employmentType: 'Plný úväzok / Flexibilný čas', experience: 'Stredná úroveň', requirements: ['Angličtina', 'Móda učenia', 'Tímová práca', 'Empatia'], benefits: ['Flexibilný čas', 'Príjemný tím', 'Zamestnanecké zľavy', 'Možnosť rozvoja'] },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ApplicationPanelComponent],
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
  expandedJobId = signal<number | null>(null);
  applicationPanelOpen = signal(false);
  applicationJobId = signal<number | null>(null);
  applicationFiles = signal<Array<{ name: string; size: number; type: string }>>([]);
  applicationNote = signal('');
  chatInput = signal('');
  applicationStatus = signal('');
  applicationMessages = signal<Array<{ sender: 'user' | 'assistant'; text: string }>>([]);
  savedJobIds = signal<number[]>([]);

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
  private readonly applicationStoragePrefix = 'smartjob-applications:';
  private readonly savedJobsStoragePrefix = 'smartjob-saved-jobs:';

  private getProfileStorageKey(): string {
    const user = this.currentUser();
    return `${this.profileStoragePrefix}${user?.uid || user?.email || 'guest'}`;
  }

  private getApplicationStorageKey(): string {
    const user = this.currentUser();
    return `${this.applicationStoragePrefix}${user?.uid || user?.email || 'guest'}`;
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

  private getSavedJobsStorageKey(): string {
    const user = this.currentUser();
    return `${this.savedJobsStoragePrefix}${user?.uid || user?.email || 'guest'}`;
  }

  private loadSavedJobs(user: User | null): void {
    const stored = localStorage.getItem(this.getSavedJobsStorageKey());
    if (!stored) {
      this.savedJobIds.set([]);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as number[];
      this.savedJobIds.set(Array.isArray(parsed) ? parsed : []);
    } catch {
      this.savedJobIds.set([]);
    }
  }

  private saveSavedJobs(): void {
    localStorage.setItem(this.getSavedJobsStorageKey(), JSON.stringify(this.savedJobIds()));
  }

  toggleSavedJob(jobId: number): void {
    this.savedJobIds.update((saved) => {
      const next = saved.includes(jobId) ? saved.filter((id) => id !== jobId) : [...saved, jobId];
      return next;
    });
    this.saveSavedJobs();
  }

  isJobSaved(jobId: number): boolean {
    return this.savedJobIds().includes(jobId);
  }

  get savedJobs(): Job[] {
    return this.jobs().filter((job) => this.savedJobIds().includes(job.id));
  }

  toggleProfileEdit(): void {
    this.profileEditOpen.update((open) => !open);
    this.authMessage.set('');
    this.authError.set('');
  }

  toggleJobExpansion(jobId: number): void {
    this.expandedJobId.update((id) => (id === jobId ? null : jobId));
  }

  startApplication(jobId: number, event?: MouseEvent): void {
    const job = this.jobs().find((item) => item.id === jobId);
    if (!job) {
      this.applicationStatus.set('Nenašla sa vybraná ponuka.');
      return;
    }

    this.expandedJobId.set(null);
    this.applicationJobId.set(jobId);
    this.applicationPanelOpen.set(true);
    this.applicationFiles.set([]);
    this.applicationNote.set(`Dobrý deň, rád by som sa uchádzal o pozíciu ${job.title} vo ${job.company}.`);
    this.chatInput.set('');
    this.applicationStatus.set('');
    this.applicationMessages.set([
      {
        sender: 'assistant',
        text: `Ahoj! Pripravil som ti miesto na prihlásenie sa na pozíciu ${job.title}. Napíš mi otázku alebo zadaj text prihlášky a pomôžem ti s úpravou.`,
      },
    ]);

    try {
      document.body.style.overflow = 'hidden';
    } catch {}
  }

  handleApplicationFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) {
      return;
    }

    const files = Array.from(input.files).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    this.applicationFiles.set(files);
    if (files.length) {
      this.applicationMessages.update((messages) => [
        ...messages,
        { sender: 'assistant', text: `Pridané ${files.length} súbor${files.length > 1 ? 'y' : ''}: ${files.map((file) => file.name).join(', ')}` },
      ]);
    }
  }

  removeApplicationFile(index: number): void {
    const next = this.applicationFiles().filter((_, idx) => idx !== index);
    this.applicationFiles.set(next);
  }

  requestApplicationHelp(): void {
    this.appendChatMessage('user', 'Potrebujem pomoc s textom prihlášky.');
    this.appendChatMessage('assistant', 'Samozrejme, môžem ti pomôcť s úpravou textu, formátom životopisu aj výberom súborov.');
  }

  sendChatMessage(): void {
    const question = this.chatInput().trim();
    if (!question) {
      return;
    }

    this.appendChatMessage('user', question);
    this.chatInput.set('');
    this.appendChatMessage('assistant', this.generateAssistantReply(question));
  }

  private appendChatMessage(sender: 'user' | 'assistant', text: string): void {
    this.applicationMessages.update((messages) => [
      ...messages,
      { sender, text },
    ]);
  }

  private generateAssistantReply(question: string): string {
    const normalized = question.toLowerCase();

    if (normalized.includes('životopis') || normalized.includes('cv')) {
      return 'Pre životopis odporúčam nasledovnú štruktúru: 1) krátky úvod s pozíciou, 2) 3–5 kľúčových skúseností, 3) technické alebo pracovné zručnosti, 4) výsledky a dosiahnuté hodnoty. V prihláške potom doplň, prečo sa na túto konkrétnu pozíciu hodíš a čo ti dáva výhodu oproti ostatným kandidátom.';
    }

    if (normalized.includes('motivačný') || normalized.includes('motivac')) {
      return 'Motivačný list môže byť krátky a zameraný na konkrétnu pozíciu. Napíš, prečo ťa práca zaujala, aké skúsenosti máš a čo konkrétne prinesieš do tímu. Príklad: „Zaujala ma táto pozícia, pretože ... v minulosti som ... a chcem rozvíjať ...“.';
    }

    if (normalized.includes('priložiť') || normalized.includes('súbor') || normalized.includes('dokument') || normalized.includes('životopis')) {
      return 'Na prihlášku je najlepšie priložiť životopis, motivačný list a ďalšie relevantné dokumenty podľa pozície. Ak máš viac súborov, uveď ich v logickom poradí a skontroluj, či názvy sú jasné. V paneli ich môžeš pridať cez „Priložené súbory“. ';
    }

    if (normalized.includes('ako napísať') || normalized.includes('napíš mi') || normalized.includes('text') || normalized.includes('prihláš')) {
      return 'Môžeš použiť tento rámec: 1) pozdrav, 2) prečo sa hlásiš, 3) čo ti dáva skúsenosti pre túto pozíciu, 4) záujem o ďalší rozhovor. Napríklad: „Dobrý deň, na pozíciu ... sa hlásim s dôrazom na ...“.';
    }

    if (normalized.includes('chyba') || normalized.includes('čo robiť') || normalized.includes('ako sa') && normalized.includes('prihlásiť')) {
      return 'Ak si nie istý, začni krátkym a profesionálnym textom, používaj konkrétne príklady, vyhýbaj sa veľmi všeobecným formuláciám a vždy sa viaž na danú ponuku. Na odoslanie použiješ tlačidlo „Odoslať prihlášku“ po doplnení textu a súborov.';
    }

    if (normalized.includes('kedy') || normalized.includes('termín') || normalized.includes('deadline')) {
      return 'Termín alebo postup vybírajú firmy individuálne, no v texte je vždy dobré ukázať záujem, rýchlosť a pripravilosť doplniť ďalšie informácie. Ak si v texte nevieš, napíš, že môžeš poskytnúť doplnkové dokumenty okamžite.';
    }

    if (normalized.includes('skúsenosť') || normalized.includes('zručnosť') || normalized.includes('odborné')) {
      return 'Pri opise skúseností začni konkrétnym výsledkom, nie len úlohou. Napríklad: „viedol som projekt ...“, „zvýšil som efektivitu ...“ alebo „pracoval som s ...“. Takýto text pôsobí uplatniteľnejšie a konkrétnejšie.';
    }

    return `Rozumiem otázke: "${question}". Môžem ti pomôcť s úpravou prihlášky, návrhom textu, výberom súborov alebo s tým, ako lepšie vystihnúť zručnosti a motiváciu pre konkrétnu ponuku.`;
  }

  closeApplication(): void {
    this.applicationPanelOpen.set(false);
    this.applicationJobId.set(null);
    this.chatInput.set('');
    this.applicationStatus.set('');
    this.applicationMessages.set([]);
    this.expandedJobId.set(null);
    try {
      document.body.style.overflow = '';
    } catch {}
  }

  sendApplication(): void {
    if (!this.selectedApplicationJob()) {
      this.applicationStatus.set('Vyberte najprv ponuku, na ktorú chcete reagovať.');
      return;
    }

    if (!this.currentUser()) {
      this.applicationStatus.set('Prihláste sa, aby ste mohli odoslať prihlášku.');
      return;
    }

    const applications = JSON.parse(localStorage.getItem(this.getApplicationStorageKey()) ?? '[]') as any[];
    const job = this.selectedApplicationJob()!;
    const payload = {
      jobId: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      sentAt: new Date().toISOString(),
      note: this.applicationNote(),
      attachments: this.applicationFiles(),
      user: this.currentUser()?.email ?? 'Hosť',
    };

    applications.push(payload);
    localStorage.setItem(this.getApplicationStorageKey(), JSON.stringify(applications));
    this.applicationStatus.set('Žiadosť bola uložená do miestnych prihlášok. Môžeš pokračovať v chate alebo pridať ďalšie dokumenty.');

    this.applicationMessages.update((messages) => [
      ...messages,
      { sender: 'assistant', text: 'Vaša prihláška je uložená. Môžem vám pomôcť pripraviť ďalší text alebo skontrolovať podpísanie dokumentov.' },
    ]);
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

  selectedApplicationJob = computed<Job | null>(() => this.jobs().find((job) => job.id === this.applicationJobId()) ?? null);

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

  set minSalary(value: number | string | undefined) {
    const parsed = value === '' || value == null ? undefined : Number(value);
    this.query.update((q) => ({ ...q, minSalary: Number.isFinite(parsed) ? parsed : undefined }));
  }

  get maxSalary(): number | undefined {
    return this.query().maxSalary;
  }

  set maxSalary(value: number | string | undefined) {
    const parsed = value === '' || value == null ? undefined : Number(value);
    this.query.update((q) => ({ ...q, maxSalary: Number.isFinite(parsed) ? parsed : undefined }));
  }

  filteredJobs = computed(() => {
    const all = this.jobs();
    const q = this.query();
    return all.filter((job) => {
      const textMatch = `${job.title} ${job.company} ${job.location}`.toLowerCase().includes(q.keywords.toLowerCase());
      const locationMatch = !q.location || job.location.toLowerCase().includes(q.location.toLowerCase());
      const minMatch = q.minSalary == null || job.salaryMin >= q.minSalary;
      const maxMatch = q.maxSalary == null || job.salaryMax <= q.maxSalary;
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
      this.loadSavedJobs(user);
    });

    // If the page was opened with a hash like #application-<id>, open that application
    try {
      const hash = window.location.hash || '';
      if (hash.startsWith('#application-')) {
        const id = Number(hash.replace('#application-', ''));
        if (Number.isFinite(id)) {
          // open the application panel for the job id found in the hash
          // small timeout to allow component initialization
          setTimeout(() => this.startApplication(id), 100);
        }
      }
    } catch {}
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
      description: item.description ?? item.snippet ?? 'Pozícia bez detailného popisu',
      employmentType: item.employmentType ?? 'Nezuvedené',
      experience: item.experience ?? 'Nezuvedené',
      requirements: Array.isArray(item.requirements) ? item.requirements : ['Požiadavky na kandidáta'],
      benefits: Array.isArray(item.benefits) ? item.benefits : ['Ponúkané benefity'],
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

