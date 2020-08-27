;(function (global, $, _) {
  global.hippo = global.hippo || {}
  global.hippo.version = '0.4'

  global.hippo.queryIndex = function (
    space,
    indexValues,
    callback,
    errCallback
  ) {
    servkit.ajax(
      {
        url: servkit.rootPath + '/api/hippo/queryIndex',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          space: space,
          indexValues: indexValues,
        }),
      },
      {
        success: function (data) {
          callback(data)
        },
        fail: function (data) {
          console.warn('hippo queryIndex fail: ' + data)
          errCallback && errCallback(data)
        },
        exception: function (data) {
          console.warn('hippo queryIndex exception: ' + data)
          errCallback && errCallback(data)
        },
      }
    )
  }

  function ExhalerParam() {}

  ExhalerParam.prototype = {
    setSpace: function (space) {
      this.space = space
    },
    setIndex: function (key, valueArr) {
      if (!this.index) {
        this.index = {}
      }
      this.index[key] = valueArr
    },
    setIndexRange: function (key, start, end) {
      this.indexRange = {
        key: key,
        start: start.replace(/\//g, ''),
        end: end.replace(/\//g, ''),
      }
    },
    addColumn: function (column) {
      if (this.columns) {
        this.columns.push(column)
      } else {
        this.columns = [column]
      }
    },
    addColumns: function (columnArr) {
      if (this.columns) {
        this.columns = this.columns.concat(columnArr)
      } else {
        this.columns = columnArr
      }
    },
  }

  /* start simple exhaler */
  function SimpleExhaler() {
    this.param = new ExhalerParam()
  }

  SimpleExhaler.prototype = {
    space: function (space) {
      this.param.setSpace(space)
      return this
    },
    index: function (indexKey, indexArr) {
      this.param.setIndex(indexKey, indexArr)
      return this
    },
    indexRange: function (key, start, end) {
      this.param.setIndexRange(key, start, end)
      return this
    },
    columns: function () {
      this.param.addColumns(_.toArray(arguments))
      return this
    },
    exhale: function (callback) {
      servkit.ajax(
        {
          url: servkit.rootPath + '/api/hippo/simple',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            space: this.param.space,
            index: this.param.index,
            indexRange: this.param.indexRange,
            columns: this.param.columns,
          }),
        },
        {
          success: function (data) {
            var exhalable = new SimpleExhalable(JSON.parse(data))
            callback(exhalable)
          },
          fail: function (data) {
            console.warn('hippo simpleExhale fail: ' + data)
            var exhalable = new SimpleExhalable([])
            callback(exhalable)
          },
          exception: function (data) {
            console.warn('hippo simpleExhale exception: ' + data)
            var exhalable = new SimpleExhalable([])
            if (data.indexOf('java.lang.OutOfMemoryError') != -1) {
              exhalable.message = i18n('Hippo_OOM')
            }
            callback(exhalable)
          },
        }
      )
    },
  }

  function SimpleExhalable(exhalable, message) {
    this.exhalable = exhalable
    this.message = message || null
  }

  SimpleExhalable.prototype = {
    each: function (iteratee, context) {
      _.each(this.exhalable, iteratee, context)
    },
    map: function (iteratee, context) {
      return _.map(this.exhalable, iteratee, context)
    },
    reduce: function (iteratee, memo, context) {
      return _.reduce(this.exhalable, iteratee, memo, context)
    },
    filter: function (predicate, context) {
      return _.filter(this.exhalable, predicate, context)
    },
  }

  global.hippo.newSimpleExhaler = function () {
    return new SimpleExhaler()
  }
  /* end simple exhaler */

  /* start mashup exhaler */
  function MashupExhaler() {
    this.params = []
    this.spaceTags = {}
  }

  MashupExhaler.prototype = {
    space: function (space) {
      var exhalerParam = new ExhalerParam()
      var spaceArr = space.split(':')
      exhalerParam.setSpace(spaceArr[0])
      this.params.push(exhalerParam)

      // 為了讓取得的資料的 key 不要跟 space 一樣又臭又長，所以提供一個 tag 幫助縮短
      this.spaceTags[spaceArr[0]] = spaceArr[1] || spaceArr[0]
      return this
    },
    index: function (indexKey, indexArr) {
      if (this.params.length) {
        this.params[this.params.length - 1].setIndex(indexKey, indexArr)
      } else {
        throw {
          name: 'MashupIndexError',
          message: '請先設定 space 再設定 index...',
        }
      }
      return this
    },
    indexRange: function (key, start, end) {
      if (this.params.length) {
        this.params[this.params.length - 1].setIndexRange(key, start, end)
      } else {
        throw {
          name: 'MashupIndexRangeError',
          message: '請先設定 space 再設定 indexRange...',
        }
      }
      return this
    },
    column: function (space, column) {
      var spaceTags = this.spaceTags,
        exhalerParam = _.find(this.params, function (e) {
          return spaceTags[e.space] === space
        })

      if (exhalerParam) {
        exhalerParam.addColumn(column)
      } else {
        throw {
          name: 'MashupColumnError',
          message: '請先設定 space 再設定 column...',
        }
      }
      return this
    },
    mashupKey: function () {
      this.mashupKeyParam = _.toArray(arguments)
      return this
    },
    exhale: function (callback) {
      var ajaxCallback = _.bind(function (data) {
        var exhalable = new MashupExhalable(JSON.parse(data), this.spaceTags)
        callback(exhalable)
      }, this)

      servkit.ajax(
        {
          url: servkit.rootPath + '/api/hippo/mashup',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            spaceParam: this.params,
            mashupKeys: this.mashupKeyParam,
          }),
        },
        {
          success: function (data) {
            ajaxCallback(data)
          },
          fail: function (data) {
            console.warn('hippo mashupExhale fail: ' + data)
            ajaxCallback('{}')
          },
          exception: function (data) {
            console.warn('hippo mashupExhale exception: ' + data)
            ajaxCallback('{}')
          },
        }
      )
    },
  }

  function MashupExhalable(exhalable, spaceTags) {
    this.exhalable = exhalable
    this.spaceTags = spaceTags
  }

  MashupExhalable.prototype = {
    each: function (iteratee) {
      _.each(
        this.exhalable,
        function (value, key) {
          try {
            iteratee(modifyKeyValue(this.spaceTags, value), key.split('|'))
          } catch (e) {
            console.warn(
              'MashupExhalable.each error at [' + key + ']: ' + e.message
            )
            throw e
          }
        },
        this
      )
    },
    map: function (iteratee) {
      return _.map(
        this.exhalable,
        function (value, key) {
          try {
            return iteratee(
              modifyKeyValue(this.spaceTags, value),
              key.split('|')
            )
          } catch (e) {
            console.warn(
              'MashupExhalable.map error at [' + key + ']: ' + e.message
            )
            throw e
          }
        },
        this
      )
    },
  }

  // key 修改成 tag
  function modifyKeyValue(spaceTags, value) {
    var modifyKeyValue = {}
    _.each(spaceTags, function (tag, tagKey) {
      modifyKeyValue[tag] = value[tagKey]
    })
    return modifyKeyValue
  }

  global.hippo.newMashupExhaler = function () {
    return new MashupExhaler()
  }
  /* end mashup exhaler */

  /* start inhaler */
  function Inhaler() {
    this.param = {
      space: '',
      index: {},
      data: [],
    }
    this.nextData = true
  }

  Inhaler.prototype = {
    space: function (space) {
      this.param.space = space
      return this
    },
    index: function (key, value) {
      this.param.index[key] = key === 'date' ? value.replace(/\//g, '') : value
      return this
    },
    put: function (key, value) {
      if (!_.isString(value) && !_.isNumber(value) && !_.isBoolean(value)) {
        throw {
          name: 'ValueTypeError',
          message:
            'put 值限定 string, number, boolean, but... [' +
            key +
            ' - ' +
            value +
            ']',
        }
      }
      if (_.isNaN(value)) {
        throw {
          name: 'ValueTypeError',
          message: 'put 值不得為 NaN, but... [' + key + ' - ' + value + ']',
        }
      }
      if (this.nextData) {
        this.param.data.push({})
        this.nextData = false
      }
      this.param.data[this.param.data.length - 1][key] = value
      return this
    },
    next: function () {
      this.nextData = true
      return this
    },
    inhale: function (callback, errCallback) {
      servkit.ajax(
        {
          url: servkit.rootPath + '/api/hippo/inhale',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(this.param),
        },
        {
          success: function (data) {
            callback()
          },
          fail: function (data) {
            console.warn('hippo inhale fail: ' + data)
            errCallback && errCallback()
          },
          exception: function (data) {
            console.warn('hippo inhale exception: ' + data)
            errCallback && errCallback()
          },
        }
      )
    },
    inhaleAppend: function (callback, errCallback) {
      servkit.ajax(
        {
          url: servkit.rootPath + '/api/hippo/inhaleAppend',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(this.param),
        },
        {
          success: function (data) {
            callback()
          },
          fail: function (data) {
            console.warn('hippo inhaleAppend fail: ' + data)
            errCallback && errCallback()
          },
          exception: function (data) {
            console.warn('hippo inhaleAppend exception: ' + data)
            errCallback && errCallback()
          },
        }
      )
    },
  }

  global.hippo.newInhaler = function () {
    return new Inhaler()
  }
  /* end inhaler */
})(this, $, _)
