import log from 'loglevel'
import { singleton } from 'tsyringe'

@singleton()
export class Logger {

    private logger: log.Logger

    constructor() {
        this.logger = log.getLogger('Logger')
        this.logger.setLevel(process.env.NODE_ENV === 'production' ? 'warn' : 'debug')
    }

    trace = (...msg: any[]) => this.logger.trace(...msg)

    debug = (...msg: any[]) => this.logger.debug(...msg)

    log = (...msg: any[]) => this.logger.log(...msg)

    info = (...msg: any[]) => this.logger.info(...msg)

    warn = (...msg: any[]) => this.logger.warn(...msg)

    error = (...msg: any[]) => this.logger.error(...msg)

}
