import { MESSAGE_MODEL } from '@/lib/dynamoose/dynamoose.models.module';
import { Message, MESSAGE_STATUS, MessageKey, MessageWithKey } from '@/lib/dynamoose/schemas/message/message.interface';
import { ORDER } from '@/types/order-enum';
import { Inject, Injectable } from '@nestjs/common';
import { Condition } from 'dynamoose';
import { SortOrder } from 'dynamoose/dist/General';
import { type Model } from 'nestjs-dynamoose';
import { randomUUID } from 'node:crypto';
import { IMessageRepository } from './message.repository.interface';

@Injectable()
export class MessageRepositoryDynamoose implements IMessageRepository {
  constructor(
    @Inject(MESSAGE_MODEL)
    private readonly messageModel: Model<MessageWithKey, Omit<MessageKey, 'gsi1pk' | 'gsi1sk' | 'gsi2pk' | 'gsi2sk'>>,
  ) {}

  async findById(id: string): Promise<Message | null> {
    const [message] = await this.messageModel
      .query({
        pk: this.getPK(id),
      })
      .exec();

    if (!message) {
      return null;
    }

    return this.toDomainObject(message);
  }

  async create(dto: Omit<Message, 'id' | 'pk' | 'sk' | 'createdAt' | 'updatedAt'>): Promise<Message> {
    const modelAttributes = this.toCreateDTO(dto);

    const createdMessage = await this.messageModel.create({
      ...modelAttributes,
      pk: this.getPK(modelAttributes.id),
      gsi1pk: this.getGSI1PK(modelAttributes.sender),
      gsi1sk: this.getGSI1SK(modelAttributes.createdAt),
      gsi2pk: this.getGSI2PK(modelAttributes.createdAt),
      gsi2sk: this.getGSI2SK(modelAttributes.createdAt),
    });

    return this.toDomainObject(createdMessage);
  }

  async patchStatus(id: string, status: MESSAGE_STATUS): Promise<Message | null> {
    const condition = new Condition('pk').eq(this.getPK(id));

    try {
      const result = await this.messageModel.update(
        {
          pk: this.getPK(id),
        },
        {
          status,
          updatedAt: new Date().toISOString(),
        },
        {
          condition,
          return: 'item',
        },
      );

      return this.toDomainObject(result);
    } catch (err: any) {
      if (err.name === 'ConditionalCheckFailedException') {
        return null;
      }

      throw err;
    }
  }

  async findByDateRange(params: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    order?: 'ASC' | 'DESC';
  }): Promise<Message[]> {
    let { startDate, endDate, limit, order = ORDER.DESC } = params;

    if (!endDate) {
      endDate = new Date().toISOString();
    }

    // Aqui estou em dúvida com relação ao que seria ideal para a regra de negócio
    // Sabendo que a aplicação deve estar preparada para servir um frontend futuramente
    // É interessante incluir um parâmetro de limite para a paginação
    // Entretanto, separando os eventos em buckets de 1 dia, é necessário
    // fazer múltiplas queries para buscar todos os eventos do range de datas
    // impossibilitando de incluir o limite nas queries em si.
    // Isso pode ser feito de forma serial (para não ter overfetch)
    // Ou pode ser feito de forma paralela (aceitamos o overfetch e efetuamos a limitação na própria aplicação)
    // Optei por fazer de forma paralela e limitar na aplicação
    // O overfetch máximo é numero de (buckets * limit) - limit.

    const dateBuckets = this.getMessageDateBucketsByDateRange({ startDate, endDate });

    dateBuckets.sort((a, b) => {
      if (order === ORDER.ASC) {
        return a.localeCompare(b);
      }
      return b.localeCompare(a);
    });

    const buildBucketQuery = (bucket: string) => {
      const q = this.messageModel.query('gsi2pk').eq(bucket).using('GSI2');

      if (order === ORDER.ASC) {
        q.sort(SortOrder.ascending);
      } else {
        q.sort(SortOrder.descending);
      }

      if (!!startDate) {
        q.where('gsi2sk').between(this.getGSI2SK(startDate), this.getGSI2SK(endDate));
      } else {
        q.where('gsi2sk').le(this.getGSI2SK(endDate));
      }

      return q;
    };

    const promises = dateBuckets.map((bucket) => this.paginate(() => buildBucketQuery(bucket), limit));

    const results = await Promise.all(promises);

    const messages: Message[] = results.flat().map(this.toDomainObject).slice(0, limit);

    return messages;
  }

  async findBySenderAndOptionalDateRange(params: {
    sender: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    order?: 'ASC' | 'DESC';
  }): Promise<Message[]> {
    let { sender, startDate, endDate, limit, order } = params;

    if (!endDate) {
      endDate = new Date().toISOString();
    }

    const buildQuery = () => {
      const q = this.messageModel.query('gsi1pk').eq(this.getGSI1PK(sender)).using('GSI1');

      if (!!startDate) {
        q.where('gsi1sk').between(this.getGSI1SK(startDate), this.getGSI1SK(endDate));
      } else {
        q.where('gsi1sk').le(this.getGSI1SK(endDate));
      }

      if (order === ORDER.ASC) {
        q.sort(SortOrder.ascending);
      } else {
        q.sort(SortOrder.descending);
      }

      return q;
    };

    const messages = await this.paginate(buildQuery, limit);

    return messages.map(this.toDomainObject);
  }

  private toDomainObject(message: MessageWithKey): Message {
    return {
      id: message.id,
      content: message.content,
      sender: message.sender,
      status: message.status,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  // Isso foi gerado pelo Claude
  // Minha implementação usava o método all() e limit() do dynamoose
  // Mas estava errado (o all sobrepõe o limit e traz tudo)
  // O Claude primeiramente tentou simplesmente aplicar o .limit
  // Mas isso pode ocasionar truncamento devido ao limite de 1MB no retorno do dynamodb
  // A próxima implementação foi a paginação dessa forma.

  private async paginate(
    buildQuery: () => ReturnType<MessageRepositoryDynamoose['messageModel']['query']>,
    limit?: number,
  ): Promise<MessageWithKey[]> {
    const collected: MessageWithKey[] = [];
    let lastKey: any = undefined;

    do {
      const q = buildQuery();
      if (!!limit) {
        q.limit(limit - collected.length);
      }
      if (lastKey) {
        q.startAt(lastKey);
      }

      const page = await q.exec();
      collected.push(...page);
      lastKey = page.lastKey;
    } while (lastKey && (!limit || collected.length < limit));

    return collected;
  }

  private toCreateDTO(dto: Omit<Message, 'id' | 'pk' | 'sk' | 'createdAt' | 'updatedAt'>): Message {
    const now = new Date().toISOString();

    return {
      id: randomUUID(),
      content: dto.content,
      sender: dto.sender,
      status: dto.status,
      createdAt: now,
      updatedAt: now,
    };
  }

  private getPK(id: string): string {
    return `MESSAGE#${id}#`;
  }

  private getGSI1PK(sender: string): string {
    return `SENDER#${sender}#`;
  }

  private getGSI1SK(isoDateTime: string): string {
    return `CREATED_AT#${isoDateTime}#`;
  }

  private getGSI2PK(isoDateTime: string): string {
    const dateOnly = isoDateTime.slice(0, 10);
    return `MESSAGE#DATE_BUCKET#${dateOnly}#`;
  }

  private getGSI2SK(isoDateTime: string): string {
    return `CREATED_AT#${isoDateTime}#`;
  }

  private getMessageDateBucketsByDateRange(params: { startDate?: string; endDate: string }): string[] {
    let { startDate, endDate } = params;
    const buckets: string[] = [];

    if (!startDate) {
      return [this.getGSI2PK(endDate)];
    }

    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      buckets.push(this.getGSI2PK(currentDate.toISOString()));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return buckets;
  }
}
