import { ajax } from '../servkit/ajax.js'

// 處理 sessionStorage
// 為解決使用者關閉 ServCloud tab 後再重新開啟時
// 儲存於 sessionStorage 當中的訊息被刪掉導致整個頁面無法正常載入的問題
// 初始化登入資訊的取得和 render 相關元件
/**
 * 取得平台版本
 * @memberof module:feature
 */
function renderSystemVersion(version = '') {
  document.getElementById('system-version').textContent = 'v' + version
}
/**
 * 取得合約截止日，滑鼠移至上方會出現距離到期日的天數，點擊則會更新license日期
 * @memberof module:feature
 */
function renderLicenseDate(license) {
  var licenseDateDashed =
    license && !_.isFunction(license)
      ? license
      : JSON.parse(window.sessionStorage.getItem('loginInfo'))['license']
  var $licenseDateEle = $('#license-date')

  function isAlert(licenseDate, alertDayBuffer) {
    return (
      moment(licenseDate, 'YYYY-MM-DD')
        .subtract(alertDayBuffer, 'days')
        .valueOf() < new Date().getTime()
    )
  }

  function isExpired(licenseDate) {
    return moment(licenseDate, 'YYYY-MM-DD').valueOf() < new Date().getTime()
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
          success(licenseDate) {
            var loginInfo = JSON.parse(
              window.sessionStorage.getItem('loginInfo')
            )
            loginInfo['license'] = licenseDate
            window.sessionStorage.setItem(
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
function renderUserName(userName) {
  $('#user').append(
    userName
      ? `<span>${userName}</span>   <i class="fa fa-chevron-down"></i>`
      : '<span>請使用新版瀏覽器</span>'
  )
}
function fetchLoginInfo() {
  const loginInfo = window.sessionStorage.getItem('loginInfo')
  return loginInfo
    ? Promise.resolve(loginInfo)
    : new Promise((res) =>
        ajax(
          {
            url: 'api/user/loginInfo',
            type: 'GET',
            dataType: 'json',
          },
          {
            success(data) {
              window.sessionStorage.setItem('loginInfo', data)
              res(data)
            },
          }
        )
      )
}
function renderLoginTime() {
  const loginTime = window.sessionStorage.getItem('loginTime') || ''
  $('#login-time').text(loginTime)
}
function initLoginInfo() {
  if (window.sessionStorage) {
    fetchLoginInfo().then((loginInfo) => {
      const { version, user_name, license } = JSON.parse(loginInfo)
      renderUserName(user_name)
      renderLicenseDate(license)
      renderSystemVersion(version)
    })

    // 更換語言時合約標籤
    i18n.async(() =>
      i18n.addChangeLangListener(renderLicenseDate, 'license-date')
    )
    renderLoginTime()
  }
}

export { initLoginInfo }
