import { Body, Controller, Get, Param, Query } from '@nestjs/common';
import { MarketService } from './market.service';
import { CampusLocation } from './entities/campus.entity';
import { PickUpPoint } from './entities/pickup-point.entity';
import { SearchDeliveryLocationsQuery } from './dto/market.dto';
import { University } from './entities/university.entity';

@Controller()
export class MarketController {
  constructor(private marketService: MarketService) {}

  @Get('university/:email')
  async getUniversityByUserEmail(@Param('email') email: string): Promise<University> {
    return await this.marketService.getUniversityByEmailAddress(email);
  }
  
  @Get('campuses')
  async getAllCampusLocations(): Promise<CampusLocation[]> {
    return await this.marketService.getAllCampuses();
  }

  @Get('campuses/:id')
  async getCampusLocationById(@Param('id') id: number): Promise<CampusLocation> {
    return await this.marketService.getOneCampus(id);
  }

  @Get('delivery/locations')
  async getAllDeliveryLocations(@Query() query: SearchDeliveryLocationsQuery): Promise<PickUpPoint[]> {
    return await this.marketService.getAllDeliveryLocations(query);
  }

  @Get('delivery/locations/:id')
  async getDeliveryLocationById(@Param('id') id: number): Promise<PickUpPoint> {
    return await this.marketService.getOneDeliveryLocation(id);
  }
}
