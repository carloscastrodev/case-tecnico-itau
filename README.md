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
docker compose up (para ver os logs no terminal)
```

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

## Uso de Agentes de IA (Claude Code)

- Utilizei o Claude para:
  - gerar parte dos testes de integração de mensagens e solucionar alguns bugs que estava tendo na minha implementação inicial (dos testes e dos endpoints de listagem com filtros);
  - ponderar sobre a modelagem do banco em relação ao uso de GSIs vs denormalização dos dados;
  - ajudar a melhorar a formatação desse README.

Em alguns pontos da aplicação estão alguns comentários onde utilizei/como utilizei.

## Decisões Técnicas

## Autenticação

- Decidi não implementar autenticação no banco de dados ou em serviços de IdP como o Cognito, optando por usar credenciais mockadas por simplicidade.

### Escolha do Dynamoose

- Escolhi o Dynamoose porque vi que ele é parecido com o Mongoose (que eu tenho alguma experiência), e por já
  existir um pacote de integração com NestJS.
- Cogitei usar o ElectroDB ou o SDK oficial da AWS para dynamodb, mas acabei optando pelo Dynamoose.

### Escolha do Pino (Logger)

- Escolhi o Pino em vez do Winston (ou outro logger) porque vi que ele é mais leve e performático. Não tinha experiência com nenhum.
- Optei por usar a biblioteca NestJS-Pino porque ela vincula e loga automaticamente os dados da requisição.

### Sobre a modelagem de dados

- Para suportar os padrões de acesso requisitados, criei dois GSIs na tabela, optando por utilizar nomes genéricos (abordagem para tabela única). Tentei pensar em como suportar os padrões de acessos sem necessidade de GSIs, mas não consegui encontrar uma forma eficiente de fazer isso. Cheguei a cogitar (pesquisando no Claude) a duplicação dos dados (modificando a partition key e sort key) mas descartei essa ideia e optei pelos GSIs.

### Use Cases vs Service

- Aqui simplesmente optei pelo que estou mais acostumado atualmente.

### Repositório

- Tentei isolar o acesso aos dados (e o acesso ao Dynamoose) na camada de repositório. A intenção aqui é que fosse possível modificar o banco de dados apenas alterando essa camada, sem modificação das regras de negócio. Não sei se consegui atingir o objetivo aqui.

## Estrutura de pastas

```
├───config - Configurações e validações de variáveis de ambiente (ConfigService)
├───database - Configurações do banco de dados (DynamoDB)
│ └───schemas
│ └───message - Schemas do modelo Message
├───lib - Configurações de bibliotecas terceiras que não são Injectables ou Módulos do NestJS
│ └───swagger - Configurações do Swagger
├───modules - Módulos da aplicação
│ ├───auth - Módulo de autenticação
│ │ ├───docs - Decorators de documentação do Swagger para casos em que a documentação do Swagger é muito verbosa.
│ │ ├───request - DTOs de requisições
│ │ ├───response - DTOs de resposta
│ │ ├───tests - Testes
│ │ └───use-cases - Casos de uso
│ └───messages
│ ├───request
│ └───response
└───utils - Funções utilitárias simples
```
