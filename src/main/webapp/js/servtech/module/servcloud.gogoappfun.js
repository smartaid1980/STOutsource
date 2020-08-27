import { requireJs, requireJsAsync, ajax } from './servkit/ajax.js'
import servkit from './servkit/servkit.js'
import i18n from './servcloud.i18n.js'
import { appFunExist, currCtx } from './servkit/appFunc.js'
import { getCookie } from './servkit/util.js'

// paramObj 需出現的參數及其形態，檢查用
const paramObjFunList = ['gogo']
const paramObjObjList = ['util', 'contextMenu', 'preCondition']
const paramObjArrList = ['dependencies', 'delayCondition']

const commonsCached = {}

// 延後執行的可能情況們
const delayCondition = {
  machineList: servkit.machinesGot,
  machineLightList: servkit.machineLightsGot,
  machineBrandList: servkit.machineBrandGot,
  machinePlantAreaList: servkit.machinePlantAreaGot,
  plantAreaList: servkit.plantAreaGot,
  appFuncBindingBrandMachineList: servkit.appFuncBindingBrandMachineGot,
}
const delayConditionPromiseMap = {
  machineList: servkit.fetchMachineDataPromise,
  machineLightList: servkit.fetchMachineLightDataPromise,
  machineBrandList: servkit.fetchMachineBrandDataPromise,
  machinePlantAreaList: servkit.fetchMachinePlantAreaDataPromise,
  plantAreaList: servkit.fetchPlantAreaDataPromise,
  appFuncBindingBrandMachineList:
    servkit.fetchAppFuncBindingBrandMachineMapPromise,
}

// url 中取出 app id 與 function id 的 Regex
// var urlAppFunRegex = /^#app\/([^\/]+)\/function\/[^\/]+\/(.+?).html/
// var urlAppFunRegex = /^#app\/([^/]+)\/function\/[^/]+\/(.+?).html/;

// localStorage 中暫存傳遞參數的 item key
const localStorageItemKey = 'GoGoAppFun'

// 執行中頁面的 app/funciton id
let appId
let funId

// 滑鼠右鍵選單，位於 index.html body > #main 中
const $gogoCtxMenu = $('#gogo-ctx-menu')
let anotherList
let ctxMenuTarget

// 共用函式庫
// 全域的來自 js/servtech/commons/*.js
// 區域(各自app)的來自 app/{appId}/commons/*.js
// var commons = {};

// 先驗證一下有沒有 localStorage
if (!localStorage) {
  console.warn("Browser is not fashion enough, there's no localStorage...")
}

// 把該尻掉的預設動作都尻掉，然後點下去要 gogo 的動作
$gogoCtxMenu
  .on('click', 'a', function (e) {
    e.preventDefault()
    var index = parseInt(e.target.dataset.index)
    var anotherInfo = anotherList[index]
    var gogoParam = {
      appId: anotherInfo.appId,
      funId: anotherInfo.funId,
      currentTab: anotherInfo.currentTab,
      graceTag: anotherInfo.graceTag,
      graceParam: anotherInfo.graceParamBuilder(ctxMenuTarget),
    }

    gogoAnother(gogoParam)
  })
  .on('contextmenu', function (e) {
    e.preventDefault()
  })

$(window)
  .on('click', function (e) {
    // 點擊後必須把 gogoContextMenu 關掉
    var targetEle = e.target
    // eslint-disable-next-line
    while (true) {
      if (!targetEle) {
        $gogoCtxMenu.hide()
        break
      }
      targetEle = targetEle.parentNode
    }
  })
  .on('contextmenu', function (e) {
    // 預設 contextmunu 關掉
    e.preventDefault()
  })

function isObject(obj) {
  return _.isObject(obj) && !_.isArray(obj) && !_.isFunction(obj)
}

function paramObjChecker(paramObj) {
  paramObjFunList.forEach((funcKey) => {
    if (!paramObj[funcKey]) {
      return
    }
    if (!_.isFunction(paramObj[funcKey])) {
      throw Error({
        name: 'ParameterError',
        message: `"${funcKey}" must be a function...`,
      })
    }
  })

  paramObjObjList.forEach((objKey) => {
    if (!paramObj[objKey]) {
      return
    }
    if (!isObject(paramObj[objKey])) {
      throw Error({
        name: 'ParameterError',
        message: `"${objKey}" must be a key-value object...`,
      })
    }
    if (
      objKey === 'preCondition' &&
      Object.values(paramObj[objKey]).some((fn) => !_.isFunction(fn))
    ) {
      throw new Error({
        name: 'ParameterError',
        message: `"${objKey}" must be a key-value object, and all values must be Function...`,
      })
    }
  })

  paramObjArrList.forEach((arrKey) => {
    if (!paramObj[arrKey]) {
      return
    }
    if (!_.isArray(paramObj[arrKey])) {
      throw Error({
        name: 'ParameterError',
        message: `"${arrKey}" must be a js array...`,
      })
    }

    if (arrKey === 'delayCondition') {
      paramObj[arrKey].forEach((key) => {
        if (!_.has(delayCondition, key)) {
          throw Error({
            name: 'ParameterError',
            message: `"${arrKey}" cannot include key: ${key}...`,
          })
        }
      })
    }
  })
}

function contextMenuEvent(e) {
  e.preventDefault()
  var posStyle = {}

  if (e.pageX > window.innerWidth - $gogoCtxMenu.outerWidth()) {
    posStyle.left = ''
    posStyle.right = window.innerWidth - e.pageX
  } else {
    posStyle.left = e.pageX
    posStyle.right = ''
  }
  if (e.pageY > window.innerHeight - $gogoCtxMenu.height()) {
    posStyle.top = ''
    posStyle.bottom = window.innerHeight - e.pageY
  } else {
    posStyle.top = e.pageY
    posStyle.bottom = ''
  }

  $gogoCtxMenu.css(posStyle).show()

  ctxMenuTarget = e.target
}

function anotherListHtml() {
  return _.map(anotherList, function (another, i) {
    if (appFunExist(another.appId, another.funId)) {
      return (
        '<li>' +
        '<a href="#" data-index="' +
        i +
        '">' +
        another.menuText +
        '</a>' +
        '</li>'
      )
    } else {
      console.warn(
        'gogoAnother parameter appId:' +
          another.appId +
          ' or funId:' +
          another.funId +
          ' incorrect!!'
      )
      return ''
    }
  }).join('')
}

function pushLocalStorageInfo(gogoParam) {
  var info = JSON.parse(localStorage.getItem(localStorageItemKey)) || {}
  var graceTag = gogoParam.graceTag || 'default'

  if (isObject(gogoParam.graceParam)) {
    gogoParam.graceParam.fromAppId = appId
    gogoParam.graceParam.fromFunId = funId
    gogoParam.graceParam.graceTag = graceTag
    info[gogoParam.appId + '/' + gogoParam.funId] = gogoParam.graceParam
  } else {
    info[gogoParam.appId + '/' + gogoParam.funId] = {
      fromAppId: appId,
      fromFunId: funId,
      graceTag: graceTag,
    }
  }

  localStorage.setItem(localStorageItemKey, JSON.stringify(info))
}

function popLocalStorageInfo() {
  const info = JSON.parse(localStorage.getItem(localStorageItemKey))
  if (info) {
    var currAppFunInfo = info[appId + '/' + funId]

    if (currAppFunInfo) {
      delete info[appId + '/' + funId]
      localStorage.setItem(localStorageItemKey, JSON.stringify(info))
    }

    return currAppFunInfo
  }
}

function gogoAnother(gogoParam) {
  pushLocalStorageInfo(gogoParam)

  var gotoUrl =
    servkit.rootPath +
    '/index.html#app/' +
    // (gogoParam.search ? '?' + _.map(gogoParam.graceParam, function (val, key) {
    //   return key + "=" + val;
    // }).join("&") : '') + '#app/' +
    gogoParam.appId +
    '/function/' +
    getCookie('lang') +
    '/' +
    gogoParam.funId +
    '.html'
  if (gogoParam.currentTab) {
    window.location.href = gotoUrl
  } else {
    window.open(gotoUrl, '_blank')
  }
}

function GoGoContext() {
  this.appId = appId
  this.funId = funId
}

function fetchDashboardApp() {
  return new Promise((res) =>
    ajax(
      {
        url: 'api/js/containsDashboardApp',
        type: 'GET',
      },
      {
        success(data) {
          res(data)
        },
      }
    )
  )
}
function fetchCommons(appId) {
  return new Promise((res, rej) =>
    requireJs([`/api/js/${appId}`], function () {
      try {
        const result = {}
        const bindingFn = window[`servcloud_${appId}_commons`]
        if (bindingFn) {
          bindingFn(result)
          delete window[`servcloud_${appId}_commons`]
        }
        commonsCached[appId] = result
        res(result)
      } catch (error) {
        rej(error)
      }
    })
  ).catch((error) => {
    console.warn(`appId: ${appId}`)
    console.warn(error)
  })
}
function initOverAllCommons() {
  return commonsCached.overall
    ? Promise.resolve(commonsCached.overall)
    : fetchCommons('overall')
}
async function initCommons(currAppId) {
  const isCached = !!commonsCached[currAppId]

  // 去跟後端/cache要 overall commons JS function
  const commonsOverall = await initOverAllCommons()

  if (!isCached && currAppId === 'Dashboard') {
    // Dashboard 取得 commons 的方式比較特別，得找出所有有 dashboard 的 app 然後把 commons 都配置好
    const appIdList = await fetchDashboardApp()
    // 過濾出沒在 commons 中的 appId 組成準備要 require 的格式
    const commonsAppIdList = appIdList.filter((appId) => !commonsCached[appId])

    // commonsApiList.length === 0 時，Promise.all會直接變resolve
    await Promise.all(commonsAppIdList.map(fetchCommons)).then(() => {
      commonsCached['Dashboard'] = _.pick(commonsCached, appIdList)
    })
  } else if (!isCached) {
    // 取得此 app 的 commons
    await fetchCommons(currAppId)
  }

  return Object.assign({}, commonsOverall, commonsCached[currAppId])
}

async function initPreCondition(context, preCondition) {
  if (_.isEmpty(preCondition)) {
    return {}
  }
  const preConditionKeys = Object.keys(preCondition)
  const preConditionFuncs = Object.values(preCondition)
  const promiseList = preConditionFuncs.map((func) => {
    return new Promise((resolve) => func.call(context, resolve))
  })
  const result = {}
  return await Promise.all(promiseList)
    .then((responseArr) => {
      let preConditionKey
      responseArr.forEach((response, index) => {
        preConditionKey = preConditionKeys[index]
        result[preConditionKey] = response
      })
      return result
    })
    .catch((err) => {
      console.warn(err)
    })
}

function renderAppFunc() {
  try {
    // appName and funcName i18n
    const pageTitleHtml = `<h1 class="page-title txt-color-blueDark">
      <i class="fa-fw fa fa-cog"></i>
      <label class="app-name">${servkit.appMap[appId][funId].app_name}</label>
      <span> > ${servkit.appMap[appId][funId].func_name} </span>
    </h1>`
    const $pageTitle = $('.page-title')
    if ($pageTitle.length) {
      $pageTitle.replaceWith(pageTitleHtml)
    } else {
      $('#content').prepend(pageTitleHtml)
    }
  } catch (e) {
    console.warn(`Can not find ${appId}.${funId} in servkit.appMap.`)
  }
}

async function callGoGo(paramObj, context) {
  const ctxMenuParam = paramObj.contextMenu
  const delayConditionPromiseList =
    paramObj.delayCondition && paramObj.delayCondition.length
      ? paramObj.delayCondition.map((name) => delayConditionPromiseMap[name])
      : []
  let commons
  let preCon

  // 平台的前置作業
  await Promise.all([
    servkit.syncAppListPromise,
    new Promise((res) => i18n.async(res)),
    ...delayConditionPromiseList,
  ])

  // 共通函式
  commons = await initCommons(context.appId)
  context.commons = _.mapObject(commons, function bindContext(value) {
    return _.isFunction(value) ? value.bind(context) : value
  })

  // 頁面所需前置作業
  preCon = await initPreCondition(context, paramObj.preCondition)
  context.preCon = preCon

  renderAppFunc()

  // 頁面主函式
  paramObj.gogo.call(window, context)

  // Go to another 右建選單 setup
  if (ctxMenuParam) {
    anotherList = ctxMenuParam.anotherList
    $gogoCtxMenu.find('ul').html(anotherListHtml())
    $(ctxMenuParam.targetSelector)
      .on('contextmenu', ctxMenuParam.filterSelector, contextMenuEvent)
      .find(ctxMenuParam.filterSelector)
      .css('cursor', 'pointer')
  }
}

function fetchDependencies(dependencies) {
  const isEmpty = _.isEmpty(dependencies)
  return new Promise((res) => {
    if (isEmpty) {
      res()
    } else if (_.isArray(dependencies[0])) {
      requireJsAsync(
        dependencies.filter((arr) => !_.isEmpty(arr)),
        res
      )
    } else {
      requireJs(dependencies, res)
    }
  })
}

async function GoGoAppFun(paramObj) {
  // 執行參數
  const currAppFunc = currCtx()
  ;({ app: appId, func: funId } = currAppFunc)

  // 非 app/function 就直接離開
  if (!appId || !funId) {
    console.warn('GoGoAppFun只能在有app和func的畫面中執行')
    return
  }

  // 驗證一下參數
  try {
    paramObjChecker(paramObj)
  } catch (e) {
    console.warn(e)
    return
  }

  var graceParam = localStorage ? popLocalStorageInfo() : null
  var context = new GoGoContext()

  // util 移植
  _.extendOwn(context, paramObj.util)

  context.gogoAnother = function (gogoParam) {
    if (!localStorage) {
      console.warn('瀏覽器不支援 localStorage 無法執行 gogoAnother')
    } else if (appFunExist(gogoParam.appId, gogoParam.funId)) {
      gogoAnother.call(context, gogoParam)
    } else {
      console.warn(
        'gogoAnother parameter appId:' +
          gogoParam.appId +
          ' or funId:' +
          gogoParam.funId +
          ' incorrect!!'
      )
    }
  }

  // 如果是別頁傳來的就要將參數置入 context
  if (graceParam) {
    context.fromAppId = graceParam.fromAppId
    context.fromFunId = graceParam.fromFunId
    context.graceTag = graceParam.graceTag
    delete graceParam.fromAppId
    delete graceParam.fromFunId
    delete graceParam.graceTag
    context.isGraced = true
    context.graceParam = graceParam
  } else {
    context.isGraced = false
  }

  // 依賴套件載入完成後才 callGoGo
  await fetchDependencies(paramObj.dependencies)
  await callGoGo(paramObj, context)
}

GoGoAppFun.version = '2'

export default GoGoAppFun
