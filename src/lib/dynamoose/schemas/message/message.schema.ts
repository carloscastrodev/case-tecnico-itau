import { model, Schema } from 'dynamoose';
import { InvalidValueException } from '@/lib/dynamoose/exceptions/invalid-value.exception';
import { MESSAGE_STATUS } from './message.interface';

export const MessageSchema = new Schema(
  {
    pk: {
      type: String,
      hashKey: true,
    },
    gsi1pk: {
      type: String,
      index: {
        type: 'global',
        name: 'GSI1',
        rangeKey: 'gsi1sk',
      },
    },
    gsi1sk: {
      type: String,
    },
    gsi2pk: {
      type: String,
      index: {
        type: 'global',
        name: 'GSI2',
        rangeKey: 'gsi2sk',
      },
    },
    gsi2sk: {
      type: String,
    },
    id: {
      type: String,
    },
    content: {
      type: String,
    },
    sender: {
      type: String,
    },
    status: {
      type: String,
      validate: (value) => {
        if (Object.values(MESSAGE_STATUS).includes(value as MESSAGE_STATUS)) return true;
        throw new InvalidValueException(`Valor inválido para o campo status: ${value}`);
      },
    },
    createdAt: {
      type: String,
    },
    updatedAt: {
      type: String,
    },
  },
  {
    saveUnknown: false,
    timestamps: false,
  },
);

export const MessageModelName = 'Message';
export const MessageModel = model(MessageModelName, MessageSchema, { initialize: false });
