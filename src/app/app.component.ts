import { Component, ViewChild } from '@angular/core';

import { Events, MenuController, Nav, Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Storage } from '@ionic/storage';

import { AboutPage } from '../pages/about/about';
import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { MapPage } from '../pages/map/map';
import { SignupPage } from '../pages/signup/signup';
import { TabsPage } from '../pages/tabs-page/tabs-page';
import { SchedulePage } from '../pages/schedule/schedule';
import { SpeakerListPage } from '../pages/speaker-list/speaker-list';
import { SupportPage } from '../pages/support/support';

import { ConferenceData } from '../providers/conference-data';
import { UserData } from '../providers/user-data';

import { InAppBrowser } from '@ionic-native/in-app-browser';

import { Geolocation } from '@ionic-native/geolocation';

export interface PageInterface {
  title: string;
  name: string;
  component: any;
  icon: string;
  logsOut?: boolean;
  index?: number;
  tabName?: string;
  tabComponent?: any;
}

@Component({
  templateUrl: 'app.template.html'
})
export class ConferenceApp {
  // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;

  // List of pages that can be navigated to from the left menu
  // the left menu only works after login
  // the login page disables the left menu
  appPages: PageInterface[] = [
    { title: 'LISTADO DE GRUTAS POR REGIÓN', name: 'Grutas', component: TabsPage, tabComponent: SchedulePage, index: 0, icon: 'S-icon'},
    { title: '¿QUÉ GRUTA TENGO MÁS CERCA?', name: 'Mapa', component: TabsPage, tabComponent: MapPage, index: 2, icon: 'map-pin-icon' },
    { title: 'VER CAVESINSPAIN EN VERSIÓN WEB', name: 'Web', component: TabsPage, tabComponent: SpeakerListPage, index: 1, icon: 'web-icon'},
    { title: '¡MI GRUTA PREFERIDA NO TIENE VIDEO!', name: 'Video', component: TabsPage, tabComponent: AboutPage, index: 3, icon: 'sad-icon'}
  ];
  loggedInPages: PageInterface[] = [
    { title: 'Account', name: 'AccountPage', component: AccountPage, icon: 'person' },
    { title: 'Support', name: 'SupportPage', component: SupportPage, icon: 'help' },
    { title: 'Logout', name: 'TabsPage', component: TabsPage, icon: 'log-out', logsOut: true }
  ];
  loggedOutPages: PageInterface[] = [
    { title: 'Login', name: 'LoginPage', component: LoginPage, icon: 'log-in' },
    { title: 'Support', name: 'SupportPage', component: SupportPage, icon: 'help' },
    { title: 'Signup', name: 'SignupPage', component: SignupPage, icon: 'person-add' }
  ];
  rootPage: any;

  constructor(
    public events: Events,
    public userData: UserData,
    public menu: MenuController,
    public platform: Platform,
    public confData: ConferenceData,
    public storage: Storage,
    public splashScreen: SplashScreen,
    public inAppBrowser: InAppBrowser,
    public geolocation: Geolocation
  ) {

    // Check if the user has already seen the tutorial
        this.rootPage = TabsPage;
        this.platformReady()

    // load the conference data
    confData.load();

    // decide which menu items should be hidden by current login status stored in local storage
    this.userData.hasLoggedIn().then((hasLoggedIn) => {
      this.enableMenu(hasLoggedIn === true);
    });
    this.enableMenu(true);

    this.listenToLoginEvents();
  }

  openPage(page: PageInterface) {
    let params = {};

    if (page.name == 'Web'){
      this.inAppBrowser.create(
        //Acceso a la web
      `https://cavesinspain.com/`,
        '_blank'
      );
    } else if (page.name == 'Video'){
      this.inAppBrowser.create(
        //Acceso al video promocional
      `https://www.youtube.com/watch?v=9TlLgFNjrwA`,
        '_blank'
      );
    } else  {

          // the nav component was found using @ViewChild(Nav)
          // setRoot on the nav to remove previous pages and only have this page
          // we wouldn't want the back button to show in this scenario
          if (page.index) {
            params = { tabIndex: page.index };
          }

          // If we are already on tabs just change the selected tab
          // don't setRoot again, this maintains the history stack of the
          // tabs even if changing them from the menu
          if (this.nav.getActiveChildNavs().length && page.index != undefined) {
            this.nav.getActiveChildNavs()[0].select(page.index);
          } else {
            // Set the root of the nav with params if it's a tab index
            this.nav.setRoot(page.name, params).catch((err: any) => {
              console.log(`Didn't set nav root: ${err}`);
            });
          }

          if (page.logsOut === true) {
            // Give the menu time to close before changing to logged out
            this.userData.logout();
          }
    }
  }

  listenToLoginEvents() {
    this.events.subscribe('user:login', () => {
      this.enableMenu(true);
    });

    this.events.subscribe('user:signup', () => {
      this.enableMenu(true);
    });

    this.events.subscribe('user:logout', () => {
      this.enableMenu(false);
    });
  }

  enableMenu(loggedIn: boolean) {
    this.menu.enable(loggedIn, 'loggedInMenu');
    this.menu.enable(!loggedIn, 'loggedOutMenu');
  }

  platformReady() {

    //Carga la geolocation
    this.geolocation.getCurrentPosition().then((resp) => {
      console.log(resp.coords.latitude);
      console.log(resp.coords.longitude);
      localStorage.setItem("longitude", JSON.stringify(resp.coords.latitude));
      localStorage.setItem("latitude", JSON.stringify(resp.coords.longitude));
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    // Call any initial plugins when ready
    this.platform.ready().then(() => {
      this.splashScreen.hide();
    });
  }

  goToUrl() {
    this.inAppBrowser.create(
      `https://twitter.com/`,
      '_blank'
    );
  }

  isActive(page: PageInterface) {
    let childNav = this.nav.getActiveChildNavs()[0];

    // Tabs are a special case because they have their own navigation
    if (childNav) {
      if (childNav.getSelected() && childNav.getSelected().root === page.tabComponent) {
        return 'primary';
      }
      return;
    }

    if (this.nav.getActive() && this.nav.getActive().name === page.name) {
      return 'primary';
    }
    return;
  }
}
