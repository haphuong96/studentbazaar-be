import { Body, Controller, Get, Param, Query } from '@nestjs/common';
import { MarketService } from './market.service';
import { CampusLocation } from './entities/campus.entity';

@Controller()
export class MarketController {
  constructor(private marketService: MarketService) {}

  @Get('campuses')
  async getAllCampusLocations(): Promise<CampusLocation[]> {
    return await this.marketService.getAllCampuses();
  }

}
