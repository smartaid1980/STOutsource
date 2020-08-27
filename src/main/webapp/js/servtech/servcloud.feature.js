/**
 * @module feature
 */
;(function (global, $, _, servkit) {
  // Welcome to ServCloud
  // console.log(' _        _      __                                                _____                    _____  __                 _ ')
  // console.log("| |      | |    ', |                                _             / ____|                  / ____|', |               | |")
  // console.log('| |  /\\  | | ___ | | ___   ___ . ___ ___   ___    _| |_   ___    | (___   ___  _ __  _  _ | |      | | ___  _   _  __| |')
  // console.log("\\ \\ /  \\ / // _ \\| |/ __| / _ \\|` _ ' _ \\ / _ \\  |_  __| / _ \\    \\___ \\ / _ \\| '__|\\ \\/ /| |      | |/ _ \\| ' | '/ _  |")
  // console.log(' \\ ` /\\ ` /|  __/| | (__ | (_) | | | | | |  __/    | |_ | (_) |   ____) |  __/| |    \\  / | |____  | | (_) | |_| | (_) |')
  // console.log('  \\_/  \\_/  \\___||_|\\___| \\___/|_, |_, |_,\\___|     \\__| \\___/   |_____/ \\___||_|     \\/   \\_____\\ |_|\\___/ \\__,.|\\___/|')
  // console.log('                                                                                                                        ')

  var doc = global.document
  var $lang = $('#lang')
  // 平台預設有的語言
  var langMap = {
    en: 'flag-us',
    zh_tw: 'flag-tw',
    zh: 'flag-cn',
  }
  var applist
  var hideLeftNav

  /**
   * 將hash解析成物件
   * @memberof module:feature
   * @returns {Object} Object{app, func, search}
   */
  function currCtx() {
    var currContext =
      location.hash
        .split('?')[0]
        .match(/^#app\/([^/]+)\/function\/[^/]+\/(.+?).html/) || []
    return {
      app: currContext[1],
      func: currContext[2],
      search:
        location.hash.indexOf('?') === -1
          ? undefined
          : '?' + location.hash.split('?')[1],
    }
  }

  /**
   * 呈現出左側選單
   * @memberof module:feature
   * @param {Object} currCtx Object{app, func, search}
   */
  function refreshLeftNav(currCtx) {
    currCtx = currCtx || {}

    // 先清掉舊的
    $('li.app-function').remove()

    var langTag = servkit.getCookie('lang')
    var app = _.find(applist, function (app) {
      return app.app_id === currCtx.app
    })
    var html
    if (app) {
      html = `<li class="app-function">
                <a href="#">
                  <i class="fa fa-lg fa-fw fa-tasks"></i> 
                  <span class="menu-item-parent">${app.app_name}</span>
                </a>
              <ul>`
      _.each(app.sys_func_list, function (func) {
        // 若是存在有不想顯示的左選單時，就不需要append
        if (
          hideLeftNav[func.app_id] &&
          _.contains(hideLeftNav[func.app_id], func.func_id)
        ) {
          return false
        }
        // 加上timestamp避免瀏覽器cache住，不過因為是寫在渲染左側選單的地方，所以要回到applist再進app重畫才是徹底拿新的 html
        html += `<li>
                  <a href="app/${func.app_id}/function/${langTag}/${
          func.func_id
        }.html?${new Date().getTime()}" title="${func.func_name}">${
          func.func_name
        }</a>
                </li>`
      })
      html += '</ul>'
      html += '</li>'

      $('nav ul').append(html)
    }

    global.initApp.leftNav()
    if (currCtx.func) {
      var currFuncEle = $('.app-function').find(
        'a[href$="' + currCtx.func + '.html"]'
      )
      $('.app-function a:first').trigger('click') // 預設為隱藏，點擊一下展開
      currFuncEle.parent().addClass('active')
      //      location.href = servkit.rootPath + "#" + $(currFuncEle).attr("href") + (currCtx.search || "");

      //      $('.app-function').find('li').each(function (i, e) {
      //        var currFuncEle = e.querySelector('a[href$="' + currCtx.func + '.html"]');
      //        if (currFuncEle) {
      //          $(currFuncEle).trigger('click').parent().addClass('active');
      //          return false;
      //        }
      //      });
    } else {
      $('.app-function a:first')
        .trigger('click')
        .parent()
        .find('li a:first')
        .trigger('click')
    }
  }
  /**
   * 取得使用者可存取的功能，然後根據hash渲染左編選單或applist
   * @memberof module:feature
   */
  function syncApplist() {
    servkit.ajax(
      {
        url: servkit.rootPath + '/api/function/findByAuth',
        type: 'GET',
        dataType: 'json',
      },
      {
        success: function (resp) {
          applist = resp
          servkit.appMap = _.reduce(
            resp,
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
          var ctx = currCtx()

          if (ctx.app) {
            refreshLeftNav(ctx)
          } else {
            // 回首頁
            renderApplistPage()
          }
        },
      }
    )
  }
  /**
   * 繪製applist，以app-tag過濾能顯示的app
   * @memberof module:feature
   */
  function renderApplistPage() {
    var isNonEn = _.contains(['zh_tw', 'zh'], servkit.getCookie('lang'))
      ? 'non-en'
      : ''
    try {
      applist = _.sortBy(applist, servtechConfig.ST_APP_ORDER_BY || 'app_id')
      if (servtechConfig.ST_APP_ORDER_SEQ === 'desc') {
        applist = applist.reverse()
      }
    } catch (e) {
      console.warn(`sort applist error, please check.`)
      throw Error(e)
    }
    var applistHtml = _.map(applist, function (app) {
      var html =
        '<div class="superbox-list" data-app-id="' +
        app.app_id +
        '" title="' +
        app.app_name +
        '">'
      html += '<a href="">'
      html +=
        '<img src="app/' +
        app.app_id +
        '/img/default.png" alt="' +
        app.app_name +
        ' logo" alt="' +
        app.app_name +
        '" class="superbox-img">'
      html +=
        '<div class="app-title ' + isNonEn + '">' + app.app_name + '</div>'
      html += '<div class="app-description ' + isNonEn + '">'
      html += '<p>v ' + app.version + '</p>'
      if (!servtechConfig.ST_HIDE_COPYRIGHT) {
        html += '<p>Servtech co., Ltd.</p>'
      }
      html += '</div>'
      html += '<div class="app-tag-group">'
      _.each(app.tag, function (tag) {
        html +=
          '<div class="app-tag app-tag-' +
          tag.tag_name +
          '">' +
          tag.tag_name +
          '</div>'
      })
      html += '</div>'
      html += '</a>'
      html += '</div>'
      return html
    })

    var $applistContainer = $('.applist-container')
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
    $applistContainer.html(applistHtml.join(''))

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

  servkit = servkit || {}
  servkit.renderApplistPage = renderApplistPage
  servkit.currCtx = currCtx
  servkit.applistGot = function () {
    return !_.isUndefined(applist)
  }
  servkit.appFunExist = function (appId, funcId) {
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
  /**
   * 更改使用者密碼
   * @memberof module:feature
   */
  // 使用者 view
  ;(function () {
    function revertChangePwdView($changePwdPanel) {
      var faClass = ['fa fa-unlock', 'fa fa-lock', 'fa fa-chain']
      $changePwdPanel.find('.input-group').each(function (i) {
        $(this)
          .attr('class', 'input-group')
          .find('.fa')
          .attr('class', faClass[i])
      })
      $changePwdPanel.find('input').each(function (i) {
        $(this).val('')
      })
      $changePwdPanel.find('.has-success').removeClass('has-success')
      $changePwdPanel.find('.has-error').removeClass('has-error')
      $changePwdPanel.find('.help-block').addClass('hide')
    }

    var $changePwdPanel = $('.change-pwd-panel')
    // 當前使用者顯示
    $('#user').on('click', function (e) {
      var isOpen = !$changePwdPanel.is(':visible')
      $changePwdPanel.slideToggle(200)
      if (isOpen) {
        $changePwdPanel.find('input')[0].focus()
        $(this).find('.fa-chevron-down').css('transform', 'rotate(180deg)')
      } else {
        $(this).find('.fa-chevron-down').css('transform', 'rotate(0deg)')
        revertChangePwdView($changePwdPanel)
      }
    })

    // 送出變更密碼
    $changePwdPanel
      .on('click', 'button.submit-change-pwd', function (e) {
        e.preventDefault()
        var inputEles = $changePwdPanel.find('input')
        var $inputGroupEles = $changePwdPanel.find('.input-group')
        var emptyInput = _.find(inputEles, function (inputEle) {
          return inputEle.value === ''
        })

        if (emptyInput) {
          $(emptyInput)
            .parent()
            .addClass('has-error')
            .find('.fa')
            .attr('class', 'fa fa-warning')
          return
        }

        servkit.ajax(
          {
            url: servkit.rootPath + '/api/user/changepwd',
            type: 'POST',
            data: {
              oldpwd: inputEles[0].value,
              newpwd: inputEles[1].value,
              confirmpwd: inputEles[2].value,
            },
          },
          {
            success: function () {
              $inputGroupEles
                .attr('class', 'input-group has-success')
                .next()
                .addClass('hide')
              $inputGroupEles.find('.fa').attr('class', 'fa fa-check')
              var lastInputFormGroup = $changePwdPanel.find('.form-group')[2]
              $(lastInputFormGroup)
                .addClass('has-success')
                .find('.help-block')
                .text('Success!')
                .removeClass('hide')
            },
            fail: function (data) {
              switch (data) {
                case '2004':
                  var firstInputGroup = $($inputGroupEles[0])
                  firstInputGroup
                    .addClass('has-error')
                    .find('.fa')
                    .attr('class', 'fa fa-warning')
                  firstInputGroup
                    .next()
                    .text('Old password incorrect!')
                    .removeClass('hide')
                  break
                case '2006':
                  _.each([0, 1, 2], function (i) {
                    var $inputGroup = $($inputGroupEles[i])
                    if (i === 0) {
                      $inputGroup
                        .attr('class', 'input-group')
                        .find('.fa')
                        .attr('class', 'fa fa-unlock')
                      $inputGroup.next().addClass('hide')
                    } else {
                      $inputGroup
                        .addClass('has-error')
                        .find('.fa')
                        .attr('class', 'fa fa-warning')
                      $inputGroup
                        .next()
                        .text('New password different!')
                        .removeClass('hide')
                    }
                  })
                  break
                case '2007':
                  var inputGroup = $($inputGroupEles[1])
                  inputGroup
                    .addClass('has-error')
                    .find('.fa')
                    .attr('class', 'fa fa-warning')
                  inputGroup
                    .next()
                    .text('Maximum length 20!')
                    .removeClass('hide')
                  break
              }
            },
          }
        )
      })
      // 取消變更密碼
      .on('click', 'button.cancel-change-pwd', function (e) {
        e.preventDefault()
        $changePwdPanel.slideToggle(200)
        $('#user').find('.fa-chevron-down').css('transform', 'rotate(0deg)')
        revertChangePwdView($changePwdPanel)
      })
  })()

  // 處理 sessionStorage
  // 為解決使用者關閉 ServCloud tab 後再重新開啟時
  // 儲存於 sessionStorage 當中的訊息被刪掉導致整個頁面無法正常載入的問題
  ;(function () {
    /**
     * 取得平台版本
     * @memberof module:feature
     */
    function systemVersion() {
      $('#system-version').append(function () {
        return (
          'v' +
          JSON.parse(global.sessionStorage.getItem('loginInfo'))['version']
        )
      })
    }
    /**
     * 取得合約截止日，滑鼠移至上方會出現距離到期日的天數，點擊則會更新license日期
     * @memberof module:feature
     */
    function licenseDate() {
      var licenseDateDashed = JSON.parse(
        global.sessionStorage.getItem('loginInfo')
      )['license']
      var $licenseDateEle = $('#license-date')

      function isAlert(licenseDate, alertDayBuffer) {
        return (
          moment(licenseDate, 'YYYY-MM-DD')
            .subtract(alertDayBuffer, 'days')
            .valueOf() < new Date().getTime()
        )
      }

      function isExpired(licenseDate) {
        return (
          moment(licenseDate, 'YYYY-MM-DD').valueOf() < new Date().getTime()
        )
      }

      function updateContent(licenseDate) {
        var alert = isAlert(licenseDate, 10)
        var expired = isExpired(licenseDate)
        var tooltipContent = (function () {
          if (expired) {
            return (
              i18n('License_Expired') +
              (moment().diff(moment(licenseDate, 'YYYY-MM-DD'), 'days') + 1) +
              i18n('Day_Over')
            )
          } else if (alert) {
            return (
              i18n('License_Rest') +
              (moment(licenseDate, 'YYYY-MM-DD').diff(moment(), 'days') + 1) +
              i18n('Day')
            )
          } else {
            return (
              i18n('License_Have') +
              (moment(licenseDate, 'YYYY-MM-DD').diff(moment(), 'days') + 1) +
              i18n('Day')
            )
          }
        })()
        var blingCount = 10

        $licenseDateEle
          .html(
            '<i class="stk-license fa' +
              (alert ? ' fa-warning' : '') +
              '"></i> ' +
              i18n('License') +
              ': <span class="stk-license-date">' +
              licenseDate +
              '</span>'
          )
          .removeClass(alert ? 'bg-color-greenLight' : 'bg-color-red')
          .addClass(alert ? 'bg-color-red' : 'bg-color-greenLight')
          .attr('data-original-title', tooltipContent)

        if (alert) {
          setTimeout(function bling() {
            if (blingCount > 0) {
              blingCount % 2 === 0
                ? $licenseDateEle.trigger('mouseover')
                : $licenseDateEle.trigger('mouseout')
              blingCount -= 1
              setTimeout(bling, 200)
            } else {
              $licenseDateEle.trigger('mouseover')
              setTimeout(function () {
                $licenseDateEle.trigger('mouseout')
              }, 5000)
            }
          }, 500)
        }
      }

      $licenseDateEle.on('click', function () {
        var $this = $(this)
        var $stkLicense = $this.find('.stk-license')
        if (!$this.hasClass('fa-refresh')) {
          $stkLicense
            .removeClass('fa-warning')
            .addClass('fa-refresh')
            .addClass('fa-spin')
          servkit.ajax(
            {
              url: servkit.rootPath + '/api/license/update',
              type: 'GET',
            },
            {
              success: function (licenseDate) {
                var loginInfo = JSON.parse(
                  global.sessionStorage.getItem('loginInfo')
                )
                loginInfo['license'] = licenseDate
                global.sessionStorage.setItem(
                  'loginInfo',
                  JSON.stringify(loginInfo)
                )

                setTimeout(function () {
                  $stkLicense.removeClass('fa-refresh').removeClass('fa-spin')
                  updateContent(licenseDate)
                }, 500)
              },
            }
          )
        }
      })

      // 合約到期日為空
      if (licenseDateDashed === '') {
        $licenseDateEle.text('unlicensed').addClass('bg-color-red')

        // 合約到期日不為空
      } else {
        updateContent(licenseDateDashed)
      }
    }
    /**
     * 顯示使用者名稱
     * @memberof module:feature
     */
    function userName() {
      $('#user').append(
        (function () {
          if (global.sessionStorage) {
            return (
              '<span>' +
              JSON.parse(global.sessionStorage.getItem('loginInfo'))[
                'user_name'
              ] +
              '</span>   <i class="fa fa-chevron-down"></i>'
            )
          }
          return '<span>請使用新版瀏覽器</span>'
        })()
      )
    }

    if (global.sessionStorage) {
      var loginInfo = global.sessionStorage.getItem('loginInfo')
      if (loginInfo) {
        // var loginInfoObj = JSON.parse(loginInfo)
        userName()
        licenseDate()
        systemVersion()
      } else {
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/user/loginInfo',
            type: 'GET',
            dataType: 'json',
          },
          {
            success: function (resp) {
              global.sessionStorage.setItem('loginInfo', resp)
              userName()
              licenseDate()
              systemVersion()
            },
          }
        )
      }

      // 更換語言時合約標籤
      i18n.addChangeLangListener(licenseDate, 'license-date')
    }
  })()

  // 將 nav 縮小的設定記在瀏覽器當中
  ;(function () {
    /**
     * 將nav的狀態存至localStorage
     * @memberof module:feature
     * @param {any} event
     */
    function changeNavStatus(event) {
      if ($(doc.body).hasClass(event.data['class'])) {
        global.localStorage.setItem('navStatus', 'normal')
      } else {
        global.localStorage.setItem('navStatus', event.data['tag'])
      }
    }

    if (global.localStorage) {
      switch (global.localStorage.getItem('navStatus')) {
        case 'minify':
          $(doc.body).addClass('minified')
          break
        case 'hidden':
          $(doc.body).addClass('hidden-menu')
          break
        case null:
        case 'normal':
        default:
          break
      }
      $('.minifyme').on(
        'click',
        null,
        {
          class: 'minified',
          tag: 'minify',
        },
        changeNavStatus
      )
      $('#hide-menu a').on(
        'click',
        null,
        {
          class: 'hidden-menu',
          tag: 'hidden',
        },
        changeNavStatus
      )
    }
  })()

  // applist 頁面無論在多寬的頁面都要置中
  $(window).on('resize', function (e) {
    $('.applist-row').css('padding-left', function () {
      return (
        ($('.applist-container').width() %
          $('.applist-container li').outerWidth(true)) /
        2
      )
    })
  })

  // 登出
  $('#logout').on('click', function (e) {
    e.preventDefault()

    servkit.ajax(
      {
        url: servkit.rootPath + '/api/user/logout',
        type: 'GET',
      },
      {
        success: function (data) {
          if (window.sessionStorage) {
            window.sessionStorage.removeItem('user')
            window.sessionStorage.removeItem('loginTime')
          }
        },
        fail: function (data) {
          console.warn('Logout not success: ' + data.data)
        },
        always: function () {
          window.location.href = servkit.rootPath + '/login.html'
        },
      }
    )
  })

  // i18n
  $lang
    .find('.dropdown-menu')
    .on('click', function (e, isCodeTrigger) {
      var liEle = e.target

      if (liEle instanceof window.HTMLUListElement) {
        return
      }
      while (!(liEle instanceof window.HTMLLIElement)) {
        liEle = liEle.parentNode
      }

      var $liEle = $(liEle)
      var $langView = $lang.find('.dropdown-toggle')
      var that = this
      var changeLangView = function () {
        $(that).find('li').removeClass('active')
        $langView.find('img').attr({
          class: $liEle.find('img').attr('class'),
          alt: $liEle.find('img').attr('alt'),
        })
        $langView.find('span').text($liEle.text())
      }
      var oldLang = servkit.getCookie('lang')
      var changedLang = _.invert(langMap)[
        $liEle.find('img').attr('class').split(' ')[1]
      ]

      if (!isCodeTrigger) {
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/user/changeLang',
            type: 'POST',
            data: {
              lang: changedLang,
            },
          },
          {
            success: function () {
              changeLangView()
              var oldLangAddSlash = '/' + oldLang + '/'
              var changedLangAddSlash = '/' + changedLang + '/'
              location.hash = location.hash.replace(
                oldLangAddSlash,
                changedLangAddSlash
              )
              location.reload()
            },
          }
        )
      } else {
        changeLangView()
      }

      // 等待 Cookie 更新完成後再向後端拿左側 app function
      servkit
        .politeCheck('Cookie')
        .until(function () {
          return servkit.getCookie('lang') === changedLang && i18n.available()
        })
        .thenDo(function () {
          syncApplist()
          i18n.changeLang(changedLang)
        })
        .tryDuration(0)
        .start()
    })
    .find('img.' + langMap[servkit.getCookie('lang')])
    .trigger('click', true)

  // 語言改變的時候要牽動的主頁面顯示
  i18n.addChangeLangListener(function (i18n) {
    $('#app-list').html(i18n('App_List'))
    $('#main-change-pwd').html(i18n('Change_Pwd'))
    $('#main-old-pwd').attr('placeholder', i18n('Old_Pwd'))
    $('#main-new-pwd').attr('placeholder', i18n('New_Pwd'))
    $('#main-confirm-pwd').attr('placeholder', i18n('Confirm_Pwd'))
    $('#main-pwd-error').html(i18n('Pwd_Error'))
    $('#main-pwd-diff1').html(i18n('Pwd_Different'))
    $('#main-pwd-diff2').html(i18n('Pwd_Different'))
    $('#main-pwd-submit').html(i18n('Submit'))
    $('#main-pwd-close').html(i18n('Close'))
    $('#main-login-tip').html(i18n('Login_Tip'))
  }, 'main-page')

  if (global.sessionStorage) {
    var loginTime = global.sessionStorage.getItem('loginTime') || ''
    $('#login-time').text(loginTime)
  }

  // 左上角的 logo
  $('#logo').on('click', function () {
    if (location.hash !== '#applist.html') {
      $('#stk-app-list > a').trigger('click')
    }
  })

  // kevin:隱藏左選單不想出現的頁面(暫時)
  $.getJSON('hideleftnav.json', function (data) {
    hideLeftNav = data
  })

  // jQuery validate i18n
  i18n.addChangeLangListener(function (i18n) {
    $.extend($.validator.messages, {
      required: i18n('Required'),
      date: i18n('Format_Error'),
      dateISO: i18n('Format_Error'),
      require_from_group: i18n('Require_From_Group'),
      digits: i18n('Please_Enter_The_Number'),
      number: i18n('Please_Enter_A_Decimal'),
      min: $.validator.format(i18n('The_Minimum_Value_Is') + '{0}'),
      max: $.validator.format(i18n('A_Maximum_Of') + '{0}'),
      maxlength: $.validator.format(i18n('Length_Should_Not_Exceed') + '{0}'),
      minlength: $.validator.format(
        i18n('Not_Less_Than_The_Length_Of') + '{0}'
      ),
    })
    $.validator.addMethod(
      'positiveNumber',
      function (value, element, params) {
        return (
          this.optional(element) ||
          /(^\d*\.?\d*[1-9]+\d*$)|(^[1-9]+\d*\.\d*$)/.test(value)
        )
      },
      i18n('Please_Enter_A_Decimal_Or_Integer_Greater_Than_Zero')
    )
    $.validator.addMethod(
      'positiveInteger',
      function (value, element, params) {
        return this.optional(element) || /^[1-9]\d*$/.test(value)
      },
      i18n('Please_Enter_A_Positive_Integer')
    )
  }, 'validate')
})(this, $, _, servkit)
