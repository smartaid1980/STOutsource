var politeCheckCount = 0

/**
 * 將預計執行的函式存入tag，若為空值則存入'default'字樣加上呼叫的次數
 * @constructor
 * @memberof module:servkit
 * @this {PoliteCheck}
 * @param {String} tag 識別PoliteCheck的名字
 */
function PoliteCheck(tag) {
  this.tag = tag || 'default' + ++politeCheckCount
}

/**
 * 建置一預計執行的函式
 * @memberof module:servkit
 * @param {Function} tag 將執行的函式
 * @returns {PoliteCheck} PoliteCheck(tag) 創建的函式
 */
function politeCheck(tag) {
  return new PoliteCheck(tag)
}

/**
 * 持續偵測直到 until 為 true 才做某件事
 * @this {PoliteCheck}
 * @param {Function} cb callback
 * @returns {PoliteCheck} this
 */
PoliteCheck.prototype.until = function (cb) {
  if (typeof cb !== 'function')
    throw new Error('until method need callback function!')
  this.checkDo = cb
  return this
}
/**
 * 預計要執行的函式
 * @this {PoliteCheck}
 * @param {Function} cb callback
 * @returns {PoliteCheck} this
 */
PoliteCheck.prototype.thenDo = function (cb) {
  if (typeof cb !== 'function')
    throw new Error('thenDo method need callback function!')
  this.thenDo = cb
  return this
}

/**
 * 可執行次數
 * @this {PoliteCheck}
 * @param {Number} count 預設的執行次數
 * @returns {PoliteCheck} this
 */
PoliteCheck.prototype.maxTry = function (count) {
  if (typeof count !== 'number') throw new Error('maxTry method need number!')
  this.tryCount = count
  return this
}

/**
 * 預計多久後執行
 * @this {PoliteCheck}
 * @param {Number} ms 所設定的時間
 * @returns {PoliteCheck} this
 */
PoliteCheck.prototype.tryDuration = function (ms) {
  if (typeof ms !== 'number') throw new Error('tryDuration method need number!')
  this.timeoutMs = ms
  return this
}

/**
 * 當checkDo()回傳true後，執行thenDo()；否則於timeoutMs後再執行一次setTimeout
 * @this {PoliteCheck}
 */
PoliteCheck.prototype.start = function () {
  var that = this
  var timeoutMs = this.timeoutMs || 0
  setTimeout(function exec() {
    if (that.tryCount === 0) {
      if (debugState) console.info(that.tag + ' do not check anymore!!')
      return
    }
    if (debugState)
      console.info(
        that.tag +
          ' polite check' +
          (that.tryCount ? ' countdown ' + that.tryCount : '')
      )
    if (that.checkDo()) {
      if (debugState) console.info(that.tag + ' done!')
      that.thenDo()
    } else {
      if (that.tryCount) that.tryCount--
      setTimeout(exec, timeoutMs)
    }
  }, 0)
}

export default politeCheck
