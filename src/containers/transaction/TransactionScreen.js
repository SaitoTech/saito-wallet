import React, { Component } from 'react'
import {
  Alert
} from 'react-native'

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { Container, Body, Content, Header, Form, Left, Right, Icon, Item, Input, Label, Title, Button, Text, StyleProvider } from "native-base";
import { inject } from 'mobx-react';

@inject('saito', 'saitoStore')
export default class TransactionScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      address: '',
      fee: '',
      amt: ''
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

  static navigationOptions = ({navigation}) => {
    const { params = {} } = navigation.state;
    return {
      header: (
        <StyleProvider style={getTheme(variables)}>
          <Header >
            <Left style={{ flex: 1}}>
              <Button transparent onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" />
              </Button>
            </Left>
            <Body style={{ flex: 1}}>
              <Title>Transaction</Title>
            </Body>
            <Right style={{ flex: 1}}>
              <Icon name="camera" style={{color: 'white', fontSize: 28}} onPress={() => params.onPress()} />
            </Right>
          </Header>
        </StyleProvider>
      )
    }
  }

  async handleSendTransactionEvent() {
    var publickey = this.state.address
    if (!this.props.saito.crypto.isPublicKey(publickey)) {
      try {
        publickey = await this.props.saito.dns.fetchPublicKeyPromise(publickey)
      } catch(err) {
        Alert.alert('err', err)
        return
      }
    }

    if (isNaN(this.state.amt)) {
      Alert.alert('Amount provided is not a number. Please enter a valid number')
      return
    }

    this.sendSaitoTransaction(publickey)
  }

  sendSaitoTransaction(publickey) {
    var newtx = this.props.saito.wallet.createUnsignedTransactionWithDefaultFee(
      publickey,
      parseFloat(this.state.amt),
    );

    newtx = this.props.saito.wallet.signTransaction(newtx);

    this.props.saito.network.propagateTransaction(newtx);
    const response = newtx ? 'Your Transaction Has Been Propagated!' : 'Null TX, make sure you have enough funds and your address is correct'
    Alert.alert(response);

    this.setState({
      address: '',
      fee: '',
      amt: ''
    })
  }

  render() {
    return (
      <StyleProvider style={getTheme(variables)}>
        <Container>
          <Content contentContainerStyle={{ flex: 1}}>
            <Text
              adjustsFontSizeToFit={true}
              numberOfLines={1}
              style={{
                fontFamily: 'Titillium Web',
                fontSize: 48,
                textAlign: 'right',
                marginRight: 10,
              }}>{this.props.saitoStore.balance}</Text>
            <Form>
              <Item>
                <Label>Address</Label>
                <Input
                  onChangeText={(text) => this.setState({address: text})}
                  value={this.state.address}
                />
              </Item>
              <Item>
                <Label>Amount</Label>
                <Input
                  keyboardType="numeric"
                  onChangeText={(amt) => this.setState({amt})}
                  value={this.state.amt}
                />
              </Item>
              <Button block dark style={{margin: 10, color: '#1c1c23'}} onPress={() => {this.handleSendTransactionEvent()}}>
                <Text>Send</Text>
              </Button>
            </Form>
          </Content>
        </Container>
      </StyleProvider>
    );
  }
}