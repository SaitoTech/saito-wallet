/**
 * Saito Wallet App
 * https://github.com/SaitoTech/SaitoWallet
 *
 * @format
 * @flow
 */

import './shim.js'
import crypto from 'crypto'

import { Saito } from 'saito-lib'
import config from './saito.config'

import axios from 'axios'
import firebase from 'react-native-firebase'

import React, {Component} from 'react';
import { AppState, AsyncStorage, Alert } from "react-native"
import { createStackNavigator, createAppContainer, NavigationActions } from "react-navigation"

// Root
import HomeScreen from './src/containers/home/HomeScreen.js'

// Registry
import RegistryScreen from './src/containers/registry/RegistryScreen.js'

// Settings
import SettingsScreen from './src/containers/settings/SettingsScreen.js'
import SettingsPeersScreen from './src/containers/settings/SettingsPeersScreen.js'
import SettingsDNSScreen from './src/containers/settings/SettingsDNSScreen.js'

// Wallet Settings
import SettingsWalletScreen from './src/containers/settings/SettingsWalletScreen.js'
import SettingsDefaultFeeScreen from './src/containers/settings/SettingsDefaultFeeScreen.js'
import SettingsRestorePrivateKeyScreen from './src/containers/settings/SettingsRestorePrivateKeyScreen.js'

// Utilities
import ScanScreen from './src/containers/scanner/ScanScreen.js'
import TransactionScreen from './src/containers/transaction/TransactionScreen.js'
import WalletScreen from './src/containers/wallet/WalletScreen.js'
import FaucetScreen from './src/containers/faucet/FaucetScreen.js';

// Chat
import ChatScreen from './src/containers/chat/ChatScreen.js'
import ChatScreenDetail from './src/containers/chat/ChatScreenDetail.js'

// Email
import EmailScreen from './src/containers/email/EmailScreen.js'
import EmailDetailScreen from './src/containers/email/EmailDetailScreen.js'
import EmailComposeScreen from './src/containers/email/EmailComposeScreen.js'

// Dreddit
import DredditScreen from './src/containers/dreddit/DredditScreen.js'
import DredditPostScreen from './src/containers/dreddit/DredditPostScreen.js'
import DredditEditScreen from './src/containers/dreddit/DredditEditScreen.js'
import DredditDetailScreen from './src/containers/dreddit/DredditDetailScreen.js'

// Modules
import Email from './src/modules/Email.js'
import Dreddit from './src/modules/Dreddit.js'
import ReactMod from './src/modules/ReactMod.js'
import ChatCore from './src/modules/ChatCore.js'
import Registry from './src/modules/Registry.js'

import { Provider } from 'mobx-react'

import ChatStore from './src/stores/chatStore'
import DredditStore from './src/stores/dredditStore'
import EmailStore from './src/stores/emailStore'
import SaitoStore from './src/stores/saitoStore'


const AppNavigator = createStackNavigator(
  {
    // Root
    Home: HomeScreen,

    // Registration
    Registry: RegistryScreen,
    Faucet: FaucetScreen,

    // Settings
    Settings: SettingsScreen,
    PeerSettings: SettingsPeersScreen,
    DNSSettings: SettingsDNSScreen,
    WalletSettings: SettingsWalletScreen,
    DefaultFeeSettings: SettingsDefaultFeeScreen,
    RestorePrivateKeySettings: SettingsRestorePrivateKeyScreen,

    // Transactions
    Transactions: TransactionScreen,

    // Wallet
    Wallet: WalletScreen,

    // Chat
    Chat: ChatScreen,
    ChatDetail: ChatScreenDetail,

    // Email
    Email: EmailScreen,
    EmailCompose: EmailComposeScreen,
    EmailDetail: EmailDetailScreen,

    // Dreddit
    Dreddit: DredditScreen,
    DredditPost: DredditPostScreen,
    DredditEdit: DredditEditScreen,
    DredditDetail: DredditDetailScreen,

    // Scanner
    Scanner: ScanScreen
  },
  {
    initialRouteName: "Home"
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends Component {
  constructor(props) {
    super(props)

    this.saito = new Saito(config)

    this.chatStore = new ChatStore(this.saito)
    this.dredditStore = new DredditStore(this.saito)
    this.emailStore = new EmailStore(this.saito)
    this.saitoStore = new SaitoStore(this.saito)

    this.state = {
      appState: AppState.currentState,
    }
  }

  async componentWillMount() {
    this.checkPermission()
    this.createNotificationListeners();

    AppState.addEventListener('change', this._handleAppStateChange)

    this.saito.modules.mods.push(new Email(this.saito, this.emailStore))
    this.saito.modules.mods.push(new Dreddit(this.saito, this.dredditStore))
    this.saito.modules.mods.push(new ChatCore(this.saito, this.chatStore))
    this.saito.modules.mods.push(new Registry(this.saito, this.saitoStore))
    this.saito.modules.mods.push(new ReactMod(this, this.saito, this.saitoStore))

    await this.saito.init()
  }

  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken')
    console.log("TOKEN: ", fcmToken)
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken()
      if (fcmToken) {
        // user has a device token
        this._linkTokenToPublickey(fcmToken)
        console.log("TOKEN: ", fcmToken)
        await AsyncStorage.setItem('fcmToken', fcmToken)
      }
    }
  }

  _linkTokenToPublickey(token) {
    const payload = {publickey: this.saitoStore.publickey, token}
    axios.post(`${this.saitoStore.getServerURL()}/notify/token/user/`, payload)
      .then(res => console.log(res.data))
      .catch(err => console.log("Failed to upload token"))
  }

  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  }

  componentWillUnmount() {
    this.notificationListener();
    this.notificationOpenedListener();
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.saito.reset(Object.assign(this.saito.options, config))
    }
    this.setState({appState: nextAppState});
  }

  async createNotificationListeners() {
    /*
    * Triggered when a particular notification has been received in foreground
    * */
    // this.notificationListener = firebase.notifications().onNotification((notification) => {
    //     const { title, body } = notification;
    //     this.showAlert(title, body);
    // });

    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
        const { title, body } = notificationOpen.notification;
        // notifications need a payload directing them to the correct module
        this.navigator &&
          this.navigator.dispatch(
            NavigationActions.navigate({ routeName: 'Chat' })
          );
        // this.showAlert(title, body);
        // this.props.navigation.navigate('Chat')
    });

    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
        const { title, body } = notificationOpen.notification;
        // notifications need a payload directing them to the correct module
        // this.navigator &&
        //   this.navigator.dispatch(
        //     NavigationActions.navigate({ routeName: 'Chat' })
        //   );
        // this.showAlert(title, body);
    }
    /*
    * Triggered for data only payload in foreground
    * */
    this.messageListener = firebase.messaging().onMessage((message) => {
      //process data message
      console.log(JSON.stringify(message));
    });
  }

  showAlert(title, body) {
    Alert.alert(
      title, body,
      [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: false },
    );
  }

  render() {
    return (
      <Provider
        saito={this.saito}
        chatStore={this.chatStore}
        saitoStore={this.saitoStore}
        emailStore={this.emailStore}
        dredditStore={this.dredditStore}
        >
        <AppContainer ref={nav => {
          this.navigator = nav;
        }}/>
      </Provider>
    )
  }
}