import { Injectable } from '@nestjs/common';
import { API_VERSION } from './constants';

@Injectable()
export class AppService {
  getHello(): string {
    return `Primar Backend ${API_VERSION}`;
  }
}
