import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import Configuration from './configs/app.config';
import { ItemModule } from './modules/item/item.module';
import { UserModule } from './modules/user/user.module';
import { AzureBlobStorageClientModule } from './modules/azure-blob-storage/blob-storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [Configuration]
    }),
    MikroOrmModule.forRoot(),
    AuthModule,
    ItemModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
