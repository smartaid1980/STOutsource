import { ajax } from './servkit/ajax.js'

// 取得 space 底下某ㄧ層的 index value 清單
function queryIndex(space, indexValues, callback, errCallback) {
  return new Promise((res, rej) =>
    ajax(
      {
        url: 'api/hippo/queryIndex',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          space: space,
          indexValues: indexValues,
        }),
      },
      {
        success(data) {
          res(data)
          if (callback) {
            callback(data)
          }
        },
        fail(data) {
          rej(data)
          console.warn('hippo queryIndex fail: ' + data)
          errCallback && errCallback(data)
        },
        exception(data) {
          rej(data)
          console.warn('hippo queryIndex exception: ' + data)
          errCallback && errCallback(data)
        },
      }
    )
  )
}
// 取得 hippo 所有 space 的資訊
function getStructure() {
  return new Promise((res, rej) =>
    ajax('api/hippo/getStructure', {
      success(data) {
        res(data)
      },
      fail(data) {
        rej(data)
        console.warn('hippo queryIndex fail: ' + data)
      },
      exception(data) {
        rej(data)
        console.warn('hippo queryIndex exception: ' + data)
      },
    })
  )
}

/* start simple exhaler */
// exhale request param
class ExhalerParam {
  constructor() {
    this.space = null
    this.index = null
    this.indexRange = null
    this.columns = null
  }
  setSpace(space) {
    this.space = space
  }
  setIndex(key, valueArr) {
    if (!this.index) {
      this.index = {}
    }
    this.index[key] = valueArr
  }
  setIndexRange(key, start, end) {
    this.indexRange = {
      key: key,
      start: start.replace(/\//g, ''),
      end: end.replace(/\//g, ''),
    }
  }
  addColumn(column) {
    if (this.columns) {
      this.columns.push(column)
    } else {
      this.columns = [column]
    }
  }
  addColumns(columnArr) {
    if (this.columns) {
      this.columns = this.columns.concat(columnArr)
    } else {
      this.columns = columnArr
    }
  }
}

// exhale methods
class SimpleExhaler {
  constructor() {
    this.param = new ExhalerParam()
  }
  space(space) {
    this.param.setSpace(space)
    return this
  }
  index(indexKey, indexArr) {
    if (_.isObject(indexKey) && !indexArr) {
      for (let key in indexKey) {
        this.param.setIndex(key, indexKey[key])
      }
    } else {
      this.param.setIndex(indexKey, indexArr)
    }
    return this
  }
  indexRange(key = 'date', start, end) {
    this.param.setIndexRange(key, start, end)
    return this
  }
  columns(...cols) {
    if (_.isArray(cols[0]) && cols.length === 1) {
      this.param.addColumns(cols[0])
    } else {
      this.param.addColumns(cols)
    }
    return this
  }
  exhale(callback) {
    return new Promise((res, rej) =>
      ajax(
        {
          url: 'api/hippo/simple',
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
          success(data) {
            const exhalable = new SimpleExhalable(JSON.parse(data))
            res(exhalable)
            if (callback) {
              callback(exhalable)
            }
          },
          fail(data) {
            console.warn('hippo simpleExhale fail: ' + data)
            const exhalable = new SimpleExhalable([])
            rej(exhalable)
            if (callback) {
              callback(exhalable)
            }
          },
          exception(data) {
            console.warn('hippo simpleExhale exception: ' + data)
            const exhalable = new SimpleExhalable([])
            rej(exhalable)
            if (data.indexOf('java.lang.OutOfMemoryError') != -1) {
              exhalable.message = i18n('Hippo_OOM')
            }
            if (callback) {
              callback(exhalable)
            }
          },
        }
      )
    )
  }
}

// exhale response
class SimpleExhalable {
  constructor(exhalable, message) {
    this.exhalable = exhalable
    this.message = message || null
  }
  each(iteratee, context) {
    _.each(this.exhalable, iteratee, context)
  }
  map(iteratee, context) {
    return _.map(this.exhalable, iteratee, context)
  }
  reduce(iteratee, memo, context) {
    return _.reduce(this.exhalable, iteratee, memo, context)
  }
  filter(predicate, context) {
    return _.filter(this.exhalable, predicate, context)
  }
}
/* end simple exhaler */

/* start mashup exhaler */
class MashupExhaler {
  constructor() {
    this.params = []
    this.spaceTags = {}
    this.mashupKeyParam = null
  }
  space(spaceName) {
    const exhalerParam = new ExhalerParam()
    const spaceArr = spaceName.split(':')

    exhalerParam.setSpace(spaceArr[0])
    this.params.push(exhalerParam)

    // 為了讓取得的資料的 key 不要跟 space 一樣又臭又長，所以提供一個 tag 幫助縮短
    this.spaceTags[spaceArr[0]] = spaceArr[1] || spaceArr[0]
    return this
  }
  index(indexKey, indexArr) {
    if (this.params.length) {
      this.params[this.params.length - 1].setIndex(indexKey, indexArr)
    } else {
      throw {
        name: 'MashupIndexError',
        message: '請先設定 space 再設定 index...',
      }
    }
    return this
  }
  indexRange(key, start, end) {
    if (this.params.length) {
      this.params[this.params.length - 1].setIndexRange(key, start, end)
    } else {
      throw {
        name: 'MashupIndexRangeError',
        message: '請先設定 space 再設定 indexRange...',
      }
    }
    return this
  }
  column(space, column) {
    const { spaceTags } = this
    const exhalerParam = _.find(this.params, (e) => {
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
  }
  mashupKey(...keys) {
    this.mashupKeyParam = keys
    return this
  }
  exhale(callback) {
    const { spaceTags } = this
    const self = this

    return new Promise((res, rej) =>
      ajax(
        {
          url: 'api/hippo/mashup',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            spaceParam: this.params,
            mashupKeys: this.mashupKeyParam,
          }),
        },
        {
          success(data) {
            const exhalable = new MashupExhalable(JSON.parse(data), spaceTags)
            res(exhalable)
            if (callback) {
              callback.call(self, exhalable)
            }
          },
          fail(data) {
            console.warn('hippo mashupExhale fail: ' + data)
            rej(data)
            if (callback) {
              callback.call(self, data)
            }
          },
          exception(data) {
            console.warn('hippo mashupExhale exception: ' + data)
            rej(data)
            if (callback) {
              callback.call(self, data)
            }
          },
        }
      )
    )
  }
}

class MashupExhalable {
  constructor(exhalable, spaceTags) {
    this.exhalable = exhalable
    this.spaceTags = spaceTags
  }
  each(iteratee) {
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
  }
  map(iteratee) {
    return _.map(
      this.exhalable,
      function (value, key) {
        try {
          return iteratee(modifyKeyValue(this.spaceTags, value), key.split('|'))
        } catch (e) {
          console.warn(
            'MashupExhalable.map error at [' + key + ']: ' + e.message
          )
          throw e
        }
      },
      this
    )
  }
}

// space name 修改成 tag
function modifyKeyValue(spaceTags, value) {
  const modifyKeyValue = {}
  _.each(spaceTags, function (tag, tagKey) {
    modifyKeyValue[tag] = value[tagKey]
  })
  return modifyKeyValue
}
/* end mashup exhaler */

/* start inhaler */
class Inhaler {
  constructor() {
    this.param = {
      space: '',
      index: {},
      data: [],
    }
    this.nextData = true
  }
  space(space) {
    this.param.space = space
    return this
  }
  index(key, value) {
    this.param.index[key] = key === 'date' ? value.replace(/\//g, '') : value
    return this
  }
  put(key, value) {
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
  }
  next() {
    this.nextData = true
    return this
  }
  inhale(callback, errCallback) {
    return new Promise((res, rej) =>
      ajax(
        {
          url: 'api/hippo/inhale',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(this.param),
        },
        {
          success(data) {
            res(data)
            if (callback) {
              callback(data)
            }
          },
          fail(data) {
            console.warn('hippo inhale fail: ' + data)
            rej(data)
            errCallback && errCallback()
          },
          exception(data) {
            console.warn('hippo inhale exception: ' + data)
            rej(data)
            errCallback && errCallback()
          },
        }
      )
    )
  }
  inhaleAppend(callback, errCallback) {
    return new Promise((res, rej) =>
      ajax(
        {
          url: 'api/hippo/inhaleAppend',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(this.param),
        },
        {
          success(data) {
            res(data)
            if (callback) {
              callback()
            }
          },
          fail(data) {
            console.warn('hippo inhaleAppend fail: ' + data)
            rej(data)
            errCallback && errCallback()
          },
          exception(data) {
            console.warn('hippo inhaleAppend exception: ' + data)
            rej(data)
            errCallback && errCallback()
          },
        }
      )
    )
  }
}
/* end inhaler */

export const hippo = {
  version: '0.4',
  queryIndex,
  getStructure,
  newSimpleExhaler() {
    return new SimpleExhaler()
  },
  newMashupExhaler() {
    return new MashupExhaler()
  },
  newInhaler() {
    return new Inhaler()
  },
}
