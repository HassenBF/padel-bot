/**
 * Simple logging utility with consistent formatting
 */
export class Logger {
  private prefix: string;

  constructor(prefix: string = '') {
    this.prefix = prefix;
  }

  log(message: string, ...args: any[]): void {
    console.log(`[${new Date().toISOString()}]${this.prefix ? ` [${this.prefix}]` : ''} ${message}`, ...args);
  }

  info(message: string, ...args: any[]): void {
    console.log(`ℹ️  [${new Date().toISOString()}]${this.prefix ? ` [${this.prefix}]` : ''} ${message}`, ...args);
  }

  success(message: string, ...args: any[]): void {
    console.log(`✅ [${new Date().toISOString()}]${this.prefix ? ` [${this.prefix}]` : ''} ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`⚠️  [${new Date().toISOString()}]${this.prefix ? ` [${this.prefix}]` : ''} ${message}`, ...args);
  }

  error(message: string, error?: Error | any): void {
    console.error(`❌ [${new Date().toISOString()}]${this.prefix ? ` [${this.prefix}]` : ''} ${message}`, error || '');
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`🔍 [${new Date().toISOString()}]${this.prefix ? ` [${this.prefix}]` : ''} ${message}`, ...args);
    }
  }
}

// Export singleton instances for common use cases
export const logger = new Logger();
export const padelLogger = new Logger('Padel');
export const cronLogger = new Logger('Cron');