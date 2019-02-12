import React, {Component} from 'react'
import { Body, Header, Left, Right, Title } from "native-base";

export default class Header extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {left, right, title} = this.props
    return (
      <Header style={{ backgroundColor: '#E7584B'}}>
        <Left>
          {left}
        </Left>
        <Body>
          <Title>{title}</Title>
        </Body>
        <Right>
          {right}
        </Right>
      </Header>
    )
  }
}