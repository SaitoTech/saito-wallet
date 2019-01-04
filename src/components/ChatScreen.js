import React, {Component} from 'react'
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

export default class ChatScreen extends Component {
  state = {
    rooms: [],
  }

  componentWillMount() {
    this.setState({
      rooms: [
        {
          key: '1',
          createdAt: new Date(),
          users: [
            {
              identifier: "adrian@saito",
              avatar: 'https://placeimg.com/140/140/any'
            }
          ],
        },
        {
          key: '2',
          createdAt: new Date(),
          users: [
            {
              identifier: "david@saito",
              avatar: 'https://placeimg.com/140/140/any'
            }
          ],
        },
        {
          key: '3',
          createdAt: new Date(),
          users: [
            {
              identifier: "richard@saito",
              avatar: 'https://placeimg.com/140/140/any'
            }
          ],
        }
      ],
    })
  }

  onPress = () => {
    const { navigation } = this.props
    navigation.navigate('ChatDetail');
    //, { user: });
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.rooms}
          renderItem={({item}) => {
            var {identifier, avatar} = item.users[0];
            return (
              <TouchableOpacity style={styles.room} onPress={this.onPress}>
                <Image
                  style={styles.roomImage} source={{uri: avatar}}/>
                <Text style={styles.item}>{identifier}</Text>
              </TouchableOpacity>
            )
          }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
   flex: 1,
  },
  room: {
    flexDirection: 'row',
    height: 100,
    borderWidth: 0.5,
    borderColor: '#d6d7da',
  },
  roomImage: {
    width: 50,
    height: 50,
    margin: 10
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
})