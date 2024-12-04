"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBroker = void 0;
const winston_1 = __importDefault(require("winston"));
const nats_1 = require("nats");
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.cli(),
    defaultMeta: 'message-broker',
    transports: [
        new winston_1.default.transports.Console(),
    ],
});
class MessageBroker {
    constructor() {
        this.sc = (0, nats_1.StringCodec)();
        this.subject = '';
    }
    setNatsConfig(objectConfig) {
        logger.debug('setting nats config');
        this.natsConfig = objectConfig;
        return this;
    }
    setSubject(subject) {
        logger.debug('setting subject');
        this.subject = subject;
        return this;
    }
    async createConnection() {
        logger.debug('connecting to nats server...');
        this.connection = await (0, nats_1.connect)(this.natsConfig);
        return this;
    }
    async checkConnection() {
        logger.debug('checking connection...');
        if (!this.connection)
            await this.createConnection();
    }
    getContext() {
        return this;
    }
    async sendRequest(plainMessage, subject, options) {
        subject = subject !== null && subject !== void 0 ? subject : this.subject;
        if (!(subject))
            throw new Error('No Subject Defined!');
        if (!plainMessage)
            throw new Error('Message Required!');
        await this.checkConnection();
        logger.debug('sending request to subject: ' + subject);
        const req = await this.connection.request(subject, this.sc.encode(plainMessage), options);
        await this.connection.drain();
        await this.connection.close();
        return {
            subject: req.subject,
            headers: req.headers,
            data: this.sc.decode(req.data)
        };
    }
    async subscribe(handler, subject, options) {
        subject = subject !== null && subject !== void 0 ? subject : this.subject;
        if (!subject)
            throw new Error('No Subject Defined!');
        await this.checkConnection();
        logger.debug('listening request to subject: ' + subject);
        const sub = this.connection.subscribe(subject, options);
        for await (const m of sub) {
            handler({
                ...m,
                data: this.sc.decode(m.data),
                sendRespond: (plainText) => m.respond(this.sc.encode(plainText))
            }, { ...sub, id: sub.getID() });
        }
        await this.connection.closed();
    }
    async publish(plainMessage, subject, options) {
        subject = subject !== null && subject !== void 0 ? subject : this.subject;
        if (!(subject))
            throw new Error('No Subject Defined!');
        if (!plainMessage)
            throw new Error('Message Required!');
        await this.checkConnection();
        logger.debug('publish data to subject: ' + subject);
        this.connection.publish(subject, this.sc.encode(plainMessage), options);
    }
}
exports.MessageBroker = MessageBroker;
//# sourceMappingURL=index.js.map