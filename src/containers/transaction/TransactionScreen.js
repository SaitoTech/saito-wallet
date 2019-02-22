import React, { Component } from 'react'
import {
  Alert,
  TextInput,
  View
} from 'react-native'

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { Container, Body, Content, Header, Left, Right, Icon, Title, Button, Text, StyleProvider } from "native-base";
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
          <Content>
            <View style={{ flex: 1, alignItems: "center", margin: 5,  marginLeft: 28, marginRight: 28}}>
              <Text style={{
                fontFamily: 'Titillium Web',
                fontSize: 48,
                textAlign: 'left'
              }}>{this.props.saitoStore.balance}</Text>
              <TextInput
                style={{height: 60, width: 300, fontSize: 24}}
                placeholder="To Address"
                onChangeText={(text) => this.setState({address: text})}
                value={this.state.address}
              />
              <TextInput
                style={{height: 60, width: 300, fontSize: 24}}
                keyboardType="numeric"
                placeholder="Amount"
                onChangeText={(amt) => this.setState({amt})}
                value={`${this.state.amt}`}
              />
              <Button block dark style={{marginTop: 20, color: '#1c1c23'}} onPress={() => {this.handleSendTransactionEvent()}}>
                <Text>Send</Text>
              </Button>
            </View>
          </Content>
        </Container>
      </StyleProvider>
    );
  }
}