import React, { Component } from 'react'
import { FlatList, TouchableOpacity, Image, View } from 'react-native'

import { Card, CardItem, Container, Body, Content, Header, ListItem, Left, Right, Icon, Title, Button, Fab, Segment, Text, Thumbnail, StyleProvider } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { observer, inject } from 'mobx-react'

@inject('saito', 'saitoStore', 'dredditStore')
@observer
export default class DredditScreen extends Component {
  static navigationOptions = ({navigation}) => {
    //const { params = {} } = navigation.state;
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
                Dreddit
              </Title>
            </Body>
            <Right style={{flex: 1}}>
            </Right>
          </Header>
        </StyleProvider>
      )
    }
  }

  onPress(id, sig) {
    const { navigation, dredditStore } = this.props
    dredditStore.getPostComments(sig)
    dredditStore.setPostSig(sig)
    navigation.navigate('DredditDetail', { id });
  }

  render() {
    return (
      <StyleProvider style={getTheme(variables)}>
        <Container>
          <Content>
            <FlatList
              data={this.props.dredditStore.getPostsBySubreddit}
              renderItem={({item, index}) => {
                // let newpost = {
                //   id: message.data.id,
                //   title: tx.transaction.msg.title,
                //   author: tx.transaction.from[0].add,
                //   subreddit: message.data.subreddit,
                //   votes: message.data.votes,
                //   text: tx.transaction.msg.text,
                //   link: tx.transaction.msg.link,
                //   sig: tx.transaction.sig,
                // }

                let { id, title, author, subreddit, votes, comments, text, link, sig } = item
                return (
                  <Card key={id} style={{paddingTop: 15, paddingLeft: 3, paddingRight: 15, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0}}>
                    <CardItem>
                      <Left>
                        <View style={{width: 40, marginLeft: 0, marginRight: 15, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                          <Button transparent style={{height: 30, alignSelf:'center'}}>
                            <Icon type={"Entypo"} name="arrow-up" />
                          </Button>
                          <Text style={{marginLeft:0, alignSelf: 'center'}}>{votes}</Text>
                          <Button transparent style={{height: 30, alignSelf:'center'}}>
                            <Icon type={"Entypo"} name="arrow-down" />
                          </Button>
                        </View>
                        <Left>
                          <Text onPress={this.onPress.bind(this, id, sig)}>{title}</Text>
                          <Text note>{author}</Text>
                        </Left>
                        <Thumbnail
                          square
                          source={{uri: `https://apps.saito.network/r/screenshots/${id}.png`}}
                          defaultSource={require('../../../assets/img/saito_logo_black.png')}
                          />
                      </Left>
                    </CardItem>
                    <CardItem style={{height: 35}}>
                      <Left>
                        <Body>
                          {/* <Button transparent style={{marginLeft: 20}}>
                            <Icon active name="chatbubbles" />
                            <Text style={{fontSize: 16}}>{comments} Comments</Text>
                          </Button> */}
                          <Button transparent style={{padding: 0, width: 50, heigth: 30, marginLeft: 45}}>
                            <Icon active name="chatbubbles" style={{fontSize: 18, marginLeft: 0, marginRight: 5}}/>
                            <Text style={{fontSize: 16, marginLeft: 0, paddingLeft:0}}>{comments}</Text>
                          </Button>
                        </Body>
                        <Text style={{fontSize: 12}}>/r/{subreddit}</Text>
                      </Left>
                    </CardItem>
                  </Card>
                )
              }
              } />
          </Content>
          <View>
            <Fab
              // containerStyle={{ }}
              style={{ backgroundColor: '#161617' }}
              position="bottomRight"
              onPress={() => this.props.navigation.navigate('DredditPost')}>
              <Icon name="pen" type={"FontAwesome5"} style={{color: 'white'}} />
            </Fab>
          </View>
        </Container>
      </StyleProvider>
    )
  }
}