# Message Broker (Nats)

## Requirements
- NodeJS v20+

## Include Packages
- winston (v3.17.0+)
- nats (v2.28.2+)

## Installation
```bash
npm install message-broker-nats
```

## How To Use
### Creating Message Broker Object
```js
const {MessageBroker} = require('message-broker-nats')
const msg = new MessageBroker()
    .setNatsConfig({
        servers: 'HOST:PORT',
        user: '?YOUR_USER',
        pass: '?YOUR_PASSWORD'
    })
```
### Connecting To Server
- Using async-await
```js
const me = await msg.createConnection()
```
- Using then-catch
```js
msg.createConnection()
    .then(me => {
        // do something here
    })
```
### Subscribe To a Subject
```js
me.subscribe(
    function (m, sub) {
        console.log('<<<', `[${sub.id}]`, m.data)
        // do something here
    },
    'action-A', // whatever
    { queue: 'group-A' }) // this optional
```

### Publish Data To Subscribers
```js
await me.publish('your message here', null, {timeout: 4000})
```

### Sending Single Request-Response
```js
const data = await me.sendRequest('your message here', null, {timeout: 4000})
console.log(data)
```