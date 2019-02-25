# Saito Wallet

Saito Wallet is a stand-alone mobile wallet for the Saito blockchain. It's built using React Native, and is currently an example of how developers can build on top of Saito with the use of the [Saito Library](https://github.com/SaitoTech/saito-lib). It saves the users wallet and slips locally, and syncs with the Saito blockchain to send and receive transactions.

## Get Started
In order to develop SaitoWallet, you're going to need to install [React Native](https://facebook.github.io/react-native/docs/getting-started.html) and install the necessarty dependencies under the tab "Building Projects with React Native". Choosing either iOS development or Android development will mean installing Xcode and Android Studio respectfully.

To run the application, run the folling commands in your terminal:
```
cd SaitoWallet
npm install
react-native run-ios
```

Or on Android
```
react-native run-android
```

If you've experiencing issues, make sure to check that `react-native-crypto` has been installed correctly
https://github.com/tradle/react-native-crypto