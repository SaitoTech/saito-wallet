import { observable, computed, action } from 'mobx'

export default class ChatStore {
  @observable isFetchingChat = false
  @observable chat = { rooms: [] }
  @observable users = {}
  currentRoomIDX = null

  constructor(saito) {
    this.saito = saito;
  }

  @action
  setChat(chat) {
    this.chat = chat
    this.chat.rooms.replace(this.chat.rooms.slice().sort((a,b) => {
      return JSON.parse(b.messages[b.messages.length - 1].tx).ts - JSON.parse(a.messages[a.messages.length - 1].tx).ts
    }))
    this.chat.rooms.map(async (room, idx) => {
      room.name = await this.getRoomName(idx);
      let room_messages = room.messages.map(message => this.importMessage(message))
      return Promise.all(room_messages)
    })
  }

  @action
  setLoadingChat(isFetching) {
    this.isFetchingChat = isFetching
  }

  @action
  async importMessage(message) {
    let publickey = message.author
    let author = await this.updateUserName(publickey)

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

  // async findUsersFromKeys(author) {
  //   let local_id = Object.assign({ identifiers: [] },
  //     this.app.keys.findByPublicKey(author));

  //   if (local_id.identifiers.length > 0) {
  //     author = local_id.identifiers[0];
  //   } else {
  //     let publickey = author;

  //     try {
  //       author = await this._getIdentifier(author);
  //     } catch(err) {
  //       console.log(err);
  //     }

  //     this.app.keys.addKey(publickey, message.author);
  //   }
  // }

  @action
  addMessage(room_id, newmsg) {
    this.chat.rooms[this.currentRoomIDX].messages.push(newmsg);
  }

  @action
  addRoom(new_room) {
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
    console.log("New Message Added inside the store");
  }

  @computed get cleanRoomsForGiftedChat() {
    var cleaned_rooms = this.chat.rooms.map((room, index) => {
      return {
        key: (index).toString(),
        room_id: room.room_id,
        unread_messages: room.unread_messages || [],
        last_message: room.messages[room.messages.length - 1],
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
      return b.last_message.timestamp - a.last_message.timestamp
    })
    return cleaned_rooms
  }

  @computed get returnGiftedChatFormat() {
    const res = this.chat.rooms[this.currentRoomIDX].messages.map((message) => { return this.cleanMessage(message) });
    res.reverse()
    return res
  }

  async getRoomName(i) {
    let { name, addresses } = this.chat.rooms[i];
    if (addresses.length == 2) {
      if (name === "") { name = addresses[0] === this.saito.wallet.returnPublicKey() ? addresses[1] : addresses[0] }
    }
    if (this.saito.crypto.isPublicKey(name)) {
      this.chat.rooms[i].name = await this._getIdentifier(name);
    }
    return name
  }

  cleanMessage(message) {
    this.addUser(message.author)
    var user = this.users[message.author];
    return {
      _id: message.id.toString(),
      text: message.message,
      createdAt: new Date(message.timestamp),
      user,
    }
  }

  _getIdentifier(author) {
    // use of reject? getAuthor?
    return new Promise((resolve, reject) => {
      this.saito.dns.fetchIdentifier(author, (answer) => {
        author = this.saito.dns.isRecordValid(answer) ?  JSON.parse(answer).identifier : author.substring(0,8);
        resolve (author);
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
}