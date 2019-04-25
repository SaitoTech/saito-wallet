import { AsyncStorage } from 'react-native'
import { observable, computed, action } from 'mobx'

export default class EmailStore {
  @observable emails = []
  @observable display_inbox = true

  constructor(saito) {
    this.saito = saito
  }

  @action
  async loadEmails() {
    let emails = await AsyncStorage.getItem("emails")

    if (emails) {
      emails = JSON.parse(emails)

      let fetch_keys = emails.map(email => this.returnUnidentifiedKeys(email.from));
      if (fetch_keys != []) {
        await this._getMultipleIdentifiers(fetch_keys)
      }

      this.emails = emails
    }

    // var tmptx = new saito_lib.transaction();
    // tmptx.transaction.id          = 0;
    // tmptx.transaction.ts          = new Date().getTime();
    // tmptx.transaction.from        = [];
    // tmptx.transaction.from[0]     = {};
    // tmptx.transaction.from[0].add = "bearguy@saito";
    // tmptx.transaction.to          = [];
    // tmptx.transaction.to[0]       = {};
    // tmptx.transaction.to[0].add   = this.saito.wallet.returnPublicKey();
    // tmptx.transaction.msg         = {};
    // tmptx.transaction.msg.module  = "Email";
    // tmptx.transaction.msg.title   = "Get Started with Saito (free tokens!)";
    // tmptx.transaction.msg.markdown = 0;
    // tmptx.transaction.msg.data    =
    // `Saito Mail is a decentralized email system:
    // 1. Visit our token faucet.
    // 2. Register an email address.
    // 3. Feedback is welcome at bearguy@saito.`;
    // this.addEmail(tmptx)
  }

  saveEmails() {
    const savedEmails = JSON.parse(JSON.stringify(this.emails))
    AsyncStorage.setItem("emails", JSON.stringify(savedEmails))
  }

  @action
  addEmail(tx) {
    let txmsg = tx.returnMessage();

    // fetch data from app
    new_email = {};
    new_email.id       = tx.transaction.sig;
    new_email.time     = tx.transaction.ts;
    new_email.from     = tx.transaction.from[0].add;
    new_email.to       = tx.transaction.to[0].add;
    new_email.module   = txmsg.module;
    new_email.title    = txmsg.title;
    new_email.data     = txmsg.data;
    new_email.markdown = txmsg.markdown;
    new_email.attachments = txmsg.attachments;

    if (this.emails.some(email => email.id === new_email.id)) {
      return
    }

    this.emails = [new_email, ...this.emails]
    this.saveEmails(JSON.parse(JSON.stringify(this.emails)))
  }

  @action
  deleteEmail(email_id) {
    this.emails = this.emails.filter(email => email.id != email_id)
    this.saveEmails()
  }

  @action
  setInboxType(inbox_state) {
    this.display_inbox = inbox_state
  }

  @computed get toggledEmails() {
    let emails = this.display_inbox ?
      this.emails.filter(email => email.from != this.saito.wallet.returnPublicKey()) :
      this.emails.filter(email => email.from === this.saito.wallet.returnPublicKey())
    emails = JSON.parse(JSON.stringify(emails))
    return emails.map((email) =>  {
      email.from = this.findUsersFromKeys(email.from)
      return email
    })
  }

  returnDetailedEmail(email_id) {
    let email = this.emails.find(email => email.id === email_id)
    email = JSON.parse(JSON.stringify(email))
    email.from = this.findUsersFromKeys(email.from)
    return email
  }

  findUsersFromKeys(publickey) {
    let local_id = this.saito.keys.findByPublicKey(publickey)
    local_id = local_id ? local_id : { identifiers: [] }
    return local_id.identifiers.length > 0 ? local_id.identifiers[0] : publickey;
  }

  returnUnidentifiedKeys(key) {
    let local_id = this.saito.keys.findByPublicKey(key)
    local_id = local_id ? local_id : { identifiers: [] }
    if (local_id.identifiers.length == 0) {
      return key
    }
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

  _getIdentifier(author) {
    return new Promise((resolve, reject) => {
      this.saito.dns.fetchIdentifier(author, (answer) => {
        if (this.saito.dns.isRecordValid(answer)) {
          resolve(JSON.parse(answer).identifier)
        } else {
          reject("Can't find identifier for key");
        }
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

  async reset() {
    console.log("RESETTING EMAILS")
    await AsyncStorage.removeItem("emails")
    this.email = []
  }

}