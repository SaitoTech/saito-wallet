import React, {Component} from 'react'

import { Alert } from 'react-native'
import { Container, Body, Content, Header, ListItem, Left, Right, Icon, Title, Button, Separator, Text, StyleProvider } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { observer, inject } from 'mobx-react'

// File System
const RNFS = require('react-native-fs')

@inject('saito', 'saitoStore')
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
    debugger
    await this.props.saito.storage.resetOptions();
    debugger
    this.props.saito.storage.saveOptions();
    this.props.saitoStore.updateSaitoWallet(this.props.saito);
  }

  importWallet() {
    RNFS.readDir(RNFS.DocumentDirectoryPath + '/SaitoWallet/options')
      .then((result) => {
        debugger
        console.log('GOT RESULT', result)

        // stat the first file
        return Promise.all([RNFS.stat(result[0].path), result[0].path])
      })
      .then((statResult) => {
        debugger
        if (statResult[0].isFile()) {
          // if we have a file, read it
          return RNFS.readFile(statResult[1], 'utf8')
        }
        return 'no file';
      })
      .then((contents) => {
        debugger
        // log the file contents
        this.props.saito.options = JSON.parse(contents)
        this.props.saito.storage.saveOptions()
        this.props.saitoStore.updateSaitoWallet(this.props.saito)
        alert('Wallet Import Successful')
      })
      .catch((err) => {
        console.log(err.message, err.code)
      });
  }

  async exportWallet() {
    debugger
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
            <ListItem>
              <Text>Restore From Privatekey</Text>
            </ListItem>
            <ListItem last onPress={() => this.handleResetEvent()}>
              <Text style={{color: 'red'}}>Reset Wallet</Text>
            </ListItem>

          </Content>
        </Container>
      </StyleProvider>
    )
  }
}