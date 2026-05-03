import { Module } from '@nestjs/common';

import { EnvService } from '@core/env/env.service';

@Module({
    providers: [EnvService],
    exports: [EnvService],
})
export class EnvModule {}