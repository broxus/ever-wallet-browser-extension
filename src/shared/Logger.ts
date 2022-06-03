import log from 'loglevel';
import { singleton } from 'tsyringe';

@singleton()
export class Logger {
  private logger: log.Logger;

  constructor() {
    this.logger = log.getLogger('Logger');
    this.logger.setLevel(process.env.NODE_ENV === 'production' ? 'warn' : 'debug');
  }

  trace(...msg: any[]): void {
    this.logger.trace(...msg);
  }

  debug(...msg: any[]): void {
    this.logger.debug(...msg);
  }

  log(...msg: any[]): void {
    this.logger.log(...msg);
  }

  info(...msg: any[]): void {
    this.logger.info(...msg);
  }

  warn(...msg: any[]): void {
    this.logger.warn(...msg);
  }

  error(...msg: any[]): void {
    this.logger.error(...msg);
  }
}
