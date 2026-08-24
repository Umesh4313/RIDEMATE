export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: any;
}

class Logger {
  private format(level: LogLevel, message: string, context?: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''}:`;
    if (data !== undefined) {
      return `${prefix} ${message} | ${typeof data === 'object' ? JSON.stringify(data) : data}`;
    }
    return `${prefix} ${message}`;
  }

  info(message: string, context?: string, data?: any): void {
    console.log(this.format('info', message, context, data));
  }

  warn(message: string, context?: string, data?: any): void {
    console.warn(this.format('warn', message, context, data));
  }

  error(message: string, context?: string, error?: any): void {
    const errorData = error instanceof Error 
      ? { name: error.name, message: error.message, stack: error.stack }
      : error;
    console.error(this.format('error', message, context, errorData));
  }

  debug(message: string, context?: string, data?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format('debug', message, context, data));
    }
  }
}

export const logger = new Logger();
