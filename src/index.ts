import winston from 'winston'

import { connect, ConnectionOptions, NatsConnection, PublishOptions, RequestOptions, StringCodec, Subscription, SubscriptionOptions } from 'nats'

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.cli(),
    defaultMeta: 'message-broker',
    transports: [
        new winston.transports.Console(),
    ],
})

export class MessageBroker {
    protected sc = StringCodec()
    private subject: string = ''
    private natsConfig!: ConnectionOptions
    private connection!: NatsConnection
    
    constructor () {}

    public setNatsConfig (objectConfig: ConnectionOptions) {
        logger.debug('setting nats config')
        this.natsConfig = objectConfig
        return this
    }

    public setSubject(subject: string) {
        logger.debug('setting subject')
        this.subject = subject
        return this
    }

    public async createConnection () :Promise<this>{
        logger.debug('connecting to nats server...')
        this.connection = await connect(this.natsConfig)
        return this
    }

    async checkConnection () {
        logger.debug('checking connection...')
        if (!this.connection) await this.createConnection()
    }

    public getContext () {
        return this
    }

    public async sendRequest (plainMessage:string, subject?: string, options?: RequestOptions) {
        subject = subject??this.subject
        if (!(subject)) throw new Error('No Subject Defined!')
        if (!plainMessage) throw new Error('Message Required!')
        await this.checkConnection()
        logger.debug('sending request to subject: ' + subject)
        const req = await this.connection.request(subject, this.sc.encode(plainMessage), options)
        await this.connection.drain()
        await this.connection.close()
        return {
            subject: req.subject,
            headers: req.headers,
            data: this.sc.decode(req.data)
        }
    }

    public async subscribe (handler: Function, subject?: string, options?: SubscriptionOptions){
        subject = subject??this.subject
        if (!subject) throw new Error('No Subject Defined!')
        await this.checkConnection()
        logger.debug('listening request to subject: ' + subject)
        const sub = this.connection.subscribe(subject, options)
        for await (const m of sub) {
            handler({
                ...m,
                data: this.sc.decode(m.data),
                sendRespond: (plainText: string) => m.respond(this.sc.encode(plainText))
            }, {...sub, id: sub.getID()})
        }
        await this.connection.closed()
    }

    public async publish (plainMessage: string, subject?: string, options?: PublishOptions): Promise<void> {
        subject = subject??this.subject
        if (!(subject)) throw new Error('No Subject Defined!')
        if (!plainMessage) throw new Error('Message Required!')
        await this.checkConnection()
        logger.debug('publish data to subject: ' + subject)
        this.connection.publish(subject, this.sc.encode(plainMessage), options)
    }
}
