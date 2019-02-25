import { observable, computed, action } from 'mobx'

export default class ChatStore {
  @observable isFetchingChat = false
  @observable chat = { rooms: [] }
  @observable users = {}
  @observable search_string = ''
  currentRoomIDX = null


  constructor(saito) {
    this.saito = saito;
  }

  @action
  async setChat(chat) {
    this.chat = chat
    this.chat.rooms.replace(this.chat.rooms.slice().sort((a,b) => {
      if (b.messages.length > 0 && a.messages.length > 0)
      return JSON.parse(b.messages[b.messages.length - 1].tx).ts - JSON.parse(a.messages[a.messages.length - 1].tx).ts
    }))
    this.chat.rooms.map(async (room, idx) => {
      var fetch_keys = []
      room.name = await this.getRoomName(room);
      fetch_keys = room.messages.map(message => this.returnUnidentifiedKeys(message));
      if (fetch_keys != []) {
        await this._getMultipleIdentifiers(fetch_keys)
      }
      return await Promise.all(room.messages.map(message => this.importMessage(message)))
    })
  }

  returnUnidentifiedKeys(message) {
    let local_id = this.saito.keys.findByPublicKey(message.author)
    local_id = local_id ? local_id : { identifiers: [] }
    if (local_id.identifiers.length == 0) {
      return message.author
    }
  }

  @action
  setLoadingChat(isFetching) {
    this.isFetchingChat = isFetching
  }

  @action
  async importMessage(message) {
    let publickey = message.author
    let author = this.findUsersFromKeys(publickey)

    this.addUserWithPublickey(publickey, author)

    var user = this.users[message.author];
    message.timestamp = JSON.parse(message.tx).ts
    return {
      _id: message.id.toString(),
      text: message.message,
      createdAt: new Date(message.timestamp),
      user,
    }
  }

  @action
  setCurrentRoomIDX(room_idx) {
    this.currentRoomIDX = room_idx
  }

  @action
  addUser(author) {
    if (!this.users[author]) {
      this.users[author] = ({_id: Object.keys(this.users).length + 1, name: author})
    }
  }

  @action
  addUserWithPublickey(publickey, author) {
    if (!this.users[publickey]) {
      this.users[publickey] = ({_id: Object.keys(this.users).length + 1, name: author})
    }
  }

  @action
  async updateUserName(author) {
    if (this.saito.crypto.isPublicKey(author)) {
      return await this._getIdentifier(author)
    }
  }

  @action
  updateSearchString(e) {
    this.search_string = e.toLocaleLowerCase()
  }

  findUsersFromKeys(publickey) {
    let local_id = this.saito.keys.findByPublicKey(publickey)
    local_id = local_id ? local_id : { identifiers: [] }
    return local_id.identifiers.length > 0 ? local_id.identifiers[0] : publickey.substring(0,8);
  }

  @action
  addMessage(room_id, newmsg) {
    idx = this.returnRoomIDX(room_id)
    this.chat.rooms[idx].messages.push(newmsg)
  }

  @action
  async addRoom(new_room) {
    new_room.name = await this.getRoomName(new_room)
    this.chat.rooms.push(new_room);
  }

  @action
  clearRoomUnreadMessages(room_idx) {
    this.chat.rooms[room_idx].unread_messages = []
  }

  @action
  addMessageToRoom(tx, room_idx) {
    tx.decryptMessage();
    var txmsg = tx.returnMessage();
    let { room_id, publickey, message, sig } = txmsg

    for (let i = this.chat.rooms[room_idx].messages.length - 1; i >= 0; i--) {
      if (this.chat.rooms[room_idx].messages[i].id == sig ) { return }
    }

    let new_message = {id: sig, timestamp: tx.transaction.ts, author: publickey, message}
    this.chat.rooms[room_idx].messages.push(new_message);

    if (this.currentRoomIDX != room_idx) {
      if (!this.chat.rooms[room_idx].unread_messages) { this.chat.rooms[room_idx].unread_messages = [] }
      this.chat.rooms[room_idx].unread_messages = [...this.chat.rooms[room_idx].unread_messages, new_message]
    }
  }

  @computed get cleanRoomsForGiftedChat() {
    var cleaned_rooms = this.chat.rooms
    .filter(room => {
      lowercase_room_name = room.name.toLocaleLowerCase()
      if (!lowercase_room_name.includes(this.search_string)) { return false } else { return true }
    })
    .map((room, index) => {
      let last_message = room.messages[room.messages.length - 1]
      return {
        key: (index).toString(),
        room_id: room.room_id,
        unread_messages: room.unread_messages || [],
        last_message,
        createdAt: new Date(),
        users: [
          {
            identifier: room.name,
            avatar: "https://placeimg.com/140/140/any"
          }
        ]
      }
    })
    cleaned_rooms.sort((a,b) => {
      if (b.last_message && a.last_message) {
        return b.last_message.timestamp - a.last_message.timestamp
      }
    })
    return cleaned_rooms
  }

  @computed get returnGiftedChatFormat() {
    const res = this.chat.rooms[this.currentRoomIDX].messages.map((message) => { return this.cleanMessage(message) });
    res.reverse()
    return res
  }

  async getRoomName(room) {
    let { name, addresses } = room
    if (addresses.length == 2) {
      if (name === "") { name = addresses[0] === this.saito.wallet.returnPublicKey() ? addresses[1] : addresses[0] }
    }
    if (this.saito.crypto.isPublicKey(name)) {
      let id = this.findUsersFromKeys(name)
      if (id.length != 8) {
        return id
      }
      return await this._getIdentifier(name);
    }
    return name
  }

  cleanMessage(message) {
    let publickey = message.author
    let id = this.findUsersFromKeys(publickey)
    this.addUserWithPublickey(publickey, id)
    var user = this.users[publickey];
    return {
      _id: message.id.toString(),
      text: message.message,
      createdAt: new Date(message.timestamp),
      user,
    }
  }

  _getIdentifier(author) {
    return new Promise((resolve, reject) => {
      this.saito.dns.fetchIdentifier(author, (answer) => {
        author = this.saito.dns.isRecordValid(answer) ?  JSON.parse(answer).identifier : author.substring(0,8);
        resolve (author);
      });
    });
  }

  _getMultipleIdentifiers(keys) {
    return new Promise((resolve, reject) => {
      this.saito.dns.fetchMultipleIdentifiers(keys, (answer) => {
        if (this.saito.dns.isRecordValid(answer)) {
          var response = JSON.parse(answer).payload
          response.forEach(key => {
            this.saito.keys.addKey(key.publickey, key.identifier);
          })
        }
        resolve (true);
      });
    });
  }

  _getPublicKey(identifier) {
    return new Promise((resolve, reject) => {
      this.saito.dns.fetchPublicKey(identifier, (answer) => {
        if (!this.saito.dns.isRecordValid(answer)) {
          reject("We cannot find the public key of that address");
        }
        resolve(JSON.parse(answer).publickey);
      });
    });
  }

  returnRoomIDX(room_id) {
    for (let i = 0; i < this.chat.rooms.length; i++) {
      if (this.chat.rooms[i].room_id == room_id) { return i; }
    }
    return null;
  }

  returnRoomID(room_idx) {
    return this.chat.rooms[room_idx].room_id;
  }

  returnCurrentRoomID() {
    return this.chat.rooms[this.currentRoomIDX].room_id;
  }

  returnCurrentRoomName() {
    return this.chat.rooms[this.currentRoomIDX].name;
  }

  findRoom(room_id) {
    if (this.chat.rooms.find(room => room.room_id == room_id)) { return true; }
  }

  reset() {
    this.isFetchingChat = false
    this.chat = { rooms: [] }
    this.users = {}
    this.currentRoomIDX = null
  }
}