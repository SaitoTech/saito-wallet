import config from '../../../saito.config'

import React, {Component} from 'react'

import { Alert } from 'react-native'
import { Container, Body, Content, Header, ListItem, Left, Right, Icon, Title, Button, Separator, Text, StyleProvider } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { observer, inject } from 'mobx-react'

// File System
const RNFS = require('react-native-fs')

@inject('saito', 'saitoStore', 'chatStore')
@observer
export default class SettingsScreen extends Component {

  handleResetEvent() {
    Alert.alert(
      'Wallet Reset',
      'Are you sure you want to reset?',
      [
        { text: 'OK', onPress: () => this.resetWallet()},
        { text: 'Cancel' },
      ]
    )
  }

  async resetWallet() {
    await this.props.saito.storage.resetOptions()
    await this.props.saito.storage.saveOptions()

    await this.props.chatStore.reset()
    await this.props.saito.reset(Object.assign(this.props.saito.options, config))
    await this.props.saitoStore.reset()

    this.props.navigation.navigate("Home")
  }

  importWallet() {
    RNFS.readDir(RNFS.DocumentDirectoryPath + '/SaitoWallet/options')
      .then((result) => {
        return Promise.all([RNFS.stat(result[0].path), result[0].path])
      })
      .then((statResult) => {
        if (statResult[0].isFile()) {
          return RNFS.readFile(statResult[1], 'utf8')
        }
        return 'no file';
      })
      .then(async (contents) => {
        this.props.saito.options = JSON.parse(contents)

        await this.props.saito.storage.saveOptions()
        await this.props.saito.reset(Object.assign(this.props.saito.options, config))
        alert('Wallet Import Successful')
      })
      .catch((err) => {
        console.log(err.message, err.code)
      });
  }

  async exportWallet() {
    const options_string = JSON.stringify(this.props.saito.options)
    const path = RNFS.DocumentDirectoryPath + '/SaitoWallet/options'

    await RNFS.mkdir(path)
    RNFS.writeFile(path + '/saito.wallet.json', options_string, 'utf8')
      .then(success => alert(`Wallet exported successfully to ${path}/saito.wallet.json`))
      .catch(err => alert(`Wallet could not be exported successfully`))
  }

  static navigationOptions = ({navigation}) => {
    return {
      header: (
        <StyleProvider style={getTheme(variables)} >
          <Header >
            <Left style={{flex: 1}}>
              <Button transparent onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" />
              </Button>
            </Left>
            <Body style={{flex: 1, alignItems: 'center'}}>
              <Title>
                Settings
              </Title>
            </Body>
            <Right style={{flex: 1}}/>
          </Header>
        </StyleProvider>
      )
    }
  }

  onPress(navigationKey) {
    this.props.navigation.navigate('Chat')
  }

  render() {
    return (
      <StyleProvider style={getTheme(variables)}>
        <Container>
          <Content>
            <Separator bordered>
              <Text>WALLET</Text>
            </Separator>
            <ListItem onPress={()=> this.props.navigation.navigate("WalletSettings")}>
              <Text>Keys</Text>
            </ListItem>
            <ListItem onPress={() => this.importWallet()}>
              <Text>Import Wallet</Text>
            </ListItem>
            <ListItem onPress={() => this.exportWallet()}>
              <Text>Export Wallet</Text>
            </ListItem>
            <ListItem onPress={() => this.props.navigation.navigate("DefaultFeeSettings")}>
              <Text>Change Default Fee</Text>
            </ListItem>
            {/* <ListItem onPress={() => this.props.navigation.navigate("RestorePrivateKeySettings")}>
              <Text>Restore From Privatekey</Text>
            </ListItem> */}
            <ListItem last onPress={() => this.handleResetEvent()}>
              <Text style={{color: 'red'}}>Reset Wallet</Text>
            </ListItem>
            <Separator bordered>
              <Text>PEERS</Text>
            </Separator>
            <ListItem last onPress={()=> this.props.navigation.navigate("PeerSettings")}>
              <Text>Peer Options</Text>
            </ListItem>
            <Separator bordered>
              <Text>DNS</Text>
            </Separator>
            <ListItem last onPress={()=> this.props.navigation.navigate("DNSSettings")}>
              <Text>DNS Options</Text>
            </ListItem>
          </Content>
        </Container>
      </StyleProvider>
    )
  }
}