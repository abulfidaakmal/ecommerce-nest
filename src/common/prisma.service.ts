import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, string>
  implements OnModuleInit
{
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {
    super({
      log: [
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });
  }

  onModuleInit(): void {
    this.$on('error', (event: Prisma.LogEvent) => {
      this.logger.error(event);
    });

    this.$on('warn', (event: Prisma.LogEvent) => {
      this.logger.warn(event);
    });
  }
}
