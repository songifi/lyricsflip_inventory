import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationType } from './entities/location.entity';

class ListLocationsQueryDto {
  search?: string;
  type?: LocationType;
  parentId?: string;
  page?: number;
  limit?: number;
}

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  create(@Body() dto: CreateLocationDto) {
    return this.locationsService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListLocationsQueryDto) {
    return this.locationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.locationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationsService.update(id, dto);
  }

  @Put(':id')
  replace(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.locationsService.remove(id);
  }

  @Get(':id/items')
  getItems(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.locationsService.getItems(id);
  }

  @Get(':id/capacity')
  getCapacity(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.locationsService.getCapacity(id);
  }
}
