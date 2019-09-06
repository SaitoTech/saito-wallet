import db from './src/db.js'

export default {
  db,
  peers: [{
    host: "sandbox.saito.network",
    port: 443,
    protocol: "https",
    synctype: "lite"
  }],
  dns: [{
    host: "sandbox-dns.saito.network",
    port: 443,
    protocol: "https",
    publickey: "226GV8Bz5rwNV7aNhrDybKhntsVFCtPrhd3pZ3Ayr9x33",
    domain: "saito"
  }]
}