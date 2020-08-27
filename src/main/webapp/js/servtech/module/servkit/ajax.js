import servkit from './servkit.js'
import { currCtx } from './appFunc.js'

const doc = window.document

/**
 * 確認檔案已是否存在
 * @memberof module:servkit
 * @param {String} source 檔案的位址url
 * @returns {Boolean} 若已存在回傳true若沒有則傳false
 */
function scriptExistInPage(source) {
  return (
    Array.from(window.document.scripts).find(
      (script) => script.src && script.src === source
    ) !== undefined
  )
}
/**
 * 載入一維陣列內的JS檔案
 * @memberof module:servkit
 * @param {Array} dependentSources 要載入的JS路徑
 * @param {Function} onloadCallback 載入完成後執行的函式
 */
function requireJs(dependentSources, onloadCallback) {
  if (!dependentSources.length && onloadCallback) {
    return onloadCallback()
  }
  let domScript
  const source = servkit.rootPath + dependentSources[0]
  if (scriptExistInPage(source)) {
    if (debugState) {
      console.info('已存在 - ' + source)
    }
    requireJs(dependentSources.slice(1), onloadCallback)
  } else {
    domScript = doc.createElement('script')
    domScript.src = source
    domScript.onloadDone = false
    domScript.onload = function () {
      domScript.onloadDone = true
      requireJs(dependentSources.slice(1), onloadCallback)
    }
    domScript.onreadystatechange = function () {
      if (domScript.readyState === 'loaded' && !domScript.onloadDone) {
        domScript.onloadDone = true
        requireJs(dependentSources.slice(1), onloadCallback)
      }
    }
    doc.getElementsByTagName('head')[0].appendChild(domScript)
  }
}

/**
 * 載入二維陣列內的JS檔案
 * @memberof module:servkit
 * @param {Array} independentSourceGroup 要載入的JS路徑
 * @param {Function} allJsOnloadCallback 載入完成後執行的函式
 */
function requireJsAsync(independentSourceGroup, allJsOnloadCallback) {
  Promise.all(
    independentSourceGroup.map(
      (srcList) => new Promise((res) => requireJs(srcList, res))
    )
  ).then(() => {
    if (allJsOnloadCallback) {
      allJsOnloadCallback()
    }
  })
}

/**
 * 抓取資料的狀態代碼與相對應的行為
 * @memberof module:servkit
 * @param {any} parsedResponse 資料
 * @param {Function} cb callback
 * @param {String} textStatus 資料抓取的狀態
 * @param {XMLHttpRequest} jqXHR XMLHttpRequest
 * @param {Object} ajaxConfig (含contentType, type, url, ...)
 */
function responseRule(
  resp,
  cb,
  textStatus,
  jqXHR,
  ajaxConfig = {
    url: '---',
  }
) {
  let parsedResponse = resp
  if (jqXHR) {
    const contentType = jqXHR.getResponseHeader('Content-Type')
    if (contentType && contentType.startsWith('application/json')) {
      if (typeof parsedResponse === 'string') {
        parsedResponse = JSON.parse(resp)
      }
    }

    // 不是被 servkit.ajax 調用，而是某人直接把 resp 傳進來
  } else {
    try {
      parsedResponse = JSON.parse(resp)
    } catch (e) {
      // 錯誤的 json 格式，可能意味著本來就不用 json，所以不處理
    }
  }

  // 僅當作純文字檔案處理
  if (cb.plainText && !parsedResponse.type) {
    cb.plainText(parsedResponse)
    return
  }

  switch (parsedResponse.type) {
    case 0: // success!!
      typeof cb === 'function'
        ? cb(parsedResponse.data, textStatus, jqXHR)
        : cb.success(parsedResponse.data, textStatus, jqXHR)
      break
    case 1: // fail...
      cb.fail
        ? cb.fail(parsedResponse.data, textStatus, jqXHR)
        : console.warn(
            '請求(' + ajaxConfig.url + ')錯誤未處理: ' + parsedResponse.data
          )
      break
    case 2: // you need to login first!!
      console.log(window.location.search)
      window.location.href =
        servkit.rootPath + '/login.html' + window.location.search
      break
    case 3: // license expired!!
      window.location.href =
        servkit.rootPath + '/index.html#licenseexpired.html'
      break
    case 4: // you need to validate first!!
      window.location.href = servkit.rootPath + '/validate.html'
      break
    case 999: // exception, please backend check if bugs exist??
      cb.exception
        ? cb.exception(parsedResponse.data, textStatus, jqXHR)
        : console.warn(
            '後端(' + ajaxConfig.url + ')發生錯誤: ' + parsedResponse.data
          )
      break
    default:
      console.warn(
        '後端(' + ajaxConfig.url + ')回傳值沒有按照規則走，請確認...',
        parsedResponse
      )
      break
  }
}

/**
 * 透過AJAX抓取資料
 * @memberof module:servkit
 * @param {Object} ajaxConfig (含contentType, type, url, ...)
 * @param {Function} cb callback
 */
function ajax(ajaxConfig, cb) {
  return $.ajax(ajaxConfig)
    .done(function (resp, textStatus, jqXHR) {
      responseRule(resp, cb, textStatus, jqXHR, ajaxConfig)
    })
    .fail(function (jqXHR, textStatus, err) {
      cb.error && cb.error(jqXHR, textStatus, err)
    })
    .always(function (resOrJqXHR, textStatus, jqXHROrErr) {
      cb.always && cb.always(resOrJqXHR, textStatus, jqXHROrErr)
    })
}

function fetchDbData(table, option = {}) {
  if (!table) {
    console.warn('fetchDbData 的參數 table 是必須的')
    return
  }
  return new Promise((res, rej) =>
    ajax(
      {
        url: 'api/getdata/db',
        type: 'POSt',
        contentType: 'application/json',
        data: JSON.stringify(
          Object.assign(
            { table },
            _.pick(option, ['columns', 'whereClause', 'whereParams'])
          )
        ),
      },
      {
        success(data) {
          res(data)
        },
        fail(data) {
          rej(data)
        },
        exception(data) {
          rej(data)
        },
      }
    )
  )
}

function fetchParamJsonFile(filePath) {
  if (!filePath) {
    console.warn('fetchParamJsonFile 的參數 filePath 是必須的')
    return
  }
  return new Promise((res, rej) =>
    ajax(
      {
        url: 'api/getdata/custParamJsonFile',
        type: 'GET',
        contentType: 'application/json',
        data: {
          filePath,
        },
      },
      {
        success(data) {
          res(JSON.parse(data))
        },
        fail(data) {
          rej(data)
        },
      }
    )
  )
}

function fetchParamFile(filePath) {
  if (!filePath) {
    console.warn('custParamFile 的參數 filePath 是必須的')
    return
  }
  return new Promise((res, rej) =>
    ajax(
      {
        url: 'api/getdata/custParamFile',
        type: 'GET',
        contentType: 'application/json',
        data: {
          filePath,
        },
      },
      {
        success(data) {
          res(data)
        },
        fail(data) {
          rej(data)
        },
      }
    )
  )
}

function fetchUserData() {
  return new Promise((res, rej) =>
    ajax(
      {
        url: 'api/user/read',
        type: 'GET',
      },
      {
        success(data) {
          res(data)
        },
        fail(data) {
          rej(data)
        },
      }
    )
  )
}

function importPageScript() {
  const { app, func } = currCtx()
  if (!app || !func) {
    return
  }
  return import(`../../../../app/${app}/module/page/${func}.js`)
    .then((module) => module.default())
    .catch((err) => console.warn('import page module fail...', err))
}
function fetchTableSchema(tableModel) {
  return new Promise((res, rej) =>
    ajax(
      {
        url: `api/stdcrud/schema?${tableModel}`,
        type: 'GET',
      },
      {
        success(data) {
          res(data)
        },
        fail(data) {
          rej(data)
        },
      }
    )
  )
}

export {
  requireJs,
  requireJsAsync,
  responseRule,
  ajax,
  importPageScript,
  fetchDbData,
  fetchParamJsonFile,
  fetchParamFile,
  fetchUserData,
  fetchTableSchema,
}
