import { saito_lib, ModTemplate } from 'saito-lib'

export default class Email extends ModTemplate {
  constructor(saito, emailStore) {
    super()

    this.saito = saito
    this.emailStore = emailStore

    this.name            = "Email";
    this.handlesEmail    = 1;
  }

  initialize() {
    this.emailStore.loadEmails()
  }

  onConfirmation(blk, tx, conf, app) {
    if (tx == null) { return; }

    let txmsg = tx.returnMessage();

    if (txmsg == null) { return; }
    if (txmsg.module != "Email") { return; }

    if (conf == 0) {
      if (tx.isFrom(app.wallet.returnPublicKey())) {
        console.log("ADDING MESSAGE TO INBOX");
        this.emailStore.addEmail(tx);
        if (tx.transaction.to[0].add != app.wallet.returnPublicKey()) { return; } else {
          app.modules.returnModule("Email")._addMessageToInbox(tx);
        }
      } else {
        if (app.BROWSER == 1) {
          if (tx.transaction.to[0].add == app.wallet.returnPublicKey()) {
            console.log("onConfirmation EMAIL");
            app.modules.returnModule("Email")._addMessageToInbox(tx);
            // app.archives.saveTransaction(tx);
          }
        }
      }
    }
  }

  _addMessageToInbox(tx) {
    console.log("ADDING MESSAGE TO INBOX");
    this.emailStore.addEmail(tx);
  }
}
