import React, {Component} from 'react';
import {
  Alert,
  Button,
  Clipboard,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { observer, inject } from 'mobx-react'

type Props = {};

@inject('saito', 'saitoStore', 'chatStore')
@observer
export default class HomeScreen extends Component<Props> {

  constructor(props) {
    super(props)
  }

  static navigationOptions = {
    header: null
  }

  render() {
    return (
      <View style={styles.container}>
        <Image
          style={{width: 100, height: 100, marginTop: 45}}
          source={require('../../assets/img/Logo-blue.png')}
        />
        <Text style={styles.header}>Saito Wallet</Text>
        <Text style={styles.welcome}>BALANCE: {this.props.saitoStore.balance}</Text>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          height: 40,
          margin: 15,
          }}>
          <ScrollView style={{backgroundColor: "#F5FCFF", marginRight: 10}} horizontal={true} >
            <Text style={styles.instructions}>{this.props.saitoStore.publickey}</Text>
          </ScrollView>
          <TouchableOpacity onPress={() => Clipboard.setString(this.props.saitoStore.publickey)}>
            <Icon size={35} name="clipboard"/>
          </TouchableOpacity>
        </View>
        <View style={{
          flexDirection: 'row',
        }}>
          <View style={{
            flex: 1,
            margin: 10
          }}>
            <Button
              title="Reset Wallet"
              color="#ff8844"
              raised={true}
              onPress={() => console.log("Wallet Reset")}
            />
          </View>
          <View style={{
            flex: 1,
            margin: 10
          }}>
            <Button
              title="Import Wallet"
              color="#ff8844"
              raised={true}
              onPress={() => console.log("Wallet Imported")}
            />
          </View>
        </View>
        <Text style={styles.moduleHeader}>MODULES</Text>
        <View style={{
          flex: 2,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginBottom: 15
        }}>
          <TouchableOpacity style={styles.module}>
            <Icon name="envelope" size={40} color="black" />
            <Text style={styles.moduleText}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.module}>
            <Icon name="reddit-alien" size={40} color="black" />
            <Text style={styles.moduleText}>Reddit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.module}>
            <Icon name="facebook-square" size={40} color="black" />
            <Text style={styles.moduleText}>Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.module}
            onPress={() => this.props.navigation.navigate('Transactions')}>
            <Icon name="link" size={40} color="black" />
            <Text style={styles.moduleText}>Send TX</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.module}
            onPress={() => this.props.navigation.navigate('Wallet')}>
            <Icon name="wallet" size={40} color="black" />
            <Text style={styles.moduleText}>Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.module}
            onPress={() => this.props.navigation.navigate('Chat')}>
            <Icon name="rocketchat" size={40} color="black" />
            <Text style={styles.moduleText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.5)',
  },
  header: {
    fontFamily: 'Titillium Web',
    fontSize: 42,
    textAlign: 'center',
    marginTop: 5
  },
  welcome: {
    fontFamily: 'Titillium Web',
    fontSize: 28,
    textAlign: 'right',
    // margin: 10,
  },
  instructions: {
    fontFamily: 'Titillium Web',
    // textAlign: 'left',
    alignSelf: 'center',
    color: '#333333',
    fontSize: 18,
    marginLeft: 10
  },
  module: {
    height: 50,
    width: Dimensions.get('window').width / 3,
    alignItems: 'center',
    marginBottom: 25
  },
  moduleHeader: {
    fontFamily: 'Titillium Web',
    fontSize: 22,
    margin: 10
  },
  moduleText: {
    fontFamily: 'Titillium Web',
    borderRadius: 10
  }
});