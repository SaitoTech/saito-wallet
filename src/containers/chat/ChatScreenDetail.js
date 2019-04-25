import React, {Component} from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { Container, Body, Content, Header, Left, Right, Icon, Title, Button, Text, StyleProvider } from "native-base";
// import Icon from 'react-native-vector-icons/FontAwesome5';
import { GiftedChat, Bubble, Composer, Send } from 'react-native-gifted-chat'
import { observer, inject } from 'mobx-react'

@inject('saito', 'chatStore')
@observer
export default class ChatScreenDetail extends Component {
  state = {
    room_id: "",
    room_name: ""
  }

  constructor(props) {
    super(props)

    const { navigation } = this.props
    this.room_name     = navigation.getParam('room_name', {})
  }

  static navigationOptions = ({navigation}) => {
    const { params = {} } = navigation.state;

    return {
      header: (
        <StyleProvider style={getTheme(variables)} >
          <Header style={{ backgroundColor: '#E7584B'}}>
            <Left style={{flex: 1}}>
              <Button transparent onPress={() => params.onBack()}>
                <Icon name="arrow-back" />
              </Button>
            </Left>
            <Body style={{flex: 1, alignItems: 'center'}}>
              <Title>{params.room_name}</Title>
            </Body>
            <Right style={{flex: 1}}>
              <Icon name="dots-horizontal" type={'MaterialCommunityIcons'} style={{color: 'white'}} onPress={() => console.log("Settings pressed")} />
            </Right>
          </Header>
        </StyleProvider>
      )
    }
  }

  onBack = () => {
    const { navigation, chatStore } = this.props
    chatStore.setCurrentRoomIDX(null)
    navigation.goBack()
  }

  componentWillMount() {
    this.props.navigation.setParams({
      room_name: this.room_name,
      onBack: this.onBack
    });
  }

  async _addSendEvent(message, room_id) {
    let msg = message.text;
    if (msg.length > 2000) msg = msg.substring(0,2000);
    var newtx = this._createMessage(room_id, msg);

    var newmsg = {
      id: newtx.transaction.sig,
      timestamp: newtx.transaction.ts,
      author: newtx.transaction.msg.publickey,
      message: msg
    };

    this.props.chatStore.addMessage(room_id, newmsg);
    this._sendMessage(newtx);

    return false;
  }

  _createMessage(chat_room_id, msg) {
    let fee = 0.0
    let relay_publickey = this.props.saito.network.peers[0].peer.publickey

    let newtx = this.props.saito.wallet.createUnsignedTransaction(relay_publickey, 0.0, fee)
    if (newtx == null) { return; }

    newtx.transaction.msg = {
      module: "Chat",
      request: "chat send message",
      publickey: this.props.saito.wallet.returnPublicKey(),
      room_id: chat_room_id,
      message: this.props.saito.keys.encryptMessage(this.props.saito.wallet.returnPublicKey(), msg)
    };

    newtx.transaction.msg = this.props.saito.keys.encryptMessage(this.props.saito.wallet.returnPublicKey(), newtx.transaction.msg);
    newtx.transaction.msg.sig = this.props.saito.wallet.signMessage(msg);
    newtx = this.props.saito.wallet.signTransaction(newtx);
    return newtx;
  }

  _sendMessage(tx) {
    this.props.saito.network.sendTransactionToPeers(tx, "chat send message");
  }

  onSend(messages = []) {
    this._addSendEvent(messages[messages.length - 1], this.props.chatStore.returnCurrentRoomID())
  }

  renderBubble(props) {
    if ((props.isSameUser(props.currentMessage, props.previousMessage) && props.isSameDay(props.currentMessage, props.previousMessage)) || props.currentMessage.user._id === 1) {
      return (
        <Bubble
          {...props}
          wrapperStyle={{right: {backgroundColor: '#1c1c23'}}}
        />
      );
    }
    return (
      <View>
        <Text style={{color: '#a19d9b'}}>{props.currentMessage.user.name}</Text>
        <Bubble
          {...props}
        />
      </View>
    );
  }

  renderComposer(props) {
    return (
      <Composer
        {...props}
        textInputStyle={{
          flex: 1,
          marginLeft: 10,
          fontSize: 16,
          lineHeight: 20,
          marginTop: Platform.select({
            ios: 6,
            android: 0,
          }),
          marginBottom: Platform.select({
            ios: 5,
            android: 0,
          }),
          padding: 0,
      }}/>
    )
  }

  renderSend(props) {
    return (
      <Send
        {...props}
        containerStyle={{
          height: 41,
          justifyContent: 'flex-end',
        }}
      />
    )
  }

  render() {
    const { chatStore } = this.props
    return (
      <GiftedChat
        messages={chatStore.returnGiftedChatFormat}
        onSend={messages => this.onSend(messages)}
        renderBubble={this.renderBubble}
        renderComposer={this.renderComposer}
        renderSend={this.renderSend}
        minComposerHeight={45}
        user={{
          _id: 1,
        }}
      />
    )
  }
}
