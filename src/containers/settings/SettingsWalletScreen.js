import React, {Component} from 'react'
import { Clipboard } from 'react-native'

import { Container, Body, Content, Header, ListItem, Left, Right, Icon, Title, Button, Separator, Text, StyleProvider } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { observer, inject } from 'mobx-react'

@inject('saito', 'saitoStore')
@observer
export default class SettingsWalletScreen extends Component {

  static navigationOptions = ({navigation}) => {
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
                Wallet Keys
              </Title>
            </Body>
            <Right style={{flex: 1}}/>
          </Header>
        </StyleProvider>
      )
    }
  }

  render() {
    const {navigation} = this.props
    return (
      <StyleProvider style={getTheme(variables)}>
        <Container>
          <Content>
            <ListItem>
              <Text>Publickey</Text>
              <Text note style={{marginLeft: 13, overflow: 'hidden' }}>
                {`${this.props.saitoStore.publickey.substring(0,26)}...`}
              </Text>
              <Right style={{flex: 1}}>
                <Icon name={"clipboard"} onPress={() => Clipboard.setString(this.props.saitoStore.publickey)}/>
              </Right>
            </ListItem>
            <ListItem onPress={() => alert(this.props.saito.wallet.returnPrivateKey())}>
              <Text>Privatekey</Text>
              <Text note password={true} style={{marginLeft: 10, overflow: 'hidden' }}>
                {`${this.props.saito.wallet.returnPrivateKey().substring(0,26)}...`}
              </Text>
              <Right style={{flex:1}}>
                <Icon name={"clipboard"} onPress={() => Clipboard.setString(this.props.saito.wallet.returnPrivateKey())}/>
              </Right>
            </ListItem>
            <ListItem last>
              <Left>
                <Text>Identifier</Text>
              </Left>
              <Body>
                <Text note>
                  { this.props.saito.wallet.returnIdentifier() ? this.props.saito.wallet.returnIdentifier() : "You have not signed up for a name yet" }
                </Text>
              </Body>
            </ListItem>
          </Content>
        </Container>
      </StyleProvider>
    )
  }
}