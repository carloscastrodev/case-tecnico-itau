import { Global, Module } from '@nestjs/common';
import { AuthenticatedGuard } from './authenticated.guard';

@Global()
@Module({
  providers: [AuthenticatedGuard],
  exports: [AuthenticatedGuard],
})
export class GuardsModule {}
