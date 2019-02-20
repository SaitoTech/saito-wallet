import React, {Component} from 'react';
import {
  Alert,
  Clipboard,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Container, Body, Content, Header, Left, Right, Icon, Title, Button, Text, StyleProvider } from "native-base";

import getTheme from '../../../native-base-theme/components'
import variables from '../../../native-base-theme/variables/variables'


import { observer, inject } from 'mobx-react'

@inject('saito', 'saitoStore', 'chatStore')
@observer
export default class HomeScreen extends Component {

  constructor(props) {
    super(props)
  }

  static navigationOptions = ({navigation}) => {
    return {
      header: (
        <StyleProvider style={getTheme(variables)} >
          <Header style={{ backgroundColor: '#E7584B'}}>
            <Left style={{flex: 1}}>
              <Icon name="menu" style={{color: 'white', fontSize: 28}} onPress={() => console.log("Settings pressed")} />
            </Left>
            <Body style={{flex: 1, alignItems: 'center'}}>
              <Title>Saito Wallet</Title>
            </Body>
            <Right style={{flex: 1}}>
              <Icon name="md-settings" type={'Ionicons'} style={{color: 'white', margin: 7, fontSize: 28}} onPress={() => navigation.navigate('Settings')} />
            </Right>
          </Header>
        </StyleProvider>
      )
    }
  }

  render() {
    return (
      <StyleProvider style={getTheme(variables)}>
        <View style={styles.container}>
          <Image
            style={{width: 100, height: 100, marginTop: 20}}
            source={require('../../../assets/img/saito_logo_black.png')}
          />
          <Text style={styles.header}>BALANCE: {this.props.saitoStore.balance}</Text>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            height: 40,
            margin: 15,
            marginLeft: 30,
            marginRight: 30,
            }}>
            <ScrollView style={{ borderColor: 'rgba(221, 221, 222, 1)', borderRadius: 8, borderStyle: 'solid', borderWidth: 1, marginRight: 20}} horizontal={true} >
              <Text style={styles.instructions}>{this.props.saitoStore.publickey}</Text>
            </ScrollView>
            <TouchableOpacity onPress={() => Clipboard.setString(this.props.saitoStore.publickey)}>
              <Icon style={{fontSize: 35}} name="clipboard"/>
            </TouchableOpacity>
          </View>
          <Button full style={{marginLeft: 45, marginRight: 45, margin: 10}} onPress={() => this.props.navigation.navigate('Registry')}>
            <Text>Register ID</Text>
          </Button>
          {/* <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
            <Button dark style={{ margin: 15 }} onPress={() => console.log("Wallet Reset")}>
              <Text style={{fontFamily: 'Titillium Web'}}>Save Wallet</Text>
            </Button>
            <Button dark style={{ margin: 15 }} onPress={() => console.log("Import Wallet")}>
              <Text style={{fontFamily: 'Titillium Web'}}>Import Wallet</Text>
            </Button>
          </View> */}
          <Text style={styles.moduleHeader}>MODULES</Text>
          <View style={{
            flex: 2,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginBottom: 15
          }}>
            <TouchableOpacity style={styles.module}>
              <Icon name="envelope" type={"FontAwesome5"} style={{fontSize: 40}} color="black" />
              <Text style={styles.moduleText}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.module}>
              <Icon name="reddit-alien" type={"FontAwesome5"} style={{fontSize: 40}} color="black" />
              <Text style={styles.moduleText}>Reddit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.module}>
              <Icon name="facebook-square" type={"FontAwesome5"} style={{fontSize: 40}}  color="black" />
              <Text style={styles.moduleText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.module}
              onPress={() => this.props.navigation.navigate('Transactions')}>
              <Icon name="link" type={"FontAwesome5"} style={{fontSize: 40}} color="black" />
              <Text style={styles.moduleText}>Send TX</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.module}
              onPress={() => this.props.navigation.navigate('Wallet')}>
              <Icon name="wallet" type={"FontAwesome5"} style={{fontSize: 40}} color="black" />
              <Text style={styles.moduleText}>Wallet QR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.module}
              onPress={() => this.props.navigation.navigate('Chat')}>
              <Icon name="chatboxes" style={{fontSize: 40}} color="black" />
              <Text style={styles.moduleText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </StyleProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
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
  },
  instructions: {
    fontFamily: 'Titillium Web',
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