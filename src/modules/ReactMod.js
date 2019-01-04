import { ModTemplate } from 'saito-lib'

export default class ReactMod extends ModTemplate {
  constructor(props) {
    super(props);
    this.props = props;
  }

  installModule(app) {
    this.props.forceUpdate();
  }

  onNewBlock(blk, lc) {
    this.props.forceUpdate();
  }
}