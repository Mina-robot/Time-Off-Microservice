import { IsOptional, IsString } from 'class-validator';

export class ReviewTimeOffRequestDto {
  @IsOptional()
  @IsString()
  managerComment?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
