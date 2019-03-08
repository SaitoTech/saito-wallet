import {AsyncStorage} from 'react-native'
import { observable, computed, action } from 'mobx'

export default class EmailStore {
  @observable emails = []

  constructor(saito) {
    this.saito = saito
  }

  async loadEmails() {
    await AsyncStorage.getItem('emails')

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
    AsyncStorage.setItem('emails', JSON.parse(JSON.stringify(this.emails)))
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

    this.emails = [new_email, ...this.emails]
  }

  @computed get returnReceivedEmails() {
    return this.emails.filter(email => email.from != this.saito.wallet.returnPublicKey())
  }

  @computed get returnSentEmails() {
    return this.emails.filter(email => email.from === this.saito.wallet.returnPublicKey())
  }
}