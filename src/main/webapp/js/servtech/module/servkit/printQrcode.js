import { loadingButton } from './form.js'
import { colors } from './var.js'
import { ajax } from './ajax.js'
import Schedule from './Schedule.js'

async function initPrintQrcodeBtn(btn, getRequestParam) {
  const loadingBtn = loadingButton(btn)
  loadingBtn.doing()
  const printerRunningTaskName = await checkPrinterStatus()
  if (printerRunningTaskName) {
    $.smallBox({
      sound: false,
      title: '目前無法列印',
      content: '條碼機執行任務中，請稍後再試',
      color: colors.red,
      iconSmall: 'fa fa-times',
      timeout: 4000,
    })
    setCheckingStatusSchedule(null, () => {
      loadingBtn.done()
      $.smallBox({
        sound: false,
        title: '可進行列印',
        content: '條碼機閒置中',
        color: colors.green,
        iconSmall: 'fa fa-check',
        timeout: 4000,
      })
    })
  } else {
    loadingBtn.done()
  }
  $(btn).on('click', async function () {
    const requestParam = getRequestParam()
    if (!requestParam) {
      return
    }
    const { isPrinting, id } = await sendPrintTask(requestParam)
    loadingBtn.doing()
    if (isPrinting) {
      $.smallBox({
        sound: false,
        content: '任務列印中',
        color: colors.green,
        iconSmall: 'fa fa-check',
        timeout: 4000,
      })
      setCheckingStatusSchedule(
        id,
        () => {
          loadingBtn.done()
          $.smallBox({
            sound: false,
            content: '列印完成',
            color: colors.green,
            iconSmall: 'fa fa-check',
            timeout: 4000,
          })
        },
        () => {
          loadingBtn.done()
          $.smallBox({
            sound: false,
            title: '列印失敗',
            content: '請聯絡管理員，稍後再試',
            color: colors.green,
            iconSmall: 'fa fa-times',
            timeout: 4000,
          })
        }
      )
    } else {
      $.smallBox({
        sound: false,
        title: '目前無法列印',
        content: '條碼機執行任務中，請稍後再試',
        color: colors.red,
        iconSmall: 'fa fa-times',
        timeout: 4000,
      })
      setCheckingStatusSchedule(null, () => {
        loadingBtn.done()
        $.smallBox({
          sound: false,
          title: '可進行列印',
          content: '條碼機閒置中',
          color: colors.green,
          iconSmall: 'fa fa-check',
          timeout: 4000,
        })
      })
    }
  })
}
function checkPrinterStatus() {
  return new Promise((res) =>
    ajax(
      {
        url: 'api/ennoconn/qrcode/printer-status',
      },
      {
        success(printerRunningTaskName) {
          res(printerRunningTaskName)
        },
      }
    )
  )
}
function checkTaskStatus(id) {
  const requestParam = {
    url: 'api/ennoconn/qrcode/print-work-status',
    data: {
      code_name: id,
    },
  }
  return new Promise((res) =>
    ajax(requestParam, {
      success(status) {
        res(status)
      },
    })
  )
}
function setCheckingStatusSchedule(taskId, successCallback, failCallback) {
  let schedule = new Schedule(
    taskId ? `printingTask-${taskId}` : 'printerStatus',
    false
  )
    .freqMillisecond(1000)
    .type('timeout')

  if (taskId) {
    schedule = schedule.action((checkAgain) =>
      checkTaskStatus(taskId).then((status) => {
        switch (status) {
          case 'success':
            successCallback()
            break
          case 'fail':
          case 'not_found':
            failCallback()
            break
          case 'running':
          default:
            checkAgain()
            break
        }
      })
    )
  } else {
    schedule = schedule.action((checkAgain) =>
      checkPrinterStatus().then((printerRunningTaskName) => {
        if (printerRunningTaskName) {
          checkAgain()
        } else {
          successCallback()
        }
      })
    )
  }
  return schedule.start()
}
function sendPrintTask(requestParam) {
  return new Promise((res) =>
    ajax(requestParam, {
      success(id) {
        res({
          isPrinting: true,
          id,
        })
      },
      fail(id) {
        res({
          isPrinting: false,
          id,
        })
      },
    })
  )
}

export { initPrintQrcodeBtn }
