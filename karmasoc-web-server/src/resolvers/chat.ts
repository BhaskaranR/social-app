import * as faker from 'faker';
import * as _ from 'lodash';

import { pubsub, CHAT_MESSAGE_SUBSCRIPTION_TOPIC } from '../setup/graphql';
import { withFilter } from 'graphql-subscriptions';

const messages : {[key: string ]: any} = {};
const channels: any[] = [];

const createMessage = (channelId) => {
  return {
    id: faker.random.uuid(),
    content: faker.lorem.sentence(),
    creationTime: faker.date.past().getTime().toString(),
    author: {
      name: faker.name.firstName() + '.' + faker.name.lastName(),
      avatar: faker.image.avatar(),
    },
    channel: { id: channelId },
  };
};

const createChannel = () => {
  return {
    id: faker.random.uuid(),
    name: faker.random.word(),
    direct: faker.random.boolean(),
    unseenMessages: faker.random.boolean() ? faker.random.number(30) : 0
  };
};


for (let i = 0; i < 15; i++) {
  const channel = createChannel();
  channels.push(channel);
  const messagesArray = [];
  messages[channel.id] =  messagesArray;
  for (let j = 0; j < 2000; j++) {
    messagesArray.push(createMessage(channel.id));
  }
}

export default  {
  User: ({user}) => {
    return {
      name: () => user.profile.name,
      avatar: () => user.profile.avatar,
    };
  },
  Channel: () => ({
    id: () => faker.random.uuid(),
    name: () => faker.random.word(),
    direct: () => faker.random.boolean(),
    unseenMessages: () => faker.random.boolean() ? faker.random.number(30) : 0,
  }),
  Subscription: {
    chatMessageAdded: {
      subscribe: withFilter(() => pubsub.asyncIterator(CHAT_MESSAGE_SUBSCRIPTION_TOPIC), (payload, args) => {
        return payload.chatMessageAdded.channel.id === args.channelId;
      })
    }
  },
  Query: () => ({
    channelsByUser: () => {
      return channels.slice(0, faker.random.number({ min: 3, max: channels.length }));
    },
    messages: (root, { channelId, channelDetails, cursor, count }, context) => {
      if (!channelId && !channelDetails) {
        console.error(`messages query must be called with channelId or channelDetails`);
        return null;
      }

      let channel : any;
      if (channelId) {
        channel = _.find(channels, (element) => element.id === channelId);
      }
      else {
        channel =   
          _.find(channels, (element) => element.name === channelDetails.name && element.direct === channelDetails.direct);
      }

      if (!channel) {
        console.error('channel not found');
        return null;
      }

      const messagesArray = messages[channel.id];
      if (!messagesArray) {
        console.error('messagesArray was not defined for channel');
        return null;
      }

      let nextMessageIndex = 0;
      if (cursor) {
        nextMessageIndex = messagesArray.findIndex((message) => message.id === cursor);
      }

      if (nextMessageIndex !== -1) {
        let finalMessageIndex = count + nextMessageIndex;
        finalMessageIndex = finalMessageIndex > messagesArray.length ? messagesArray.length : finalMessageIndex;
        const nextCursor = finalMessageIndex === messagesArray.length ? null : messagesArray[finalMessageIndex].id;

        return {
          cursor: nextCursor,
          channel,
          messagesArray: messagesArray.slice(nextMessageIndex, finalMessageIndex).reverse(),
        };
      }
      else {
        console.error('cursor is invalid');
        return null;
      }
    },
    channelByName:  (root, { name, isDirect }) => {
      return _.find(channels, (element) => element.name === name && element.direct === isDirect) || null;
    },
  }),
  Mutation: () => ({
    sendMessage: (root, { channelId, content }, {user}) => {
      const messagesArray = messages.get(channelId);
      if (!messagesArray) {
        console.error('channel not found');
        return null;
      }
      const newMessage = {
        id: faker.random.uuid(),
        content,
        creationTime: (new Date()).getTime().toString(),
        author: {
          name: user.profile.name,
          avatar: user.profile.avatar
        },
        channel: {
          id: channelId,
        }
      };

      messagesArray.unshift(newMessage);
      pubsub.publish(CHAT_MESSAGE_SUBSCRIPTION_TOPIC, { chatMessageAdded: newMessage });
      return newMessage;
    }
  })
};

