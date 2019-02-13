import React, {Component} from 'react'
import {View} from 'react-native'
import QRCode from 'react-native-qrcode';

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { Body, Header, Left, Right, Icon, Title, Button, StyleProvider } from "native-base";

import {inject} from 'mobx-react'

@inject('saitoStore')
export default class WalletScreen extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      header: (
        <StyleProvider style={getTheme(variables)}>
          <Header>
            <Left style={{flex: 1}}>
              <Button transparent onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" />
              </Button>
            </Left>
            <Body style={{flex: 1, alignItems: 'center'}}>
              <Title>Wallet</Title>
            </Body>
            <Right style={{flex: 1}}>
            </Right>
          </Header>
        </StyleProvider>
      )
    }
  }

  render() {
    const { saitoStore } = this.props
    return(
      <View style={{flex: 1, alignItems: 'center', marginTop: 25}}>
        <QRCode
          value={saitoStore.publickey}
          size={325}
          bgColor='black'
          fgColor='white'/>
      </View>
    )
  }
}
