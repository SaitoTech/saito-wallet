/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  Alert,
  Button,
  Clipboard,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { createStackNavigator, createAppContainer } from "react-navigation";
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Saito } from 'saito-lib';

// Components
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

// stores
import { Provider, observer, inject } from 'mobx-react'
import ChatStore from './src/stores/chatStore'

const new_saito = new Saito({
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
});

async function initSaito(props) {
  console.log(props)
  new_saito.modules.mods.push(new ReactMod(props))
  new_saito.modules.mods.push(new ChatCore(props.props.chatStore, new_saito, props))
  await new_saito.init()
  console.log(new_saito)
}

type Props = {};

@inject('chatStore')
@observer
class HomeScreen extends Component<Props> {
  constructor(props) {
    super(props)
    props.app = this
    initSaito(this)
    // this.props = props;
    console.log(this);
  }

  static navigationOptions = {
    header: null
  }

  render() {
    return (
      <View style={styles.container}>
        <Image
          style={{width: 100, height: 100, marginTop: 45}}
          source={require('./assets/img/Logo-blue.png')}
        />
        <Text style={styles.header}>Saito Wallet</Text>
        <Text style={styles.welcome}>BALANCE: {new_saito.wallet.wallet.balance}</Text>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          // alignItems: 'center',
          height: 40,
          // width: Dimensions.get('window').width / 1.2,
          margin: 15,
          }}>
          <ScrollView style={{backgroundColor: "#F5FCFF", marginRight: 10}} horizontal={true} >
            <Text style={styles.instructions}>{new_saito.wallet.wallet.publickey}</Text>
          </ScrollView>
          <TouchableOpacity onPress={() => Clipboard.setString(new_saito.wallet.wallet.publickey)}>
            <Icon size={35} name="clipboard"/>
          </TouchableOpacity>
        </View>
        <View style={{
          flexDirection: 'row',
        }}>
          <View style={{
            flex: 1,
            margin: 10
          }}>
            <Button
              title="Reset Wallet"
              color="#ff8844"
              raised={true}
              onPress={() => console.log("Wallet Reset")}
            />
          </View>
          <View style={{
            flex: 1,
            margin: 10
          }}>
            <Button
              title="Import Wallet"
              color="#ff8844"
              raised={true}
              onPress={() => console.log("Wallet Imported")}
            />
          </View>
        </View>
        <Text style={styles.moduleHeader}>MODULES</Text>
        <View style={{
          flex: 2,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginBottom: 15
        }}>
          <TouchableOpacity style={styles.module}>
            <Icon name="envelope" size={40} color="black" />
            <Text style={styles.moduleText}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.module}>
            <Icon name="reddit-alien" size={40} color="black" />
            <Text style={styles.moduleText}>Reddit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.module}>
            <Icon name="facebook-square" size={40} color="black" />
            <Text style={styles.moduleText}>Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.module}
            onPress={() => this.props.navigation.navigate('Transactions', { saito: new_saito })}>
            <Icon name="link" size={40} color="black" />
            <Text style={styles.moduleText}>Send TX</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.module}
            onPress={() => this.props.navigation.navigate('Wallet', { saito: new_saito })}>
            <Icon name="wallet" size={40} color="black" />
            <Text style={styles.moduleText}>Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.module}
            onPress={() => this.props.navigation.navigate('Chat', { saito: new_saito })}>
            <Icon name="rocketchat" size={40} color="black" />
            <Text style={styles.moduleText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

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
  render() {
    return (
      <Provider chatStore={new ChatStore(new_saito)}>
        <AppContainer />
      </Provider>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#F5FCFF',
    backgroundColor: 'rgba(240, 240, 240, 0.5)',
  },
  header: {
    fontFamily: 'Titillium Web',
    fontSize: 42,
    textAlign: 'center',
    marginTop: 5
  },
  welcome: {
    fontFamily: 'Titillium Web',
    fontSize: 28,
    textAlign: 'right',
    // margin: 10,
  },
  instructions: {
    fontFamily: 'Titillium Web',
    // textAlign: 'left',
    alignSelf: 'center',
    color: '#333333',
    fontSize: 18,
    marginLeft: 10
  },
  module: {
    height: 50,
    width: Dimensions.get('window').width / 3,
    alignItems: 'center',
    marginBottom: 25
  },
  moduleHeader: {
    fontFamily: 'Titillium Web',
    fontSize: 22,
    margin: 10
  },
  moduleText: {
    fontFamily: 'Titillium Web',
    borderRadius: 10
  }
});
