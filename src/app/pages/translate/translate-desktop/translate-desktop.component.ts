import {Component, inject, OnInit} from '@angular/core';
import {Store} from '@ngxs/store';
import {takeUntil, tap} from 'rxjs/operators';
import {BaseComponent} from '../../../components/base/base.component';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
} from '@ionic/angular/standalone';
import {SetSetting} from '../../../modules/settings/settings.actions';
import {AsyncPipe} from '@angular/common';
import {LanguageSelectorComponent} from '../language-selector/language-selector.component';
import {addIcons} from 'ionicons';
import {
  sunnyOutline,
  moonOutline,
  documentText,
  camera,
  mic,
  cloudUpload,
  swapHorizontal,
  arrowDown,
  play,
  pause,
  download,
  shareSocial,
  ellipsisVertical,
  copyOutline,
  arrowForward,
} from 'ionicons/icons';
import {RouterLink} from '@angular/router';
import {Observable} from 'rxjs';
import {InputMode, TranslateStateModel} from '../../../modules/translate/translate.state';
import {TranslationService} from '../../../modules/translate/translate.service';
import {
  FlipTranslationDirection,
  SetInputMode,
  SetSignedLanguage,
  SetSpokenLanguage,
  SetSpokenToSigned,
  SetSpokenLanguageText,
  SetSignWritingText,
  CopySpokenLanguageText,
  DownloadSignedLanguageVideo,
  ShareSignedLanguageVideo,
} from '../../../modules/translate/translate.actions';
import {VideoStateModel} from '../../../core/modules/ngxs/store/video/video.state';
import {VideoModule} from '../../../components/video/video.module';
import {UploadComponent} from '../signed-to-spoken/upload/upload.component';
import {SpokenLanguageInputComponent} from '../spoken-to-signed/spoken-language-input/spoken-language-input.component';
import {SignedLanguageOutputComponent} from '../spoken-to-signed/signed-language-output/signed-language-output.component';

const FAKE_WORDS = [
  {
    time: 0.618368,
    sw: ['M507x523S15a28494x496'],
    text: 'B',
  },
  {
    time: 0.876432,
    sw: ['M507x523S15a28494x496S26500493x477'],
    text: 'Your',
  },
  {
    time: 1.102468,
    sw: ['M507x523S15a28494x496S26500493x477', 'M522x525S11541498x491S115494'],
    text: 'Your h',
  },
  {
    time: 1.102468,
    sw: ['M507x523S15a28494x496S26500493x477', 'M522x525S11541498x491'],
    text: 'Your h',
  },
  {
    time: 1.438297,
    sw: ['M507x523S15a28494x496S26500493x477', 'M522x525S11541498x491S11549479x498'],
    text: 'Your',
  },
  {
    time: 1.628503,
    sw: ['M507x523S15a28494x496S26500493x477', 'M522x525S11541498x491S11549479x498S20500489x476'],
    text: 'Your',
  },
  {
    time: 1.786967,
    sw: ['M507x523S15a28494x496S26500493x477', 'M522x525S11541498x491S11549479x498S20600489x476'],
    text: 'Your name',
  },
  {
    time: 1.993408,
    sw: [
      'M507x523S15a28494x496S26500493x477',
      'M522x525S11541498x491S11549479x498S20600489x476',
      'M554x585S30a00481x488S14c39465x545S14c31508x546',
    ],
    text: 'Your name',
  },
  {
    time: 2.163386,
    sw: [
      'M507x523S15a28494x496S26500493x477',
      'M522x525S11541498x491S11549479x498S20600489x476',
      'M554x585S30a00481x488S30300481x477S14c31508x546S14c39465x545S26506539x545S26512445x545',
    ],
    text: 'Your name',
  },
  {
    time: 3.113322,
    sw: [
      'M507x523S15a28494x496S26500493x477',
      'M522x525S11541498x491S11549479x498S20600489x476',
      'M554x585S30a00481x488S30300481x477S14c31508x546S14c39465x545S27102539x545S27116445x545',
    ],
    text: 'What is your name?',
  },
];

@Component({
  selector: 'app-translate-desktop',
  templateUrl: './translate-desktop.component.html',
  styleUrls: ['./translate-desktop.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    LanguageSelectorComponent,
    SpokenLanguageInputComponent,
    SignedLanguageOutputComponent,
    UploadComponent,
    VideoModule,
    RouterLink,
    AsyncPipe,
  ],
})
export class TranslateDesktopComponent extends BaseComponent implements OnInit {
  private store = inject(Store);
  translation = inject(TranslationService);

  spokenToSigned$ = this.store.select<boolean>(state => state.translate.spokenToSigned);
  theme$ = this.store.select<string>(state => state.settings.theme);
  spokenLanguage$ = this.store.select<string>(state => state.translate.spokenLanguage);
  signedLanguage$ = this.store.select<string>(state => state.translate.signedLanguage);
  detectedLanguage$ = this.store.select<string>(state => state.translate.detectedLanguage);
  inputMode$ = this.store.select<InputMode>(state => state.translate.inputMode);
  spokenLanguageText$ = this.store.select<string>(state => state.translate.spokenLanguageText);
  videoState$ = this.store.select<VideoStateModel>(state => state.video);

  spokenToSigned: boolean;
  inputMode: InputMode = 'text';
  selectedTab: 'text' | 'camera' | 'voice' | 'upload' = 'text';

  constructor() {
    super();

    addIcons({
      sunnyOutline,
      moonOutline,
      documentText,
      camera,
      mic,
      cloudUpload,
      swapHorizontal,
      arrowDown,
      play,
      pause,
      download,
      shareSocial,
      ellipsisVertical,
      copyOutline,
      arrowForward,
    });
  }

  toggleTheme(currentTheme: string): void {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.store.dispatch(new SetSetting('theme', nextTheme));
  }

  setSignedLanguage(lang: string): void {
    this.store.dispatch(new SetSignedLanguage(lang));
  }

  setSpokenLanguage(lang: string): void {
    this.store.dispatch(new SetSpokenLanguage(lang));
  }

  swapLanguages(): void {
    this.store.dispatch(FlipTranslationDirection);
  }

  updateSelectedTab(): void {
    if (this.spokenToSigned) {
      if (this.selectedTab !== 'voice') {
        this.selectedTab = 'text';
      }
    } else {
      if (this.inputMode === 'webcam') {
        this.selectedTab = 'camera';
      } else if (this.inputMode === 'upload') {
        this.selectedTab = 'upload';
      }
    }
  }

  selectTab(tab: 'text' | 'camera' | 'voice' | 'upload'): void {
    this.selectedTab = tab;
    if (tab === 'text') {
      this.store.dispatch(new SetSpokenToSigned(true));
    } else if (tab === 'camera') {
      this.store.dispatch(new SetSpokenToSigned(false));
      this.store.dispatch(new SetInputMode('webcam'));
    } else if (tab === 'voice') {
      this.store.dispatch(new SetSpokenToSigned(true));
      // Focus textarea to indicate voice input is active
      setTimeout(() => {
        const textarea = document.getElementById('desktop');
        if (textarea) {
          textarea.focus();
        }
      }, 50);
    } else if (tab === 'upload') {
      this.store.dispatch(new SetSpokenToSigned(false));
      this.store.dispatch(new SetInputMode('upload'));
    }
  }

  triggerTranslate(): void {
    const textarea = document.getElementById('desktop');
    if (textarea) {
      textarea.focus();
    }
  }

  copyInputText(): void {
    this.store.dispatch(new CopySpokenLanguageText());
  }

  downloadVideo(): void {
    this.store.dispatch(new DownloadSignedLanguageVideo());
  }

  shareVideo(): void {
    this.store.dispatch(new ShareSignedLanguageVideo());
  }

  ngOnInit(): void {
    this.spokenToSigned$
      .pipe(
        tap(spokenToSigned => {
          this.spokenToSigned = spokenToSigned;
          this.updateSelectedTab();
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();

    this.inputMode$
      .pipe(
        tap(inputMode => {
          this.inputMode = inputMode;
          this.updateSelectedTab();
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();

    // Fake translation loop (from SignedToSpokenComponent)
    let lastArray = [];
    let lastText = '';

    if (typeof requestAnimationFrame !== 'undefined') {
      const f = () => {
        if (!this.spokenToSigned) {
          const video = document.querySelector('video');
          if (video) {
            let resultArray = [];
            let textResult = '';
            for (const step of FAKE_WORDS) {
              if (step.time <= video.currentTime) {
                textResult = step.text;
                resultArray = step.sw;
              }
            }

            if (textResult !== lastText) {
              this.store.dispatch(new SetSpokenLanguageText(textResult));
              lastText = textResult;
            }

            if (JSON.stringify(resultArray) !== JSON.stringify(lastArray)) {
              this.store.dispatch(new SetSignWritingText(resultArray));
              lastArray = resultArray;
            }
          }
        }

        requestAnimationFrame(f);
      };
      f();
    }
  }
}
