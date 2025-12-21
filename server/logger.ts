import * as fs from 'fs';
import * as path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
  stack?: string;
  duration?: number;
  endpoint?: string;
  statusCode?: number;
  ip?: string;
  userId?: string;
  requestId?: string;
}

const LOG_DIR = path.join(process.cwd(), 'logs');
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_LOG_FILES = 10;

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

class Logger {
  private logBuffer: LogEntry[] = [];
  private bufferSize = 50;
  private currentLogFile = this.getLogFilePath();

  constructor() {
    // Flush buffer every 5 seconds
    setInterval(() => this.flushBuffer(), 5000);
    
    // Cleanup old logs on startup
    this.cleanupOldLogs();
  }

  private getLogFilePath(): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(LOG_DIR, `pinnode-${date}.log`);
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLog(entry: LogEntry): string {
    const logData = {
      ...entry,
      timestamp: entry.timestamp
    };
    return JSON.stringify(logData) + '\n';
  }

  log(level: LogLevel, message: string, data?: Record<string, any>, stack?: string) {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      data,
      stack
    };

    this.logBuffer.push(entry);

    // Console output
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
    if (level === 'error' || level === 'critical') {
      console.error(prefix, message, data || '');
      if (stack) console.error(stack);
    } else if (level === 'warn') {
      console.warn(prefix, message, data || '');
    } else {
      console.log(prefix, message, data || '');
    }

    // Flush if buffer is full
    if (this.logBuffer.length >= this.bufferSize) {
      this.flushBuffer();
    }
  }

  debug(message: string, data?: Record<string, any>) {
    if (process.env.DEBUG === 'true') {
      this.log('debug', message, data);
    }
  }

  info(message: string, data?: Record<string, any>) {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, any>) {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | Record<string, any>, data?: Record<string, any>) {
    let stack: string | undefined;
    let errorData = data || {};

    if (error instanceof Error) {
      stack = error.stack;
      errorData = {
        ...errorData,
        errorMessage: error.message,
        errorName: error.name
      };
    } else if (typeof error === 'object') {
      errorData = { ...error, ...data };
    }

    this.log('error', message, errorData, stack);
  }

  critical(message: string, error?: Error | Record<string, any>, data?: Record<string, any>) {
    let stack: string | undefined;
    let errorData = data || {};

    if (error instanceof Error) {
      stack = error.stack;
      errorData = {
        ...errorData,
        errorMessage: error.message,
        errorName: error.name
      };
    } else if (typeof error === 'object') {
      errorData = { ...error, ...data };
    }

    this.log('critical', message, errorData, stack);
  }

  // Log API request with metrics
  logRequest(method: string, endpoint: string, statusCode: number, duration: number, ip?: string, data?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level: statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info',
      message: `${method} ${endpoint}`,
      endpoint,
      statusCode,
      duration,
      ip,
      data,
      requestId: this.generateRequestId()
    };

    this.logBuffer.push(entry);

    // Fast log for performance metrics
    const logMsg = `${method.padEnd(6)} ${endpoint.padEnd(40)} ${statusCode} ${duration.toString().padStart(5)}ms`;
    if (statusCode >= 500) {
      console.error(logMsg);
    } else if (statusCode >= 400) {
      console.warn(logMsg);
    }

    if (this.logBuffer.length >= this.bufferSize) {
      this.flushBuffer();
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private flushBuffer() {
    if (this.logBuffer.length === 0) return;

    try {
      const logFile = this.getLogFilePath();
      if (logFile !== this.currentLogFile) {
        this.currentLogFile = logFile;
        this.cleanupOldLogs();
      }

      const content = this.logBuffer.map(entry => this.formatLog(entry)).join('');
      fs.appendFileSync(logFile, content);
      this.logBuffer = [];
    } catch (err) {
      console.error('Failed to flush logs:', err);
    }
  }

  private cleanupOldLogs() {
    try {
      const files = fs.readdirSync(LOG_DIR)
        .filter(f => f.startsWith('pinnode-') && f.endsWith('.log'))
        .sort()
        .reverse();

      // Remove old files if exceeded max
      if (files.length > MAX_LOG_FILES) {
        for (let i = MAX_LOG_FILES; i < files.length; i++) {
          fs.unlinkSync(path.join(LOG_DIR, files[i]));
        }
      }

      // Check file sizes
      for (const file of files) {
        const filePath = path.join(LOG_DIR, file);
        const stat = fs.statSync(filePath);
        if (stat.size > MAX_LOG_SIZE) {
          const newName = file.replace('.log', `-${Date.now()}.log`);
          fs.renameSync(filePath, path.join(LOG_DIR, newName));
        }
      }
    } catch (err) {
      console.error('Failed to cleanup old logs:', err);
    }
  }

  // Retrieve logs with filtering
  retrieveLogs(options?: {
    level?: LogLevel;
    endpoint?: string;
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }): LogEntry[] {
    const logs: LogEntry[] = [];
    const limit = options?.limit || 1000;
    const offset = options?.offset || 0;

    try {
      // Get all log files
      const files = fs.readdirSync(LOG_DIR)
        .filter(f => f.startsWith('pinnode-') && f.endsWith('.log'))
        .sort()
        .reverse();

      // Read files (most recent first)
      for (const file of files) {
        if (logs.length >= limit + offset) break;

        const filePath = path.join(LOG_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());

        for (const line of lines.reverse()) {
          try {
            const entry = JSON.parse(line) as LogEntry;

            // Apply filters
            if (options?.level && entry.level !== options.level) continue;
            if (options?.endpoint && !entry.endpoint?.includes(options.endpoint)) continue;
            if (options?.startDate && entry.timestamp < options.startDate) continue;
            if (options?.endDate && entry.timestamp > options.endDate) break;

            logs.push(entry);

            if (logs.length >= limit + offset) break;
          } catch (e) {
            // Skip malformed lines
          }
        }
      }

      // Apply offset and limit
      return logs.slice(offset, offset + limit);
    } catch (err) {
      console.error('Failed to retrieve logs:', err);
      return [];
    }
  }

  // Get log statistics
  getStats(): {
    totalEntries: number;
    byLevel: Record<LogLevel, number>;
    byEndpoint: Record<string, number>;
    avgResponseTime: number;
    errorRate: number;
  } {
    const logs = this.retrieveLogs({ limit: 10000 });
    const stats = {
      totalEntries: logs.length,
      byLevel: {
        debug: 0,
        info: 0,
        warn: 0,
        error: 0,
        critical: 0
      } as Record<LogLevel, number>,
      byEndpoint: {} as Record<string, number>,
      avgResponseTime: 0,
      errorRate: 0
    };

    let totalDuration = 0;
    let requestCount = 0;

    for (const log of logs) {
      stats.byLevel[log.level]++;

      if (log.endpoint) {
        stats.byEndpoint[log.endpoint] = (stats.byEndpoint[log.endpoint] || 0) + 1;
      }

      if (log.duration !== undefined) {
        totalDuration += log.duration;
        requestCount++;
      }
    }

    if (requestCount > 0) {
      stats.avgResponseTime = Math.round(totalDuration / requestCount);
    }

    stats.errorRate = stats.totalEntries > 0 
      ? Math.round((stats.byLevel.error + stats.byLevel.critical) / stats.totalEntries * 100)
      : 0;

    return stats;
  }

  // Search logs by keyword
  searchLogs(keyword: string, limit: number = 100): LogEntry[] {
    const logs = this.retrieveLogs({ limit: 5000 });
    const searchTerm = keyword.toLowerCase();

    return logs
      .filter(log => 
        log.message.toLowerCase().includes(searchTerm) ||
        JSON.stringify(log.data || {}).toLowerCase().includes(searchTerm) ||
        log.stack?.toLowerCase().includes(searchTerm)
      )
      .slice(0, limit);
  }
}

export const logger = new Logger();
