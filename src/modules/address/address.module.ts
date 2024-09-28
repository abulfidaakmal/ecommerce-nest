import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressRepository } from './address.repository';
import { AddressController } from './address.controller';

@Module({
  providers: [AddressService, AddressRepository],
  controllers: [AddressController],
})
export class AddressModule {}
