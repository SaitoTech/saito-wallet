import db from './src/db.js'

export default {
  db,
  peers: [{
    host: "apps.saito.network",
    port: 443,
    protocol: "https",
    synctype: "lite"
  }],
  // wallet: {
  //   privatekey: "67e0dbd52d0dbf43e30d4f5e91537eb0af0784db8bede408bd4e49a717d04670",
  //   publickey: "vNYBdjVc211SxLc9LyQALgrcs3kEe9ZtN9HDHtWsf7pw"
  // },
  dns: [{
    host: "apps.saito.network",
    port: 443,
    protocol: "https",
    publickey: "npDwmBDQafC148AyhqeEBMshHyzJww3X777W9TM3RYNv",
    domain: "saito"
  }]
}