import React, {Component} from 'react';
import { Dimensions } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';

export default class ScanScreen extends Component {
  static navigationOptions = {
    header: null
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