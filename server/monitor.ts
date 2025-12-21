/**
 * Error Monitoring System
 * Single Responsibility: Monitor and track system errors
 * Used by: Logger, Error Handler, Routes
 */

import { logger, type LogEntry } from './logger';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorAlert {
  id: string;
  timestamp: string;
  severity: ErrorSeverity;
  message: string;
  errorType: string;
  endpoint?: string;
  statusCode?: number;
  count: number;
  lastOccurrence: string;
  stack?: string;
}

export interface MonitorStats {
  totalErrors: number;
  bySeverity: Record<ErrorSeverity, number>;
  byEndpoint: Record<string, number>;
  byErrorType: Record<string, number>;
  activeAlerts: ErrorAlert[];
  errorTrend: { timestamp: string; count: number }[];
  systemHealth: 'healthy' | 'degraded' | 'critical';
}

class ErrorMonitor {
  private errorCounts: Map<string, number> = new Map();
  private errorTracking: Map<string, ErrorAlert> = new Map();
  private errorTimestamps: number[] = [];
  private readonly ALERT_THRESHOLD = 5; // Alert after 5 same errors in 15 min
  private readonly TIME_WINDOW = 15 * 60 * 1000; // 15 minutes

  /**
   * Record an error occurrence
   * Single Responsibility: Track and aggregate errors
   */
  recordError(
    message: string,
    errorType: string,
    endpoint?: string,
    statusCode?: number,
    stack?: string
  ): void {
    const errorKey = `${endpoint}:${statusCode}:${errorType}`;
    const count = (this.errorCounts.get(errorKey) || 0) + 1;
    this.errorCounts.set(errorKey, count);

    // Record timestamp for trend analysis
    this.errorTimestamps.push(Date.now());
    // Keep only last 24 hours
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    this.errorTimestamps = this.errorTimestamps.filter(ts => ts > cutoff);

    // Determine severity based on status code
    const severity = this.calculateSeverity(statusCode, count);

    // Create or update alert
    const alertId = errorKey;
    const existingAlert = this.errorTracking.get(alertId);

    if (existingAlert) {
      existingAlert.count = count;
      existingAlert.lastOccurrence = new Date().toISOString();
      existingAlert.severity = severity;
    } else {
      this.errorTracking.set(alertId, {
        id: alertId,
        timestamp: new Date().toISOString(),
        severity,
        message,
        errorType,
        endpoint,
        statusCode,
        count: 1,
        lastOccurrence: new Date().toISOString(),
        stack
      });
    }

    // Alert if threshold exceeded
    if (count >= this.ALERT_THRESHOLD && count % this.ALERT_THRESHOLD === 0) {
      this.triggerAlert(errorKey, severity);
    }
  }

  /**
   * Calculate error severity
   * Single Responsibility: Severity determination
   */
  private calculateSeverity(statusCode?: number, count: number = 1): ErrorSeverity {
    if (count >= 20) return 'critical';
    if (count >= 10) return 'high';
    if (!statusCode) return 'medium';
    if (statusCode >= 500) return statusCode === 503 ? 'high' : 'critical';
    if (statusCode >= 400) return 'medium';
    return 'low';
  }

  /**
   * Trigger alert notification
   * Single Responsibility: Alert management
   */
  private triggerAlert(errorKey: string, severity: ErrorSeverity): void {
    const alert = this.errorTracking.get(errorKey);
    if (!alert) return;

    const alertMessage = `[${severity.toUpperCase()}] Error Alert: ${alert.message} (${alert.count} occurrences)`;

    if (severity === 'critical') {
      logger.critical(alertMessage, {
        errorKey,
        alert,
        timestamp: new Date().toISOString()
      });
    } else if (severity === 'high') {
      logger.error(alertMessage, {
        errorKey,
        alert,
        timestamp: new Date().toISOString()
      });
    } else {
      logger.warn(alertMessage, {
        errorKey,
        alert,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get all active alerts
   * Single Responsibility: Alert retrieval
   */
  getActiveAlerts(): ErrorAlert[] {
    return Array.from(this.errorTracking.values())
      .filter(alert => {
        const timeSinceLastOccurrence = Date.now() - new Date(alert.lastOccurrence).getTime();
        return timeSinceLastOccurrence < this.TIME_WINDOW;
      })
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
  }

  /**
   * Get monitoring statistics
   * Single Responsibility: Stats compilation
   */
  getStats(): MonitorStats {
    const allLogs = logger.retrieveLogs({ limit: 10000 });
    const recentErrors = allLogs.filter(log => 
      log.level === 'error' || log.level === 'critical'
    );

    const stats: MonitorStats = {
      totalErrors: recentErrors.length,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      byEndpoint: {},
      byErrorType: {},
      activeAlerts: this.getActiveAlerts(),
      errorTrend: this.calculateErrorTrend(),
      systemHealth: 'healthy'
    };

    // Calculate severity distribution
    for (const alert of stats.activeAlerts) {
      stats.bySeverity[alert.severity]++;
      
      if (alert.endpoint) {
        stats.byEndpoint[alert.endpoint] = (stats.byEndpoint[alert.endpoint] || 0) + 1;
      }
      
      stats.byErrorType[alert.errorType] = (stats.byErrorType[alert.errorType] || 0) + 1;
    }

    // Determine system health
    if (stats.bySeverity.critical > 0 || stats.activeAlerts.some(a => a.severity === 'critical')) {
      stats.systemHealth = 'critical';
    } else if (stats.bySeverity.high > 5 || recentErrors.length > 100) {
      stats.systemHealth = 'degraded';
    }

    return stats;
  }

  /**
   * Calculate error trend over time
   * Single Responsibility: Trend analysis
   */
  private calculateErrorTrend(): { timestamp: string; count: number }[] {
    const trend: Record<string, number> = {};
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Group by 10-minute intervals
    for (const timestamp of this.errorTimestamps) {
      if (timestamp < oneHourAgo) continue;

      const interval = Math.floor((timestamp - oneHourAgo) / (10 * 60 * 1000)) * 10;
      const key = new Date(oneHourAgo + interval * 60 * 1000).toISOString();
      trend[key] = (trend[key] || 0) + 1;
    }

    return Object.entries(trend)
      .map(([timestamp, count]) => ({ timestamp, count }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Clear error alerts
   * Single Responsibility: Alert management
   */
  clearAlerts(): void {
    this.errorTracking.clear();
    this.errorCounts.clear();
    logger.info('Error alerts cleared');
  }

  /**
   * Check if system is experiencing issues
   * Single Responsibility: Health check
   */
  hasActiveIssues(): boolean {
    const alerts = this.getActiveAlerts();
    return alerts.length > 0;
  }

  /**
   * Get health summary
   * Single Responsibility: Summary generation
   */
  getHealthSummary(): {
    status: 'healthy' | 'degraded' | 'critical';
    activeAlerts: number;
    recentErrors: number;
    criticalEndpoints: string[];
  } {
    const stats = this.getStats();
    const alerts = this.getActiveAlerts();
    
    return {
      status: stats.systemHealth,
      activeAlerts: alerts.length,
      recentErrors: stats.totalErrors,
      criticalEndpoints: alerts
        .filter(a => a.severity === 'critical')
        .map(a => a.endpoint || 'unknown')
        .filter((v, i, a) => a.indexOf(v) === i)
    };
  }
}

export const errorMonitor = new ErrorMonitor();
