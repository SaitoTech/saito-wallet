import React, {Component} from 'react'
import { FlatList } from 'react-native'

import { Container, Body, Content, Header, ListItem, Left, Right, Icon, Title, Button, Separator, Text, Thumbnail, StyleProvider } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { observer, inject } from 'mobx-react'

@inject('emailStore')
@observer
export default class EmailScreen extends Component {

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
              <Title>
                Email
              </Title>
            </Body>
            <Right style={{flex: 1}}>
              <Icon name="edit" type={"FontAwesome5"} style={{color: 'white'}} onPress={() => navigation.navigate('EmailCompose')} />
            </Right>
          </Header>
        </StyleProvider>
      )
    }
  }

  onPress(email_idx) {
    // let index = this.props.emailStore.returnEmailIDX(email_idx)
    // this.props.emailStore.setCurrentRoomIDX(email_idx)
    // this.props.emailStore.clearRoomUnreadMessages(email_idx)

    const { navigation } = this.props

    // navigation.navigate('EmailDetail', {
    //   email: this.props.emailStore.returnCurrentEmail()
    // });
    navigation.navigate('EmailDetail', { email_idx });
  }

  render() {
    return (
      <StyleProvider style={getTheme(variables)}>
        <Container>
          <Content>
          <FlatList
              data={this.props.emailStore.returnReceivedEmails}
              renderItem={({item, index}) => {
                // new_email = {};
                // new_email.id       = tx.transaction.sig;
                // new_email.time     = tx.transaction.ts;
                // new_email.from     = tx.transaction.from[0].add;
                // new_email.to       = tx.transaction.to[0].add;
                // new_email.module   = txmsg.module;
                // new_email.title    = txmsg.title;
                // new_email.data     = txmsg.data;
                // new_email.markdown = txmsg.markdown;
                // new_email.attachments = txmsg.attachments;

                var {id, time, from, to, module, title, data, markdown, attachments} = item

                // let message = last_message ? last_message.message : ''

                let d = new Date(time)
                let hours = ((d.getHours() + 11) % 12 + 1)
                let am_pm = d.getHours() > 12 ? 'PM' : 'AM'
                let timestamp = `${hours}:${("0" + d.getMinutes()).substr(-2)} ${am_pm}`

                // let room_name = item.unread_messages.length > 0 ? `${identifier} (${item.unread_messages.length})` : identifier
                // room_name = room_name.slice(0,30)

                return (
                  <ListItem onPress={this.onPress.bind(this, index)} avatar style={{ height: 80}}>
                    <Left>
                      <Thumbnail source={require('../../../assets/img/saito_logo_black.png')}/>
                    </Left>

                    <Body style={{height: 80}}>
                      <Text >{from}</Text>
                      <Text note>{title}</Text>
                    </Body>

                    <Right style={{height: 80}}>
                      <Text note>{timestamp}</Text>
                    </Right>
                  </ListItem>
                )
              }
            } />
          </Content>
        </Container>
      </StyleProvider>
    )
  }
}