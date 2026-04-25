import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTimeOffRequestDto {
  @IsString()
  employeeId: string;

  @IsString()
  locationId: string;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  daysRequested?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
