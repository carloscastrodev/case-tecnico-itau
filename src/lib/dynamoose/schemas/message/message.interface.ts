export enum MESSAGE_STATUS {
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
  READ = 'READ',
}

export interface MessageKey {
  pk: string;
  gsi1pk: string;
  gsi1sk: string;
  gsi2pk: string;
  gsi2sk: string;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  status: MESSAGE_STATUS;
  createdAt: string;
  updatedAt: string;
}

export type MessageWithKey = Message & MessageKey;
