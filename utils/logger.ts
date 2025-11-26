
import { User } from '../types';

type LogLevel = 'info' | 'warn' | 'error';

class Logger {
  private userContext: Partial<User> | null = null;

  public setUser(user: User) {
    this.userContext = {
      uid: user.uid,
      role: user.role,
      tenantId: user.tenantId,
    };
  }

  public clearUser() {
    this.userContext = null;
  }

  private log(level: LogLevel, message: string, context?: object) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context: {
        ...context,
        user: this.userContext,
        url: window.location.href,
      },
    };

    // In a real application, this would send the log to a service like
    // Google Cloud Logging, Sentry, etc. For this demo, we use console.
    switch (level) {
      case 'info':
        console.log(JSON.stringify(logEntry, null, 2));
        break;
      case 'warn':
        console.warn(JSON.stringify(logEntry, null, 2));
        break;
      case 'error':
        console.error(JSON.stringify(logEntry, null, 2));
        break;
    }
  }

  public info(message: string, context?: object) {
    this.log('info', message, context);
  }

  public warn(message: string, context?: object) {
    this.log('warn', message, context);
  }

  public error(message: string, error?: any, context?: object) {
    const errorContext = {
      ...context,
      errorMessage: error?.message,
      errorCode: error?.code,
      errorStack: error?.stack,
    };
    this.log('error', message, errorContext);
  }
}

// Export a singleton instance
export const logger = new Logger();
