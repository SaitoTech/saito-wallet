import React, {Component} from 'react'
import { Alert, View } from 'react-native'

import axios from 'axios'

import { Container, Body, Content, Form, Header, Label, Left, Right, Icon, Input, Item, Title, Button, Text, StyleProvider } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import {inject} from 'mobx-react'

@inject('saito', 'saitoStore')
export default class FaucetScreen extends Component {
  constructor(props) {
    super(props)
  }

  static navigationOptions = ({navigation}) => {
    return {
      header: (
        <StyleProvider style={getTheme(variables)} >
          <Header >
            <Left style={{flex: 1}}>
              <Button transparent onPress={() => {
                  navigation.goBack()
                }}>
                <Icon name="arrow-back" />
              </Button>
            </Left>
            <Body style={{flex: 1, alignItems: 'center'}}>
              <Title>
                Faucet
              </Title>
            </Body>
            <Right style={{flex: 1}}>
            </Right>
          </Header>
        </StyleProvider>
      )
    }
  }


  sendRequestToNetwork() {
    const {saitoStore, navigation} = this.props

    axios.get(`${saitoStore.getServerURL()}/faucet/success?saito_address=${saitoStore.publickey}`)
      .then((response) => {
        debugger
        navigation.navigate('Home')
      })
      .catch(err => console.log(err))
  }

  render() {
    return (
      <Content contentContainerStyle={{ flex: 1}}>
        <Form>
          <Item disabled>
            <Input disabled placeholder={this.props.saitoStore.publickey}/>
            <Icon name='information-circle' />
          </Item>
          <Button dark full style={{ margin: 10 }} onPress={() => this.sendRequestToNetwork()}>
            <Text>Submit</Text>
          </Button>
        </Form>
      </Content>
    )
  }
}