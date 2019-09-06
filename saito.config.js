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
    host: "dns.saito.network",
    port: 443,
    protocol: "https",
    publickey: "23ykRYbjvAzHLRaTYPcqjkQ2LnFYeMkg9cJgXPbrWcHmr",
    domain: "saito"
  }]
}