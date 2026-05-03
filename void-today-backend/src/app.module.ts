import { Module } from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";

import {EnvModule} from "@core/env/env.module";
import {PrismaModule} from "@core/prisma/prisma.module";

@Module({
  imports: [
      ConfigModule.forRoot({
        isGlobal: true,
      }),
      PrismaModule,
      EnvModule,
  ],
})
export class AppModule {}
