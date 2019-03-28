
import React, { Component } from 'react'
import { FlatList, TouchableOpacity, Image, View } from 'react-native'

import {
  Button,
  Container,
  Body,
  Content,
  Header,
  Label,
  Left,
  Right,
  Icon,
  Title,
  Fab,
  Form,
  Footer,
  Input,
  Item,
  Spinner,
  Text,
  Textarea,
  StyleProvider
} from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { observer, inject } from 'mobx-react'

@inject('saito', 'saitoStore', 'dredditStore')
@observer
export default class DredditPostScreen extends Component {

  state = {
    title: '',
    url: '',
    subreddit: '',
    content:'',
    sendingPost: false
  }

  static navigationOptions = ({navigation}) => {
    return {
      header: (
        <StyleProvider style={getTheme(variables)} >
          <Header hasSegment >
            <Left style={{flex: 1}}>
              <Button transparent onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" />
              </Button>
            </Left>
            <Body style={{ flex: 1, alignItems: 'center' }}>
              <Title>
                Dreddit
              </Title>
            </Body>
            <Right style={{flex: 1}}>
            </Right>
          </Header>
        </StyleProvider>
      )
    }
  }

  componentWillMount() {
    const { navigation } = this.props
    let title     = navigation.getParam('title', '')
    let url       = navigation.getParam('url', '')
    let subreddit = navigation.getParam('subreddit', '')
    let content   = navigation.getParam('content', '')
    this.setState({title, url, subreddit, content})
  }

  sendPost() {
    this.setState({
      sendingPost: true
    })

    let {title,url,content,subreddit} = this.state

    let msg = {
      module: "Reddit",
      type: 'post',
      title: title,
      link: url,
      text: content,
      subreddit: subreddit,
    }

    var regex=/^[0-9A-Za-z]+$/

    if (regex.test(msg.subreddit)) {} else {
      if (msg.subreddit != "") {
        alert("Only alphanumeric characters permitted in sub-reddit name")
        return
      } else {
        msg.subreddit = "main"
      }
    }

    if (msg.title == "") {
      alert("You cannot submit an empty post")
      return
    }

    var newtx = this.props.saito.wallet.createUnsignedTransactionWithDefaultFee(this.props.saito.wallet.returnPublicKey(), 0.0)
    if (newtx == null) { alert("Unable to send TX"); return; }

    newtx.transaction.msg = msg
    newtx = this.props.saito.wallet.signTransaction(newtx)

    this.props.saito.network.propagateTransactionWithCallback(newtx, () => {
      this.setState({ sendingPost: false })
      alert("Your post has been broadcast")
      this.props.dredditStore.addPostLocal(newtx, msg)
      this.props.navigation.navigate('Dreddit', {})
    });
  }

  render() {
    return (
      <StyleProvider style={getTheme(variables)}>
        <Container >
          <Content >
            { this.state.sendingPost ? <Spinner color='rgba(28,28,35,1)' /> :
            <Form>
              <Item inlineLabel style={{ marginLeft: 0 }}>
              <Label style={{width: 60, marginLeft: 5}}>Title</Label>
                <Input onChangeText={(title) => this.setState({title})}/>
              </Item>
              <Item inlineLabel style={{ marginLeft: 0 }}>
                <Label style={{width: 60, marginLeft: 5}}>URL</Label>
                <Input onChangeText={(url) => this.setState({url})}/>
              </Item>
              <Item style={{ marginLeft: 0 }}>
                <Input
                  placeholder="subreddit"
                  onChangeText={(subreddit) => this.setState({subreddit})}/>
              </Item>
              <View>
                <Textarea
                  rowSpan={15}
                  placeholder='Content'
                  onChangeText={content => this.setState({content})}
                  style={{ width: '100%' }} />
              </View>
            </Form> }
          </Content>
          { this.state.sendingPost ? null :
            <Footer>
              <Button block dark style={{width: '100%', height: '100%'}} onPress={() => this.sendPost()}>
                <Text>POST</Text>
              </Button>
            </Footer>
          }
        </Container>
      </StyleProvider>
    )
  }
}