'use strict'

const {MessageBroker} = require('../src/index')

const msg = new MessageBroker()
    .setNatsConfig({
        servers: 'localhost:4222',
        user: 'ruser',
        pass: ''
    })
    .createConnection()
msg.then(me => {
    // single request-response
    me.subscribe(
        function (m, sub) {
            console.log('<<<', `[${sub.id}]`, m.data)
            m.sendRespond(`Data Dikembalikan [${sub.id}][${m.data}] `)
        },
        'action-A',
        { queue: 'group-A' })
    // worker from group-A
    me.subscribe(
        function (m, sub) {
            console.log('<<<', `[${sub.id}]`, m.data)
        },
        'action-B',
        { queue: 'group-A' })
    // recieve from publish method
    me.subscribe(
        function (m, sub) {
            console.log('<<<', `[${sub.id}]`, m.data)
        },
        'action-C',
        { queue: 'group-B' })
})