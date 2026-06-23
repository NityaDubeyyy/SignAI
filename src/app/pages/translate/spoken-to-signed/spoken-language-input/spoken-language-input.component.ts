import {Component, inject, Input, OnInit} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {debounce, distinctUntilChanged, skipWhile, takeUntil, tap} from 'rxjs/operators';
import {interval, Observable} from 'rxjs';
import {
  SetSpokenLanguage,
  SetSpokenLanguageText,
  SuggestAlternativeText,
  CopySpokenLanguageText,
} from '../../../../modules/translate/translate.actions';
import {Store} from '@ngxs/store';
import {TranslateStateModel} from '../../../../modules/translate/translate.state';
import {BaseComponent} from '../../../../components/base/base.component';
import {IonButton, IonButtons, IonIcon, IonTextarea, IonToolbar} from '@ionic/angular/standalone';
import {SpeechToTextComponent} from '../../../../components/speech-to-text/speech-to-text.component';
import {TranslocoDirective, TranslocoPipe} from '@jsverse/transloco';
import {addIcons} from 'ionicons';
import {addOutline, closeOutline, sparkles, timeOutline, trashOutline, copyOutline} from 'ionicons/icons';
import {AsyncPipe, DecimalPipe} from '@angular/common';
import {TextToSpeechComponent} from '../../../../components/text-to-speech/text-to-speech.component';
import {DesktopTextareaComponent} from './desktop-textarea/desktop-textarea.component';

@Component({
  selector: 'app-spoken-language-input',
  templateUrl: './spoken-language-input.component.html',
  styleUrls: ['./spoken-language-input.component.scss'],
  imports: [
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTextarea,
    DesktopTextareaComponent,
    SpeechToTextComponent,
    ReactiveFormsModule,
    TranslocoPipe,
    DecimalPipe,
    TextToSpeechComponent,
    AsyncPipe,
    TranslocoDirective,
  ],
})
export class SpokenLanguageInputComponent extends BaseComponent implements OnInit {
  private store = inject(Store);
  private readonly historyStorageKey = 'sign-translate.recentTranslations';

  translate$!: Observable<TranslateStateModel>;
  text$!: Observable<string>;
  normalizedText$!: Observable<string>;

  text = new FormControl();
  maxTextLength = 500;
  detectedLanguage!: string;
  spokenLanguage!: string;
  recentTranslations: string[] = [];

  @Input() isMobile = false;

  constructor() {
    super();
    this.translate$ = this.store.select<TranslateStateModel>(state => state.translate);
    this.text$ = this.store.select<string>(state => state.translate.spokenLanguageText);
    this.normalizedText$ = this.store.select<string>(state => state.translate.normalizedSpokenLanguageText);

    addIcons({sparkles, addOutline, timeOutline, closeOutline, trashOutline, copyOutline});
  }

  copyText(): void {
    this.store.dispatch(new CopySpokenLanguageText());
  }

  ngOnInit() {
    this.loadRecentTranslations();

    this.translate$
      .pipe(
        tap(({spokenLanguage, detectedLanguage}) => {
          this.detectedLanguage = detectedLanguage;
          this.spokenLanguage = spokenLanguage ?? detectedLanguage;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();

    // Local text changes
    this.text.valueChanges
      .pipe(
        debounce(() => interval(300)),
        skipWhile(text => !text), // Don't run on empty text, on app launch
        distinctUntilChanged((a, b) => a.trim() === b.trim()),
        tap(text => {
          this.store.dispatch(new SetSpokenLanguageText(text));
          this.saveRecentTranslation(text);
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();

    this.text.valueChanges
      .pipe(
        debounce(() => interval(1000)),
        distinctUntilChanged((a, b) => a.trim() === b.trim()),
        tap(text => this.store.dispatch(new SuggestAlternativeText())),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();

    // Changes from the store
    this.text$
      .pipe(
        tap(text => this.text.setValue(text)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();
  }

  setText(text: string) {
    this.store.dispatch(new SetSpokenLanguageText(text));
  }

  clearText() {
    this.store.dispatch(new SetSpokenLanguageText(''));
  }

  clearRecentTranslations() {
    this.recentTranslations = [];
    this.persistRecentTranslations();
  }

  setDetectedLanguage() {
    this.store.dispatch(new SetSpokenLanguage(this.detectedLanguage));
  }

  private loadRecentTranslations() {
    if (!('localStorage' in globalThis)) {
      return;
    }

    try {
      const storedHistory = localStorage.getItem(this.historyStorageKey);
      this.recentTranslations = storedHistory ? JSON.parse(storedHistory) : [];
    } catch {
      this.recentTranslations = [];
    }
  }

  private saveRecentTranslation(text: string) {
    const trimmedText = text.trim();
    if (trimmedText.length < 2) {
      return;
    }

    this.recentTranslations = [
      trimmedText,
      ...this.recentTranslations.filter(item => item.toLowerCase() !== trimmedText.toLowerCase()),
    ].slice(0, 5);
    this.persistRecentTranslations();
  }

  private persistRecentTranslations() {
    if (!('localStorage' in globalThis)) {
      return;
    }

    localStorage.setItem(this.historyStorageKey, JSON.stringify(this.recentTranslations));
  }
}
