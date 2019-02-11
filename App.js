/**
 * Saito Wallet App
 * https://github.com/SaitoTech/SaitoWallet
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';

import { Saito } from 'saito-lib';
import { createStackNavigator, createAppContainer } from "react-navigation";

// Container Screens
import HomeScreen from './src/containers/HomeScreen.js'
import ScanScreen from './src/containers/ScanScreen.js'
import TransactionScreen from './src/containers/TransactionScreen.js'
import WalletScreen from './src/containers/WalletScreen.js'
import ChatScreen from './src/containers/ChatScreen.js'
import ChatScreenDetail from './src/containers/ChatScreenDetail.js'

// Modules
import ReactMod from './src/modules/ReactMod.js'
import ChatCore from './src/modules/ChatCore.js'

// DB
import db from './src/db.js'

//mobx
import { Provider } from 'mobx-react'

// stores
import SaitoStore from './src/stores/saitoStore'
import ChatStore from './src/stores/chatStore'

const AppNavigator = createStackNavigator(
  {
    Home: HomeScreen,
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

export default class App extends Component<Props> {
  saito = new Saito({
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

  constructor(props) {
    super(props)

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