import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { AuthModule } from "../auth/auth.module";
// import { AuthGuard } from "../auth/guards/auth.guard";

@Module({
    providers: [ChatGateway, ChatService],
    imports: [AuthModule]
})
export class ChatModule {}