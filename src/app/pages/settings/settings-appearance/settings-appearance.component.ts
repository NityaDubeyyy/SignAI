import {Component} from '@angular/core';
import {TranslocoDirective, TranslocoPipe} from '@jsverse/transloco';
import {SettingsAppearanceImagesComponent} from './settings-appearance-images/settings-appearance-images.component';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonRadioGroup,
  IonRadio,
} from '@ionic/angular/standalone';
import {BaseSettingsComponent} from '../../../modules/settings/settings.component';
import {AsyncPipe} from '@angular/common';

@Component({
  templateUrl: './settings-appearance.component.html',
  selector: 'app-settings-appearance',
  styleUrls: ['./settings-appearance.component.scss'],
  imports: [
    TranslocoDirective,
    SettingsAppearanceImagesComponent,
    TranslocoPipe,
    AsyncPipe,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonContent,
    IonBackButton,
    IonButtons,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonRadioGroup,
    IonRadio,
  ],
})
export class SettingsAppearanceComponent extends BaseSettingsComponent {}
