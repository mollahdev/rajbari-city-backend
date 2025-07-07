// firebase.js
const firebase = require('firebase-admin')
const path = require('path')

// Load the service account key JSON
const serviceAccount = require(path.join(__dirname, 'config.json'))

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
})

module.exports = firebase
