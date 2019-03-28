import React, {Component} from 'react'
import { FlatList, TouchableOpacity, View } from 'react-native'

import { Container, Body, Content, Header, ListItem, Left, Right, Icon, Title, Button, Fab, Segment, Text, Thumbnail, StyleProvider } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { observer, inject } from 'mobx-react'

@inject('emailStore')
@observer
export default class EmailScreen extends Component {
  state = {
    seg: 1
  }

  static navigationOptions = ({navigation}) => {
    const { params = {} } = navigation.state;
    console.log(params)
    return {
      header: (
        <StyleProvider style={getTheme(variables)} >
          <Header hasSegment >
            <Left style={{flex: 1}}>
              <Button transparent onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" />
              </Button>
            </Left>
            <Body style={{ flex: 1, alignItems: 'center' }}>
              <Title>
                Email
              </Title>
            </Body>
            <Right style={{flex: 1}}>
            </Right>
          </Header>
        </StyleProvider>
      )
    }
  }

  componentWillMount() {
    this.props.navigation.setParams({ emailStore: this.props.emailStore });
  }


  onPress(id) {
    const { navigation } = this.props
    navigation.navigate('EmailDetail', { id });
  }

  render() {
    return (
      <StyleProvider style={getTheme(variables)}>
        <Container>
          <Content>
          <Segment style={{width: '100%'}}>
            <Button first
              style={{
                width: '45%',
                backgroundColor: this.state.seg === 1 ? '#161617' : "white",
                borderColor: '#161617',
                justifyContent: 'center'
              }}
              active={this.state.seg === 1 ? true : false}
              onPress={() => {
                this.setState({ seg: 1 })
                this.props.emailStore.setInboxType(true)
              }}
              >
              <Text
                style={{ color: this.state.seg === 1 ? "white" : "#161617" }}
              >Inbox</Text>
            </Button>
            <Button last
              style={{
                width: '45%',
                backgroundColor: this.state.seg === 2 ? "#161617" : "white",
                borderColor: '#161617',
                justifyContent: 'center'
              }}
              active={this.state.seg === 2 ? true : false}
              onPress={() => {
                this.setState({ seg: 2 })
                this.props.emailStore.setInboxType(false)
              }}
              >
              <Text
                style={{ color: this.state.seg === 2 ? "white" : "#161617" }}
                >Sent</Text>
            </Button>
          </Segment>
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
                    <ListItem key={index} onPress={this.onPress.bind(this, id)} avatar style={{ height: 80, marginLeft: 0 }}>
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
          <View>
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