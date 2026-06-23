import {Component, inject} from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {TranslocoPipe, TranslocoService} from '@jsverse/transloco';
import {arrowForward, sunnyOutline, moonOutline} from 'ionicons/icons';
import {addIcons} from 'ionicons';
import {Store} from '@ngxs/store';
import {AsyncPipe} from '@angular/common';
import {SetSetting} from '../../modules/settings/settings.actions';
import {LandingFooterComponent} from './landing-footer/landing-footer.component';
import {LogoComponent} from '../../components/logo/logo.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  imports: [
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonLabel,
    IonMenuToggle,
    IonItem,
    RouterLink,
    RouterLinkActive,
    IonFooter,
    IonButton,
    TranslocoPipe,
    IonButtons,
    IonMenuButton,
    IonIcon,
    RouterOutlet,
    LandingFooterComponent,
    LogoComponent,
    AsyncPipe,
  ],
})
export class LandingComponent {
  private mediaMatcher = inject(MediaMatcher);
  isMobile = this.mediaMatcher.matchMedia('(max-width: 768px)');

  private store = inject(Store);
  theme$ = this.store.select<string>(state => state.settings.theme);

  pages = [
    {key: 'home', route: '/'},
    {key: 'about', route: '/about'},
  ];

  constructor() {
    addIcons({arrowForward, sunnyOutline, moonOutline});
  }

  toggleTheme(currentTheme: string): void {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.store.dispatch(new SetSetting('theme', nextTheme));
  }

  // TODO: remove this when i18n is supported
  private transloco = inject(TranslocoService);
  lastActiveLang = this.transloco.getActiveLang();

  ionViewWillEnter() {
    this.transloco.setActiveLang('en');
  }

  ionViewWillLeave() {
    this.transloco.setActiveLang(this.lastActiveLang);
  }
}
