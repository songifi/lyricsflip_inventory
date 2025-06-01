import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { PharmacyService } from 'src/pharmacy/pharmacy.service';
import { MobilePharmacyDto } from './dto/mobile-pharmacy.dto';

@Controller('mobile/pharmacies')
export class MobilePharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Get()
  async findAllMobile(
    @Query('page', ParseIntPipe) page = 1,
    @Query('per_page', ParseIntPipe) perPage = 10,
  ) {
    const { data, total } = await this.pharmacyService.paginate({ page, perPage });
    return {
      data: data.map(ph => new MobilePharmacyDto(ph)),
      meta: {
        page,
        per_page: perPage,
        total,
        has_more: page * perPage < total,
      },
    };
  }

  @Get('sync')
  async getUpdates(@Query('updated_since') updatedSince: string) {
    const updates = await this.pharmacyService.getUpdatedSince(updatedSince);
    return updates.map(ph => new MobilePharmacyDto(ph));
  }
}
