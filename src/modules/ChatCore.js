import { saito_lib, ModTemplate } from 'saito-lib'

import axios from 'axios'

import {observable} from 'mobx'

// const uuidv4 = require('uuid/v4');
// const uuidv5 = require('uuid/v5');

class ChatCore extends ModTemplate {
  constructor(app, store) {
    super(app);

    this.app = app;
    this.store = store;

    this.name = "Chat";

    this.chat = {}
    this.chat.rooms = []

    this.public_room_id = '984cb2da-13c1-11e9-ab14-d663bd873d93';

    this.server = {
      host: "apps.saito.network",
      port: 443,
      protocol: "https"
    }
  }

  initialize() {
    // start fecthing chat
    let publickey = this.app.wallet.returnPublicKey()
    this.store.addUser(publickey)
    this.store.setLoadingChat(true)

    axios.get(`${this._getChatURL()}/chat/${publickey}`)
      .then(async (response) => {
        await this.store.setChat(response.data)
        this.store.setLoadingChat(false)
      })
      .catch(err => console.log(err))
  }

  _getChatURL() {
    return `${this.server.protocol}://${this.server.host}:${this.server.port}`
  }

  ///////////////////////
  // handlePeerRequest //
  ///////////////////////
  //
  // zero-fee transactions sent directly to us by chat-peers end up
  // here. we handle them just like paid transactions sent over the
  // blockchain. paid & free are interchangeable.
  //
  handlePeerRequest(app, req, peer, mycallback) {
    if (req.request == null) { return; }
    if (req.data == null) { return; }

    switch (req.request) {
      case "chat send message":
        console.log(req.request)
        var tx = new saito_lib.transaction(req.data);
        if (tx == null) { return; }
        this._receiveMessage(app, tx);
        break;
      case "chat request create room":
        var tx = new saito_lib.transaction(req.data);
        if (tx == null) { return; }
        this._handleCreateRoomRequest(app, tx, peer);
        break;
      case "chat response create room":
        var tx = new saito_lib.transaction(req.data);
        if (tx == null) { return; }
        if (tx.transaction.to[0].add == app.wallet.returnPublicKey()) { this._handleCreateRoomResponse(app, tx); }
        break;
      default:
        break;
    }
  }

  ////////////////////
  // onConfirmation //
  ////////////////////
  //
  // paid transactions sent over the blockchain end up here. we
  // handle them just like zero-fee transactions sent peer-to-peer
  //
  // zero-fee transactions are sent in here with BLK=null and conf==0
  // so do not edit this to require the chat functionality to require
  // anything else.
  //
  //
  onConfirmation(blk, tx, conf, app) {
    var chat_self = app.modules.returnModule("Chat");
    var txmsg = tx.returnMessage();

    if (txmsg == null) { return; }
    if (txmsg.module != "Email") { return; }

    if (conf == 0) {
      switch (txmsg.request) {
        case 'chat send message':
          chat_self._receiveMessage(app, tx);
          break;
      }
    }
  }

  _receiveMessage(app, tx) {
    tx.decryptMessage(this.app);
    var txmsg = tx.returnMessage();

    // need to track the path of a message
    if (txmsg.publickey == this.app.wallet.returnPublicKey()) { return; }

    if (!this.app.BROWSER) {
      this.app.network.sendTransactionToPeers(tx, "chat send message");
      this._saveMessageToDB(tx);
    } else {
      let room_idx = this.store.returnRoomIDX(txmsg.room_id);
      if (room_idx === parseInt(room_idx, 10)) {
        this.store.addMessageToRoom(tx, room_idx);
      }
    }
  }

  _saveMessageToDB(newtx) {
    var { room_id, publickey, message, sig } = newtx.returnMessage();

    if (this.app.BROWSER == 0) {
      var sql = "INSERT OR IGNORE INTO mod_chat_records (room_id, author, message, sig, tx) VALUES ($room_id, $author, $message, $sig, $tx)";
      var params = {
        $room_id: room_id,
        $author: publickey,
        $message: message,
        $sig: sig,
        $tx: JSON.stringify(newtx.transaction)
      }
      this.app.storage.execDatabase(sql, params, function () { });
    }
  }

  // maybe condition creation based on acceptance of invite? Need to consider that functionality
  // _addUser(app, tx) {
  //   var email_self = app.modules.returnModule("Email");
  //   email_self.onConfirmation(null, tx, 0, app);
  // }

  _addNewRoom(tx) {
    let txmsg = tx.returnMessage();
    let { name, room_id, addresses } = txmsg;

    if (this.store.findRoom(room_id)) { return }

    if (addresses.length == 2) {
      name = addresses[0] === this.app.wallet.returnPublicKey() ? addresses[1] : addresses[0]
    }

    var new_room = {
      room_id,
      name,
      addresses,
      messages: []
    }

    this.store.addRoom(new_room);

    return new_room
  }

  _sendCreateRoomRequest(addresses, name = "") {
    let to_address = this.server.peer.publickey;

    var newtx = this.app.wallet.createUnsignedTransaction(to_address, 0.0, 0.0);
    if (newtx == null) { return; }

    newtx.transaction.msg = {
      module: "Chat",
      request: "chat request create room",
      name,
      addresses
    }

    newtx.transaction.msg = this.app.keys.encryptMessage(this.app.wallet.returnPublicKey(), newtx.transaction.msg);
    newtx.transaction.msg.sig = this.app.wallet.signMessage(JSON.stringify(newtx.transaction.msg));

    newtx = this.app.wallet.signTransaction(newtx);

    this.app.network.sendRequest("chat request create room", JSON.stringify(newtx.transaction));
  }

  _handleCreateRoomRequest(app, tx, peer) {
    let txmsg = tx.returnMessage()
    if (txmsg.addresses.every(address => app.network.hasPeer(address))) {
      this._sendCreateRoomResponse(app, tx, peer);
    } else {
      console.log("We need to make an on chain broadcast to see where it is. THis should be handled by the proxy module");
      this._sendCreateRoomResponse(app, tx, peer);
    }
  }

  _sendCreateRoomResponse(app, tx, peer) {
    if (this.app.server == null) { return; }
    if (this.app.server.server.host == "") { return; }
    // just use app.BROWSER, tool

    // new function
    // create new chat room and deliver info on that

    var txmsg = tx.returnMessage();
    var { name, addresses } = txmsg;

    addresses.sort((a, b) => a.localeCompare(b));
    // create new room id
    var new_room_uuid = addresses.length == 2 ? uuidv5(addresses.join(), this.public_room_id) : uuidv4();
    for (let i = 0; i < addresses.length; i++) {
      var to_address = addresses[i];

      var room_sql = "INSERT OR IGNORE into mod_chat_rooms (uuid, name, publickey, tx) VALUES ($uuid, $name, $publickey, $tx)"
      var params = {
        $uuid: new_room_uuid,
        $name: name,
        $publickey: to_address,
        $tx: JSON.stringify(tx)
      }

      this.app.storage.db.run(room_sql, params);

      var newtx = app.wallet.createUnsignedTransaction(to_address, 0.0, 0.0)
      newtx.transaction.msg = {
        module: "Chat",
        request: "chat response create room",
        room_id: new_room_uuid,
        name,
        addresses
      }
      newtx.transaction.msg = app.keys.encryptMessage(to_address, newtx.transaction.msg);
      newtx = app.wallet.signTransaction(newtx);

      app.network.sendRequest("chat response create room", JSON.stringify(newtx.transaction));
    }
  }

  _handleCreateRoomResponse(app, tx) {
    this._addNewRoom(tx);
  }

  _createMessage(chat_room_id, msg) {
    let fee = 0.0 //await this._returnModServerStatus() ? 0.0 : 2.0;
    let newtx = this.app.wallet.createUnsignedTransaction(this.server.peer.publickey, 0.0, fee);
    if (newtx == null) { return; }

    newtx.transaction.msg = {
      module: "Chat",
      request: "chat send message",
      publickey: this.app.wallet.returnPublicKey(),
      room_id: chat_room_id,
      message: this.app.keys.encryptMessage(this.app.wallet.returnPublicKey(), msg)
    };

    newtx.transaction.msg = this.app.keys.encryptMessage(this.app.wallet.returnPublicKey(), newtx.transaction.msg);
    newtx.transaction.msg.sig = this.app.wallet.signMessage(msg);
    newtx = this.app.wallet.signTransaction(newtx);
    return newtx;
  }

  async _sendMessage(tx) {
    let from_slip = Object.assign({amt: 0.0}, tx.transaction.from[0]);
    if (from_slip.amt > 0.0) {
      this.app.network.propagateTransaction(tx);
    } else {
      this.app.network.sendTransactionToPeers(tx, "chat send message");
    }
  }

  _returnModServerStatus() {
    return new Promise((resolve, reject) => {
      this.server.sendRequestWithCallback("module", "Chat", (hasModule) => {
        resolve(hasModule);
      });
    });
  }

  _returnAuthor() {
    var author = this.app.wallet.returnPublicKey().substring(0, 8);
    if (this.app.wallet.returnIdentifier() != "") { author = this.app.wallet.returnIdentifier(); }
    return author
  }

  _returnRoomByID(room_id) {
    return this.chat.rooms.find(room => room.room_id == room_id);
  }

  _getRoomsWithoutMessages() {
    return this.chat.rooms.map((room) => {
      let { addresses, name, room_id } = room;
      return { addresses, name, room_id };
    });
  }

  _saveChat() {
    let server = this.server.peer;
    this.app.options.chat = Object.assign({}, {server, rooms: this._getRoomsWithoutMessages(), settings: this.settings});
    this.app.storage.saveOptions();
  }
}

export default ChatCore