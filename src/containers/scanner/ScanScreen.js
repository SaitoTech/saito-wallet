import React, {Component} from 'react';
import { Dimensions } from 'react-native';

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { Container, Body, Content, Header, Left, Right, Icon, Title, Button, Text, StyleProvider } from "native-base";

import QRCodeScanner from 'react-native-qrcode-scanner';

export default class ScanScreen extends Component {
  static navigationOptions = ({navigation}) => {
    const { params = {} } = navigation.state;
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
                Scan QR
              </Title>
            </Body>
            <Right style={{flex: 1}}/>
          </Header>
        </StyleProvider>
      )
    }
  }

  onSuccess(e) {
    const { navigation } = this.props;
    navigation.goBack();
    navigation.state.params.onSelect({ to_address: e.data });
  }

  render() {
    return (
      <QRCodeScanner
        onRead={this.onSuccess.bind(this)}
        cameraStyle={{ height: Dimensions.get('window').height }}
      />
    )
  }
}