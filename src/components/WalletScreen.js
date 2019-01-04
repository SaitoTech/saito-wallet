import React, {Component} from 'react'
import {View, StyleSheet, Text} from 'react-native'
import QRCode from 'react-native-qrcode';

export default class WalletScreen extends Component {
  static navigationOptions = {
    header: null
  }

  constructor(props) {
    super(props)
    this.state = {};

    const { navigation } = this.props
    const new_saito = navigation.getParam('saito', {})
    this.state.wallet = new_saito.wallet.wallet
  }

  render() {
    return(
      <View style={{flex: 1, alignItems: 'center', marginTop: 60}}>
        <QRCode
          value={this.state.wallet.publickey}
          size={325}
          bgColor='black'
          fgColor='white'/>
        <Text style={styles.welcome}>Wallet QR</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    fontFamily: 'Titillium Web',
    fontSize: 42,
    textAlign: 'center',
    marginTop: 5
  },
  welcome: {
    fontFamily: 'Titillium Web',
    fontSize: 28,
    textAlign: 'right'
  }
});
