import { IsNumber, IsString, Min } from 'class-validator';

export class UpsertBalanceDto {
  @IsString()
  employeeId: string;

  @IsString()
  locationId: string;

  @IsNumber()
  @Min(0)
  availableDays: number;
}
