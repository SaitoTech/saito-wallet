import React, { Component } from 'react'
import { Dimensions, FlatList, Linking, KeyboardAvoidingView, TextInput, TouchableOpacity, Image, StyleSheet, View } from 'react-native'

import { Card, CardItem, Container, Body, Content, Header, H3, ListItem, Left, Right, Icon, Title, Button, Fab, Segment, Text, Textarea, Thumbnail, Spinner, StyleProvider } from "native-base";

import Markdown from 'react-native-markdown-renderer'

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { observer, inject } from 'mobx-react'
import { Observer } from 'mobx-react/native'

@inject('saito', 'saitoStore', 'dredditStore')
@observer
export default class DredditDetailScreen extends Component {

  state = {
    message: '',
    parent_id: '0',
    show_reply: false,
    comment_map: []
  }

  constructor(props) {
    super(props)

    const { navigation } = this.props
    this.post_id = navigation.getParam('id', {})
    this.post_index = navigation.getParam('index', {})
    this.post = this.props.dredditStore.returnPostByID(this.post_id)

    this.rules = {
      text: (node, children, parent, styles) => {
        return <Text style={{fontSize: 14}} key={node.key}>{node.content}</Text>;
      },
    }
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

  editPost() {
    this.props.navigation.navigate("DredditPostScreen", {
      title: this.post.title,
      url: this.post.link,
      subreddit: this.post.subreddit,
      content: this.post.text,
    })
  }

  onPostVote(index, sig, vote) {
    this.props.dredditStore.updatePostVote(vote, index)
    this.props.dredditStore.vote(vote, 'post', sig)
  }

  onReplySelect(sig, map) {
    this.setState({
      parent_id: sig,
      show_reply: !this.state.show_reply,
      comment_map: map
    })
  }

  onSendComment() {
    var link = `https://apps.saito.network/r/${this.post.subreddit}/${this.post.sig}`
    var msg = {
      module: "Reddit",
      type: "comment",
      text: this.state.message,
      post_id: this.post.sig,
      parent_id: this.state.parent_id,
      post_author: this.post.post_author,
      link: link,
      subreddit: this.post.subreddit.toLowerCase(),
      identifier: this.props.saito.wallet.returnIdentifier(),
    }

    let newtx = this.createCommentTX(msg)
    this.sendComment(newtx)
    this.props.dredditStore.addComment(newtx, msg, this.state.comment_map)
  }

  createCommentTX(msg) {
    var newtx = this.props.saito.wallet.createUnsignedTransaction(this.props.saito.wallet.returnPublicKey(), 0.0, 1.000);
    if (newtx == null) { alert("Unable to send TX"); return; }

    newtx.transaction.msg = msg;
    newtx = this.props.saito.wallet.signTransaction(newtx);
    return newtx
  }

  editComment() {
    var msg = {};
    msg.module     = "Reddit";
    msg.type       = "edit_comment";
    msg.post_id    = this.post.sig;
    msg.comment_id = this.state.comment_id;
    msg.data       = this.state.message;

    let newtx = this.createCommentTX(msg)
    this.sendComment(newtx)
    //this.props.dredditStore.editComment(newtx, msg, this.state.comment_map)
  }

  sendComment(newtx) {
    this.props.saito.network.propagateTransactionWithCallback(newtx, () => {
      alert("Your comment has been broadcast")
      this.setState({parent_id: 0, show_reply: !this.state.show_reply})
    });
  }

  replyToComment(comment_id) {
    this.setState({parent_id: comment_id})
  }

  onCommentVote(map, sig, vote) {
    this.props.dredditStore.updateCommentVote(vote, sig, map)
    this.props.dredditStore.vote(vote, 'comment', sig)
  }

  renderRedditCard(branch, map, spacing=15) {
    return branch.children.map((comment, index) => {
      let author = comment.data.author === "" ? comment.data.publickey.substring(0,8) : comment.data.author
      let next_map = [...map, index]
      return (
        <View>
          <Card transparent style={{marginLeft: spacing, padding: 0, marginTop: 0}}>
            <CardItem>
              <Left>
                <View style={{width: 40, marginRight: 8, flexDirection: 'column', justifyContent:"flex-start"}}>
                  <Button onPress={this.onCommentVote.bind(this, JSON.parse(JSON.stringify(next_map)), comment.data.sig, 1)}
                    transparent style={{height: 30, alignSelf:'center'}}>
                    <Icon type={"Entypo"} name="arrow-up" />
                  </Button>
                  <Text style={{marginLeft:0, alignSelf: 'center'}}>{comment.data.votes}</Text>
                  <Button onPress={this.onCommentVote.bind(this, JSON.parse(JSON.stringify(next_map)), comment.data.sig, -1)}
                    transparent style={{height: 30, alignSelf:'center'}}>
                    <Icon type={"Entypo"} name="arrow-down" />
                  </Button>
                </View>
                <Left>
                  <Text note>{author}</Text>
                  <Markdown rules={this.rules}>{comment.data.text}</Markdown>
                  <Button
                    transparent
                    onPress={
                      this.onReplySelect.bind(this, comment.data.sig, JSON.parse(JSON.stringify([index])))
                    }
                    style={{padding: 0, width: 75, height: 30}}>
                    <Icon active name="chatbubbles" style={{fontSize: 16, marginLeft: 0, marginRight: 5}}/>
                    <Text style={{fontSize: 12, marginLeft: 0, paddingLeft:0}}>reply</Text>
                  </Button>
                </Left>
              </Left>
            </CardItem>
          </Card>
          {this.renderRedditCard(comment, JSON.parse(JSON.stringify(next_map)), spacing + 15)}
        </View>
      )
    })
  }

  render() {
    let { id, title, author, subreddit, comments, text, link, sig } = this.props.dredditStore.posts[this.post_index]
    return (
      <StyleProvider style={getTheme(variables)}>
        <Container>
          <Content>
            <Observer>{() =>
              <Card style={{paddingTop: 15, paddingLeft: 3, paddingRight: 15, marginTop: 0, marginLeft: 0, marginRight: 0}}>
                <CardItem>
                  <Left>
                    <View style={{width: 40, marginLeft: 0, marginRight: 15, flexDirection: 'column'}}>
                      <Button
                        onPress={this.onPostVote.bind(this, this.post_index, sig, 1)}
                        transparent
                        style={{height: 30, alignSelf:'center'}}>
                        <Icon type={"Entypo"} name="arrow-up" />
                      </Button>
                      <Text style={{marginLeft:0, alignSelf: 'center'}}>{this.props.dredditStore.posts[this.post_index].votes}</Text>
                      <Button
                        onPress={this.onPostVote.bind(this, this.post_index, sig, -1)}
                        transparent
                        style={{height: 30, alignSelf:'center'}}>
                        <Icon type={"Entypo"} name="arrow-down" />
                      </Button>
                    </View>
                    <Left>
                      <Text
                        onPress={() => Linking.openURL(link)}
                      >{title}</Text>
                      <Text note>{author}</Text>
                    </Left>
                    <Thumbnail
                      square
                      source={{uri: `https://apps.saito.network/r/screenshots/${id}.png`}}
                      defaultSource={require('../../../assets/img/saito_logo_black.png')}
                      />
                  </Left>
                </CardItem>
                {/* <CardItem>
                  <Body>
                    <Button
                      onPress={() => this.editPost()}
                      transparent>
                      <Icon type={"FontAwesome5"} name={"edit"}/>
                    </Button>
                  </Body>
                </CardItem> */}
                <CardItem style={{margin: 10}}>
                  <Body>
                    <Markdown>
                      {text}
                    </Markdown>
                  </Body>
                </CardItem>
              </Card>
            }</Observer>
            <H3 style={{marginTop: 10, marginBottom: 10, marginLeft: 5}}>Comments</H3>
            { this.props.dredditStore.loadingComments ? <Spinner color='rgba(28,28,35,1)' /> :
            <FlatList
              style={{marginBottom: 40}}
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
                let author = item.data.author === "" ? item.data.publickey.substring(0,8) : item.data.author
                let comment_map = []

                return (
                  <Observer>{() =>
                    <Card style={{marginTop: 0, marginLeft: 0, marginRight: 0}}>
                      <Card transparent>
                        <CardItem style={{justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                          <Left>
                            <View style={{
                              width: 40,
                              marginLeft: 0,
                              marginRight: 8,
                              flexDirection: 'column',
                              justifyContent:"flex-start",
                              alignItems:"flex-start"
                            }}>
                              <Button onPress={this.onCommentVote.bind(this, JSON.parse(JSON.stringify([index])), item.data.sig, 1)}
                              transparent style={{height: 30, alignSelf:'center'}}>
                                <Icon type={"Entypo"} name="arrow-up" />
                              </Button>
                              <Text style={{marginLeft:0, alignSelf:'center'}}>{item.data.votes}</Text>
                              <Button onPress={this.onCommentVote.bind(this, JSON.parse(JSON.stringify([index])), item.data.sig, -1)}
                              transparent style={{height: 30, alignSelf:'center'}}>
                                <Icon type={"Entypo"} name="arrow-down" />
                              </Button>
                            </View>
                            <Left>
                              <Text note>{author}</Text>
                              <Markdown rules={this.rules}>{item.data.text}</Markdown>
                              <Button
                                transparent
                                onPress={
                                  this.onReplySelect.bind(this, item.data.sig, JSON.parse(JSON.stringify([index])))
                                }
                                style={{padding: 0, width: 75, height: 30}}>
                                <Icon active name="chatbubbles" style={{fontSize: 16, marginLeft: 0, marginRight: 5}}/>
                                <Text style={{fontSize: 12, marginLeft: 0, paddingLeft:0}}>reply</Text>
                              </Button>
                            </Left>
                          </Left>
                        </CardItem>
                      </Card>
                      {this.renderRedditCard(item, [...comment_map, index])}
                    </Card>
                  }</Observer>
                )
              }} />
            }
          </Content>
          {this.state.show_reply ?
            <View style={styles.bottomView}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Textarea
                  style={styles.input}
                  onChangeText={text => this.setState({ message: text })}
                />
                <Button
                  onPress={() => this.onSendComment()}
                  transparent style={{height: '100%', width: '15%', backgroundColor: 'white'}}>
                  <Icon type={'AntDesign'} name='arrowright'/>
                </Button>
              </View>
            </View>
            : null}
          {this.state.show_reply ? null : <View>
            <Fab
              // containerStyle={{ }}
              style={{ backgroundColor: '#161617' }}
              position="bottomRight"
              onPress={this.onReplySelect.bind(this, '0', [])}>
              <Icon name="pen" type={"FontAwesome5"} style={{color: 'white'}} />
            </Fab>
          </View>}
        </Container>
      </StyleProvider>
    )
  }
}

const styles = StyleSheet.create({
  bottomView: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', //Here is the trick
    bottom: 0, //Here is the trick
  },
  input: {
    backgroundColor: 'white',
    width: '85%',
    height: '100%',
    position: 'relative',
    color: 'black'
  },
});