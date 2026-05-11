import { CreateMessageUseCase } from './create-message';
import { FindMessagesUseCase } from './find-messages';
import { FindMessageByIdUseCase } from './find-message-by-id';
import { PatchMessageStatusUseCase } from './patch-message-status';

// Talvez eu deveria utilizar barrel files em mais locais simplesmente para seguir um padrão.
// Mas optei por fazer somente aqui porque existe um caso de uso no módulo
// Que é registrar todos os use cases em uma linha só.
export { CreateMessageUseCase, FindMessagesUseCase, FindMessageByIdUseCase, PatchMessageStatusUseCase };
