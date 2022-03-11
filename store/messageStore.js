class MessageStore {
  saveMessage(message) {}

  findMessageForUser(userId) {}
}

class InMemoryMessageStore extends MessageStore {
  constructor() {
    super();
    this.messages = [];
  }

  saveMessage(message) {
    this.messages.push(message);
  }

  findMessageForUser(userId) {
    return this.messages.filter(
      ({ from, to }) => from === userId || to === userId
    );
  }
}

const CONVERSATION_TTL = 24 * 60 * 60;

class RedisMessageStore extends MessageStore {
  constructor(redisClient) {
    super();
    this.redisClient = redisClient;
  }

  saveMessage(message) {
    const value = JSON.stringify(message);
    this.redisClient
      .multi()
      .rpush(`messages:${message.from}`, value)
      .rpush(`messages:${message.to}`, value)
      .expire(`messages:${message.from}`, CONVERSATION_TTL)
      .expire(`messages:${message.to}`, CONVERSATION_TTL)
      .exec();
  }

  findMessageForUser(userId) {
    return this.redisClient
      .lrange(`messages:${userId}`, 0, -1)
      .then(results => {
        return results.map(result => JSON.parse(result));
      });
  }
}

module.exports = {
  InMemoryMessageStore,
  RedisMessageStore
};
