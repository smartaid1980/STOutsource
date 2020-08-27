/**
 *  目的：
 *    1. 建立 ServCloud app 的 JS code 執行環境
 *    2. 提供一個任意帶參數跳轉頁面的機制
 *
 *  =============================================
 *  =====  GoGoAppFun 函式執行需傳入的參數  =====
 *  =============================================
 *    GoGoAppFun({
 *      // ---必填---
 *      // 當 GoGoAppFun 前置動作處理完後即會調用此方法
 *      // 您就可在此方法中開始初始化該 app function 頁面
 *      // 所帶的參數 context 內可以：
 *      //   1. 辨別是否為恩典，也就是透過其他頁面 gogoAnothor 過來的 (isGraced)
 *      //   2. 取得此恩典的類型，可以在很多種不同參數類型的情況下用來加以判別 (graceTag)
 *      //   3. 取得受到恩典的參數 (graceParam)
 *      //   4. 其他東西自己去看下面 context 的註解...
 *      gogo: function (context) {
 *
 *      },
 *
 *      // ---可選---
 *      // 任何在此的東西都會被嵌進 context 當中傳給 gogo callback
 *      // 可把 gogo 當中會共用到的函式或變數放此
 *      // 是否真的能夠把共用的都放進來就取決於個人功力囉，呵呵呵！
 *      util: {
 *
 *      },
 *
 *      // ---可選---
 *      // 等同幫你做 servkit.requireJs 或 servkit.requireJsAsync，就看你是傳一維還是二維
 *      dependencies: [
 *
 *      ],
 *
 *      // ---可選---
 *      // 指定延遲執行的等待情況，待這些情況都完成後才會執行 gogo
 *      delayCondition: ['condition name', ...],
 *
 *      // ---可選---
 *      // 右鍵選單選項，一個快速列舉 gogoAnother 清單的設定
 *      contextMenu: {
 *        targetSelector: 'container element',
 *        filterSelector: 'triggered element',
 *        anotherList: [
 *          {
 *            appId: 'willGoToAppId',
 *            funId: 'willGoToAppFunId',
 *            menuText: 'Go to willGoToAppFunId', // 選單要顯示的文字
 *            currentTab: true/false, // optional(default fasle)
 *            graceTag: 'tagName',
 *            graceParamBuilder: function (targetEle) {
 *              // 以 target element 建一個 grace param 後回傳
 *              return any js object you will pass;
 *            }
 *          },
 *          ...
 *        ]
 *      },
 *
 *      // ---可選---
 *      // 前提條件載入，任何非同步才能取得的資料可在此列舉
 *      // 全部都 done 之後才會執行 gogo
 *      // 屆時 context.preCon 當中就會包含此中所有的 key，對應物件即是 done 傳入的
 *      preCondition: {
 *        firstCon: function (done) {
 *          setTimeout(function () {
 *            done(yourResultObject)
 *          }, 5000);
 *        },
 *        secondCon: function (done) {
 *          setTimeout(function () {
 *            done(yourResultObject)
 *          }, 8000);
 *        }
 *      }
 *    });
 *
 *  ==================================================
 *  =====  gogo 執行的時候都會帶有 context 參數  =====
 *  ==================================================
 *    {
 *      // 若由其他頁面執行 context.gogoAnother 帶過來的，則 isGraced 為 true
 *      // 以 grace 命名表示此頁是透過恩典而被開起的
 *      isGraced: true/false,
 *
 *      // isGraced === true 時存在
 *      // graceTag:   gogoAnother 的時候指定的標籤，在不同頁面傳來不同形式的參數時可用來進行判別
 *      // graceParam: gogoAnother 帶來的參數
 *      graceTag: 'tagName',
 *      graceParam: ...,
 *
 *      // 此頁面的 app/function
 *      appId: ...,
 *      funId: ...,
 *
 *      // isGraced === true 時存在
 *      // 是從哪個 app/function 傳來的恩典
 *      fromAppId: ...,
 *      fromFunId: ...,
 *
 *      // 可透過此調用方法做頁面導向
 *      gogoAnother: function ({
 *        appId: 'willGoToAppId',
 *        funId: 'willGoToAppFunId',
 *        currentTab: true/false, // optional(default fasle)
 *        graceTag: 'tagName',
 *        graceParam: any js object you will pass
 *      }),
 *
 *      // 一系列在執行 GoGoAppFun 傳入的參數中的 util 內容物
 *      util1: ...,
 *      util2: ...,
 *      util3: ...,
 *         .
 *         .
 *         .
 *      utiln: ...,
 *
 *      // 從「平台」和「該 App」的 commons 資料夾底下的所有檔案 export 出來的所有東西
 *      commons: {
 *        key: value,
 *         .
 *         .
 *         .
 *      }
 *    }
 *
 */
;(function (global, $, _, servkit) {
  // 需出現的參數，檢查用
  var paramObjFunSet = ['gogo']
  var paramObjObjSet = ['util', 'contextMenu', 'preCondition']
  var paramObjArrSet = ['dependencies', 'delayCondition']

  // 延後執行的可能情況們
  var delayCondition = {
    machineList: servkit.machinesGot,
    machineLightList: servkit.machineLightsGot,
    machineBrandList: servkit.machineBrandGot,
    machinePlantAreaList: servkit.machinePlantAreaGot,
    plantAreaList: servkit.plantAreaGot,
    appFuncBindingBrandMachineList: servkit.appFuncBindingBrandMachineGot,
  }

  // url 中取出 app id 與 function id 的 Regex
  // var urlAppFunRegex = /^#app\/([^\/]+)\/function\/[^\/]+\/(.+?).html/
  var urlAppFunRegex = /^#app\/([^/]+)\/function\/[^/]+\/(.+?).html/

  // localStorage 中暫存傳遞參數的 item key
  var localStorageItemKey = 'GoGoAppFun'

  // 執行中頁面的 app/funciton id
  var appId
  var funId

  // 滑鼠右鍵選單，位於 index.html body > #main 中
  var $gogoCtxMenu = $('#gogo-ctx-menu')
  var anotherList
  var ctxMenuTarget

  // 共用函式庫
  // 全域的來自 js/servtech/commons/*.js
  // 區域(各自app)的來自 app/{appId}/commons/*.js
  var commons = {}

  // 先驗證一下有沒有 localStorage
  if (!localStorage) {
    console.warn("Browser is not fashion enough, there's no localStorage...")
    return
  }

  // 去跟後端要 overall commons JS function
  servkit.requireJs(['/api/js/overall'], function () {
    commons.overall = {}
    window.servcloud_overall_commons(commons.overall)
    delete window.servcloud_overall_commons
  })

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

  $(global)
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
    _.each(paramObjFunSet, function (funcKey) {
      if (!_.isFunction(paramObj[funcKey])) {
        throw Error({
          name: 'ParameterError',
          message: '"' + funcKey + '" must be a function...',
        })
      }
    })

    _.each(paramObjObjSet, function (objKey) {
      if (objKey === 'util' && !paramObj[objKey]) {
        return
      }
      if (objKey === 'contextMenu' && !paramObj[objKey]) {
        return
      }
      if (objKey === 'preCondition') {
        if (!paramObj[objKey]) {
          return
        } else {
          if (
            !_.chain(paramObj[objKey])
              .values()
              .every(function (v) {
                return _.isFunction(v)
              })
              .value()
          ) {
            throw new Error({
              name: 'ParameterError',
              message:
                '"' +
                objKey +
                '" must be a key-value object, and all values must be Function...',
            })
          }
        }
      }

      if (!isObject(paramObj[objKey])) {
        throw Error({
          name: 'ParameterError',
          message: '"' + objKey + '" must be a key-value object...',
        })
      }
    })

    _.each(paramObjArrSet, function (arrKey) {
      if (!paramObj[arrKey]) {
        return
      }

      if (!_.isArray(paramObj[arrKey])) {
        throw Error({
          name: 'ParameterError',
          message: '"' + arrKey + '" must be a js array...',
        })
      }

      if (arrKey === 'delayCondition') {
        _.each(paramObj[arrKey], function (key) {
          if (!_.has(delayCondition, key)) {
            throw Error({
              name: 'ParameterError',
              message: '"' + arrKey + '" cannot include key: ' + key + '...',
            })
          }
        })
      }
    })
  }

  function contextMenuEvent(e) {
    e.preventDefault()
    var posStyle = {}

    if (e.pageX > global.innerWidth - $gogoCtxMenu.outerWidth()) {
      posStyle.left = ''
      posStyle.right = global.innerWidth - e.pageX
    } else {
      posStyle.left = e.pageX
      posStyle.right = ''
    }
    if (e.pageY > global.innerHeight - $gogoCtxMenu.height()) {
      posStyle.top = ''
      posStyle.bottom = global.innerHeight - e.pageY
    } else {
      posStyle.top = e.pageY
      posStyle.bottom = ''
    }

    $gogoCtxMenu.css(posStyle).show()

    ctxMenuTarget = e.target
  }

  function anotherListHtml() {
    return _.map(anotherList, function (another, i) {
      if (servkit.appFunExist(another.appId, another.funId)) {
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
    var info = JSON.parse(localStorage.getItem(localStorageItemKey))
    if (info) {
      var currAppFunInfo = info[appId + '/' + funId]

      if (currAppFunInfo) {
        delete info[appId + '/' + funId]
        localStorage.setItem(localStorageItemKey, JSON.stringify(info))
      }

      return currAppFunInfo
    }
  }

  function getCommons(appIdList) {
    return _.reduce(
      appIdList,
      function (memo, appId) {
        memo[appId] = commons[appId]
        return memo
      },
      {}
    )
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
      servkit.getCookie('lang') +
      '/' +
      gogoParam.funId +
      '.html'
    if (gogoParam.currentTab) {
      global.location.href = gotoUrl
    } else {
      global.open(gotoUrl, '_blank')
    }
  }

  function GoGoContext() {
    this.appId = appId
    this.funId = funId
  }

  function callGoGo(paramObj, context) {
    var ctxMenuParam = paramObj.contextMenu
    var commonsComplete = false

    // Dashboard 取得 commons 的方式比較特別，得找出所有有 dashboard 的 app 然後把 commons 都配置好
    if (context.appId === 'Dashboard' && !commons[context.appId]) {
      servkit.ajax(
        {
          url: 'api/js/containsDashboardApp',
          type: 'GET',
        },
        function (appIdList) {
          // 過濾出沒在 commons 中的 appId 組成準備要 require 的格式
          var excludeCommonsAppId = _.filter(appIdList, function (appId) {
            return !commons[appId]
          })
          var commonsApiList = _.map(excludeCommonsAppId, function (appId) {
            return ['/api/js/' + appId]
          })

          if (commonsApiList.length) {
            servkit.requireJsAsync(commonsApiList, function () {
              // 把 commons 取出後刪掉
              _.each(excludeCommonsAppId, function (appId) {
                commons[appId] = {}
                window['servcloud_' + appId + '_commons'](commons[appId])
                delete window['servcloud_' + appId + '_commons']
              })

              commons['Dashboard'] = getCommons(appIdList)
              commonsComplete = true
            })
          } else {
            commons['Dashboard'] = getCommons(appIdList)
            commonsComplete = true
          }
        }
      )

      // 取得此 app 的 commons
    } else if (!commons[context.appId]) {
      servkit.requireJs(['/api/js/' + context.appId], function () {
        try {
          commons[context.appId] = {}
          window['servcloud_' + context.appId + '_commons'](
            commons[context.appId]
          )
          delete window['servcloud_' + context.appId + '_commons']

          commonsComplete = true
        } catch (error) {
          console.warn(`appId: ${context.appId}`)
          console.warn(error)
        }
      })
      // 啥都沒做，因為都有了
    } else {
      commonsComplete = true
    }
    // 第一階段 - 環境相關的東西
    servkit
      .politeCheck()
      .until(function () {
        return (
          servkit.applistGot() && // 1. 確定 app 列表存在
          commons.overall &&
          commonsComplete && // 2. 確定 overall 和此 app 的 commons 都存在了
          i18n.available() && // 3. i18n
          _.chain(delayCondition) // 4. 確定環境提供的前提條件都完成
            .pick(paramObj.delayCondition)
            .values()
            .map(function (e) {
              return e()
            })
            .every()
            .value()
        )
      })
      .thenDo(function () {
        // 配製 commons
        context.commons = _.extend({}, commons.overall, commons[context.appId])
        _.each(context.commons, function (v, k) {
          if (_.isFunction(v)) {
            context.commons[k] = function () {
              return v.apply(context, _.toArray(arguments))
            }
          }
        })
        // 第二階段 - preCondition
        function preCondition_try() {
          try {
            // appName and funcName i18n
            let pageTitleHtml = `<h1 class="page-title txt-color-blueDark">
              <i class="fa-fw fa fa-cog"></i>
              <label class="app-name">${servkit.appMap[appId][funId].app_name}</label>
              <span> > ${servkit.appMap[appId][funId].func_name} </span>
            </h1>`
            if ($('.page-title').length) {
              $('.page-title').replaceWith(pageTitleHtml)
            } else {
              $('#content').prepend(pageTitleHtml)
            }
          } catch (e) {
            console.warn(`Can not find ${appId}.${funId} in servkit.appMap.`)
          }

          // gogo
          paramObj.gogo.call(global, context)

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

        if (paramObj.preCondition !== undefined) {
          const preConditionKeys = Object.keys(paramObj.preCondition)
          const preConditionFuncs = Object.values(paramObj.preCondition)
          let promise_get = preConditionFuncs.map((func) => {
            return new Promise((resolve) => func.call(context, resolve))
          })
          Promise.all(promise_get)
            .then((responseArr) => {
              let preConditionKey
              context.preCon = {}
              responseArr.forEach((response, index) => {
                preConditionKey = preConditionKeys[index]
                context.preCon[preConditionKey] = response
              })
              preCondition_try()
            })
            .catch((err) => {
              console.warn(err)
            })
        } else {
          preCondition_try()
        }
      })
      .tryDuration(0)
      .start()
  }

  function GoGoAppFun() {
    // 執行參數
    var paramObj = arguments[0]
    var currContext = location.hash.split('?')[0].match(urlAppFunRegex) || []
    var requireType = 'requireJs'

    appId = currContext[1]
    funId = currContext[2]

    // 非 app/function 就直接離開
    if (!appId || !funId) {
      return
    }

    // 驗證一下參數
    try {
      paramObjChecker(paramObj)
    } catch (e) {
      console.warn(e)
      return
    }

    var graceParam = popLocalStorageInfo()
    var context = new GoGoContext()

    // util 移植
    _.extendOwn(context, paramObj.util)

    context.gogoAnother = function (gogoParam) {
      if (servkit.appFunExist(gogoParam.appId, gogoParam.funId)) {
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
    var dependencies = paramObj.dependencies
    if (dependencies) {
      if (dependencies.length > 0 && _.isArray(dependencies[0])) {
        requireType = 'requireJsAsync'
      }
      servkit[requireType](dependencies, function () {
        callGoGo(paramObj, context)
      })
    } else {
      callGoGo(paramObj, context)
    }
  }

  GoGoAppFun.version = '1.3'
  global.GoGoAppFun = GoGoAppFun
})(this, $, _, servkit)
