import React, {Component} from 'react'
import {Alert, View, TouchableOpacity} from 'react-native'

import { Container, Body, Button, Content, Form, Footer, Header, Label, ListItem, Left, Right, Icon, Item, Title, Separator, Text, StyleProvider, Input, Textarea } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';

import { observer, inject } from 'mobx-react'

var RNFS = require('react-native-fs');

@inject('saito', 'saitoStore', 'emailStore')
@observer
export default class EmailComposeScreen extends Component {

  state = {
    to: '',
    title: '',
    content: '',
    attachments: []
  }

  static navigationOptions = ({navigation}) => {
    const { params = {} } = navigation.state
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
              {/* <TouchableOpacity
                onPress={() => params.uploadFile()}>
                <Icon name="paperclip" style={{color: 'white'}} type={"Feather"} />
              </TouchableOpacity> */}
            </Right>
          </Header>
        </StyleProvider>
      )
    }
  }

  componentWillMount() {
    const { navigation } = this.props
    let to    = navigation.getParam('to', '')
    let title = navigation.getParam('title', '')
    this.setState({to, title})

    this.props.navigation.setParams({ uploadFile: this.uploadFile });
  }

  returnUnidentifiedKeys(message) {
    let local_id = this.saito.keys.findByPublicKey(message.author)
    local_id = local_id ? local_id : { identifiers: [] }
    if (local_id.identifiers.length == 0) {
      return message.author
    }
  }

  uploadFile = () => {
    // iPhone/Android
    DocumentPicker.show({
      filetype: [DocumentPickerUtil.images()],
    }, async (error, res) => {
      // Android
      let {
        uri,
        type,
        fileName,
        fileSize
      } = res

      const split = type.split('/');

      let encoding_type = split[0] === 'image' ? 'base64' : 'utf8'

      try {
        let contents = await RNFS.readFile(uri, encoding_type)

        let attachments = [...this.state.attachments, {
          uri,
          type,
          fileName,
          fileSize,
          contents
        }]
        this.setState({attachments})
      } catch (err) {
        console.log(err.message, err.code)
      }

      console.log(res);
    });
  }

  async sendEmail() {
    let tx = await this.createEmailTX()

    if (tx != null) {
      debugger
      console.log(tx)
      var newtx = this.props.saito.wallet.signTransaction(tx);

      this.props.saito.network.propagateTransactionWithCallback(newtx, (err) => {
        if (!err) {
          Alert.alert("Success", "Your Email has been sent successfully")
          this.saveSentEmail(newtx)
          this.props.navigation.navigate('Email')
        } else {
          Alert.alert("Error", "There was an error submitting your request to the network. This is an issue with your network connection or wallet")
        }
      });
    }
  }

  async createEmailTX() {
    var to = this.state.to

    // check if it's a publickey, get from DNS
    if (!this.props.saito.crypto.isPublicKey(to)) {

      // alert('Do not have support for DNS yet')
      try {
        var publickey = await this.props.emailStore._getPublicKey(to)
        console.log("RETRUNED PUBKEY", publickey)
        to = publickey
      } catch(err) {
        console.log(err)
        Alert.alert("Error", "To address not found for identifier")
        return null
      }
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

  saveSentEmail(tx) {
    this.props.emailStore.addEmail(tx)
    this.props.emailStore.saveEmails()
  }

  render() {
    // var attachments = []

    // if (this.state.attachments) {
    //   this.state.attachments.forEach((attachment) => {

    //     console.log('SINGLE ATTACHMENT', attachment.fileName)

    //     attachments.push(
    //       <View style={{backgroundColor: 'grey', width: 25, height: 25}}>
    //         <Text>
    //           {attachment.fileName}
    //         </Text>
    //       </View>
    //     )

    //     console.log(attachments)
    //   })
    // }
    // console.log("ATTACHMENTS", attachments)
    return (
      <StyleProvider style={getTheme(variables)}>
        <Container >
          <Content >
            <Form>
              <Item inlineLabel style={{ marginLeft: 0 }}>
              <Label style={{width: 60, marginLeft: 5}}>To</Label>
                <Input
                  value={this.state.to}
                  onChangeText={(to) => this.setState({to})}/>
              </Item>
              <Item inlineLabel style={{ marginLeft: 0 }}>
                <Label style={{width: 60, marginLeft: 5}}>From</Label>
                <Input value={this.props.saito.wallet.returnPublicKey()}/>
              </Item>
              <Item style={{ marginLeft: 0 }}>
                <Input
                  value={this.state.title}
                  placeholder="Title"
                  onChangeText={(title) => this.setState({title})}/>
              </Item>
              <View>
                <Textarea
                  rowSpan={15}
                  placeholder='Compose'
                  onChangeText={content => this.setState({content})}
                  style={{ width: '100%' }} />
              </View>
            </Form>
          </Content>
          <Footer>
            <Button block dark style={{width: '95%', height: '95%'}} onPress={() => this.sendEmail()}>
              <Text>SEND</Text>
            </Button>
          </Footer>
        </Container>
      </StyleProvider>
    )
  }
}