import { LoggerService } from '@nestjs/common';

export class CustomLogger implements LoggerService {
  log(message: string) {
    console.log('📢 ' + message);
  }

  error(message: string, trace?: string) {
    console.error('❌ ' + message);
    console.log('🔍 Stack Trace: ' + trace);
  }

  warn(message: string) {
    console.warn('⚠️ ' + message);
  }

  debug(message: string) {
    console.debug('🐞 ' + message);
  }
}