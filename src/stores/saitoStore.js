import {AsyncStorage} from 'react-native'
import firebase from 'react-native-firebase'
import axios from 'axios'

import { observable, action } from 'mobx'

export default class SaitoStore {
  @observable balance = '0.0'
  @observable publickey = ''
  @observable identifier = ''
  @observable default_fee = 0.0

  constructor(config, saito) {
    this.saito   = saito
    this.balance = saito.wallet.wallet.balance
    this.publickey = saito.wallet.wallet.publickey
    this.server = config.peers[0]
  }

  @action
  updateSaitoWallet() {
    let { balance, publickey, default_fee, identifier } = this.saito.wallet.wallet
    console.log("BALANCE", this.saito.wallet.wallet.balance)
    console.log("PUBLICKEY", this.saito.wallet.wallet.publickey)
    this.balance = balance
    this.publickey = publickey
    this.identifier = identifier
    this.default_fee = default_fee
  }

  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken')
    console.log("TOKEN: ", fcmToken)
    if (!fcmToken) {
        console.log("RETRIEVING TOKEN")
        fcmToken = await firebase.messaging().getToken()
        if (fcmToken) {
            // user has a device token
            this._linkTokenToPublickey(fcmToken)
            console.log("TOKEN: ", fcmToken)
            await AsyncStorage.setItem('fcmToken', fcmToken)
        }
    }
  }

  _linkTokenToPublickey(token) {
    console.log("LINKING TOKEN TO NEW PUBLICKEY")
    console.log(this.publickey)
    console.log(token)
    const payload = {publickey: this.publickey, token}
    axios.post(`${this.getServerURL()}/notify/token/user/`, payload)
      .then(res => {
        console.log("SUCCESSFULLY LINKED TOKEN")
        console.log(res.data)
      })
      .catch(err => console.log("Failed to upload token"))
  }

  getServerURL() {
    return `${this.server.protocol}://${this.server.host}:${this.server.port}`
  }

  async reset() {
    this._linkTokenToPublickey(await AsyncStorage.getItem('fcmToken'))
  }

}