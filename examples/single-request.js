'use strict'

const {MessageBroker} = require('../src/index')

const msg = new MessageBroker()
    .setNatsConfig({
        servers: 'localhost:4222',
        user: 'ruser',
        pass: ''
    })
    .setSubject('action-A')
    .createConnection()
msg.then(async (m) => {
    const message = `[${new Date().getTime()}] Hello A`
    console.log('Sending Message:', message)
    const data = await m.sendRequest(message, null, {timeout: 4000})
    console.log(data)
})