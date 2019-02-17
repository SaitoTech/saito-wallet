import { ModTemplate } from 'saito-lib'

export default class ReactMod extends ModTemplate {
  constructor(app, props, store) {
    super(props);

    this.name = "ReactMod"

    this.name            = "Registry";
    this.browser_active  = 0;
    this.handlesEmail    = 1;
    this.handlesDNS      = 1;

    this.app   = app
    this.props = props
    this.store = store
  }

  installModule(app) {
    this.store.updateSaitoWallet(this.app)
  }

  initialize(app) {
    this.store.updateSaitoWallet(this.app)
  }

  onNewBlock(blk, lc) {
    this.store.updateSaitoWallet(this.app)
  }

  updateBalance(app) {
    this.store.updateSaitoWallet(this.app)
  }
}