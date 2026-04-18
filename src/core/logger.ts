/**
 * @license
 * System-wide Logger & Performance Monitor
 * Mimics Pino API for browser safety while providing structured logs
 */

type LogContext = Record<string, any>;

class SystemLogger {
  private formatMessage(level: string, contextOrMsg: LogContext | string, msg?: string) {
    const timestamp = new Date().toISOString();
    let data = {};
    let message = '';

    if (typeof contextOrMsg === 'string') {
      message = contextOrMsg;
    } else {
      data = contextOrMsg;
      message = msg || '';
    }

    return {
      timestamp,
      level,
      message,
      ...data
    };
  }

  info(contextOrMsg: LogContext | string, msg?: string) {
    const formatted = this.formatMessage('INFO', contextOrMsg, msg);
    console.log(`[INFO] ${formatted.message}`, formatted);
  }

  warn(contextOrMsg: LogContext | string, msg?: string) {
    const formatted = this.formatMessage('WARN', contextOrMsg, msg);
    console.warn(`[WARN] ${formatted.message}`, formatted);
  }

  error(contextOrMsg: LogContext | string, msg?: string) {
    const formatted = this.formatMessage('ERROR', contextOrMsg, msg);
    console.error(`[ERROR] ${formatted.message}`, formatted);
  }
}

export const logger = new SystemLogger();

/**
 * Performance Monitoring Wrapper
 * Measures execution time of async operations and alerts on slow calls
 *
 * @param name - Name of the operation being measured
 * @param fn - The async function to measure
 * @returns The result of the async function
 * @throws The error thrown by the async function
 */
export const measureOperation = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    logger.info({ name, durationMs: duration.toFixed(2) }, `Operation completed: ${name}`);
    
    // Alert if operation took longer than 1 second
    if (duration > 1000) {
      logger.warn({ name, durationMs: duration.toFixed(2) }, `Slow operation detected: ${name}`);
    }
    
    return result;
  } catch (error: any) {
    const duration = performance.now() - start;
    logger.error({ name, durationMs: duration.toFixed(2), error: error.message || error }, `Operation failed: ${name}`);
    throw error;
  }
};
