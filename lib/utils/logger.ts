import { AppError, ErrorCode } from "../error";

/**
 * Log levels to categorize logs by importance
 */
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL",
}

/**
 * Structure of a log entry
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  module: string;
  userId?: string;
  error?: Error | AppError;
  data?: Record<string, any>;
  context?: Record<string, any>;
}

/**
 * Interface for logger transport implementations
 */
interface LoggerTransport {
  log(entry: LogEntry): void;
}

/**
 * Console transport for logging to the console
 */
class ConsoleTransport implements LoggerTransport {
  constructor(private minLevel: LogLevel = LogLevel.INFO) {}

  log(entry: LogEntry): void {
    const levelPriority = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3,
      [LogLevel.FATAL]: 4,
    };

    if (levelPriority[entry.level] < levelPriority[this.minLevel]) {
      return;
    }

    const { timestamp, level, message, module, userId, data, error } = entry;
    const logPrefix = `[${timestamp}][${level}][${module}]${
      userId ? `[User:${userId}]` : ""
    }`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`${logPrefix} ${message}`, { data, error });
        break;
      case LogLevel.INFO:
        console.info(`${logPrefix} ${message}`, { data });
        break;
      case LogLevel.WARN:
        console.warn(`${logPrefix} ${message}`, { data, error });
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(`${logPrefix} ${message}`, { data, error });
        break;
    }
  }
}

/**
 * For server environments: logs to a file
 * Note: This is a simple implementation. In production,
 * consider using a more robust solution like Winston or Pino.
 */
class ServerFileTransport implements LoggerTransport {
  log(entry: LogEntry): void {
    // In a real implementation, you would write to a file
    // or send to a logging service like LogRocket, Sentry, etc.
    // For now, we'll just use console as a placeholder
    const { timestamp, level, message, module, userId, data, error } = entry;
    const logEntry = JSON.stringify({
      timestamp,
      level,
      message,
      module,
      userId,
      data,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            ...(error instanceof AppError && {
              code: error.code,
              field: error.field,
              httpStatus: error.httpStatus,
            }),
          }
        : undefined,
    });

    // In production, you would write this to a file or send to a logging service
    // For development, we'll just use console
    console.log(logEntry);
  }
}

/**
 * Main Logger class
 */
export class Logger {
  private static instance: Logger;
  private transports: LoggerTransport[] = [];
  private defaultContext: Record<string, any> = {};

  private constructor() {
    // Default transport for development
    if (process.env.NODE_ENV !== "production") {
      this.addTransport(new ConsoleTransport(LogLevel.DEBUG));
    } else {
      // In production, use appropriate transports
      this.addTransport(new ConsoleTransport(LogLevel.INFO));
      this.addTransport(new ServerFileTransport());
    }
  }

  /**
   * Get singleton instance of the logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Add a new transport
   */
  public addTransport(transport: LoggerTransport): void {
    this.transports.push(transport);
  }

  /**
   * Set default context for all logs
   */
  public setDefaultContext(context: Record<string, any>): void {
    this.defaultContext = { ...this.defaultContext, ...context };
  }

  /**
   * Create a child logger with a specific module name
   */
  public createLogger(module: string): ModuleLogger {
    return new ModuleLogger(this, module);
  }

  /**
   * Internal method to log an entry
   */
  public logEntry(entry: LogEntry): void {
    const enhancedEntry = {
      ...entry,
      context: { ...this.defaultContext, ...entry.context },
      timestamp: entry.timestamp || new Date().toISOString(),
    };

    this.transports.forEach((transport) => {
      try {
        transport.log(enhancedEntry);
      } catch (e) {
        console.error("Error in logger transport:", e);
      }
    });
  }
}

/**
 * Logger instance for a specific module
 */
export class ModuleLogger {
  constructor(private logger: Logger, private module: string) {}

  /**
   * Log a debug message
   */
  debug(message: string, data?: Record<string, any>, userId?: string): void {
    this.logger.logEntry({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      module: this.module,
      userId,
      data,
    });
  }

  /**
   * Log an info message
   */
  info(message: string, data?: Record<string, any>, userId?: string): void {
    this.logger.logEntry({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      module: this.module,
      userId,
      data,
    });
  }

  /**
   * Log a warning message
   */
  warn(
    message: string,
    data?: Record<string, any>,
    error?: Error,
    userId?: string
  ): void {
    this.logger.logEntry({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      module: this.module,
      userId,
      data,
      error,
    });
  }

  /**
   * Log an error message
   */
  error(
    message: string,
    error?: Error | AppError,
    data?: Record<string, any>,
    userId?: string
  ): void {
    this.logger.logEntry({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      module: this.module,
      userId,
      data,
      error,
    });
  }

  /**
   * Log a fatal error message
   */
  fatal(
    message: string,
    error?: Error | AppError,
    data?: Record<string, any>,
    userId?: string
  ): void {
    this.logger.logEntry({
      timestamp: new Date().toISOString(),
      level: LogLevel.FATAL,
      message,
      module: this.module,
      userId,
      data,
      error,
    });
  }

  /**
   * Log an application error
   */
  appError(error: AppError, data?: Record<string, any>, userId?: string): void {
    const levelMap: Record<ErrorCode, LogLevel> = {
      [ErrorCode.VALIDATION_ERROR]: LogLevel.WARN,
      [ErrorCode.NOT_FOUND]: LogLevel.WARN,
      [ErrorCode.UNAUTHORIZED]: LogLevel.WARN,
      [ErrorCode.CONFLICT]: LogLevel.WARN,
      [ErrorCode.SERVER_ERROR]: LogLevel.ERROR,
      [ErrorCode.RATE_LIMIT_EXCEEDED]: LogLevel.WARN,
      [ErrorCode.BAD_REQUEST]: LogLevel.WARN,
      [ErrorCode.FORBIDDEN]: LogLevel.WARN,
    };

    this.logger.logEntry({
      timestamp: new Date().toISOString(),
      level: levelMap[error.code] || LogLevel.ERROR,
      message: error.message,
      module: this.module,
      userId,
      data,
      error,
    });
  }
}

/**
 * Create a module logger - convenience function
 */
export function createLogger(module: string): ModuleLogger {
  return Logger.getInstance().createLogger(module);
}

// Export a default logger for quick access
export const logger = createLogger("app");
