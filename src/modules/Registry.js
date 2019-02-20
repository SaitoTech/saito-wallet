import {ModTemplate} from 'saito-lib'


export default class Registry extends ModTemplate{
  constructor(saito, saitoStore) {
    super()
    this.saito = saito
    this.store = saitoStore
  }

  // initialize() {}

  onConfirmation(blk, tx, conf, app) {
    if (tx == null) { return; }

    let txmsg = tx.returnMessage();

    if (txmsg == null) { return; }
    if (txmsg.module != "Email") { return; }


    if (conf == 0) {
      if (tx.transaction.to[0].add == app.wallet.returnPublicKey()) {
        if (txmsg.title == 'Address Registration Success') {
          this.store.saveIdentifierToWallet(this.saito)
        }
      }
    }
  }

  // handlePeerRequest() {}
}