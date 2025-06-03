import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from "@nestjs/common";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { SupplierQueryDto } from "./dto/supplier-query.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { SuppliersService } from "./supplier.service";

@Controller("suppliers")
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  findAll(@Query() query: SupplierQueryDto) {
    return this.suppliersService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.suppliersService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto
  ) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.suppliersService.remove(id);
  }

  @Patch(":id/deactivate")
  deactivate(@Param("id", ParseUUIDPipe) id: string) {
    return this.suppliersService.deactivate(id);
  }

  @Patch(":id/activate")
  activate(@Param("id", ParseUUIDPipe) id: string) {
    return this.suppliersService.activate(id);
  }
}
