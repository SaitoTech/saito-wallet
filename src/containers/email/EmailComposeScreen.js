import React, {Component} from 'react'
import {Alert, TouchableOpacity} from 'react-native'

import { Container, Body, Button, Content, Form, Footer, Header, Label, ListItem, Left, Right, Icon, Item, Title, Separator, Text, StyleProvider, Input, Textarea } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { observer, inject } from 'mobx-react'

@inject('saito', 'saitoStore')
@observer
export default class EmailComposeScreen extends Component {

  state = {
    to: '',
    title: '',
    content: ''
  }

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
                Compose
              </Title>
            </Body>
            <Right style={{flex: 1}}>
              <TouchableOpacity>
                <Icon name="paperclip" style={{color: 'white'}} type={"Feather"} />
              </TouchableOpacity>
            </Right>
          </Header>
        </StyleProvider>
      )
    }
  }

  returnUnidentifiedKeys(message) {
    let local_id = this.saito.keys.findByPublicKey(message.author)
    local_id = local_id ? local_id : { identifiers: [] }
    if (local_id.identifiers.length == 0) {
      return message.author
    }
  }

  sendEmail() {
    let tx = this.createEmailTX()

    if (tx != null) {
      debugger
      console.log(tx)
      newtx = this.props.saito.wallet.signTransaction(tx);

      this.props.saito.network.propagateTransactionWithCallback(newtx, (err) => {
        if (!err) {
          Alert.alert("Success", "Your Email has been sent successfully")
          this.props.navigation.navigate('Email')
        } else {
          Alert.alert("Error", "There was an error submitting your request to the network. This is an issue with your network connection or wallet")
        }
      });
    }
  }

  createEmailTX() {
    let to = this.state.to

    // check if it's a publickey, get from DNS
    if (!this.props.saito.crypto.isPublicKey(to)) {
      // alert('Do not have support for DNS yet')
    }

    let newtx = this.props.saito.wallet.createUnsignedTransactionWithDefaultFee(to)
    console.log(newtx)
    if (!newtx) {
      return null
    }

    newtx.transaction.msg.module = 'Email';
    newtx.transaction.msg.data   = this.state.content;
    newtx.transaction.msg.title  = this.state.title;

    return newtx
  }

  render() {
    return (
      <StyleProvider style={getTheme(variables)}>
        <Container >
          <Content >
            <Form>
              <Item inlineLabel style={{ marginLeft: 0 }}>
              <Label style={{width: 60, marginLeft: 5}}>To</Label>
                <Input onChangeText={(to) => {
                  console.log(to)
                  this.setState({to})
                }}/>
              </Item>
              <Item inlineLabel style={{ marginLeft: 0 }}>
                <Label style={{width: 60, marginLeft: 5}}>From</Label>
                <Input value={this.props.saito.wallet.returnPublicKey()}/>
              </Item>
              <Item style={{ marginLeft: 0 }}>
                <Input placeholder="Title" onChangeText={(title) => {
                  console.log(title)
                  this.setState({title})
                }}/>
              </Item>
              <Textarea
                rowSpan={15}
                placeholder='Compose'
                onChangeText={(content) => {
                  console.log(content)
                  this.setState({content})
                }}
                style={{ width: '100%' }} />
            </Form>
          </Content>
          <Footer>
            <Button block dark style={{width: '100%', height: '100%'}} onPress={() => this.sendEmail()}>
              <Text>SEND</Text>
            </Button>
          </Footer>
        </Container>
      </StyleProvider>
    )
  }
}