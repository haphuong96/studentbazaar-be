import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { User } from "../user/entities/user.entity";
import { University } from "../market/entities/university.entity";

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        MikroOrmModule.forFeature([User, University])
    ]
})

export class AuthModule {}