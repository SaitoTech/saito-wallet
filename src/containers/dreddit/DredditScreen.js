import React, { Component } from 'react'
import { FlatList, TouchableOpacity, Image, View } from 'react-native'

import { Card, CardItem, Container, Body, Content, Header, ListItem, Left, Right, Icon, Title, Button, Fab, Segment, Spinner, Text, Thumbnail, StyleProvider } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { observer, inject } from 'mobx-react'
import { Observer } from 'mobx-react/native';

//import config from '../../../satio.config'

@inject('config', 'saito', 'saitoStore', 'dredditStore')
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

  onPress(id, sig, index) {
    console.log("ID: ", id)
    console.log("SIG: ", sig)
    console.log("INDEX: ", index)
    const { navigation, dredditStore } = this.props
    dredditStore.setPostSig(sig)
    navigation.navigate('DredditDetail', { id, index })
    dredditStore.getPostComments(sig)
  }

  onVote(index, sig, vote) {
    this.props.dredditStore.updatePostVote(vote, index)
    this.props.dredditStore.vote(vote, 'post', sig)
  }

  _renderItem({item, index}) {
    let { id, tx, title, author, subreddit, comments, text, link } = item
    let sig = tx.sig
    let { protocol, host, port } = this.props.config.peers[0]
    console.log(tx)
    console.log(sig)
    return (
      <Observer>{() =>
        <Card
          key={id}
          style={{paddingTop: 15, paddingLeft: 3, paddingRight: 15, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0}}>
          <TouchableOpacity onPress={this.onPress.bind(this, id, sig, index)}>
            <CardItem>
              <Left>
                <View style={{width: 40, marginLeft: 0, marginRight: 15, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                  <Button onPress={this.onVote.bind(this, index, sig, 1)} transparent style={{height: 30, alignSelf:'center'}}>
                    <Icon type={"Entypo"} name="arrow-up" />
                  </Button>
                  <Text style={{marginLeft:0, alignSelf: 'center'}}>{item.votes}</Text>
                  <Button onPress={this.onVote.bind(this, index, sig, -1)} transparent style={{height: 30, alignSelf:'center'}}>
                    <Icon type={"Entypo"} name="arrow-down" />
                  </Button>
                </View>
                <Left>
                  <Text>{title}</Text>
                  <Text note>{author}</Text>
                </Left>
                <Thumbnail
                  square
                  // source={{uri: `https://sandbox.saito.network/r/screenshots/${id}.png`}}
                  source={{uri: `${protocol}://${host}:${port}/r/screenshots/${id}.png`}}
                  defaultSource={require('../../../assets/img/saito_logo_black.png')}
                  />
              </Left>
            </CardItem>
            <CardItem style={{height: 35}}>
              <Left>
                <Body>
                  <Button transparent style={{padding: 0, width: 50, heigth: 30, marginLeft: 45}}>
                    <Icon active name="chatbubbles" style={{fontSize: 18, marginLeft: 0, marginRight: 5}}/>
                    <Text style={{fontSize: 16, marginLeft: 0, paddingLeft:0}}>{comments}</Text>
                  </Button>
                </Body>
                <Text style={{fontSize: 12}}>/r/{subreddit}</Text>
              </Left>
            </CardItem>
          </TouchableOpacity>
        </Card>
      }</Observer>
    )
  }

  render() {
    return (
      <StyleProvider style={getTheme(variables)}>
        <Container>
          <Content>
          { this.props.dredditStore.loadingPosts ? <Spinner color='rgba(28,28,35,1)' /> :
            <FlatList
              data={this.props.dredditStore.getPostsBySubreddit}
              renderItem={this._renderItem.bind(this)} />
          }
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