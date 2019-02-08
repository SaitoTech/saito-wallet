import React, { Component } from 'react'
import {
  Alert,
  Button,
  Text,
  TextInput,
  View
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5';

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
      headerRight: (
        <Icon name="camera" size={30} onPress={() => params.onPress()} color="black" style={{marginRight: 10}}/>
      )
    }
  }

  sendSaitoTransaction(new_saito) {
    console.log(this.state);
    var newtx = new_saito.wallet.createUnsignedTransaction(
      this.state.to_address,
      parseFloat(this.state.amt),
      parseFloat(this.state.fee)
    );
    newtx = new_saito.wallet.signTransaction(newtx);
    console.log("NEW TRANSACTION", newtx);
    new_saito.network.propagateTransaction(newtx);
    const response = newtx ? 'Your Transaction Has Been Propagated!' :
      'Null TX, make sure you have enough funds and your address is correct'
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
        <View style={{ margin: 30, width: 300}}>
          <Button
            onPress={() => {this.sendSaitoTransaction(new_saito)}}
            containerViewStyle={{width: '100%'}}
            title="Send"
            color="#ff8844"
            raised={true}
          />
        </View>
      </View>
    );
  }
}