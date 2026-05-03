import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";

import {PrismaModule} from "@core/prisma/prisma.module";
import {AuthService} from "@modules/auth/auth.service";

@Module({
    imports: [
        PrismaModule,
        JwtModule.register({})
    ],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthController {}