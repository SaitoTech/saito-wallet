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

import React, {Component} from 'react';
import { createStackNavigator, createAppContainer } from "react-navigation";

// Container Screens
import HomeScreen from './src/containers/home/HomeScreen.js'

// Registry
import RegistryScreen from './src/containers/registry/RegistryScreen.js'

// settings screen
import SettingsScreen from './src/containers/settings/SettingsScreen.js'
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
  }

  async componentDidMount() {
    this.saito.modules.mods.push(new ReactMod(this, this.saito, this.saitoStore))
    this.saito.modules.mods.push(new ChatCore(this.saito, this.chatStore))
    this.saito.modules.mods.push(new Registry(this.saito, this.saitoStore))

    await this.saito.init()
    console.log("SAITO", this.saito)
  }

  render() {
    return (
      <Provider saito={this.saito} saitoStore={this.saitoStore} chatStore={this.chatStore}>
        <AppContainer />
      </Provider>
    )
  }
}