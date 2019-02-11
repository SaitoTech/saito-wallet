import React, {Component} from 'react'
import axios from 'axios'
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  View
} from 'react-native'

import { observer, inject } from 'mobx-react'
import Icon from 'react-native-vector-icons/FontAwesome5';

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
    // const { navigation } = this.props

    // this.saito = navigation.getParam('saito', {})
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
      headerRight:
        <View style={{flex: 1, flexDirection: 'row'}}>
          <Icon name="camera" size={30} onPress={() => params.onPressScanner()} color="black" style={{marginRight: 20}}/>
          <Icon name="plus" size={30} onPress={() => params.setModalVisible(true)} color="black" style={{marginRight: 10}}/>
        </View>
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({ onPressScanner: this.onPressScanner });
    this.props.navigation.setParams({ setModalVisible: this.setModalVisible });
  }

  async _addCreateRoomEvent(msg, room_id) {
    let room_data = this._getRoomDataFromMessage(msg);
    let { addresses, name } = room_data;

    let publickeys = addresses.map(async (address) => {
      if (this.app.crypto.isPublicKey(address)) { return address }
      else {
        // try {
        //   if (address.match(/[@|<>]/)) {
        //     return await this._getPublicKey(address);
        //   // } else {
        //   //   // this is just someone trying to send a message with 'add' at the beginning
        //   //   this._addSendEvent(msg, room_id);
        //   }
        // } catch(err) {
        //   alert(err);
        //   return;
        // }
        alert("Invalid public key");
      }
    });

    publickeys = await Promise.all(publickeys);
    publickeys.push(this.props.saito.wallet.returnPublicKey());

    this._sendCreateRoomRequest(publickeys, name);
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

  newRoom() {
    debugger
    const {new_room_name} = this.state
    let addresses = [...this.state.addresses, this.props.saito.wallet.returnPublicKey()]
    this.sendCreateRoomRequest(addresses, new_room_name)
    this.setState({ addresses: [''], new_room_name: '' })
    this.setModalVisible(false)
  }

  // addAddress() {
  //   let addresses = [...this.state.addresses, this.state.address_submit]
  //   this.setState({ addresses })
  //   this.setState({ address_submit: '' })
  // }

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

  onPress(index){
    this.props.chatStore.setCurrentRoomIDX(index)
    this.props.chatStore.clearRoomUnreadMessages(index)
    const { navigation } = this.props
    navigation.navigate('ChatDetail', {
      wallet: this.props.saito.wallet,
      saito: this.props.saito,
    });
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
      <View style={styles.container}>
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
            <Icon name="plus" size={30} onPress={() => this.newAddress()} color="black"/>
            <View style={{flexDirection: 'row', alignItems: "center", justifyContent: 'center', margin: 25 }}>
              <View style={{ margin: 10 }}>
                <TouchableHighlight
                  onPress={() => {
                    this.newRoom()
                  }}>
                  <Text style={{fontSize: 24, color: '#ff8844'}}>Create Room</Text>
                </TouchableHighlight>
              </View>
              <View style={{ margin: 10 }}>
                <TouchableHighlight
                  onPress={() => {
                    this.setModalVisible(!this.state.modalVisible);
                  }}>
                  <Text style={{fontSize: 24}}>Cancel</Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </Modal>
        <FlatList
          data={this.props.chatStore.cleanRoomsForGiftedChat}
          renderItem={({item, index}) => {
            var {room_id} = item
            var {identifier, avatar} = item.users[0];
            let room_name = item.unread_messages.length > 0 ? `${identifier} (${item.unread_messages.length})` : identifier
            return (
              <TouchableOpacity index={index} style={styles.room} onPress={this.onPress.bind(this, index)}>
                <Image
                  style={styles.roomImage} source={{uri: avatar}}/>
                <Text style={styles.item}>{room_name}</Text>
              </TouchableOpacity>
            )
          }}
        />
      </View>
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