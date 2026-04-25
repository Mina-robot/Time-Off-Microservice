import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: 'time-off-microservice',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
