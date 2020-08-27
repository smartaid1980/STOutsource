var MILLISECONDS_PER_SECOND = 1000
var MILLISECONDS_PER_MINUTE = 60000
var MILLISECONDS_PER_HOUR = 3600000
var MILLISECONDS_PER_DAY = 86400000
// var SECONDS_PER_MINUTE = 60
var OVERFLOW_VALUE = '+++'
var UNDERFLOW_VALUE = '---'
var INFINITY_VALUE = '0'
var DATE_8_BITS_REGEX = /\d{8}/
var DATE_20_BITS_REGEX = /\d{20}/

// 提供一個擴充方法的方法，這完全是從 the good parts 抄來的
if (!Function.prototype.method) {
  Function.prototype.method = function (name, func) {
    this.prototype[name] = func
    return this
  }
} else {
  console.warn('[警告] Function.prototype.method 已存在...')
}

// 0.0 ~ 1.0 -> '0.0%' ~ '100.0%'
Number.method('floatToPercentage', function (
  fixedDigit = 2,
  allowNegative = false,
  allowOver100 = false
) {
  if (!_.isFinite(this) || (!allowOver100 && this > 1.0)) {
    // 如果分母是零，即使要顯示超過100%的數值也要顯示成 +++
    return OVERFLOW_VALUE
  } else if (!allowNegative && this < 0.0) {
    return UNDERFLOW_VALUE
  } else if (Number.isNaN(this.valueOf())) {
    return '0.00%'
  } else {
    return (this * 100).toFixed(fixedDigit) + '%'
  }
})

// 10000 -> '10,000'
Number.method('numberWithCommas', function () {
  return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
})

// 毫秒數值 -> 'XXm XXs'
Number.method('millisecondToXXmXXs', function () {
  if (!_.isFinite(this)) {
    // 分母是0
    return INFINITY_VALUE
  } else if (this < 0) {
    return UNDERFLOW_VALUE
  } else {
    var minute = Math.floor(this / MILLISECONDS_PER_MINUTE)
    var second = Math.floor(
      (this % MILLISECONDS_PER_MINUTE) / MILLISECONDS_PER_SECOND
    )
    return (
      (minute < 10 ? '0' : '') +
      minute +
      'm ' +
      (second < 10 ? '0' : '') +
      second +
      's'
    )
  }
})

// 毫秒數值 -> 'HH:mm:ss'
Number.method('millisecondToHHmmss', function () {
  if (!_.isFinite(this)) {
    // 分母是0
    return INFINITY_VALUE
  } else if (this < 0) {
    return UNDERFLOW_VALUE
  } else {
    var hour = Math.floor(this / MILLISECONDS_PER_HOUR)
    var minute = Math.floor(
      (this % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE
    )
    var second = Math.floor(
      (this % MILLISECONDS_PER_MINUTE) / MILLISECONDS_PER_SECOND
    )
    return (
      (hour < 10 ? '0' : '') +
      hour +
      ':' +
      (minute < 10 ? '0' : '') +
      minute +
      ':' +
      (second < 10 ? '0' : '') +
      second
    )
  }
})

// 毫秒數值 -> 'D天 HH:mm:ss'
Number.method('millisecondToDHHmmss', function () {
  if (!_.isFinite(this)) {
    // 分母是0
    return INFINITY_VALUE
  } else if (this < 0) {
    return UNDERFLOW_VALUE
  } else {
    var day = Math.floor(this / MILLISECONDS_PER_DAY)
    var hour = Math.floor((this % MILLISECONDS_PER_DAY) / MILLISECONDS_PER_HOUR)
    var minute = Math.floor(
      (this % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE
    )
    var second = Math.floor(
      (this % MILLISECONDS_PER_MINUTE) / MILLISECONDS_PER_SECOND
    )
    return (
      day +
      'D ' +
      (hour < 10 ? '0' : '') +
      hour +
      ':' +
      (minute < 10 ? '0' : '') +
      minute +
      ':' +
      (second < 10 ? '0' : '') +
      second
    )
  }
})

// 毫秒數值 -> '天D時H分M秒S'
Number.method('millisecondToDHMS', function (unit) {
  if (!_.isFinite(this)) {
    // 分母是0
    return INFINITY_VALUE
  } else if (this < 0) {
    return UNDERFLOW_VALUE
  } else {
    var day = Math.floor(this / MILLISECONDS_PER_DAY)
    var hour = Math.floor((this % MILLISECONDS_PER_DAY) / MILLISECONDS_PER_HOUR)
    hour = hour < 10 ? `0${hour}` : hour
    var minute = Math.floor(
      (this % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE
    )
    minute = minute < 10 ? `0${minute}` : minute
    var second = Math.floor(
      (this % MILLISECONDS_PER_MINUTE) / MILLISECONDS_PER_SECOND
    )
    second = second < 10 ? `0${second}` : second
    switch (unit) {
      case 'D':
        return `${day}D`
      case 'H':
        return `${day}D ${hour}H`
      case 'M':
        return `${day}D ${hour}H ${minute}M`
      default:
        return `${day}D ${hour}H ${minute}M ${second}S`
    }
  }
})

// 數字四捨五入
Number.method('round', function (decimal = 1) {
  return +(Math.round(this + 'e+' + decimal) + 'e-' + decimal)
})

// 'HH:mm:ss' -> 毫秒數值
String.method('HHmmssToMillisecond', function () {
  var hour = this.split(':')[0]
  var min = this.split(':')[1]
  var sec = this.split(':')[2]

  return sec * 1000 + min * 60 * 1000 + hour * 3600 * 1000
})

// 'XX.XX%' -> XX.XX
String.method('percentageToFloat', function () {
  var result = parseFloat(this)
  if (_.isNumber(result) && !_.isNaN(result)) {
    return result
  }
  return 0.0
})

// '10000' -> '10,000'
String.method('numberWithCommas', function () {
  var result = Number(this)
  if (isNaN(result)) {
    return this
  }
  return result.numberWithCommas()
})

// YYYYMMDD -> YYYY/MM/DD
String.method('date8BitsToSlashed', function () {
  if (DATE_8_BITS_REGEX.test(this)) {
    return (
      this.substring(0, 4) +
      '/' +
      this.substring(4, 6) +
      '/' +
      this.substring(6, 8)
    )
  }
  return this
})

// YYYYMMDDHHmmss -> YYYY/MM/DD HH:mm:ss
String.method('date20BitsToFormatted', function () {
  if (DATE_20_BITS_REGEX.test(this)) {
    return (
      this.substring(0, 4) +
      '/' +
      this.substring(4, 6) +
      '/' +
      this.substring(6, 8) +
      ' ' +
      this.substring(8, 10) +
      ':' +
      this.substring(10, 12) +
      ':' +
      this.substring(12, 14)
    )
  }
  return this
})

// YYYYMMDDHHmmss -> YYYY/MM/DD HH:mm:ss
String.method('dateTimeBitsToFormatted', function () {
  if (this.length >= 14) {
    return (
      this.substring(0, 4) +
      '/' +
      this.substring(4, 6) +
      '/' +
      this.substring(6, 8) +
      ' ' +
      this.substring(8, 10) +
      ':' +
      this.substring(10, 12) +
      ':' +
      this.substring(12, 14)
    )
  }
  return this
})

// whatever -> YYYY/MM/DD
String.method('whateverToDateSlashed', function () {
  if (this.length >= 8) {
    return (
      this.substring(0, 4) +
      '/' +
      this.substring(4, 6) +
      '/' +
      this.substring(6, 8)
    )
  }
  return this
})

// 從DB來的datetime -> YYYY/MM/DD HH:mm:ss
const displayDatetimePattern = 'YYYY/MM/DD HH:mm:ss'
String.method('toFormatedDatetime', function (
  inputPattern,
  outputPattern = displayDatetimePattern
) {
  const timeStr = this.toString()
  let momentObj = moment(timeStr)
  if (timeStr === '') {
    momentObj = moment()
  } else if (momentObj.toString() === 'Invalid date' && inputPattern) {
    momentObj = moment(timeStr, inputPattern)
  }
  return momentObj.format(outputPattern)
})

// 從DB來的date -> YYYY/MM/DD
const dbDatePattern = 'MMM DD, YYYY'
const displayDatePattern = 'YYYY/MM/DD'
String.method('toFormatedDate', function (
  inputPattern = dbDatePattern,
  outputPattern = displayDatePattern
) {
  const timeStr = this.toString()
  let momentObj = moment(timeStr)
  if (timeStr === '') {
    momentObj = moment()
  } else if (momentObj.toString() === 'Invalid date') {
    momentObj = moment(timeStr, inputPattern)
  }
  return momentObj.format(outputPattern)
})

// 從DB來的 time -> HH:mm:ss
const dbTimePattern = 'hh:mm:ss A'
const displayTimePattern = 'HH:mm:ss'
String.method('toFormatedTime', function (
  inputPattern = dbTimePattern,
  outputPattern = displayTimePattern
) {
  const timeStr = this.toString()
  let momentObj = moment(timeStr)
  if (timeStr === '') {
    momentObj = moment()
  } else if (momentObj.toString() === 'Invalid date') {
    momentObj = moment(timeStr, inputPattern)
  }
  return momentObj.format(outputPattern)
})
