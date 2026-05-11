export enum MESSAGE_STATUS {
  SENT = 'enviado',
  RECEIVED = 'recebido',
  READ = 'lido',
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
