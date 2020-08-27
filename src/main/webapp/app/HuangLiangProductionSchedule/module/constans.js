const DATE_FORMAT = 'YYYY/MM/DD'
const DATETIME_FORMAT_WITHOUT_SEC = 'YYYY/MM/DD HH:mm'
const DATETIME_FORMAT = 'YYYY/MM/DD HH:mm:ss'
const DATETIME_FORMAT_BACKEND = 'YYYY-MM-DD HH:mm:ss'
const HOURTIME_FORMAT = 'HH:mm'
const DATE_DAY_FORMAT = 'MM/DD (dd)'
const TIME_FORMAT = 'h A'
const MILLISECONDS_PER_HOUR = 1000 * 60 * 60
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24
const datetimeReg = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d|\d{2}), \d{4} (\d|\d{2}):\d{2}:\d{2} (AM|PM)$/
const dateReg = /^(一|二|三|四|五|六|七|八|九|十|十一|十二)月 (\d|\d{2}), \d{4}$/

export {
  DATE_FORMAT,
  DATETIME_FORMAT_WITHOUT_SEC,
  DATETIME_FORMAT,
  DATETIME_FORMAT_BACKEND,
  HOURTIME_FORMAT,
  DATE_DAY_FORMAT,
  TIME_FORMAT,
  MILLISECONDS_PER_HOUR,
  MILLISECONDS_PER_DAY,
  dateReg,
  datetimeReg,
}
