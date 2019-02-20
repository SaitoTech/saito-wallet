import { ModTemplate } from 'saito-lib'

export default class ReactMod extends ModTemplate {
  constructor(props, app, store) {
    super(props);

    this.name = "ReactMod"

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