import React, {Component} from 'react'

import {View} from 'react-native'
import { Container, Body, Content, Header, ListItem, Left, Right, Icon, Item, Title, H1, H2, Button, Separator, Text, StyleProvider, Footer } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { observer, inject } from 'mobx-react'

@inject('saito', 'saitoStore', 'emailStore')
@observer
export default class EmailDetailScreen extends Component {

  constructor(props) {
    super(props)

    const { navigation } = this.props
    let email_idx = navigation.getParam('email_idx', {})
    this.email = this.props.emailStore.emails[email_idx]
  }

  static navigationOptions = ({navigation}) => {
    return {
      header: (
        <StyleProvider style={getTheme(variables)} >
          <Header >
            <Left style={{flex: 1}}>
              <Button transparent onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" />
              </Button>
            </Left>
            <Body style={{flex: 1, alignItems: 'center'}}>
            </Body>
            <Right style={{flex: 1, justifyContent: 'space-between'}}>
              <Icon name="archive" style={{color: 'white'}}/>
              <Icon name="trash" style={{color: 'white'}}/>
              <Icon name="kebab-vertical" style={{color: 'white'}} type={'Octicons'}/>
            </Right>
          </Header>
        </StyleProvider>
      )
    }
  }

  render() {
    var {id, time, from, to, module, title, data, markdown, attachments} = this.email

    // let message = last_message ? last_message.message : ''

    let d = new Date(time)
    let hours = ((d.getHours() + 11) % 12 + 1)
    let am_pm = d.getHours() > 12 ? 'PM' : 'AM'
    let timestamp = `${hours}:${("0" + d.getMinutes()).substr(-2)} ${am_pm}`

    return (
      <StyleProvider style={getTheme(variables)}>
        <Container>
          <Content contentContainerStyle={{margin: 7}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
              <H1 style={{width: '75%'}}>
                {title}
              </H1>
              <Text style={{color: 'grey'}}>{timestamp}</Text>
            </View>

            <View style={{flex: 1, flexDirection: 'column', marginBottom: 10}}>
              <H2 style={{color: 'grey'}}>
                {from}
              </H2>
            </View>

            <View
              style={{
                borderBottomColor: 'lightgrey',
                borderBottomWidth: 1,
              }}
            />

            <View style={{flex: 1, flexDirection: 'column', marginTop: 10 }}>
              <Text>
                {data}
              </Text>
            </View>
          </Content>
          <Footer contentContainerStyle={{flex: 1, justifyContent: 'space-around', backgroundColor: 'white'}}>
            <Button bordered dark style={{height: '100%', width: '35%', justifyContent: 'center', marginLeft: 5, marginRight: 5}}>
              <Icon name="mail-reply" type='FontAwesome' style={{color: 'black', fontSize: 27}}/>
            </Button>
            <Button bordered dark style={{height: '100%', width: '35%', justifyContent: 'center', marginLeft: 5, marginRight: 5}}>
              <Icon name="mail-forward" type='FontAwesome' style={{color: 'black', fontSize: 27}}/>
            </Button>
          </Footer>
        </Container>
      </StyleProvider>
    )
  }
}