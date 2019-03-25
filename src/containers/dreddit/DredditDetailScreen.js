import React, { Component } from 'react'
import { Dimensions, FlatList, KeyboardAvoidingView, TextInput, TouchableOpacity, Image, StyleSheet, View } from 'react-native'

import { Card, CardItem, Container, Body, Content, Header, H3, ListItem, Left, Right, Icon, Title, Button, Fab, Segment, Text, Thumbnail, StyleProvider } from "native-base";

import Markdown from 'react-native-markdown-renderer'

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { observer, inject } from 'mobx-react'

@inject('saito', 'saitoStore', 'dredditStore')
@observer
export default class DredditDetailScreen extends Component {

  state = {
    message: ''
  }

  constructor(props) {
    super(props)

    const { navigation } = this.props
    this.post_id = navigation.getParam('id', {})
    this.post = this.props.dredditStore.returnPostByID(this.post_id)
  }

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

  renderRedditCard(branch, spacing=15) {
    return branch.children.map((comment) => {
      return (
        <View>
          <Card transparent style={{marginLeft: spacing, padding: 0, marginTop: 0}}>
            <CardItem>
              <Left>
                <View style={{width: 40, marginRight: 8, flexDirection: 'column', justifyContent:"flex-start"}}>
                  <Button transparent style={{height: 30, alignSelf:'center'}}>
                    <Icon type={"Entypo"} name="arrow-up" />
                  </Button>
                  <Text style={{marginLeft:0, alignSelf: 'center'}}>{comment.data.votes}</Text>
                  <Button transparent style={{height: 30, alignSelf:'center'}}>
                    <Icon type={"Entypo"} name="arrow-down" />
                  </Button>
                </View>
                <Left>
                  <Text note>{comment.data.author}</Text>
                  <Text style={{fontSize: 14}}>{comment.data.text}</Text>
                  <Button transparent style={{padding: 0, width: 75, heigth: 40}}>
                    <Icon active name="chatbubbles" style={{fontSize: 16, marginLeft: 0, marginRight: 5}}/>
                    <Text style={{fontSize: 12, marginLeft: 0, paddingLeft:0}}>reply</Text>
                  </Button>
                </Left>
              </Left>
            </CardItem>
          </Card>
          {this.renderRedditCard(comment, spacing + 15)}
        </View>
      )
    })
  }

  render() {
    let { id, title, author, subreddit, votes, comments, text, link, sig } = this.post
    return (
      <StyleProvider style={getTheme(variables)}>
        <Container>
          <Content>
            <Card key={id} style={{paddingTop: 15, paddingLeft: 3, paddingRight: 15, marginTop: 0, marginLeft: 0, marginRight: 0}}>
              <CardItem>
                <Left>
                  <View style={{width: 40, marginLeft: 0, marginRight: 15, flexDirection: 'column'}}>
                    <Button transparent style={{height: 30, alignSelf:'center'}}>
                      <Icon type={"Entypo"} name="arrow-up" />
                    </Button>
                    <Text style={{marginLeft:0, alignSelf: 'center'}}>{votes}</Text>
                    <Button transparent style={{height: 30, alignSelf:'center'}}>
                      <Icon type={"Entypo"} name="arrow-down" />
                    </Button>
                  </View>
                  <Left>
                    <Text>{title}</Text>
                    <Text note>{author}</Text>
                  </Left>
                  <Thumbnail
                    square
                    source={{uri: `https://apps.saito.network/r/screenshots/${id}.png`}}
                    defaultSource={require('../../../assets/img/saito_logo_black.png')}
                    />
                </Left>
              </CardItem>
              <CardItem style={{margin: 10}}>
                <Body>
                  {/* <Text>{text}</Text> */}
                  <Markdown>
                    {text}
                  </Markdown>
                  {/* <Body>
                    <Button transparent style={{marginLeft: 20}}>
                      <Icon active name="chatbubbles" />
                      <Text style={{fontSize: 16}}>{comments} Comments</Text>
                    </Button>
                  </Body>
                  <Text>/r/{subreddit}</Text> */}
                </Body>
              </CardItem>
            </Card>
            <H3>Comments</H3>
            <FlatList
              data={this.props.dredditStore.getCommentsByPostID}
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

                // let { id, title, author, subreddit, votes, comments, text, link, sig } = item
                // console.log(item)

                return (
                  <Card style={{marginTop: 0, marginLeft: 0, marginRight: 0}}>
                    <Card transparent>
                      <CardItem>
                        <Left>
                          <View style={{
                            width: 40,
                            marginLeft: 0,
                            marginRight: 8,
                            flexDirection: 'column',
                            justifyContent:"flex-start"
                          }}>
                            <Button transparent style={{height: 30, alignSelf:'center'}}>
                              <Icon type={"Entypo"} name="arrow-up" />
                            </Button>
                            <Text style={{marginLeft:0, alignSelf:'center'}}>{item.data.votes}</Text>
                            <Button transparent style={{height: 30, alignSelf:'center'}}>
                              <Icon type={"Entypo"} name="arrow-down" />
                            </Button>
                          </View>
                          <Left>
                            <Text note>{item.data.author}</Text>
                            <Text style={{fontSize: 14}}>{item.data.text}</Text>
                            <Button transparent style={{padding: 0, width: 75, heigth: 40}}>
                              <Icon active name="chatbubbles" style={{fontSize: 16, marginLeft: 0, marginRight: 5}}/>
                              <Text style={{fontSize: 12, marginLeft: 0, paddingLeft:0}}>reply</Text>
                            </Button>
                          </Left>
                        </Left>
                      </CardItem>
                    </Card>
                    {this.renderRedditCard(item)}
                  </Card>
                )
              }} />
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                onChangeText={text => this.setState({ message: text })}
                // value={this.state.email}
                placeholderTextColor='white'
                underlineColorAndroid='transparent'
              />
              <Button onPress={this.send} title='SEND' />
          </View>
          </Content>
          {/* <View style={{ flex: 1}}>
            <Fab
              containerStyle={{ }}
              style={{ backgroundColor: '#161617' }}
              position="bottomRight"
              onPress={() => this.props.navigation.navigate('EmailCompose')}>
              <Icon name="pen" type={"FontAwesome5"} style={{color: 'white'}} />
            </Fab>
          </View> */}
        </Container>
      </StyleProvider>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50,
    backgroundColor: '#EE5407',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', //Here is the trick
    bottom: 0, //Here is the trick
  },
  input: {
    backgroundColor: 'red',
    width: '100%',
    height: 40,
    color: '#ffffff'
  },
});