import React, {Component} from 'react'
import { Alert, Text, View } from 'react-native'

import {inject} from 'mobx-react'

@inject('saito')
export default class RegistractionScreen extends Component {
  state = {
    requested_identifier: ''
  }
  publickey = ''


  sendRequestToNetwork(msg, amount, fee) {
    var newtx = saito.wallet.createUnsignedTransaction(this.publickey, amount, fee);

    if (newtx == null) { Alert.alert("Error", "Unable to send TX"); return; }

    newtx.transaction.msg = msg;
    newtx = saito.wallet.signTransaction(newtx);

    saito.network.propagateTransactionWithCallback(newtx, (err) => {
      if (!err) {
        Alert.alert("Success", "Your registration request has been submitted. Please wait for network confirmation")
        this.setState({requested_identifier: ''})
        this.props.navigator('Homescreen')
      } else {
        Alert.alert("Error", "There was an error submitting your request to the network. This is an issue with your network connection or wallet")
        this.setState({requested_identifier: ''})
      }
    });
  }

  sendRegisrationRequest() {
    const {saito} = this.props
    var msg = {}
        msg.module               = "Registry"
        msg.requested_identifier = this.state.requested_identifier

    var amount = 3.0;
    var fee    = 2.0;

    var regex=/^[0-9A-Za-z]+$/;

    //
    // check regex of input
    //
    if (!regex.test(msg.requested_identifier)) {
      if (msg.requested_identifier != "") {
        Alert.alert("Error", "Only alphanumeric characters permitted in registered name");
        return;
      } else {
        Alert.alert("Error", "Can't submit blank form")
      }
    }


    //
    // check that this entry is valid
    //
    var c;

    if (saito.dns.isActive() == 0) {
      c = confirm("You are not connected to a DNS server, so we cannot confirm this address is available. Click OK to try and register it. You will receive a success or failure email from the registration server once the network has processed your request.");
      if (!c) { return; }

      this.sendRegisrationRequest(msg, amount, fee)

      return;
    }

    saito.dns.fetchPublicKey(`${msg.requested_identifier}@saito`, (answer) => {
      answer = JSON.parse(answer)
      if (answer) {
        if (answer.publickey != "") {
          c = confirm("This address appears to be registered. If you still want to try registering it, click OK.");
        } else {
          c = true;
        };
      }

      if (c) {
        this.sendRequestToNetwork(msg, amount, fee)
      }
    });
  }

  render() {
    return (
      <View>
        <Text>
          This is the RegistractionScreen
        </Text>
      </View>
    )
  }
}