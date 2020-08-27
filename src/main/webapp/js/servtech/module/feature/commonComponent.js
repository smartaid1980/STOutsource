import { ajax } from '../servkit/ajax.js'
import { servtechConfig } from '../servtech.config.js'

function toggleCommonComponent() {
  if (
    !servtechConfig.ST_UI_SHOW_DEMO &&
    servtechConfig.ST_UI_SHOW_DEMO !== undefined
  ) {
    $('head').append('<style> #showdemo, .showdemo { display: none; } </style>')
  }
  if (
    !servtechConfig.ST_UI_SHOW_DEVLOGO &&
    servtechConfig.ST_UI_SHOW_DEVLOGO !== undefined
  ) {
    $('head').append('<style> .dev-logo-div { display: none; }</style>')
  }
  if (
    !servtechConfig.ST_UI_SHOW_SERVLOGO &&
    servtechConfig.ST_UI_SHOW_SERVLOGO !== undefined
  ) {
    $('head').append('<style> .serv-info { display: none; } </style>')
  }
  if (
    !servtechConfig.ST_UI_SHOW_APP_DESCRIPTION &&
    servtechConfig.ST_UI_SHOW_APP_DESCRIPTION !== undefined
  ) {
    $('head').append('<style> .app-description { display: none; } </style>')
  }
  if (
    !servtechConfig.ST_UI_SHOW_CONTRACT &&
    servtechConfig.ST_UI_SHOW_CONTRACT !== undefined
  ) {
    $('head').append(
      '<style> #content { padding-top: 20px!important; } </style>'
    )
  }
  if (
    !servtechConfig.ST_UI_SHOW_TABLEFILTER &&
    servtechConfig.ST_UI_SHOW_TABLEFILTER !== undefined
  ) {
    $('head').append(
      '<style> thead>tr:not(:last-child) { display: none; } </style>'
    )
  }
  if (
    !servtechConfig.ST_UI_SHOW_PLANT_AREA &&
    servtechConfig.ST_UI_SHOW_PLANT_AREA !== undefined
  ) {
    $('head').append('<style> .plant_area { display: none; } </style>')
  }
  if (servtechConfig.ST_HIDE_COPYRIGHT) {
    $('#copyright').hide()
  } else {
    $('#copyright').text(
      `ServCloud © ${new Date().getFullYear()} Servtech Co., Ltd.`
    )
  }
  if (servtechConfig.ST_SHOW_THEME_DROPDOWN) {
    $('#theme').removeClass('hide')
  }
}

// 點擊左上角的 logo 回到首頁 applist.html
function initLogoClickHandler() {
  $('#logo').on('click', function () {
    if (location.hash !== '#applist.html') {
      $('#stk-app-list > a').trigger('click')
    }
  })
}

// jarviswidget-fullscreen-btn全螢幕的時候換頁會造成overflow:hidden
function initWidgetSetting() {
  $(window).on('hashchange', function removeOverFlow(evt) {
    $('body').removeClass('nooverflow')
  })
}

// applist 頁面無論在多寬的頁面都要置中
function initAppList() {
  $(window).on('resize', function (e) {
    $('.applist-row').css('padding-left', function () {
      return (
        ($('.applist-container').width() %
          $('.applist-container li').outerWidth(true)) /
        2
      )
    })
  })
}

// 登出行為
function logout(e) {
  if (e) {
    e.preventDefault()
  }
  ajax(
    {
      url: 'api/user/logout',
      type: 'GET',
    },
    {
      success() {
        if (window.sessionStorage) {
          window.sessionStorage.removeItem('user')
          window.sessionStorage.removeItem('loginTime')
        }
      },
      fail(data) {
        console.warn('Logout not success: ' + data.data)
      },
      always() {
        window.location.href = servkit.rootPath + '/login.html'
      },
    }
  )
}
function initLogoutBtn() {
  $('#logout').on('click', logout)
}

export {
  toggleCommonComponent,
  initLogoutBtn,
  initAppList,
  initWidgetSetting,
  initLogoClickHandler,
}
