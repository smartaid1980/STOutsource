// servtech library
import './servtech/module/servcloud.protoext.js'
import servkit from './servtech/module/servkit/servkit.js'
import GoGoAppFun from './servtech/module/servcloud.gogoappfun.js'
import i18n from './servtech/module/servcloud.i18n.js'
import { hippo } from './servtech/module/servcloud.hippo.js'

// THIS MUST AFTER app.min.js
import {
  toggleCommonComponent,
  initLogoClickHandler,
  initWidgetSetting,
  initAppList,
  initLogoutBtn,
} from './servtech/module/feature/commonComponent.js'
import { initChangePwdPanel } from './servtech/module/feature/changePwdPanel.js'
import {
  initSelect2,
  initJqueryUiDialog,
  initJqueryValidation,
} from './servtech/module/feature/customizeLibSetting.js'
import { initLang } from './servtech/module/feature/lang.js'
import { initLoginInfo } from './servtech/module/feature/loginInfo.js'
import { initNavStatus } from './servtech/module/feature/navStatus.js'
import { initPlatformTheme } from './servtech/module/feature/theme.js'
import {
  initCSU,
  initIIOT,
  initAPlus,
} from './servtech/module/projectCustomize.js'
import { servtechConfig } from './servtech/module/servtech.config.js'
import { setupTempalteEngine } from './servtech/module/servcloud.tempalte.engine.js'
import { createReportTable } from './servtech/module/table/reportTable.js'
import { initBroadcaster } from './servtech/module/servkit/broadcaster.js'

window.servkit = servkit
window.GoGoAppFun = GoGoAppFun
window.i18n = i18n
window.hippo = hippo
window.createTempalteEngine = setupTempalteEngine
window.createReportTable = createReportTable
window.servtechConfig = servtechConfig

;(async function main() {
  await i18n.async()

  // 初始化主畫面元件
  toggleCommonComponent()
  initLogoClickHandler()
  initWidgetSetting()
  initAppList()
  initLogoutBtn()

  // 修改密碼功能
  initChangePwdPanel()

  // library 客製化設定
  initSelect2()
  initJqueryUiDialog()
  initJqueryValidation()

  // 初始化語言相關設定和顯示
  initLang()

  // 初始化登入相關設定和顯示
  initLoginInfo()

  // 初始化側邊欄模式
  initNavStatus()

  // 初始化平台布景主題
  initPlatformTheme()

  initBroadcaster()

  // 針對客戶平台的客製化動作
  switch (servtechConfig.ST_CUSTOMER) {
    case 'CSU':
      initCSU()
      break
    case 'IIOT':
      initIIOT()
      break
    case 'APlus':
      initAPlus()
      break
  }
})()
