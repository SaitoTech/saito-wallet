/**
 * Saito Wallet App
 * https://github.com/SaitoTech/SaitoWallet
 *
 * @format
 * @flow
 */

import { Saito } from 'saito-lib';
import React, {Component} from 'react';
import { createStackNavigator, createAppContainer } from "react-navigation";

// Container Screens
import HomeScreen from './src/containers/home/HomeScreen.js'

// settings screen
import SettingsScreen from './src/containers/settings/SettingsScreen.js'
import SettingsWalletScreen from './src/containers/settings/SettingsWalletScreen.js'


import ScanScreen from './src/containers/scanner/ScanScreen.js'
import TransactionScreen from './src/containers/transaction/TransactionScreen.js'
import WalletScreen from './src/containers/wallet/WalletScreen.js'
import ChatScreen from './src/containers/chat/ChatScreen.js'
import ChatScreenDetail from './src/containers/chat/ChatScreenDetail.js'

// Modules
import ReactMod from './src/modules/ReactMod.js'
import ChatCore from './src/modules/ChatCore.js'

import db from './src/db.js'

import { Provider } from 'mobx-react'

import SaitoStore from './src/stores/saitoStore'
import ChatStore from './src/stores/chatStore'

const AppNavigator = createStackNavigator(
  {
    Home: HomeScreen,
    Settings: SettingsScreen,
    WalletSettings: SettingsWalletScreen,
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

    this.saito = new Saito({
      db,
      peers: [{
        host: "apps.saito.network",
        port: 443,
        protocol: "https",
        synctype: "lite"
      }],
      wallet: {
        privatekey: "67e0dbd52d0dbf43e30d4f5e91537eb0af0784db8bede408bd4e49a717d04670",
        publickey: "vNYBdjVc211SxLc9LyQALgrcs3kEe9ZtN9HDHtWsf7pw"
      },
      dns: [{
        host: "apps.saito.network",
        port: 443,
        protocol: "https",
        publickey: "npDwmBDQafC148AyhqeEBMshHyzJww3X777W9TM3RYNv",
        domain: "saito"
      }]
    })

    this.chatStore = new ChatStore(this.saito)
    this.saitoStore = new SaitoStore(this.saito)
  }

  async componentWillMount() {
    this.saito.modules.mods.push(new ReactMod(this.saito, this, this.saitoStore))
    this.saito.modules.mods.push(new ChatCore(this.saito, this.chatStore))

    await this.saito.init()
  }

  render() {
    return (
      <Provider saito={this.saito} saitoStore={this.saitoStore} chatStore={this.chatStore}>
        <AppContainer />
      </Provider>
    )
  }
}