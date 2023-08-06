import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CampusLocation } from './entities/campus.entity';
import { MarketController } from './market.controller';

@Module({
  controllers: [MarketController],
  providers: [MarketService],
  exports: [MarketService],
  imports: [MikroOrmModule.forFeature([CampusLocation])],
})
export class MarketModule {}
