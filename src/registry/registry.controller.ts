import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { Service } from '../payment/payment.types';
import { RegistryService } from './registry.service';
import { PublishServiceDto } from '../payment/payment.dto';
import { isStellarPublicKey } from '../stellar/stellar';

@Controller('v1/registry')
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  @Get('search')
  search(
    @Query('capability') capability?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('asset') asset?: string,
  ): Service[] {
    return this.registryService.search({
      capability,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      asset,
    });
  }

  @Get(':id')
  getService(@Param('id') id: string): Service {
    const service = this.registryService.getService(id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  @Post()
  publishService(@Body() data: PublishServiceDto): Service {
    if (!isStellarPublicKey(data.payoutAddress)) {
      throw new BadRequestException(
        'payoutAddress must be a Stellar G… public key',
      );
    }
    return this.registryService.publishService({
      name: data.name,
      capability: data.capability,
      payoutAddress: data.payoutAddress,
      pricePerCall: data.pricePerCall,
      provider: data.provider || 'unknown',
      rating: 5.0,
    });
  }

  @Put(':id')
  updateService(
    @Param('id') id: string,
    @Body() updates: Partial<Service>,
  ): Service {
    const updated = this.registryService.updateService(id, updates);
    if (!updated) {
      throw new NotFoundException('Service not found');
    }
    return updated;
  }

  @Delete(':id')
  deleteService(@Param('id') id: string): { message: string } {
    const service = this.registryService.getService(id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return { message: 'Service deleted' };
  }
}
