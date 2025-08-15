interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
  error?: Error;
}

class Logger {
  private logLevel: number;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = this.getLogLevel();
  }

  private getLogLevel(): number {
    const level = process.env.LOG_LEVEL?.toUpperCase();
    const levels: LogLevel = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
    };

    return levels[level as keyof LogLevel] ?? (this.isDevelopment ? 3 : 1);
  }

  private formatLog(level: string, message: string, data?: any, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error,
    };
  }

  private shouldLog(level: string): boolean {
    const levels: LogLevel = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
    };
    return levels[level as keyof LogLevel] <= this.logLevel;
  }

  private output(level: string, message: string, data?: any, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatLog(level, message, data, error);
    
    if (this.isDevelopment) {
      // Development: Pretty console output
      const timestamp = logEntry.timestamp;
      const levelColor = this.getLevelColor(level);
      
      console.log(`${timestamp} [${levelColor}${level}\x1b[0m] ${message}`);
      
      if (data) {
        console.log('Data:', data);
      }
      
      if (error) {
        console.error('Error:', error);
      }
    } else {
      // Production: JSON structured logging
      console.log(JSON.stringify(logEntry));
    }
  }

  private getLevelColor(level: string): string {
    switch (level) {
      case 'ERROR': return '\x1b[31m'; // Red
      case 'WARN': return '\x1b[33m';  // Yellow
      case 'INFO': return '\x1b[36m';  // Cyan
      case 'DEBUG': return '\x1b[35m'; // Magenta
      default: return '\x1b[0m';       // Reset
    }
  }

  public error(message: string, data?: any, error?: Error): void {
    this.output('ERROR', message, data, error);
  }

  public warn(message: string, data?: any): void {
    this.output('WARN', message, data);
  }

  public info(message: string, data?: any): void {
    this.output('INFO', message, data);
  }

  public debug(message: string, data?: any): void {
    this.output('DEBUG', message, data);
  }

  public log(message: string, data?: any): void {
    this.info(message, data);
  }

  // Specialized logging methods
  public request(method: string, url: string, duration?: number, statusCode?: number): void {
    const message = `${method} ${url}`;
    const data = { method, url, duration, statusCode };
    
    if (statusCode && statusCode >= 400) {
      this.warn(message, data);
    } else {
      this.info(message, data);
    }
  }

  public database(operation: string, table: string, duration?: number, error?: Error): void {
    const message = `Database ${operation} on ${table}`;
    const data = { operation, table, duration };
    
    if (error) {
      this.error(message, data, error);
    } else {
      this.debug(message, data);
    }
  }

  public auth(action: string, userId?: number, success: boolean = true, error?: Error): void {
    const message = `Authentication ${action} ${success ? 'succeeded' : 'failed'}`;
    const data = { action, userId, success };
    
    if (error || !success) {
      this.warn(message, data, error);
    } else {
      this.info(message, data);
    }
  }

  public performance(operation: string, duration: number, metadata?: any): void {
    const message = `Performance: ${operation} took ${duration}ms`;
    this.debug(message, { operation, duration, metadata });
  }

  // Log level management
  public setLogLevel(level: string): void {
    this.logLevel = this.getLogLevel();
  }

  public getCurrentLogLevel(): string {
    const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
    return levels[this.logLevel] || 'INFO';
  }

  // Utility methods
  public createChildLogger(context: string): Logger {
    const childLogger = new Logger();
    const originalOutput = childLogger.output.bind(childLogger);
    
    childLogger.output = (level: string, message: string, data?: any, error?: Error) => {
      const contextualMessage = `[${context}] ${message}`;
      originalOutput(level, contextualMessage, data, error);
    };
    
    return childLogger;
  }
}

// Create and export singleton instance
export const logger = new Logger();

// Export the class for creating child loggers
export { Logger };
export default logger;
