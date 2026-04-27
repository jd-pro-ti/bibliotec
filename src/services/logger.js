const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 }
const CURRENT_LOG_LEVEL = LOG_LEVELS.INFO

export const logger = {
  debug: (...args) => { if (CURRENT_LOG_LEVEL <= LOG_LEVELS.DEBUG) console.debug('[DEBUG]', ...args) },
  info: (...args) => { if (CURRENT_LOG_LEVEL <= LOG_LEVELS.INFO) console.info('[INFO]', ...args) },
  warn: (...args) => { if (CURRENT_LOG_LEVEL <= LOG_LEVELS.WARN) console.warn('[WARN]', ...args) },
  error: (...args) => { if (CURRENT_LOG_LEVEL <= LOG_LEVELS.ERROR) console.error('[ERROR]', ...args) }
}