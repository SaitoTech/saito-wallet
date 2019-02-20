import React, {Component} from 'react'
import { Alert, View } from 'react-native'

import { Container, Body, Content, Form, Header, Label, Left, Right, Icon, Input, Item, Title, Button, Text, StyleProvider } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import {inject} from 'mobx-react'

@inject('saito')
export default class RegistryScreen extends Component {
  state = {
    requested_identifier: ''
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


  sendRequestToNetwork(msg, amount, fee) {
    const {saito} = this.props
    var newtx = saito.wallet.createUnsignedTransaction(this.publickey, amount, fee);

    if (newtx == null) { Alert.alert("Error", "Unable to send TX"); return; }

    newtx.transaction.msg = msg;
    newtx = saito.wallet.signTransaction(newtx);

    saito.network.propagateTransactionWithCallback(newtx, (err) => {
      if (!err) {
        Alert.alert("Success", "Your registration request has been submitted. Please wait for network confirmation")
        this.setState({requested_identifier: ''})
        this.props.navigator.navigate('Homescreen')
      } else {
        Alert.alert("Error", "There was an error submitting your request to the network. This is an issue with your network connection or wallet")
        this.setState({requested_identifier: ''})
      }
    });
  }

  handleRegisrationRequest() {
    const {saito} = this.props
    var msg = {}
        msg.module               = "Registry"
        msg.requested_identifier = this.state.requested_identifier

    var amount = 3.0;
    var fee    = 2.0;

    var regex=/^[0-9A-Za-z]+$/;

    //
    // check regex of input
    //
    if (!regex.test(msg.requested_identifier)) {
      if (msg.requested_identifier != "") {
        Alert.alert("Error", "Only alphanumeric characters permitted in registered name");
        return;
      } else {
        Alert.alert("Error", "Can't submit blank form")
      }
    }


    //
    // check that this entry is valid
    //

    if (saito.dns.isActive() == 0) {
      Alert.alert(
        'DNS Error',
        'You are not connected to a DNS server, so we cannot confirm this address is available. Try to register anyways?',
        [
          { text: 'OK', onPress: () => this.sendRequestToNetwork(msg, amount, fee)},
          { text: 'Cancel' },
        ]
      )

      return;
    }

    saito.dns.fetchPublicKey(`${msg.requested_identifier}@saito`, (answer) => {
      answer = JSON.parse(answer)
      if (answer) {
        if (answer.publickey != "") {
          alert("This address appears to be registered");
        }
      }

      this.sendRequestToNetwork(msg, amount, fee)
    });
  }

  render() {
    return (
      <Content contentContainerStyle={{ flex: 1, justifyContent: 'center'}}>
        <Form>
          <Item floatingLabel>
            <Label>Requested Identifier</Label>
            <Input onChangeText={(e) => this.setState({ requested_identifier: e })} />
          </Item>
          <Button dark full style={{ margin: 10 }} onPress={() => this.handleRegisrationRequest()}>
            <Text>Restore</Text>
          </Button>
        </Form>
      </Content>
    )
  }
}