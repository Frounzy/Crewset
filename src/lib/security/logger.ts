export type LogLevel = 'info' | 'warn' | 'error' | 'critical'

interface LogEntry {
  level: LogLevel
  message: string
  userId?: string
  metadata?: Record<string, any>
  timestamp: string
  environment: string
}

export const logger = {
  info: (message: string, userId?: string, metadata?: Record<string, any>) => 
    log('info', message, userId, metadata),
  
  warn: (message: string, userId?: string, metadata?: Record<string, any>) => 
    log('warn', message, userId, metadata),
  
  error: (message: string, userId?: string, metadata?: Record<string, any>) => 
    log('error', message, userId, metadata),
  
  critical: (message: string, userId?: string, metadata?: Record<string, any>) => 
    log('critical', message, userId, metadata),
}

function log(level: LogLevel, message: string, userId?: string, metadata?: Record<string, any>) {
  const entry: LogEntry = {
    level,
    message,
    userId,
    metadata,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  }

  // In production, this would go to Datadog/Sentry/CloudWatch
  // For now, we print structured JSON to stdout which Vercel picks up
  console.log(JSON.stringify(entry))

  // TODO: Insert into Supabase audit_logs table for critical events
  if (level === 'critical' || level === 'error') {
     // We can fire-and-forget an insert to audit_logs here if needed, 
     // but console logs are safer for async contexts.
  }
}
