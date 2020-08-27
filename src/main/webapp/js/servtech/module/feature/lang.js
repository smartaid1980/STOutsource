import { ajax } from '../servkit/ajax.js'
import { getCookie } from '../servkit/util.js'
import { syncApplist } from '../servkit/appFunc.js'
import { langMap } from '../servkit/var.js'
import { servtechConfig } from '../servtech.config.js'

const $lang = $('#lang')

// 初始化語系選擇
function changeLangView($liEle) {
  const $langView = $lang.find('.dropdown-toggle')
  $lang.find('li').removeClass('active')
  $langView.find('img').attr({
    class: $liEle.find('img').attr('class'),
    alt: $liEle.find('img').attr('alt'),
  })
  $langView.find('span').text($liEle.text())
}
function changeLangAjax(lang) {
  return new Promise((res) =>
    ajax(
      {
        url: 'api/user/changeLang',
        type: 'POST',
        data: {
          lang,
        },
      },
      {
        success() {
          res()
        },
      }
    )
  )
}
async function langChangeHandler(e, isCodeTrigger) {
  const liEle = this
  const $liEle = $(liEle)
  const oldLang = getCookie('lang')
  const changedLang = $liEle.data('lang')

  if (!isCodeTrigger) {
    await changeLangAjax(changedLang).then(() => {
      changeLangView($liEle)
      const oldLangAddSlash = '/' + oldLang + '/'
      const changedLangAddSlash = '/' + changedLang + '/'
      location.hash = location.hash.replace(
        oldLangAddSlash,
        changedLangAddSlash
      )
      // location.reload();
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
  } else {
    changeLangView($liEle)
  }
  i18n.async(() => {
    servkit.syncAppListPromise = syncApplist()
    i18n.changeLang(changedLang)
  })
}
function updateMainPageLang() {
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
}
function initLang() {
  const langHtmlList = []
  const currLang = getCookie('lang')
  const selectedLang =
    currLang ||
    (servtechConfig.ST_LANGUAGE ? servtechConfig.ST_LANGUAGE[0] : 'en')
  const selectedLangClass = `flag-${langMap[selectedLang].class}`
  const selectedLangHtml = `<img src="img/blank.gif" class="flag ${selectedLangClass}" style="background: none;">
    <span>${langMap[selectedLang].text}</span><i class="fa fa-angle-down"></i>`

  // render 目前選擇的語言
  $('#lang').find('.dropdown-toggle').html(selectedLangHtml)

  // render 語言列表
  if (servtechConfig.ST_LANGUAGE) {
    servtechConfig.ST_LANGUAGE.forEach((lang) => {
      langHtmlList.push(
        `<li data-lang="${lang}"><a href="javascript:void(0);"><img src="img/blank.gif" class="flag flag-${langMap[lang].class}" style="background: none;">${langMap[lang].text}</a></li>`
      )
    })
    $lang.find('.dropdown-menu').html(langHtmlList.join(''))
  }

  // 語言改變的時候要牽動的主頁面顯示
  i18n.addChangeLangListener(updateMainPageLang, 'main-page')

  // 綁定更換語言的事件
  $lang
    .find('.dropdown-menu')
    .on('click', 'li', langChangeHandler)
    .find('img.' + selectedLangClass)
    .trigger('click', true)
}

export { initLang }
