
import React, { Component } from 'react'
import { FlatList, TouchableOpacity, Image, View } from 'react-native'

import { Card, CardItem, Container, Body, Content, Header, Label, ListItem, Left, Right, Icon, Title, Button, Fab, Form, Footer, Input, Item, Segment, Text, Textarea, Thumbnail, StyleProvider } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'

import { observer, inject } from 'mobx-react'

@inject('saito', 'saitoStore', 'dredditStore')
@observer
export default class DredditPostScreen extends Component {

  state = {
    title: '',
    url: '',
    title: '',
    content:'',
  }

  static navigationOptions = ({navigation}) => {
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

  render() {
    return (
      <StyleProvider style={getTheme(variables)}>
        <Container >
          <Content >
            <Form>
              <Item inlineLabel style={{ marginLeft: 0 }}>
              <Label style={{width: 60, marginLeft: 5}}>Title</Label>
                <Input
                  onChangeText={(to) => this.setState({to})}/>
              </Item>
              <Item inlineLabel style={{ marginLeft: 0 }}>
                <Label style={{width: 60, marginLeft: 5}}>URL</Label>
                <Input />
              </Item>
              <Item style={{ marginLeft: 0 }}>
                <Input
                  value={this.state.title}
                  placeholder="subreddit"
                  onChangeText={(title) => this.setState({title})}/>
              </Item>
              <View>
                <Textarea
                  rowSpan={15}
                  placeholder='Content'
                  onChangeText={content => this.setState({content})}
                  style={{ width: '100%' }} />
              </View>
            </Form>
          </Content>
          <Footer>
            <Button block dark style={{width: '100%', height: '100%'}} onPress={() => this.sendEmail()}>
              <Text>POST</Text>
            </Button>
          </Footer>
        </Container>
      </StyleProvider>
    )
  }
}