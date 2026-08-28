import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UpdateSupplierStatusDto } from './dto/update-supplier-status.dto';
import { CreateSupplierContactDto } from './dto/create-supplier-contact.dto';
import { UpdateSupplierContactDto } from './dto/update-supplier-contact.dto';
import { CreateSupplierCommunicationDto } from './dto/create-supplier-communication.dto';
import { CreateSupplierReviewDto } from './dto/create-supplier-review.dto';
import { QuerySuppliersDto } from './dto/query-suppliers.dto';
import { AuthenticatedRequest } from './authenticated-request';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  @Get()
  async findAll(
    @Query() query: QuerySuppliersDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.findAll(query, req.user.companyId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.findOne(id, req.user.companyId);
  }

  @Post()
  async create(
    @Body() dto: CreateSupplierDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.create(dto, req.user.companyId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.update(id, dto, req.user.companyId);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.suppliersService.remove(id, req.user.companyId);
    return { message: 'Supplier deleted successfully' };
  }

  // ─── Status ────────────────────────────────────────────────────────────────

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierStatusDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.updateStatus(
      id,
      dto,
      req.user.companyId,
      req.user.userId,
    );
  }

  // ─── Items ─────────────────────────────────────────────────────────────────

  @Get(':id/items')
  async findItems(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.findItems(id, req.user.companyId);
  }

  // ─── Contacts ──────────────────────────────────────────────────────────────

  @Get(':id/contacts')
  async listContacts(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.listContacts(id, req.user.companyId);
  }

  @Post(':id/contacts')
  async addContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSupplierContactDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.addContact(id, dto, req.user.companyId);
  }

  @Put(':id/contacts/:contactId')
  async updateContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Body() dto: UpdateSupplierContactDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.updateContact(
      id,
      contactId,
      dto,
      req.user.companyId,
    );
  }

  @Delete(':id/contacts/:contactId')
  async removeContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.suppliersService.removeContact(
      id,
      contactId,
      req.user.companyId,
    );
    return { message: 'Contact deleted successfully' };
  }

  // ─── Communication log ─────────────────────────────────────────────────────

  @Get(':id/communications')
  async listCommunications(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.listCommunications(id, req.user.companyId);
  }

  @Post(':id/communications')
  async logCommunication(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSupplierCommunicationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.logCommunication(
      id,
      dto,
      req.user.companyId,
      req.user.userId,
    );
  }

  // ─── Performance ───────────────────────────────────────────────────────────

  @Get(':id/reviews')
  async listReviews(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.listReviews(id, req.user.companyId);
  }

  @Post(':id/reviews')
  async addReview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSupplierReviewDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.suppliersService.addReview(
      id,
      dto,
      req.user.companyId,
      req.user.userId,
    );
  }
}
