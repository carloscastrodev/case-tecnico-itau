# Case Técnico Itaú - API REST de Mensagens

Este projeto é uma API REST desenvolvida com NestJS para atender aos requisitos do case técnico do Itaú.

## Funcionalidades

- Autenticação via JWT
- Cadastro de Mensagens
- Listagem de Mensagens (filtro por remetente e/ou período e paginação/ordenação por data)
- Busca de Mensagens por ID
- Atualização de Status de Mensagens

## Stack

- NestJS
- DynamoDB (via NestJS Dynamoose)
- Zod e Class Validator para validação de dados
- Jest, Supertest e Testcontainers para testes
- NestJS Pino para logs estruturados
- Swagger para documentação
- Eslint e Prettier para formatação do código
- Datadog para observabilidade (com nestjs-ddtrace e agente rodando no docker)

## Estrutura de pastas

```
src/
├── config/                       # Configurações e validações de variáveis de ambiente (ConfigService)
├── decorators/                   # Decorators customizados reutilizáveis pela aplicação
│   └── tests/                    # Testes unitários dos decorators
├── guards/                       # Guards do NestJS (autenticação, throttling, etc.)
│   └── tests/                    # Testes unitários dos guards
├── lib/                          # Configurações de bibliotecas terceiras que não são Injectables ou Módulos do NestJS
│   ├── datadog/                  # Inicialização do tracer do datadog
│   ├── dynamoose/                # Configurações e modelos do Dynamoose (DynamoDB)
│   │   ├── exceptions/           # Exceções customizadas relacionadas ao Dynamoose
│   │   └── schemas/              # Schemas do Dynamoose
│   │       ├── message/          # Schemas do modelo Message
│   │       └── rate-limit/       # Schemas do modelo de Rate Limit
│   ├── express/                  # Tipagens auxiliares relacionadas ao Express
│   └── swagger/                  # Configurações do Swagger
├── modules/                      # Módulos da aplicação
│   ├── auth/                     # Módulo de autenticação
│   │   ├── docs/                 # Decorators de documentação do Swagger para casos em que a documentação do Swagger é muito verbosa
│   │   ├── request/              # DTOs de requisições
│   │   ├── response/             # DTOs de resposta
│   │   ├── tests/                # Testes
│   │   └── use-cases/            # Casos de uso
│   ├── messages/                 # Módulo de mensagens
│   │   ├── docs/                 # Decorators de documentação do Swagger do módulo de mensagens
│   │   ├── repositories/         # Camada de repositório (acesso a dados) de mensagens
│   │   ├── request/              # DTOs de requisições
│   │   ├── response/             # DTOs de resposta
│   │   ├── tests/                # Testes
│   │   └── use-cases/            # Casos de uso
│   └── rate-limit/               # Módulo de Rate Limit (Throttler)
│       └── storage/              # Implementação custom de storage do Throttler (persistido em DynamoDB)
├── tests/                        # Utilitários compartilhados de testes
│   └── fixtures/                 # Fixtures e helpers reutilizados pelos testes
├── types/                        # Tipos/Interfaces compartilhados pela aplicação
└── utils/                        # Funções utilitárias simples
```

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/carloscastrodev/challenge-itau.git
```

### 2. Copie o arquivo .env.example para .env

```bash
cp .env.example .env
```

### 3. Inicie a aplicação com o Docker

```bash
docker compose up -d (para rodar em segundo plano)
ou
docker compose up --attach backend (para ver os logs da aplicação no terminal)
```

OU

```bash
npm run start:docker

ou

yarn start:docker

```

(_isso equivale a rodar o comando `docker compose up --attach backend`_)

### 4. Acesse o Swagger para testar a aplicação

```bash
http://localhost:3001/api/docs                               |
```

## Testes

(_Precisa do docker instalado e rodando para alguns dos testes de integração, pois estou utilizando testcontainers_)
Para rodar os testes, utilize os comandos:

```bash
npm run test:unit | yarn test:unit - Testes Unitários
npm run test:e2e | yarn test:e2e - Testes de Integração
```

## Autenticação

- A autenticação é realizada pelo endpoint `POST /v1/sign-in`. O mecanismo de autenticação é baseado em usuário e senha, devolvendo um token de acesso JWT.

## Credenciais de teste padrão (.env.example)

```
 username: user
 password: password
```

## Como usar o token

O token JWT é gerado pelo endpoint `POST /v1/sign-in` e deve ser enviado no header `Authorization` com o prefixo `Bearer`.

```
Authorization: Bearer <token>
```

Pelo Swagger, isso é feito clicando botão Authorize
![Swagger Authorize](./readme-images/swagger-1.png)

Em seguida, insira o JWT no campo do modal aberto.

## Diagrama da API

Como não fiz nada muito complexo em termos arquiteturais, o diagrama é apenas um fluxograma dos casos de uso (autenticação e mensagens), incluindo os componentes do sistema por onde a requisição percorre. Inclui algumas explicações sobre os GSIs aplicados na tabela do DynamoDB, além das ferramentas de observabilidade (Pino, Datadog).

![Diagrama da API](./readme-images/diagrama-api.drawio.svg)

## Uso de Agentes de IA (Claude Code)

- Utilizei o Claude para:
  - gerar parte dos testes de integração de mensagens e solucionar alguns bugs que estava tendo na minha implementação inicial (dos testes e dos endpoints de listagem com filtros);
  - ponderar sobre a modelagem do banco em relação ao uso de GSIs vs denormalização dos dados;
  - implementação da classe de storage do Throttler do NestJS (Rate Limit com Janela Fixa);
  - auxilio na escrita do docker-compose (dd-agent);
  - ajudar a melhorar a formatação desse README.

Em alguns pontos da aplicação estão alguns comentários onde utilizei/como utilizei.

## Decisões Técnicas

## Autenticação

- Decidi não implementar autenticação no banco de dados ou em serviços de IdP como o Cognito, optando por usar credenciais mockadas por simplicidade.

### Escolha do Dynamoose

- Escolhi o Dynamoose porque vi que ele é parecido com o Mongoose (que eu tenho alguma experiência), e por já existir um pacote de integração com NestJS.
- Cogitei usar o [ElectroDB](https://electrodb.dev) ou o SDK oficial da AWS para dynamodb, mas acabei optando pelo Dynamoose.

### Escolha do Pino (Logger)

- Escolhi o [Pino](https://getpino.io) em vez do Winston (ou outro logger) porque vi que ele é mais leve e performático. Não tinha experiência com nenhum.
- Optei por usar a biblioteca [NestJS-Pino](https://github.com/iamolegga/nestjs-pino) porque ela vincula e loga automaticamente os dados da requisição.

### Sobre a modelagem de dados

- Para suportar os padrões de acesso requisitados, criei dois GSIs na tabela, optando por utilizar nomes genéricos (abordagem para tabela única). Tentei pensar em como suportar os padrões de acessos sem necessidade de GSIs, mas não consegui encontrar uma forma eficiente de fazer isso. Cheguei a cogitar (pesquisando no Claude) a duplicação dos dados (modificando a partition key e sort key) mas descartei essa ideia e optei pelos GSIs.

### Use Cases vs Service

- Aqui simplesmente optei pelo que estou mais acostumado atualmente, mas talvez a nomeclatura dos arquivos tenha fugido um pouco do padrão que apliquei no restante do projeto.

### Repositório

- Tentei isolar o acesso ao banco de dados (DynamoDB) na camada de repositório. A intenção aqui é que fosse possível modificar o banco de dados apenas alterando essa camada, sem modificação das regras de negócio. Não sei se consegui atingir o objetivo aqui.

## Rate limit na autenticação

- Rate limit em rotas de autenticação é um padrão comum, para evitar ataques de brute-force. Aqui usei o pacote throttler do nest junto com um storage custom (no próprio DynamoDB). A implementação do storage fiz com ajuda do Claude. Optei por utilizar o próprio DynamoDB aqui simplesmente para exercitar o design de single table (e por não ter experiência com redis). Poderia ter utilizado essa [biblioteca](https://github.com/jmcdo29/nest-lab/tree/main/packages/throttler-storage-redis), mas preferi seguir com o DynamoDB. A implementação ficou um pouco inocente. É uma janela fixa que não considera se o usuário acertou o errou a senha, então teoricamente um usuário com rate limit mesmo acertando a senha na próxima requisição ficaria bloqueado por um tempo até conseguir logar. Talvez para melhorar esse ponto poderia ter pensado em uma forma de incrementar a duração dos bloqueios progressivamente após cada rate limit, mas optei por não fazer.

## Por que mais testes de integração do que unitários?

- Eu particularmente prefiro testar a aplicação de forma mais similar a como um usuário iria interagir com ela. Em testes unitários eu acabo tendo que criar muitos mocks, e parece que eu estou testando mais a implementação de certas coisas do que sua interface propriamente. Talvez eu esteja fazendo isso de forma incorreta? De qualquer forma eu acredito que testes de integração (com banco de dados de teste, etc.) são mais interessantes e fiéis ao que seria o comportamento real da aplicação.

## Observabilidade (Datadog)

- Nesse quesito eu tenho mais experiência com [Sentry](https://sentry.io). A integração com o Nest é bem simples e automática.
- Eu decidi tentar utilizar alguma outra ferramenta com a qual não tenho experiência, por simples aprendizado.
- Primeiramente cogitei utilizar o [Better Stack](https://betterstack.com) porque eu ouvi falar dele recentemente e queria ver o processo de integração/interface do mesmo (por puro aprendizado). Após configurar o opentelemetry e observar alguns traces no painel eu vi que teria que fazer muita coisa manualmente para ter o mesmo que o Sentry oferecia de forma automática.
- Por fim acabei testando o [DataDog](https://www.datadoghq.com) (que é citado no próprio desafio e sei que é um padrão para aplicações distribuídas, e com o qual eu também não tinha experiência). A escolha casou bem com o Pino porque ele já gera logs no formato correto para vincular com os traces do datadog.
