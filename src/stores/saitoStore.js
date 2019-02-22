
import { observable, action } from 'mobx'

export default class SaitoStore {
  @observable balance = '0.0'
  @observable publickey = ''
  @observable identifier = ''
  @observable default_fee = 0.0

  server = {
    host: "apps.saito.network",
    port: 443,
    protocol: "https"
  }


  constructor(saito) {
    this.saito   = saito
    this.balance = saito.wallet.wallet.balance
    this.publickey = saito.wallet.wallet.publickey
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

  getServerURL() {
    return `${this.server.protocol}://${this.server.host}:${this.server.port}`
  }

}