import { Module } from '@nestjs/common';
import { AuthenticatedGuard } from './authenticated.guard';

@Module({
  imports: [],
  controllers: [],
  providers: [AuthenticatedGuard],
})
export class GuardsModule {}
