import React, {Component} from 'react'
import config from '../../../saito.config'
// import { View } from 'react-native'

import { Container, Body, Content, Form, Header, Label, Left, Right, Icon, Input, Item, Title, Button, Text, StyleProvider } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { observer, inject } from 'mobx-react'
// import { runInThisContext } from 'vm';

@inject('saito', 'saitoStore')
@observer
export default class SettingsRestorePrivateKeyScreen extends Component {
  state= {
    address: ''
  }

  static navigationOptions = ({navigation}) => {
    const { params = {} } = navigation.state
    return {
      header: (
        <StyleProvider style={getTheme(variables)} >
          <Header >
            <Left style={{flex: 1}}>
              <Button transparent onPress={() => {
                  navigation.goBack()
                }}>
                <Icon name="arrow-back" />
              </Button>
            </Left>
            <Body style={{flex: 1, alignItems: 'center'}}>
              <Title>
                Restore
              </Title>
            </Body>
            <Right style={{flex: 1}}>
              <Icon name='camera' style={{color: 'white'}} onPress={() => params.onPress()} />
            </Right>
          </Header>
        </StyleProvider>
      )
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({ onPress: this.onPress });
  }

  onSelect = data => {
    this.setState(Object.assign(this.state, data));
  };

  onPress = () => {
    const { navigation } = this.props;
    navigation.navigate("Scanner", { onSelect: this.onSelect });
  }


  restoreFromPrivateKey() {
    let privatekey = this.state.address
    let publickey = this.props.saito.crypto.returnPublicKey(privatekey);

    if (publickey != "") {

      // regardless of whether we got an identifier, save
      this.props.saito.wallet.wallet.inputs  = [];
      this.props.saito.wallet.wallet.outputs = [];
      this.props.saito.wallet.wallet.privatekey = privatekey;
      this.props.saito.wallet.wallet.publickey  = publickey;

      this.props.saito.dns.fetchIdentifier(publickey, (answer) => {
        if (this.props.saito.dns.isRecordValid(answer) != 0) {
          dns_response = JSON.parse(answer);
          this.props.saito.wallet.wallet.identifier = dns_response.identifier;
        }
        this.props.saito.options.blockchain.lastblock = 0;
        this.props.saito.storage.saveOptions();
        this.props.saito.wallet.saveWallet();

        alert("Your Wallet and Email Address Have Been Restored!");

        this.props.saito.reset(Object.assign(this.props.saito.options, config))
        // this.props.saitoStore.updateSaitoWallet(this.props.saito)

        this.props.navigation.navigate("Home")
      });
    }
  }

  render() {
    return (
      <StyleProvider style={getTheme(variables)}>
        <Content contentContainerStyle={{ flex: 1, justifyContent: 'center'}}>
          <Form>
            <Item floatingLabel>
              <Label>Privatekey</Label>
              <Input onChangeText={(e) => this.setState({ address: e })} />
            </Item>
            <Button full style={{ margin: 10 }} onPress={() => this.restoreFromPrivateKey()}>
              <Text>Restore</Text>
            </Button>
          </Form>
        </Content>
      </StyleProvider>
    )
  }
}