import { ajax } from './ajax.js'
import { getCookie } from './util.js'
import { servtechConfig } from '../servtech.config.js'

let applist = []
let hideLeftNav = {}
let appMap = {}

$.getJSON('hideleftnav.json', function (data) {
  hideLeftNav = data
})

function fetchAppList() {
  return new Promise((res) =>
    ajax(
      {
        url: 'api/function/findByAuth',
        type: 'GET',
        dataType: 'json',
      },
      {
        success(data) {
          res(data)
        },
      }
    )
  )
}
/**
 * 取得使用者可存取的功能，然後根據hash渲染左編選單或applist
 * @memberof module:feature
 */
function syncApplist() {
  return fetchAppList().then((data) => {
    applist = data
    for (let key in appMap) {
      delete appMap[key]
    }
    Object.assign(
      appMap,
      _.reduce(
        data,
        (map, app) => {
          map[app.app_id] = _.reduce(
            app.sys_func_list,
            (memo, func) => {
              memo[func.func_id] = {
                app_name: app.app_name,
                func_name: func.func_name,
              }
              return memo
            },
            {}
          )
          return map
        },
        {}
      )
    )
    const appFuncMap = getCurrAppFunc()
    const isBackToIndexPage = !appFuncMap.app

    // 回首頁
    if (isBackToIndexPage) {
      renderApplistPage()
    } else {
      refreshLeftNav(appFuncMap)
    }
  })
}

/**
 * 將hash解析成物件
 * @memberof module:feature
 * @returns {Object} Object{app, func, search}
 */
function getCurrAppFunc() {
  const currAppFunc =
    location.hash
      .split('?')[0]
      .match(/^#app\/([^/]+)\/function\/[^/]+\/(.+?).html/) || []
  return {
    app: currAppFunc[1],
    func: currAppFunc[2],
    search:
      location.hash.indexOf('?') === -1
        ? undefined
        : '?' + location.hash.split('?')[1],
  }
}

/**
 * 繪製applist，以app-tag過濾能顯示的app
 * @memberof module:feature
 */
function renderApplistPage() {
  const isNonEn = _.contains(['zh_tw', 'zh'], getCookie('lang'))
  const nonEnClass = isNonEn ? 'non-en' : ''
  const $applistContainer = $('.applist-container')
  let appListHtml
  try {
    applist = _.sortBy(applist, servtechConfig.ST_APP_ORDER_BY || 'app_id')
    if (servtechConfig.ST_APP_ORDER_SEQ === 'desc') {
      applist = applist.reverse()
    }
  } catch (e) {
    console.warn(`sort applist error, please check.`)
    throw Error(e)
  }
  appListHtml = applist
    .map(
      (app) => `<div class="superbox-list" data-app-id="${app.app_id}" title="${
        app.app_name
      }">
    <a href="">
      <img src="app/${app.app_id}/img/default.png" alt="${
        app.app_name
      } logo" alt="${app.app_name}" class="superbox-img">
      <div class="app-title ${nonEnClass}">${app.app_name}</div>
      <div class="app-description ${nonEnClass}">
        <p>v ${app.version}</p>
        ${!servtechConfig.ST_HIDE_COPYRIGHT ? '<p>Servtech co., Ltd.</p>' : ''}
      </div>
      <div class="app-tag-group">
        ${app.tag
          .map(
            (tag) =>
              `<div class="app-tag app-tag-${tag.tag_name}">${tag.tag_name}</div>`
          )
          .join('')}
      </div>
    </a>
  </div>`
    )
    .join('')

  refreshLeftNav()

  if (!$applistContainer.find('.superbox-list').length) {
    $applistContainer
      .off('click', '.superbox-list[data-app-id]')
      .on('click', '.superbox-list[data-app-id]', function (e) {
        e.preventDefault()
        refreshLeftNav({
          app: this.getAttribute('data-app-id'),
        })
      })
  }
  $applistContainer.html(appListHtml)

  // 過濾用 tag checkbox
  var $applistFilter = $('.applist-tag-filter')
  var tagCheckboxHtml = _.chain($('.app-tag').toArray())
    .map(function (e) {
      return e.textContent.trim()
    })
    .uniq()
    .map(function (e) {
      return (
        '<label class="btn btn-labeled btn-default active" data-tag="' +
        e +
        '">' +
        '<span class="btn-label">' +
        '<i class="glyphicon glyphicon-ok"></i>' +
        '<i class="glyphicon glyphicon-remove"></i>' +
        '</span>' +
        i18n(e) +
        '</label>'
      )
    })
    .value()
    .join('')
  $applistFilter.html(tagCheckboxHtml)

  if ($applistFilter.find('.btn').length) {
    $applistFilter.off('click', '.btn').on('click', '.btn', function (e) {
      e.preventDefault()
      var $t = $(e.target)
      if ($t.hasClass('active')) {
        $t.removeClass('active')
      } else {
        $t.addClass('active')
      }

      var tags = []
      $applistFilter.find('.btn.active').each(function (e) {
        tags.push('.app-tag-' + $(this).attr('data-tag'))
      })

      $applistContainer
        .find('.superbox-list')
        .addClass('hide')
        .has(tags.join(','))
        .removeClass('hide')
    })
  }

  $(window).trigger('resize')
}
/**
 * 呈現出左側選單
 * @memberof module:feature
 * @param {Object} currAppFunc Object{app, func, search}
 */
function refreshLeftNav(currAppFunc = {}) {
  // 先清掉舊的
  $('li.app-function').remove()
  const langTag = getCookie('lang')
  const app = _.find(applist, function (app) {
    return app.app_id === currAppFunc.app
  })
  let funcListHtml
  if (app) {
    funcListHtml = app.sys_func_list
      .map(({ app_id, func_id, func_name }) => {
        return hideLeftNav[app_id] && _.contains(hideLeftNav[app_id], func_id)
          ? ''
          : `<li>
        <a href="app/${app_id}/function/${langTag}/${func_id}.html?${new Date().getTime()}" title="${func_name}">${func_name}</a>
      </li>`
      })
      .join('')
    let html = `<li class="app-function">
      <a href="#">
        <i class="fa fa-lg fa-fw fa-tasks"></i> 
        <span class="menu-item-parent">${app.app_name}</span>
      </a>
      <ul>
      ${funcListHtml}
      </ul>
    </li>`

    $('nav ul').append(html)
  }

  // smartAdmin function
  window.initApp.leftNav()

  if (currAppFunc.func) {
    var currFuncEle = $('.app-function').find(
      'a[href$="' + currAppFunc.func + '.html"]'
    )
    $('.app-function a:first').trigger('click') // 預設為隱藏，點擊一下展開
    currFuncEle.parent().addClass('active')
  } else {
    $('.app-function a:first')
      .trigger('click')
      .parent()
      .find('li a:first')
      .trigger('click')
  }
}
function applistGot() {
  return !_.isUndefined(applist)
}
function appFunExist(appId, funcId) {
  var app = _.find(applist, function (app) {
    return app.app_id === appId
  })
  if (app) {
    return !!_.find(app.sys_func_list, function (func) {
      return func.func_id === funcId
    })
  } else {
    return false
  }
}
export {
  appMap,
  getCurrAppFunc as currCtx,
  applistGot,
  appFunExist,
  syncApplist,
  renderApplistPage,
}
