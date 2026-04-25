import { IsDateString, IsNumber, IsString, Min } from 'class-validator';

export class CreateTimeOffRequestDto {
  @IsString()
  employeeId: string;

  @IsString()
  locationId: string;

  @IsNumber()
  @Min(0.5)
  daysRequested: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
