import db from './src/db.js'

export default {
  db,
  peers: [{
    host: "apps.saito.network",
    port: 443,
    protocol: "https",
    synctype: "lite"
  }],
  dns: [{
    host: "apps.saito.network",
    port: 443,
    protocol: "https",
    publickey: "npDwmBDQafC148AyhqeEBMshHyzJww3X777W9TM3RYNv",
    domain: "saito"
  }]
}