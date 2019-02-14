import React, {Component} from 'react'
import { View, Slider } from 'react-native'

import { Container, Body, Content, Header, ListItem, Left, Right, Icon, Title, Button, Separator, Text, StyleProvider } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { observer, inject } from 'mobx-react'

@inject('saito', 'saitoStore')
@observer
export default class SettingsWalletScreen extends Component {
  state= {
    default_fee: this.props.saitoStore.default_fee
  }

  static navigationOptions = ({navigation}) => {
    const { params = {} } = navigation.state
    return {
      header: (
        <StyleProvider style={getTheme(variables)} >
          <Header >
            <Left style={{flex: 1}}>
              <Button transparent onPress={() => {
                  params.saito.storage.saveOptions()
                  navigation.goBack()
                }}>
                <Icon name="arrow-back" />
              </Button>
            </Left>
            <Body style={{flex: 1, alignItems: 'center'}}>
              <Title>
                Default Fee
              </Title>
            </Body>
            <Right style={{flex: 1}}/>
          </Header>
        </StyleProvider>
      )
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({ saito: this.props.saito });
  }

  setDefaultFee() {
    this.props.saito.wallet.wallet.default_fee = this.state.default_fee
    this.props.saitoStore.updateSaitoWallet(this.props.saito)
  }

  render() {
    return (
      <StyleProvider style={getTheme(variables)}>
        <Container>
          <View style={{ flex: 1, justifyContent: 'center'}}>
            <Text style={{
              fontFamily: 'Titillium Web',
              fontSize: 48,
              textAlign: 'center'
            }}>{`${this.state.default_fee.toFixed(3)} SAITO`}</Text>
            <Slider
              value={this.state.default_fee}
              style={{margin: 20}}
              minimumValue={0.005}
              maximumValue={5}
              step={0.005}
              onSlidingComplete={() => this.setDefaultFee()}
              onValueChange={(val) => this.setState({default_fee: Math.round(val * 1000) / 1000})}
            />
          </View>
        </Container>
      </StyleProvider>
    )
  }
}