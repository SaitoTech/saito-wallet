import React, { Component } from 'react'
import {
  Alert,
  // Button,
  // Text,
  TextInput,
  View
} from 'react-native'
import getTheme from '../../native-base-theme/components'
import variables from '../../native-base-theme/variables/material'
import { Container, Card, CardItem, Body, Content, Header, Left, Right, Icon, Title, Button, Text, StyleProvider } from "native-base";
// import Icon from 'react-native-vector-icons/FontAwesome5';

export default class TransactionScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      to_address: '',
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
        <Header style={{ backgroundColor: '#E7584B'}}>
          <Left>
            <Button transparent onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>Transaction</Title>
          </Body>
          <Right>
            <Icon name="camera" size={30} onPress={() => params.onPress()} color="black" style={{marginRight: 10}}/>
          </Right>
        </Header>
      )
    }
  }

  sendSaitoTransaction(new_saito) {
    var newtx = new_saito.wallet.createUnsignedTransaction(
      this.state.to_address,
      parseFloat(this.state.amt),
      parseFloat(this.state.fee)
    );

    newtx = new_saito.wallet.signTransaction(newtx);

    new_saito.network.propagateTransaction(newtx);
    const response = newtx ? 'Your Transaction Has Been Propagated!' : 'Null TX, make sure you have enough funds and your address is correct'
    Alert.alert(response);

    this.setState({
      to_address: '',
      fee: '',
      amt: ''
    })
  }

  render() {
    const { navigation } = this.props
    const new_saito = navigation.getParam('saito', {})

    return (
      <StyleProvider style={getTheme(variables)}>
        <Container>
          <Content>
            <View style={{ flex: 1, alignItems: "center", marginTop: 20 }}>
              <Text style={{
                fontFamily: 'Titillium Web',
                fontSize: 28,
                textAlign: 'right'
              }}>BALANCE: {new_saito.wallet.wallet.balance}</Text>
              <TextInput
                style={{height: 60, width: 300, fontSize: 24}}
                placeholder="To Address"
                onChangeText={(text) => this.setState({to_address: text})}
                value={this.state.to_address}
              />
              <TextInput
                style={{height: 60, width: 300, fontSize: 24}}
                keyboardType="numeric"
                placeholder="Fee"
                onChangeText={(fee) => this.setState({fee})}
                value={`${this.state.fee}`}
              />
              <TextInput
                style={{height: 60, width: 300, fontSize: 24}}
                keyboardType="numeric"
                placeholder="Amount"
                onChangeText={(amt) => this.setState({amt})}
                value={`${this.state.amt}`}
              />
              {/* <View style={{ margin: 30, width: 300}}> */}
                <Button
                  onPress={() => {this.sendSaitoTransaction(new_saito)}}
                  containerViewStyle={{width: '100%'}}
                  title="Send"
                  color="#ff8844"
                  raised={true}
                />
              {/* </View> */}
            </View>
          </Content>
        </Container>
      </StyleProvider>
    );
  }
}