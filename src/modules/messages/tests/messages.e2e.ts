import { MESSAGE_STATUS } from '@/lib/dynamoose/schemas/message/message.interface';
import { e2eSetup } from '@/tests/fixtures/e2e-setup';
import { ORDER } from '@/types/order-enum';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { StartedTestContainer } from 'testcontainers';
import { CreateMessageRequestDto } from '../request/create-message.request';

// A maioria desses testes foi gerada em conjunto com o Claude
// Comecei escrevendo alguns manualmente mas o boilerplate era grande
// Então acabei iterando nisso com o Claude.

describe('Messages [E2E]', () => {
  let app: INestApplication;
  let container: StartedTestContainer;
  let token: string;

  const authGet = (endpoint: string) =>
    request(app.getHttpServer()).get(endpoint).set('Authorization', `Bearer ${token}`);
  const authPost = (endpoint: string) =>
    request(app.getHttpServer()).post(endpoint).set('Authorization', `Bearer ${token}`);
  const authPatch = (endpoint: string) =>
    request(app.getHttpServer()).patch(endpoint).set('Authorization', `Bearer ${token}`);

  // Gera um id único por remetente para que testes concorrentes/sequenciais
  // não poluam os resultados
  let senderCounter = 0;
  const uniqueSender = (label = 'user') => `${label}_${Date.now()}_${++senderCounter}`;

  const createMessage = async (overrides: Partial<CreateMessageRequestDto> = {}) => {
    const body: CreateMessageRequestDto = {
      content: 'Mensagem de teste',
      sender: overrides.sender ?? uniqueSender(),
      status: MESSAGE_STATUS.SENT,
      ...overrides,
    };

    const response = await authPost('/v1/messages').send(body);

    return { response, body };
  };

  beforeAll(async () => {
    ({ app, container } = await e2eSetup());

    const { body } = await request(app.getHttpServer()).post('/v1/auth/sign-in').send({
      username: process.env.MOCKED_USER_USERNAME,
      password: process.env.MOCKED_USER_PASSWORD,
    });
    token = body.accessToken;
  }, 60000);

  afterAll(async () => {
    await app?.close();
    await container?.stop();
  }, 20000);

  describe('POST /v1/messages', () => {
    it('should return 201 and persist the message (verified via GET /:id round-trip)', async () => {
      const sender = uniqueSender();
      const { response, body } = await createMessage({ sender, status: MESSAGE_STATUS.SENT });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          content: body.content,
          sender: body.sender,
          status: body.status,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
      expect(new Date(response.body.createdAt).toString()).not.toBe('Invalid Date');
      expect(response.body.createdAt).toBe(response.body.updatedAt);

      const getResp = await authGet(`/v1/messages/${response.body.id}`);
      expect(getResp.status).toBe(200);
      expect(getResp.body).toEqual(response.body);
    });

    it('should return 401 with a message when the request is unauthenticated', async () => {
      const response = await request(app.getHttpServer()).post('/v1/messages').send({
        content: 'x',
        sender: 'x',
        status: MESSAGE_STATUS.SENT,
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it.each([
      ['invalid status enum', { content: 'c', sender: 's', status: 'NOPE' as MESSAGE_STATUS }],
      ['missing content', { sender: 's', status: MESSAGE_STATUS.SENT } as Partial<CreateMessageRequestDto>],
      ['missing sender', { content: 'c', status: MESSAGE_STATUS.SENT } as Partial<CreateMessageRequestDto>],
      ['missing status', { content: 'c', sender: 's' } as Partial<CreateMessageRequestDto>],
      ['empty content', { content: '', sender: 's', status: MESSAGE_STATUS.SENT }],
    ])('should return 400 with a message when body is invalid (%s)', async (_label, body) => {
      const response = await authPost('/v1/messages').send(body);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should strip unknown fields from the payload (whitelist validation)', async () => {
      const sender = uniqueSender();
      const response = await authPost('/v1/messages').send({
        content: 'with-extras',
        sender,
        status: MESSAGE_STATUS.SENT,
        id: 'attacker-controlled-id',
        createdAt: '1999-01-01T00:00:00.000Z',
      });

      expect(response.status).toBe(201);
      expect(response.body.id).not.toBe('attacker-controlled-id');
      expect(response.body.createdAt).not.toBe('1999-01-01T00:00:00.000Z');
    });
  });

  describe('GET /v1/messages/:id', () => {
    it('should return 200 with the persisted message', async () => {
      const { response: created } = await createMessage();
      const response = await authGet(`/v1/messages/${created.body.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: created.body.id,
        content: created.body.content,
        sender: created.body.sender,
        status: created.body.status,
      });
    });

    it('should return 404 with a message when the id does not exist', async () => {
      const response = await authGet('/v1/messages/00000000-0000-0000-0000-000000000000');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 with a message when unauthenticated', async () => {
      const response = await request(app.getHttpServer()).get('/v1/messages/whatever');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /v1/messages (list)', () => {
    it('should return only messages of the requested sender', async () => {
      const senderA = uniqueSender('A');
      const senderB = uniqueSender('B');

      const a1 = await createMessage({ sender: senderA, content: 'a1' });
      const a2 = await createMessage({ sender: senderA, content: 'a2' });
      await createMessage({ sender: senderB, content: 'b1' });

      const response = await authGet('/v1/messages').query({ sender: senderA });

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      const ids = response.body.map((m: any) => m.id);
      expect(ids).toEqual(expect.arrayContaining([a1.response.body.id, a2.response.body.id]));
      expect(response.body.every((m: any) => m.sender === senderA)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    it('should return messages within the date range', async () => {
      const sender = uniqueSender('range');
      const created = await createMessage({ sender });

      const startDate = new Date(Date.now() - 60_000).toISOString();
      const endDate = new Date(Date.now() + 60_000).toISOString();

      const response = await authGet('/v1/messages').query({ startDate, endDate, sender });

      expect(response.status).toBe(200);
      expect(response.body.map((m: any) => m.id)).toContain(created.response.body.id);
    });

    it('should not return messages outside the date range', async () => {
      const sender = uniqueSender('range-out');
      await createMessage({ sender });

      const startDate = '1999-01-01T00:00:00.000Z';
      const endDate = '1999-12-31T23:59:59.999Z';

      const response = await authGet('/v1/messages').query({ startDate, endDate, sender });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should respect the limit parameter', async () => {
      const sender = uniqueSender('lim');
      await createMessage({ sender });
      await createMessage({ sender });
      await createMessage({ sender });

      const response = await authGet('/v1/messages').query({ sender, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should return ASC and DESC orderings correctly', async () => {
      const sender = uniqueSender('order');
      await createMessage({ sender, content: 'first' });

      // Delay para garantir que o createdAt seja diferente
      await new Promise((r) => setTimeout(r, 20));
      await createMessage({ sender, content: 'second' });

      const desc = await authGet('/v1/messages').query({ sender, order: ORDER.DESC });
      const asc = await authGet('/v1/messages').query({ sender, order: ORDER.ASC });

      expect(desc.status).toBe(200);
      expect(asc.status).toBe(200);
      expect(desc.body).toHaveLength(2);
      expect(asc.body).toHaveLength(2);
      expect(desc.body[0].createdAt >= desc.body[1].createdAt).toBe(true);
      expect(asc.body[0].createdAt <= asc.body[1].createdAt).toBe(true);
    });

    it.each([
      ['no filters at all', {}],
      ['invalid startDate', { startDate: 'not-a-date', endDate: new Date().toISOString() }],
      ['invalid endDate', { startDate: new Date().toISOString(), endDate: 'not-a-date' }],
      ['limit below 1', { sender: 'x', limit: 0 }],
      ['limit above 100', { sender: 'x', limit: 101 }],
      ['invalid order', { sender: 'x', order: 'SIDEWAYS' }],
    ])('should return 400 with a message on invalid query (%s)', async (_label, query) => {
      const response = await authGet('/v1/messages').query(query);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 with a message when unauthenticated', async () => {
      const response = await request(app.getHttpServer()).get('/v1/messages').query({ sender: 'x' });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    describe('sender + date range combined', () => {
      it('should return only messages of the sender that fall inside the range', async () => {
        const sender = uniqueSender('combo');
        const otherSender = uniqueSender('combo-other');

        const before = new Date(Date.now() - 60_000).toISOString();
        const inA = await createMessage({ sender, content: 'in-A' });
        const inB = await createMessage({ sender, content: 'in-B' });
        const leak = await createMessage({ sender: otherSender, content: 'wrong-sender' });
        const after = new Date(Date.now() + 60_000).toISOString();

        const response = await authGet('/v1/messages').query({ sender, startDate: before, endDate: after });

        expect(response.status).toBe(200);
        const ids = response.body.map((m: any) => m.id);
        expect(ids).toEqual(expect.arrayContaining([inA.response.body.id, inB.response.body.id]));
        expect(ids).not.toContain(leak.response.body.id);
        expect(response.body.every((m: any) => m.sender === sender)).toBe(true);
      });

      it('should include a message whose createdAt equals startDate (start is inclusive)', async () => {
        const sender = uniqueSender('start-incl');
        const { response: created } = await createMessage({ sender });
        const boundary = created.body.createdAt;

        const response = await authGet('/v1/messages').query({
          sender,
          startDate: boundary,
          endDate: new Date(Date.now() + 60_000).toISOString(),
        });

        expect(response.status).toBe(200);
        expect(response.body.map((m: any) => m.id)).toContain(created.body.id);
      });

      it('should include a message whose createdAt equals endDate (end is inclusive)', async () => {
        const sender = uniqueSender('end-incl');
        const { response: created } = await createMessage({ sender });
        const boundary = created.body.createdAt;

        const response = await authGet('/v1/messages').query({
          sender,
          startDate: new Date(Date.now() - 60_000).toISOString(),
          endDate: boundary,
        });

        expect(response.status).toBe(200);
        expect(response.body.map((m: any) => m.id)).toContain(created.body.id);
      });

      it('should include messages when startDate == endDate == its createdAt', async () => {
        const sender = uniqueSender('point-range');
        const { response: created } = await createMessage({ sender });
        const boundary = created.body.createdAt;

        const response = await authGet('/v1/messages').query({ sender, startDate: boundary, endDate: boundary });

        expect(response.status).toBe(200);
        expect(response.body.map((m: any) => m.id)).toContain(created.body.id);
      });

      it('should exclude messages created strictly before startDate', async () => {
        const sender = uniqueSender('below');
        const { response: older } = await createMessage({ sender });
        const startDate = new Date(new Date(older.body.createdAt).getTime() + 1).toISOString();

        await new Promise((r) => setTimeout(r, 20));
        const { response: newer } = await createMessage({ sender });

        const response = await authGet('/v1/messages').query({
          sender,
          startDate,
          endDate: new Date(Date.now() + 60_000).toISOString(),
        });

        expect(response.status).toBe(200);
        const ids = response.body.map((m: any) => m.id);
        expect(ids).toContain(newer.body.id);
        expect(ids).not.toContain(older.body.id);
      });

      it('should exclude messages created strictly after endDate', async () => {
        const sender = uniqueSender('above');
        const { response: early } = await createMessage({ sender });
        await new Promise((r) => setTimeout(r, 20));
        const { response: late } = await createMessage({ sender });
        const endDate = new Date(new Date(late.body.createdAt).getTime() - 1).toISOString();

        const response = await authGet('/v1/messages').query({
          sender,
          startDate: new Date(Date.now() - 60_000).toISOString(),
          endDate,
        });

        expect(response.status).toBe(200);
        const ids = response.body.map((m: any) => m.id);
        expect(ids).toContain(early.body.id);
        expect(ids).not.toContain(late.body.id);
      });

      it('should return an empty array when the sender exists but no message falls in the range', async () => {
        const sender = uniqueSender('no-overlap');
        await createMessage({ sender });

        const response = await authGet('/v1/messages').query({
          sender,
          startDate: '1999-01-01T00:00:00.000Z',
          endDate: '1999-12-31T23:59:59.999Z',
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      });

      it('should respect ordering when combined with sender + date range', async () => {
        const sender = uniqueSender('combo-order');
        await createMessage({ sender });
        await new Promise((r) => setTimeout(r, 20));
        await createMessage({ sender });

        const startDate = new Date(Date.now() - 60_000).toISOString();
        const endDate = new Date(Date.now() + 60_000).toISOString();

        const asc = await authGet('/v1/messages').query({ sender, startDate, endDate, order: ORDER.ASC });
        const desc = await authGet('/v1/messages').query({ sender, startDate, endDate, order: ORDER.DESC });

        expect(asc.body).toHaveLength(2);
        expect(desc.body).toHaveLength(2);
        expect(asc.body[0].createdAt <= asc.body[1].createdAt).toBe(true);
        expect(desc.body[0].createdAt >= desc.body[1].createdAt).toBe(true);
      });

      it('should respect limit when combined with sender + date range', async () => {
        const sender = uniqueSender('combo-limit');
        await createMessage({ sender });
        await createMessage({ sender });
        await createMessage({ sender });

        const response = await authGet('/v1/messages').query({
          sender,
          startDate: new Date(Date.now() - 60_000).toISOString(),
          endDate: new Date(Date.now() + 60_000).toISOString(),
          limit: 2,
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
      });
    });
  });

  describe('PATCH /v1/messages/:id/status', () => {
    it('should update the status and bump updatedAt', async () => {
      const { response: created } = await createMessage({ status: MESSAGE_STATUS.SENT });
      const id = created.body.id;

      // Delay para garantir que o updatedAt seja diferente
      await new Promise((r) => setTimeout(r, 20));

      const patch = await authPatch(`/v1/messages/${id}/status`).send({ status: MESSAGE_STATUS.READ });

      expect(patch.status).toBe(200);
      expect(patch.body.status).toBe(MESSAGE_STATUS.READ);
      expect(patch.body.updatedAt).not.toBe(created.body.updatedAt);
      expect(patch.body.createdAt).toBe(created.body.createdAt);

      const getResp = await authGet(`/v1/messages/${id}`);
      expect(getResp.status).toBe(200);
      expect(getResp.body.status).toBe(MESSAGE_STATUS.READ);
      expect(getResp.body.updatedAt).toBe(patch.body.updatedAt);
    });

    it('should return 404 with a message when the id does not exist', async () => {
      const response = await authPatch('/v1/messages/00000000-0000-0000-0000-000000000000/status').send({
        status: MESSAGE_STATUS.READ,
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 with a message when status is invalid', async () => {
      const { response: created } = await createMessage();
      const response = await authPatch(`/v1/messages/${created.body.id}/status`).send({ status: 'NOT-A-STATUS' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 with a message when unauthenticated', async () => {
      const response = await request(app.getHttpServer())
        .patch('/v1/messages/anything/status')
        .send({ status: MESSAGE_STATUS.READ });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });
});
