import {ModTemplate} from 'saito-lib'


export default class Registry extends ModTemplate{
  constructor(saito, saitoStore) {
    super()
    this.saito = saito
    this.store = saitoStore

    this.publickey = '23ykRYbjvAzHLRaTYPcqjkQ2LnFYeMkg9cJgXPbrWcHmr'

    this.handlesEmail    = 1;
    this.handlesDNS      = 1;

    this.name = "Registry"
  }

  // initialize() {}

  onConfirmation(blk, tx, conf, app) {
    if (conf == 0 && app.BROWSER == 1) {
      if (tx == null) { return; }

      let txmsg = tx.returnMessage();

      if (txmsg == null) { return; }
      if (txmsg.module != "Email") { return; }


      // if (conf == 0) {
      //   if (tx.transaction.to[0].add == app.wallet.returnPublicKey()) {
      //     console.log("ARE WE HERE?")
      //     if (txmsg.title == 'Address Registration Success!') {
      //       this.store.saveIdentifierToWallet(this.saito)
      //     }
      //   }
      // }

      // if (txmsg.module == "Email") {
      if (txmsg.sig === undefined) { return; }
      if (txmsg.sig == "") { return; }

      var sig = txmsg.sig;

      var registry_self = app.modules.returnModule("Registry");

      //
      // browser can update itself
      //
      if (tx.transaction.to[0].add == app.wallet.returnPublicKey()) {

        let sigsplit = sig.replace(/\n/g, '').split("\t");
        if (sigsplit.length > 6) {

          let registry_id    = sigsplit[1];
          let registry_bid   = sigsplit[2];
          let registry_bhash = sigsplit[3];
          let registry_add   = sigsplit[4];
          let registry_sig   = sigsplit[6];
          let registry_key   = sigsplit[7];

          let msgtosign   = registry_id + registry_add + registry_bid + registry_bhash;
          let msgverifies = app.crypto.verifyMessage(msgtosign, registry_sig, registry_self.publickey);

          if (msgverifies) {
            app.keys.addKey(registry_add, registry_id, 0, "Email");
            app.keys.saveKeys();
            app.wallet.updateIdentifier(registry_id);
            app.wallet.saveWallet();
          }
        }

      }
    }
  }

  onNewBlock() {
    this.store.updateSaitoWallet(this.saito)
  }

  shouldAffixCallbackToModule(modname) {
    return modname == this.name || modname == "Email"
  }
}