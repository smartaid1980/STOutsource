import { getCookie } from './servkit/util.js'
import { ajax } from './servkit/ajax.js'
import { currCtx } from './servkit/appFunc.js'

/**
 * 用法：
 *    i18n(key) 即可取得環境目前語言對應的字串
 *
 * 語言包來源有二：
 *  1. 當登入成功的時候，會載入 langs/languages.tsv 的語言包作為「全域語言」
 *  2. 當頁面第一次進到某 app 的時候，會載入 app/{某 app}/langs/languages.tsv 作為該「app 語言」
 *
 * 語言包內容：
 *  第一行為語系列表，彼此用tab分隔，開頭加一個tab
 *  e.g. [tab]zh-tw[tab]zh[tab]en
 *
 *  底下每一行都是一個key的各語系翻譯，第一個字為key，後面的字照著語系列表的順序為該語言的翻譯，每個字之間用tab分隔
 *  e.g. i18n_ServCloud_No_Data	無資料	无资料	No Data
 *
 * 查詢方式：
 *  1. 當你在某 app 下的時候用 i18n(key) 取得語言字串時
 *     會首先從「app 語言」查，若無則再查「全域語言」，再無將回傳 key
 *  2. 若不是在 app 下，則只會查「全域語言」，若無將回傳 key
 *
 * 其他：
 *  語言包因為一些歷史因素，每個 key 一定都會帶「i18n_ServCloud_」前綴字元
 *  而此模組傳入的 key 為求簡潔，必須省略該前綴
 * @module i18n
 */

let currLang = getCookie('lang')
/* 
langTable = {
  _global: {
    zh_tw: {
      [key]: value
    },
    zh: {
      [key]: value
    }
  },
  [appId]: {
    zh_tw: {
      [key]: value
    },
    zh: {
      [key]: value
    }
  }
} 
*/
const langMap = {}
const globalKey = '_global'
const servcloudPrefix = 'i18n_ServCloud_'
let currApp = globalKey

const lineBreakRegex = /\r\n|\n/
const tabRegex = /\t/

const changeLangListeners = []
const listenerKey = 'servcloud_i18n_cb'

let langTableProcessing = false
let langPromise

function getAppLangTag(appId, langTag, key) {
  return appId &&
    langMap[appId] &&
    langMap[appId][langTag] &&
    langMap[appId][langTag][key]
    ? langMap[appId][langTag][key]
    : null
}

function getGlobalLangTag(langTag, key) {
  return langMap[globalKey] &&
    langMap[globalKey][langTag] &&
    langMap[globalKey][langTag][key]
    ? langMap[globalKey][langTag][key]
    : null
}
/**
 * 利用後墜字抓取該語言的相應字串
 * @memberof module:i18n
 * @param {String} suffix 後墜字
 * @returns {String} 該語言的字串
 */
function i18n(suffix) {
  const key = servcloudPrefix + suffix
  return (
    getAppLangTag(currApp, currLang, key) ||
    getGlobalLangTag(currLang, key) ||
    key
  )
}

i18n.async = function (callback) {
  return callback ? langPromise.then(callback) : langPromise
}

i18n.available = function () {
  return !langTableProcessing
}

i18n.changeLang = function (lang) {
  currLang = lang
  changeLangListeners.forEach((listener) => listener())
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

function getLangUrl(appId) {
  return appId === globalKey
    ? 'langs/languages.tsv'
    : `app/${appId}/langs/languages.tsv`
}

function fetchAppLang(appId) {
  if (langMap[appId]) {
    return
  }

  langTableProcessing = true
  return (langPromise = fetch(getLangUrl(appId))
    .then((res) => res.text())
    .then((data) => {
      updateLangMap(data, appId)
      langTableProcessing = false
    }))
}

function updateLangMap(tsvContent, appId) {
  const rowDataList = tsvContent.split(lineBreakRegex).reduce((acc, line) => {
    if (line.length && !line.startsWith('#')) {
      acc.push(line.split(tabRegex))
    }
    return acc
  }, [])

  let langTagIndexMap

  langMap[appId] = {}

  rowDataList.forEach(([key, ...langTagList], index) => {
    if (index) {
      _.each(
        langTagIndexMap,
        (i, lang) => (langMap[appId][lang][key] = langTagList[i])
      )
    } else {
      langTagIndexMap = Object.fromEntries(
        langTagList.map((lang, key) => [lang, key])
      )
      _.each(langTagIndexMap, (i, lang) => (langMap[appId][lang] = {}))
    }
  })
}

function updateCurrApp() {
  const currAppFunc = currCtx()
  currApp = currAppFunc.app || globalKey
}

function updateAppLang() {
  updateCurrApp()
  if (currApp !== globalKey) {
    fetchAppLang(currApp)
  }
}

$(window).on('hashchange', updateAppLang)

// 馬上先去拿 global 和 currApp
fetchAppLang(globalKey)
updateAppLang()

export default i18n
