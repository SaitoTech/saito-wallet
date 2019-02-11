
import { observable, action } from 'mobx'

export default class SaitoStore {
  @observable balance = '0.0'
  @observable publickey = ''


  constructor(saito) {
    this.balance = saito.wallet.wallet.balance
    this.publickey = saito.wallet.wallet.publickey
  }

  @action
  updateSaitoWallet(saito) {
    this.balance = saito.wallet.wallet.balance
    this.publickey = saito.wallet.wallet.publickey
  }
}