/**
 * 用法：<br>
 * &nbsp   i18n(key) 即可取得環境目前語言對應的字串<br>
 *  <br>
 *  語言包來源有二：<br>
 *  &nbsp  1. 當登入成功的時候，會載入 langs/languages.tsv 的語言包作為「全域語言」<br>
 *  &nbsp  2. 當頁面第一次進到某 app 的時候，會載入 app/{某 app}/langs/languages.tsv 作為該「app 語言」<br>
 *  <br>
 *  查詢方式：<br>
 *  &nbsp  1. 當你在某 app 下的時候用 i18n(key) 取得語言字串時
 *       會首先從「app 語言」查，若無則再查「全域語言」，再無將回傳 key<br>
 *  &nbsp  2. 若不是在 app 下，則只會查「全域語言」，若無將回傳 key<br>
 *  <br>
 *  語言包因為一些歷史因素，每個 key 一定都會帶「i18n_ServCloud_」前綴字元<br>
 *  而此模組傳入的 key 為求簡潔，必須省略該前綴<br>
 * @module i18n
 */
;(function (global, servkit) {
  var langTag = servkit.getCookie('lang')
  /* {
     _global: {
        zh_tw: {
          key: value
        },
        zh: {
          key: value
        }
     },
     app: {
        zh_tw: {
          key: value
        },
        zh: {
          key: value
        }
     }
   } */
  var langTable = {}
  var globalKey = '_global'
  var currApp = globalKey
  var servcloudPrefix = 'i18n_ServCloud_'

  var changeLineRegex = /\r\n|\n/
  var tabRegex = /\t/
  var urlAppRegex = /^#app\/([^]+)\/function\/.*/

  var changeLangListeners = []
  var listenerKey = 'servcloud_i18n_cb'

  var langTableProcessing = false
  /**
   * 利用後墜字抓取該語言的相應字串
   * @memberof module:i18n
   * @param {String} suffix 後墜字
   * @returns {String} 該語言的字串
   */
  function i18n(suffix) {
    var key = servcloudPrefix + suffix

    if (
      currApp &&
      langTable[currApp] &&
      langTable[currApp][langTag] &&
      langTable[currApp][langTag][key]
    ) {
      return langTable[currApp][langTag][key]
    }

    if (
      langTable[globalKey] &&
      langTable[globalKey][langTag] &&
      langTable[globalKey][langTag][key]
    ) {
      return langTable[globalKey][langTag][key]
    }

    return key.substring(servcloudPrefix.length)
  }

  i18n.async = function (callback) {
    servkit
      .politeCheck()
      .until(function () {
        return !langTableProcessing
      })
      .thenDo(function () {
        callback(i18n)
      })
      .tryDuration(0)
      .start()
  }

  i18n.changeLang = function (tag) {
    langTag = tag
    _.each(changeLangListeners, function (listener) {
      // console.log(listener[listenerKey]);
      listener(i18n)
    })
  }

  i18n.available = function () {
    return !langTableProcessing
  }

  i18n.addChangeLangListener = function (fn, name) {
    if (!fn[listenerKey]) {
      fn[listenerKey] = name || 'no-name'
      changeLangListeners.push(fn)
    }
  }

  i18n.showListeners = function () {
    console.info(changeLangListeners)
  }

  function fetchAppLang(app) {
    if (langTable[app]) {
      return
    }

    langTableProcessing = true
    $.ajax({
      url:
        app === globalKey
          ? 'langs/languages.tsv'
          : 'app/' + app + '/langs/languages.tsv',
      type: 'GET',
    })
      .done(function (data) {
        if (data.type && data.type === 2) {
          window.location.href = servkit.rootPath
        } else {
          tsvIntoLangTable(data, app)
        }
      })
      .always(function () {
        langTableProcessing = false
      })
  }

  function tsvIntoLangTable(tsvContent, app) {
    var table = _.reduce(
      tsvContent.split(changeLineRegex),
      function (memo, line) {
        if (line.length === 0 || line.startsWith('#')) {
          return memo
        }
        memo.push(line.split(tabRegex))
        return memo
      },
      []
    )

    var langTags, langTagIndice

    langTable[app] = {}

    _.each(table, function (row, index) {
      if (index === 0) {
        langTags = row
        langTagIndice = _.range(1, row.length)
        _.each(langTagIndice, function (i) {
          langTable[app][langTags[i]] = {}
        })
      } else {
        var key = row[0]
        _.each(langTagIndice, function (i) {
          langTable[app][langTags[i]][key] = row[i]
        })
      }
    })

    // console.log(langTable);
  }

  function checkCurrApp() {
    var appRegexResult = location.hash.split('?')[0].match(urlAppRegex)
    if (appRegexResult) {
      currApp = appRegexResult[1]
    } else {
      currApp = globalKey
    }
  }

  $(window).on('hashchange', function () {
    checkCurrApp()
    if (currApp !== globalKey) {
      fetchAppLang(currApp)
    }
  })

  // 馬上先去拿 global 和 currApp
  fetchAppLang(globalKey)
  checkCurrApp()
  if (currApp !== globalKey) {
    fetchAppLang(currApp)
  }

  global.i18n = i18n
})(this, servkit)
