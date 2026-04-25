import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateTimeOffRequestDto } from './dto/create-time-off-request.dto';
import { ReviewTimeOffRequestDto } from './dto/review-time-off-request.dto';
import { TimeOffService } from './time-off.service';

@Controller('time-off-requests')
export class TimeOffController {
  constructor(private readonly timeOffService: TimeOffService) {}

  @Get()
  async listRequests() {
    return this.timeOffService.listRequests();
  }

  @Get(':id')
  async getRequest(@Param('id') id: string) {
    return this.timeOffService.getRequest(id);
  }

  @Post()
  async create(@Body() payload: CreateTimeOffRequestDto) {
    return this.timeOffService.createRequest(payload);
  }

  @Patch(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() payload: ReviewTimeOffRequestDto,
  ) {
    return this.timeOffService.approveRequest(id, payload);
  }

  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() payload: ReviewTimeOffRequestDto,
  ) {
    return this.timeOffService.rejectRequest(id, payload);
  }

  @Delete(':id')
  async cancel(@Param('id') id: string) {
    return this.timeOffService.cancelRequest(id);
  }
}
