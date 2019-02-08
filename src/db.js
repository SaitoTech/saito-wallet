import {AsyncStorage} from 'react-native'

async function storeData(key, value) {
  try {
    await AsyncStorage.setItem(`@SaitoWallet:${key}`, value)
  } catch (error) {
    console.log(error)
  }
}

async function getData(key) {
  try {
    const value = await AsyncStorage.getItem(`@SaitoWallet:${key}`);
    if (value !== null) {
      return value
    }
  } catch (error) {
    console.log(error)
  }
}

async function loadOptions() {
  var data = await this.getData('options')
  if (data) {
    console.log(this)
    this.app.options = JSON.parse(data);
  }
}

async function saveOptions() {
  if (this.app) {
    if (this.app.options) {
      await this.storeData('options', JSON.stringify(this.app.options))
    }
  }
}

export default { storeData, getData, loadOptions, saveOptions }