# Case Técnico Itaú - API REST de Mensagens

Este projeto é uma API REST desenvolvida com NestJS para atender aos requisitos do case técnico do Itaú.

## Funcionalidades

- Autenticação via JWT
- Cadastro de Mensagens
- Listagem de Mensagens (filtro por remetente e/ou período e paginação)
- Busca de Mensagens por ID
- Atualização de Status de Mensagens

## Stack

- NestJS
- DynamoDB (via NestJS Dynamoose)
- Zod e Class Validator para validação de dados
- Jest e Supertest para testes
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
docker compose up -d
```

### 4. Acesse o Swagger para testar a aplicação

```bash
http://localhost:3001/api/docs                               |
```

## Testes

Para rodar os testes, utilize os comandos:

```bash
npm run test:unit | yarn test:unit - Testes Unitários
npm run test:e2e | yarn test:e2e - Testes de Integração
```

## Autenticação

- A autenticação é realizada pelo endpoint `POST /v1/sign-in`. O mecanismo de autenticação é baseado em usuário e senha, devolvendo um token de acesso JWT.
  ```
  **Decisão técnica**
  Nesse quesito decidi não implementar autenticação no banco de dados ou em serviços de IdP como o Cognito, optando por usar credenciais mockadas por simplicidade.
  ```

## Credenciais de teste padrão (.env.example)

```
 username: user
 password: password
```

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
