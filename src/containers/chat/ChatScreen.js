import React, {Component} from 'react'

import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  View
} from 'react-native'

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { Container, Body, Content, Header, List, ListItem, Left, Right, Icon, Input, Item, Title, Thumbnail, Button, Spinner, Text, StyleProvider } from "native-base";

import { observer, inject } from 'mobx-react'

@inject('saito', 'chatStore')
@observer
export default class ChatScreen extends Component {
  state = {
    addresses: [''],
    new_room_name: '',
    modalVisible: false
  }

  constructor(props) {
    super(props)
  }

  onSelect = data => {
    this.setState(Object.assign(this.state, data));
  };

  setModalVisible = (visible) => {
    this.setState({addresses: ['']})
    this.setState({modalVisible: visible})
  }

  onPressScanner = () => {
    const { navigation } = this.props;
    navigation.navigate("Scanner", { onSelect: this.onSelect });
  }

  static navigationOptions = ({navigation}) => {
    const { params = {} } = navigation.state;
    return {
      header: (
        <StyleProvider style={getTheme(variables)} >
          <Header searchBar rounded>
            <Icon
              name="arrow-back"
              onPress={() => { params.chatStore.updateSearchString(''); navigation.goBack()}}
              style={{ fontSize: 29, marginLeft: 9, marginRight: 10, color: 'white', alignSelf: 'center'}}
            />
              <Item style={{marginBottom: 8, marginTop: 7}}>
                <Icon name="ios-search" />
                <Input placeholder="Search" onChangeText={(e) => params.chatStore.updateSearchString(e)}/>
              </Item>
            <Icon name="camera" type={'MaterialCommunityIcons'} style={{color: 'white', marginLeft: 7, alignSelf: 'center'}} onPress={() => params.onPressScanner()}  />
            <Icon name="ios-add" style={{color: 'white', fontSize: 34, alignSelf: 'center', marginLeft: 17, marginRight: 3}} onPress={() => params.setModalVisible(true)} />
          </Header>
        </StyleProvider>
      )
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({ onPressScanner: this.onPressScanner });
    this.props.navigation.setParams({ setModalVisible: this.setModalVisible });
    this.props.navigation.setParams({ chatStore: this.props.chatStore });
  }

  async _addCreateRoomEvent(addresses) {
    let publickeys = addresses.map(async (address) => {
      if (this.props.saito.crypto.isPublicKey(address)) { return address }
      else {
        try {
          if (address.match(/[@|<>]/)) {
            return await this.props.chatStore._getPublicKey(address)
          }
        } catch(err) {
          console.log(err)
          Alert.alert("Error", "Invalid public key or identifier")
          return
        }
      }
    });
    return await Promise.all(publickeys);
  }

  sendCreateRoomRequest(addresses, name="") {
    let to_address = this.props.saito.network.peers[0].peer.publickey

    var newtx = this.props.saito.wallet.createUnsignedTransaction(to_address, 0.0, 0.0);
    if (newtx == null) { return; }

    newtx.transaction.msg = {
      module: "Chat",
      request: "chat request create room",
      name,
      addresses
    }

    newtx.transaction.msg = this.props.saito.keys.encryptMessage(this.props.saito.wallet.returnPublicKey(), newtx.transaction.msg);
    newtx.transaction.msg.sig = this.props.saito.wallet.signMessage(JSON.stringify(newtx.transaction.msg));

    newtx = this.props.saito.wallet.signTransaction(newtx);

    this.props.saito.network.sendRequest("chat request create room", JSON.stringify(newtx.transaction));
  }

  async newRoom() {
    const {new_room_name} = this.state
    let addresses = [...this.state.addresses, this.props.saito.wallet.returnPublicKey()]
    addresses = await this._addCreateRoomEvent(addresses)
    this.sendCreateRoomRequest(addresses, new_room_name)
    this.setState({ addresses: [''], new_room_name: '' })
    this.setModalVisible(false)
  }

  onChangeAddress(id, value) {
    let {addresses} = this.state
    addresses[id] = value

    this.setState({
      addresses
    })
  }

  onChangeName(value) {
    this.setState({new_room_name: value})
  }

  newAddress() {
    let addresses = [...this.state.addresses, '']
    this.setState({ addresses });
  }

  onPress(room_id) {
    let index = this.props.chatStore.returnRoomIDX(room_id)
    this.props.chatStore.setCurrentRoomIDX(index)
    this.props.chatStore.clearRoomUnreadMessages(index)
    const { navigation } = this.props
    navigation.navigate('ChatDetail', {
      wallet: this.props.saito.wallet,
      saito: this.props.saito,
      room_name: this.props.chatStore.returnCurrentRoomName()
    });
    this.props.chatStore.updateSearchString('')
  }

  render() {
    let { addresses, new_room_name } = this.state
    let name_input = addresses.length > 1 ?
      <TextInput
        style={{height: 60, width: 300, fontSize: 24, textAlign: 'center'}}
        placeholder="Room Name"
        onChangeText={this.onChangeName.bind(this)}
        value={new_room_name}
      /> : null

    return (
      <Container>
        <Content>
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
            }}>
            <View style={{ flex: 1, flexDirection: 'column', alignItems: "center", justifyContent: 'center' }}>
              <Text style={{
                fontFamily: 'Titillium Web',
                fontSize: 28,
                textAlign: 'right'
              }}>Add People to Chat</Text>
              {
                addresses.map((address, idx) => {
                  return (
                    <TextInput
                      id={idx}
                      key={idx}
                      style={{height: 60, width: 300, fontSize: 24, textAlign: 'center'}}
                      placeholder="Address"
                      onChangeText={this.onChangeAddress.bind(this, idx)}
                      value={this.state.addresses[idx]}
                    />
                  )
                })
              }
              { name_input }
              <Icon name="ios-add" style={{fontSize: 64}} onPress={() => this.newAddress()} color="black"/>
              <View style={{flexDirection: 'column', alignItems: "center", justifyContent: 'center', margin: 25 }}>
                <View style={{ margin: 10 }}>
                  <Button primary onPress={() => {this.newRoom()}}>
                    <Text>
                      Create Room
                    </Text>
                  </Button>
                </View>
                <View style={{ margin: 10 }}>
                  <Button dark onPress={() => {this.setModalVisible(!this.state.modalVisible)}}>
                    <Text>
                      Close
                    </Text>
                  </Button>
                </View>
              </View>
            </View>
          </Modal>
          {this.props.chatStore.isFetchingChat ? <Spinner color='rgba(28,28,35,1)' /> :
            <FlatList
              data={this.props.chatStore.cleanRoomsForGiftedChat}
              renderItem={({item, index}) => {
                var {room_id, last_message} = item
                var {identifier, avatar} = item.users[0];

                let d = last_message ? new Date(last_message.timestamp) : new Date()
                let message = last_message ? last_message.message : ''
                let hours = ((d.getHours() + 11) % 12 + 1)
                let am_pm = d.getHours() > 12 ? 'PM' : 'AM'
                let timestamp = `${hours}:${("0" + d.getMinutes()).substr(-2)} ${am_pm}`

                let room_name = item.unread_messages.length > 0 ? `${identifier} (${item.unread_messages.length})` : identifier
                room_name = room_name.slice(0,20)

                return (
                  <ListItem avatar onPress={this.onPress.bind(this, room_id)} style={{ height: 80}}>
                    <Left>
                      <Thumbnail source={require('../../../assets/img/saito_logo_black.png')}/>
                    </Left>

                    <Body style={{height: 80}}>
                      <Text >{room_name}</Text>
                      <Text note>{message}</Text>
                    </Body>

                    <Right style={{height: 80}}>
                      <Text note>{timestamp}</Text>
                    </Right>
                  </ListItem>
                )
              }
            } />}
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
   flex: 1,
  },
  room: {
    flexDirection: 'row',
    height: 100,
    borderWidth: 0.5,
    borderColor: '#d6d7da',
  },
  roomImage: {
    width: 50,
    height: 50,
    margin: 10
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
})