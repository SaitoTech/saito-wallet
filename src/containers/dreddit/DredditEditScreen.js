
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
export default class DredditEditScreen extends Component {

  state = {
    title: '',
    url: '',
    subreddit: '',
    content:'',
    sig: '',
    sendingEdit: false
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
                Edit Post
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
    let sig       = navigation.getParam('sig', '')
    this.setState({title, url, subreddit, content, sig})
  }

  sendEdit() {
    this.setState({
      sendingEdit: true
    })

    let { content, sig } = this.state

    let msg = {
      module: "Reddit",
      type: 'edit_post',
      post_id: sig,
      data: content
    }

    // msg.module     = "Reddit";
    // msg.type       = "edit_comment";
    // msg.post_id    = this.post.sig;
    // msg.comment_id = this.state.comment_id;
    // msg.data       = this.state.message;

    // var regex=/^[0-9A-Za-z]+$/

    // if (regex.test(msg.subreddit)) {} else {
    //   if (msg.subreddit != "") {
    //     alert("Only alphanumeric characters permitted in sub-reddit name")
    //     return
    //   } else {
    //     msg.subreddit = "main"
    //   }
    // }

    // if (msg.title == "") {
    //   alert("You cannot submit an empty post")
    //   return
    // }

    var newtx = this.props.saito.wallet.createUnsignedTransactionWithDefaultFee(this.props.saito.wallet.returnPublicKey(), 0.0)
    if (newtx == null) { alert("Unable to send TX"); return; }

    newtx.transaction.msg = msg
    newtx = this.props.saito.wallet.signTransaction(newtx)

    this.props.saito.network.propagateTransactionWithCallback(newtx, () => {
      this.setState({ sendingEdit: false })
      alert("Your edit has been broadcast")
      this.props.dredditStore.editPostLocal(newtx, msg)
      this.props.navigation.goBack();
    });
  }

  render() {
    return (
      <StyleProvider style={getTheme(variables)}>
        <Container >
          <Content >
            { this.state.sendingEdit ? <Spinner color='rgba(28,28,35,1)' /> :
            <Form>
              <Item inlineLabel style={{ marginLeft: 0 }}>
              <Label style={{width: 60, marginLeft: 5}}>Title</Label>
                <Input
                  onChangeText={(title) => this.setState({title})}
                  editable={false}
                  value={this.state.title}
                  />
              </Item>
              <Item inlineLabel style={{ marginLeft: 0 }}>
                <Label style={{width: 60, marginLeft: 5}}>URL</Label>
                <Input
                  onChangeText={(url) => this.setState({url})}
                  editable={false}
                  value={this.state.url}
                />
              </Item>
              <Item style={{ marginLeft: 0 }}>
                <Input
                  placeholder="subreddit"
                  onChangeText={(subreddit) => this.setState({subreddit})}
                  editable={false}
                  value={this.state.subreddit}
                  />
              </Item>
              <View>
                <Textarea
                  rowSpan={15}
                  placeholder='Content'
                  onChangeText={content => this.setState({content})}
                  style={{ width: '100%' }}
                  value={this.state.content}
                  />
              </View>
            </Form> }
          </Content>
          { this.state.sendingEdit ? null :
            <Footer>
              <Button block dark style={{width: '100%', height: '100%'}} onPress={() => this.sendEdit()}>
                <Text>EDIT</Text>
              </Button>
            </Footer>
          }
        </Container>
      </StyleProvider>
    )
  }
}