/**
 * Logger utility that only logs in development mode
 * In production, can be configured to send to error tracking services
 */

type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug';

interface Logger {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

class LoggerService implements Logger {
  private isDev = import.meta.env.DEV;
  private isProd = import.meta.env.PROD;

  log(...args: any[]): void {
    if (this.isDev) {
      console.log(...args);
    }
  }

  error(...args: any[]): void {
    // Always log errors, but in production send to service
    if (this.isDev) {
      console.error(...args);
    } else if (this.isProd) {
      // In production, you can integrate with error tracking services
      // Example: Sentry.captureException(error);
      console.error('[Error]', ...args);
    }
  }

  warn(...args: any[]): void {
    if (this.isDev) {
      console.warn(...args);
    }
  }

  info(...args: any[]): void {
    if (this.isDev) {
      console.info(...args);
    }
  }

  debug(...args: any[]): void {
    if (this.isDev) {
      console.debug(...args);
    }
  }

  // Helper for structured logging
  group(label: string, collapsed = false): void {
    if (this.isDev) {
      if (collapsed) {
        console.groupCollapsed(label);
      } else {
        console.group(label);
      }
    }
  }

  groupEnd(): void {
    if (this.isDev) {
      console.groupEnd();
    }
  }

  // Helper for timing operations
  time(label: string): void {
    if (this.isDev) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDev) {
      console.timeEnd(label);
    }
  }
}

export const logger = new LoggerService();

// Export default for convenience
export default logger;
