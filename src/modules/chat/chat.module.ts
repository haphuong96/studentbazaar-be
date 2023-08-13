import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";
import { ChatController } from "./chat.controller";
// import { AuthGuard } from "../auth/guards/auth.guard";

@Module({
    controllers: [ChatController],
    providers: [ChatGateway, ChatService],
    imports: [AuthModule, UserModule]
})
export class ChatModule {}