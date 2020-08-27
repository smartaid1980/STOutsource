function getRootPath() {
  const strFullPath = window.document.location.href
  const strPath = window.document.location.pathname
  const pos = strFullPath.indexOf(strPath)
  const prePath = strFullPath.substring(0, pos)
  const postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1)
  return prePath + postPath
}

/**
 * 取得cookie內容並以物件方式記錄
 * @memberof module:servkit
 * @param {String} key 物件的key值
 * @returns {Object} 取得結果
 */
function getCookie(key) {
  const cookieMap = _.reduce(
    window.document.cookie.split(';'),
    function (cookieMap, cookie) {
      const cookieSplitted = cookie.trim().split('=')
      cookieMap[cookieSplitted[0]] = cookieSplitted[1]
      return cookieMap
    },
    {}
  )
  return cookieMap[key]
}

/**
 * 取得location.serach 中的參數值
 * @memberof module:servkit
 * @param {String} key 參數的key
 * @returns {String} 參數的值
 */
function getURLParameter(key) {
  return (
    decodeURIComponent(
      (new RegExp('[?|&]' + key + '=' + '([^&;]+?)(&|#|;|$)').exec(
        location.hash
      ) || [null, ''])[1].replace(/\+/g, '%20')
    ) || null
  )
}

// 自然排序
function naturalSort(arr, sortBy) {
  if (!_.isArray(arr)) {
    console.warn('naturalSort 的參數 arr 應該是 Array')
    return arr
  }
  return [...arr].sort((a, b) => {
    if (!sortBy) {
      return naturalCompareValue(a, b)
    } else if (_.isString(sortBy)) {
      return naturalCompareValue(a[sortBy], b[sortBy])
    } else if (_.isFunction(sortBy)) {
      return naturalCompareValue(sortBy(a), sortBy(b))
    } else {
      console.warn('naturalSort 的參數 sortBy 應該是字串或函式')
      return naturalCompareValue(a, b)
    }
  })
}

function matchResult2CompareArr(matchResult) {
  return [matchResult[1] || Infinity, matchResult[2] || '']
}
/**
 * 字串排序：將文字與數字分開，先排文字部分再排數字
 * @memberof module:servkit
 * @param {String | Object} a 前一個字串
 * @param {String | Object} b 後一個字串
 * @returns {Number} 前後的差距
 */
function naturalCompareValue(a, b) {
  const strA = _.isObject(a) ? a.name?.toString() : a.toString()
  const strB = _.isObject(b) ? b.name?.toString() : b.toString()
  const regEx = /(\d+)|(\D+)/g
  const segmentListA = Array.from(
    replaceChineseNumber(strA).matchAll(regEx)
  ).map(matchResult2CompareArr)
  const segmentListB = Array.from(
    replaceChineseNumber(strB).matchAll(regEx)
  ).map(matchResult2CompareArr)

  while (segmentListA.length && segmentListB.length) {
    const segmentA = segmentListA.shift()
    const segmentB = segmentListB.shift()
    // 第一個元素是數字，第二個元素是文字
    const compareResult =
      segmentA[0] - segmentB[0] || segmentA[1].localeCompare(segmentB[1])
    if (compareResult) return compareResult
  }

  return segmentListA.length - segmentListB.length
}

// 只作用於1~10 十一會被替換為101，當有兩位數以上建議以阿拉伯數字做編號
function replaceChineseNumber(str) {
  return str
    .replace(/一/g, 1)
    .replace(/二/g, 2)
    .replace(/三/g, 3)
    .replace(/四/g, 4)
    .replace(/五/g, 5)
    .replace(/六/g, 6)
    .replace(/七/g, 7)
    .replace(/八/g, 8)
    .replace(/九/g, 9)
    .replace(/十/g, 10)
}

/**
 * 以先排name中的字串部分後，再排數字部分
 * @memberof module:servkit
 * @param {Object} map 預計排序的物件
 * @returns {Object} 排序後的物件
 */
function map2NaturalComparedObjArray(map) {
  return _.map(map, function (name, key) {
    return {
      key: key,
      name: name,
    }
  }).sort(naturalCompareValue)
}

function hasOwnProperty(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export {
  getRootPath,
  naturalCompareValue,
  replaceChineseNumber,
  map2NaturalComparedObjArray,
  getCookie,
  getURLParameter,
  naturalSort,
  hasOwnProperty,
}
