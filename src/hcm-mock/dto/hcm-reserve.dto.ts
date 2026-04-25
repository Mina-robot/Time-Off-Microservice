import { IsNumber, IsString, Min } from 'class-validator';

export class HcmReserveDto {
  @IsString()
  employeeId: string;

  @IsString()
  locationId: string;

  @IsNumber()
  @Min(0.5)
  days: number;
}
