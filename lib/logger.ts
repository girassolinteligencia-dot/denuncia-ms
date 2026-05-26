type LogContext = Record<string, unknown>

function log(level: 'info' | 'warn' | 'error', scope: string, message: string, context?: LogContext) {
  const prefix = `[${scope}] ${message}`

  if (level === 'info') {
    console.info(prefix, context ?? '')
    return
  }

  if (level === 'warn') {
    console.warn(prefix, context ?? '')
    return
  }

  console.error(prefix, context ?? '')
}

export const logger = {
  info: (scope: string, message: string, context?: LogContext) => log('info', scope, message, context),
  warn: (scope: string, message: string, context?: LogContext) => log('warn', scope, message, context),
  error: (scope: string, message: string, context?: LogContext) => log('error', scope, message, context),
}
