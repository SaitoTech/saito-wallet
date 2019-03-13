import React, {Component} from 'react'
import { FlatList, TouchableOpacity, View } from 'react-native'

import { Container, Body, Content, Header, ListItem, Left, Right, Icon, Title, Button, Fab, Segment, Text, Thumbnail, StyleProvider } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { observer, inject } from 'mobx-react'

var BUTTONS = [
  { text: "Inbox", icon: "american-football", iconColor: "#2c8ef4" },
  { text: "Sent", icon: "analytics", iconColor: "#f42ced" },
  { text: "Cancel", icon: "close", iconColor: "#25de5b" }
];

var CANCEL_INDEX = 2;

@inject('emailStore')
@observer
export default class EmailScreen extends Component {
  static navigationOptions = ({navigation}) => {
    const { params = {} } = navigation.state;
    return {
      header: (
        <StyleProvider style={getTheme(variables)} >
          <Header hasSegment>
            <Left>
              <Button transparent onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" />
              </Button>
            </Left>
            {/* <Body style={{ flex: 1, alignItems: 'center' }}> */}
            {/* <Title>
                Email
              </Title> */}
            <Body>
              <Segment>
                <Button first
                  onPress={() => params.emailStore.setInboxType(true)}>
                  <Text>Inbox</Text>
                </Button>
                <Button last active
                  onPress={() => params.emailStore.setInboxType(false)}>
                  <Text>Sent</Text>
                </Button>
              </Segment>
            </Body>
            {/* <Right style={{flex: 1}}>
              <Title style={{marginRight: 10}} onPress={() => params.emailStore.setInboxType(true)}>Inbox</Title>
              <Title onPress={() => params.emailStore.setInboxType(false)}>Sent</Title>
            </Right> */}
            <Right></Right>
          </Header>
        </StyleProvider>
      )
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({ emailStore: this.props.emailStore});
  }


  onPress(id) {
    // let index = this.props.emailStore.returnEmailIDX(email_idx)
    // this.props.emailStore.setCurrentRoomIDX(email_idx)
    // this.props.emailStore.clearRoomUnreadMessages(email_idx)

    const { navigation } = this.props

    // navigation.navigate('EmailDetail', {
    //   email: this.props.emailStore.returnCurrentEmail()
    // });
    navigation.navigate('EmailDetail', { id });
  }

  render() {
    return (
      <StyleProvider style={getTheme(variables)}>
        <Container>
          <Content>
            <FlatList
                data={this.props.emailStore.toggledEmails}
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
                    <ListItem key={index} onPress={this.onPress.bind(this, id)} avatar style={{ height: 80}}>
                      {/* <Left>
                        <Thumbnail source={require('../../../assets/img/saito_logo_black.png')}/>
                      </Left> */}

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
          <View style={{ flex: 1}}>
            <Fab
              containerStyle={{ }}
              style={{ backgroundColor: '#161617' }}
              position="bottomRight"
              onPress={() => this.props.navigation.navigate('EmailCompose')}>
              <Icon name="pen" type={"FontAwesome5"} style={{color: 'white'}} />
            </Fab>
          </View>
        </Container>
      </StyleProvider>
    )
  }
}