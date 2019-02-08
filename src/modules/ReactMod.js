import { ModTemplate } from 'saito-lib'

export default class ReactMod extends ModTemplate {
  constructor(props) {
    super(props);
    this.props = props
  }

  installModule(app) {
    this.props.forceUpdate()
  }

  initialize(app) {
    this.props.forceUpdate()
  }

  // We need something else to trigger updates to state
  onNewBlock(blk, lc) {
    this.props.forceUpdate()
  }

  updateBalance(app) {
    this.props.forceUpdate()
  }
}