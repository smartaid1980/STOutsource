/**
 * 一個定期執行的排程
 * @memberof module:servkit
 * @param {String} name
 * @letructor
 * @this {Schedule}
 */
function Schedule(name, isRunImmediately = true) {
  this._id = undefined
  this._name = name
  this._type = 'interval'
  this.isRunImmediately = isRunImmediately
}

Schedule.prototype = {
  /**
   * 排程的行為
   * @this {Schedule}
   * @param {Function} cb 預執行的函式
   * @returns {Schedule} this
   */
  action(cb) {
    this._action = cb
    return this
  },
  /**
   * 排程的時間
   * @this {Schedule}
   * @param {Number} ms 時間
   * @returns {Schedule} this
   */
  freqMillisecond(ms) {
    if (!_.isNumber(ms)) {
      throw new Error('請指定一個數值給 freqMillisecond！')
    }
    this._freqMs = ms
    return this
  },
  /**
   * 設定timeout或間隔時間的原因
   * @this {Schedule}
   * @param {String} timeoutOrInterval timeout或間隔時間的原因
   * @returns {Schedule} this
   */
  type(timeoutOrInterval) {
    if (['timeout', 'interval'].indexOf(timeoutOrInterval) !== -1) {
      this._type = timeoutOrInterval
      return this
    } else {
      throw new Error('timeout or interval with type...')
    }
  },
  /**
   * 執行排程
   * @this {Schedule}
   * @returns {Schedule} this
   */
  start(isPreventStart) {
    const that = this

    function stopSchedule() {
      if (!that._id) {
        return
      }
      if (that._type === 'timeout') {
        clearTimeout(that._id)
      } else {
        clearInterval(that._id)
      }
      that._id = undefined
    }

    function startSchedule() {
      if (that._id) {
        return
      }
      if (!_.isNumber(that._freqMs)) {
        throw new Error('請明確指定一個數值給 freqMillisecond！')
      }
      switch (that._type) {
        case 'timeout':
          that._id = setTimeout(
            function timeoutAction() {
              try {
                that._action(function () {
                  that._id = setTimeout(timeoutAction, that._freqMs)
                })
              } catch (e) {
                console.warn('[Schedule ' + that._name + '] 葛了啦...')
                console.warn(e)
                that._id = setTimeout(timeoutAction, that._freqMs)
              }
            },
            that.isRunImmediately ? 0 : that._freqMs
          )
          break
        case 'interval':
        default:
          if (that.isRunImmediately) {
            try {
              that._action()
            } catch (e) {
              console.warn('[Schedule ' + that._name + '] 葛了啦...')
              console.warn(e)
            }
          }
          that._id = setInterval(that._action, that._freqMs)
          break
      }
    }

    if (!isPreventStart) {
      startSchedule()
    }

    $(window).on('hashchange', function hashChange(evt) {
      stopSchedule()
      $(window).off('hashchange', hashChange)
    })

    return {
      getScheduleId() {
        return that._id
      },
      getName() {
        return that._name
      },
      getType() {
        return that._type
      },
      setFreqMillisecond(ms) {
        that.freqMillisecond(ms)
        if (this.isActive()) {
          stopSchedule()
          startSchedule()
        }
      },
      start() {
        startSchedule()
      },
      stop() {
        stopSchedule()
      },
      isActive() {
        return _.isNumber(that._id)
      },
    }
  },
}

export default Schedule
