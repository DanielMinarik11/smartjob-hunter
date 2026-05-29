import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

export interface ApplicationMessage {
  sender: 'user' | 'assistant';
  text: string;
}

type QuestionTab = 'prihlaska' | 'cv' | 'dokumenty' | 'styl';

@Component({
  selector: 'app-application-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './application-panel.component.html',
  styleUrls: ['./application-panel.component.css'],
})
export class ApplicationPanelComponent implements AfterViewChecked, AfterViewInit {
  @ViewChild('chatMessagesContainer') chatMessagesContainer!: ElementRef<HTMLDivElement>;

  @Input() job: Job | null = null;
  @Input() applicationNote = '';
  @Output() applicationNoteChange = new EventEmitter<string>();
  @Input() applicationFiles: Array<{ name: string; size: number; type: string }> = [];
  @Input() applicationMessages: ApplicationMessage[] = [];
  @Input() applicationStatus = '';
  @Input() chatInput = '';
  @Input() isSaved = false;

  private lastMessageCount = 0;

  readonly suggestedQuestionsByTab: Record<QuestionTab, { label: string; questions: string[] }> = {
    prihlaska: {
      label: 'Príprava prihlášky',
      questions: [
        'Ako mám napísať motivačný list?',
        'Pomôž mi upraviť text prihlášky.',
        'Ako mám zdôrazniť svoju motiváciu?',
        'Napíš mi kratší a profesionálnejší text prihlášky.',
      ],
    },
    cv: {
      label: 'Životopis a zručnosti',
      questions: [
        'Ako mám opísať skúsenosti v životopise?',
        'Ako mám napísať zručnosti pre túto pozíciu?',
        'Pomôž mi s formátovaním životopisu.',
        'Ako mám vysvetliť chýbajúcu skúsenosť?',
      ],
    },
    dokumenty: {
      label: 'Dokumenty',
      questions: [
        'Čo mám priložiť k prihláške?',
        'Mám priložiť certifikáty?',
        'Ako mám pripraviť balík dokumentov?',
        'Aké ďalšie súbory môžem pridať?',
      ],
    },
    styl: {
      label: 'Štýl a formulácie',
      questions: [
        'Ako mám text spraviť profesionálnejší?',
        'Ako mám zlepšiť formuláciu?',
        'Napíš mi príklad dobrej odpovede.',
        'Ako mám vyjadriť záujem o pozíciu?',
      ],
    },
  };

  selectedQuestionTab: QuestionTab = 'prihlaska';

  @Output() close = new EventEmitter<void>();
  @Output() send = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() help = new EventEmitter<void>();
  @Output() chatInputChange = new EventEmitter<string>();
  @Output() chatSend = new EventEmitter<void>();
  @Output() filesChanged = new EventEmitter<Event>();
  @Output() fileRemove = new EventEmitter<number>();

  onNoteChange(value: string): void {
    this.applicationNoteChange.emit(value);
  }

  onFilesChanged(event: Event): void {
    this.filesChanged.emit(event);
  }

  onChatInputChange(value: string): void {
    this.chatInputChange.emit(value);
  }

  selectQuestionTab(tab: string): void {
    if (tab === 'prihlaska' || tab === 'cv' || tab === 'dokumenty' || tab === 'styl') {
      this.selectedQuestionTab = tab;
    }
  }

  applySuggestedQuestion(question: string): void {
    this.onChatInputChange(question);
  }

  get selectedSuggestedQuestions(): string[] {
    return this.suggestedQuestionsByTab[this.selectedQuestionTab].questions;
  }

  ngAfterViewInit(): void {
    this.scrollChatToBottom();
    this.lastMessageCount = this.applicationMessages.length;
  }

  ngAfterViewChecked(): void {
    if (this.applicationMessages.length !== this.lastMessageCount) {
      this.scrollChatToBottom();
      this.lastMessageCount = this.applicationMessages.length;
    }
  }

  private scrollChatToBottom(): void {
    const chatElement = this.chatMessagesContainer?.nativeElement;
    if (!chatElement) {
      return;
    }

    requestAnimationFrame(() => {
      chatElement.scrollTop = chatElement.scrollHeight;
    });
  }

  sendChat(): void {
    this.chatSend.emit();
  }

  removeFile(index: number): void {
    this.fileRemove.emit(index);
  }
}
