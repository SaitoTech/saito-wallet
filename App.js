/**
 * Saito Wallet App
 * https://github.com/SaitoTech/SaitoWallet
 *
 * @format
 * @flow
 */

import './shim.js'
import crypto from 'crypto'

import { Saito } from 'saito-lib';
import config from './saito.config'

import firebase from 'react-native-firebase';

import React, {Component} from 'react';
import { AppState, AsyncStorage, Alert } from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";

// Container Screens
import HomeScreen from './src/containers/home/HomeScreen.js'

// Registry
import RegistryScreen from './src/containers/registry/RegistryScreen.js'

// settings screen
import SettingsScreen from './src/containers/settings/SettingsScreen.js'
import SettingsPeersScreen from './src/containers/settings/SettingsPeersScreen.js'
import SettingsDNSScreen from './src/containers/settings/SettingsDNSScreen.js'

import SettingsWalletScreen from './src/containers/settings/SettingsWalletScreen.js'
import SettingsDefaultFeeScreen from './src/containers/settings/SettingsDefaultFeeScreen.js'
import SettingsRestorePrivateKeyScreen from './src/containers/settings/SettingsRestorePrivateKeyScreen.js'


import ScanScreen from './src/containers/scanner/ScanScreen.js'
import TransactionScreen from './src/containers/transaction/TransactionScreen.js'
import WalletScreen from './src/containers/wallet/WalletScreen.js'
import ChatScreen from './src/containers/chat/ChatScreen.js'
import ChatScreenDetail from './src/containers/chat/ChatScreenDetail.js'

// Modules
import ReactMod from './src/modules/ReactMod.js'
import ChatCore from './src/modules/ChatCore.js'
import Registry from './src/modules/Registry.js'

import { Provider } from 'mobx-react'

import SaitoStore from './src/stores/saitoStore'
import ChatStore from './src/stores/chatStore'
import FaucetScreen from './src/containers/faucet/FaucetScreen.js';

const AppNavigator = createStackNavigator(
  {
    Home: HomeScreen,
    Registry: RegistryScreen,
    Settings: SettingsScreen,
    Faucet: FaucetScreen,
    PeerSettings: SettingsPeersScreen,
    DNSSettings: SettingsDNSScreen,
    WalletSettings: SettingsWalletScreen,
    DefaultFeeSettings: SettingsDefaultFeeScreen,
    RestorePrivateKeySettings: SettingsRestorePrivateKeyScreen,
    Transactions: TransactionScreen,
    Wallet: WalletScreen,
    Chat: ChatScreen,
    ChatDetail: ChatScreenDetail,
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
    this.saitoStore = new SaitoStore(this.saito)

    this.state = {
      appState: AppState.currentState,
    }
  }

  async componentDidMount() {
    this.checkPermission()
    this.createNotificationListeners();
    AppState.addEventListener('change', this._handleAppStateChange)

    this.saito.modules.mods.push(new ReactMod(this, this.saito, this.saitoStore))
    this.saito.modules.mods.push(new ChatCore(this.saito, this.chatStore))
    this.saito.modules.mods.push(new Registry(this.saito, this.saitoStore))

    await this.saito.init()
  }

  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    console.log("ENABLED: ", enabled)
    if (enabled) {
        this.getToken();
    } else {
        this.requestPermission();
    }
  }

  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    console.log("TOKEN: ", fcmToken)
    if (!fcmToken) {
        fcmToken = await firebase.messaging().getToken();
        if (fcmToken) {
            // user has a device token
            console.log("TOKEN: ", fcmToken)
            await AsyncStorage.setItem('fcmToken', fcmToken);
        }
    }
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
    this.notificationListener = firebase.notifications().onNotification((notification) => {
        const { title, body } = notification;
        this.showAlert(title, body);
    });

    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
        const { title, body } = notificationOpen.notification;
        this.showAlert(title, body);
    });

    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
        const { title, body } = notificationOpen.notification;
        this.showAlert(title, body);
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
      <Provider saito={this.saito} saitoStore={this.saitoStore} chatStore={this.chatStore}>
        <AppContainer />
      </Provider>
    )
  }
}