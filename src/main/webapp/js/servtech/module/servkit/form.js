import { map2NaturalComparedObjArray, naturalCompareValue } from './util.js'
import servkit from './servkit.js'
import { select2AllowClearHelper } from '../feature/customizeLibSetting.js'
import { getMachineName } from './machine.js'
import { colors } from './var.js'

/**
 * 資料形態轉換<br>
 * - float：轉成小數<br>
 * - percentage：轉成百分比<br>
 * - timeObj：轉成時間物件<br>
 * - suffix：轉成浮點數<br>
 * - floatMinutesToMS：將_._M改成_M_S<br>
 * - LAST_IDLE：將'LAST_IDLE'改成'***'<br>
 * - time：轉成y/m/d h:m:s<br>
 * - hourMin：轉成_H_M<br>
 * @memberof module:servkit
 * @param {String} dataFormat 轉換的資料形態
 * @param {any} data 要轉換的資料
 * @returns {any} data 轉換結果
 */
function switchDataFormat(dataFormat, data) {
  let result = data
  if (!dataFormat) {
    return result
  }
  try {
    let second
    let minute
    let hour
    switch (dataFormat.type) {
      // 小數點數字
      case 'float':
        result = parseFloat(data).toFixed(dataFormat.digit)
        break
      // 百分比
      case 'percentage':
        result = parseFloat(data * 100).toFixed(dataFormat.digit) + '%'
        break
      case 'timeObj':
        result = new Date(data.getTime()).format(dataFormat.format)
        break
      case 'suffix':
        result = parseFloat(data).toFixed(dataFormat.digit) + dataFormat.suffix
        break
      case 'floatMinutesToMS':
        if (parseFloat(data) === 0 || parseFloat(data)) {
          minute = Math.floor(data)
          second = Math.floor((data - minute) * 60)
          result =
            (minute < 10 ? '0' : '') +
            minute +
            'M ' +
            (second < 10 ? '0' : '') +
            second +
            'S'
        }
        break
      case 'LAST_IDLE':
        if (data.startsWith('LAST_IDLE')) {
          result = '***'
        }
        break
      case 'time':
        if (data.length === 20 || data.length === 17) {
          const Year = data.substring(0, 4)
          const Month = data.substring(4, 6)
          const Day = data.substring(6, 8)
          const Hour = data.substring(8, 10)
          const Minutes = data.substring(10, 12)
          const Seconds = data.substring(12, 14)
          result =
            Year +
            '/' +
            Month +
            '/' +
            Day +
            ' ' +
            Hour +
            ':' +
            Minutes +
            ':' +
            Seconds
        }
        break
      case 'hourMin':
        second = Math.floor(result / 1000)
        minute = Math.floor(second / 60)
        hour = Math.floor(minute / 60)
        // let day = Math.floor(hour / 24)

        hour = hour < 10 ? '0' + hour : hour
        minute = minute % 60 < 10 ? '0' + (minute % 60) : minute % 60
        result = hour + ' H ' + minute + ' M'
        break
      default:
        console.warn('undefined type:' + dataFormat.type)
    }
  } catch (e) {
    console.warn('exception = ' + e)
  }
  return result
}
//formate to string YYYY/MM/DD HH:mm:ss
function dateFormateString(dateString) {
  if (dateString == undefined || dateString == null || dateString == '')
    return ''
  console.warn(dateString)
  const check_OODate = function (date) {
    if (date.toString().length < 2) {
      return '0' + date.toString()
    }
    return date
  }
  const date = new Date(dateString)
  return (
    date.getFullYear() +
    '/' +
    check_OODate(parseInt(date.getMonth()) + 1) +
    '/' +
    check_OODate(parseInt(date.getDate())) +
    ' ' +
    check_OODate(parseInt(date.getHours())) +
    ':' +
    check_OODate(parseInt(date.getMinutes())) +
    ':' +
    check_OODate(parseInt(date.getSeconds()))
  )
}

/**
 * 在多選的下拉式選單中全選的行為
 * @memberof module:servkit
 * @param {any} e 使用者資訊
 */
function multiselectSettingSelectAll($select, defaultSelectAll) {
  const isSet = !!Array.from($select[0].options).find(
    (el) => el.textContent === 'ALL' && el.value === 'ALL'
  )
  if (isSet) {
    return
  }
  $select.prepend('<option>ALL</option>')
  multiselectHeightOptimization($select[0])
  $select
    .off('mousedown')
    .on('mousedown', multiselectWithoutCtrlMouseDown)
    .off('mousemove')
    .on('mousemove', multiselectWithoutCtrlMouseMove)

  // for mobile and tablet. Seems like the option is not what we saw on desktop browser, more like
  // chorme app render extra view over the multi-select options.
  let lastSelectAll = $select.find('option:first').prop('selected')
  $select.off('change').on('change', function (e) {
    const isSelectAll = $select.find('option:first').prop('selected')
    if (isSelectAll !== lastSelectAll) {
      $select.find('option').prop('selected', isSelectAll)
    }
    lastSelectAll = isSelectAll
  })

  $select
    .find('option:first')
    .off('click')
    .on('click', function (e) {
      const selectScrollTop = e.target.parentNode.scrollTop
      $select.find('option').prop('selected', this.selected)

      // 調整 scrollTop 的動作必須要延遲到所有 mousedown 事件都做完後
      setTimeout(function () {
        e.target.parentNode.scrollTop = selectScrollTop
      }, 0)
    })

  if (defaultSelectAll) {
    $select.find('option').prop('selected', 'selected')
  }
}

/**
 * 在多選的下拉式選單中執行即使不按Ctrl也可多選<br>
 * 按下Shift可連續多選
 * @memberof module:servkit
 * @param {any} e 使用者資訊
 */
function multiselectWithoutCtrlMouseDown(e) {
  let target = e.target
  let selectScrollTop
  let selected
  if (target instanceof window.HTMLOptionElement) {
    e.preventDefault()
    selectScrollTop = target.parentNode.scrollTop

    target.selected = !target.selected
    if (e.shiftKey) {
      // 壓住 shift 要往上「全選」或「反全選」
      selected = target.selected
      target = target.previousElementSibling
      while (
        target instanceof window.HTMLOptionElement &&
        target.selected === !selected
      ) {
        target.selected = !target.selected
        target = target.previousElementSibling
      }
    }

    // 調整 scrollTop 的動作必須要延遲到所有 mousedown 事件都做完後
    setTimeout(function () {
      e.target.parentNode.scrollTop = selectScrollTop
    }, 0)

    $(this).focus()
    $(target).closest('select').change() // 加了preventDefault會讓值沒有改變因此要自己觸發change事件
  }
}

/**
 * 取消按著左鍵於下拉式選單內拖拉可連續多選的效果
 * @memberof module:servkit
 * @param {any} e 使用者資訊
 */
function multiselectWithoutCtrlMouseMove(e) {
  if (e.target instanceof window.HTMLOptionElement) {
    e.preventDefault()
  }
}

/**
 * 預設下拉式選單的高度
 * @memberof module:servkit
 * @param {any} selectElement
 */
function multiselectHeightOptimization(selectElement) {
  const optionHeight = $(selectElement).find(':first-child').height() || 22
  if (selectElement.hasAttribute('multiple')) {
    if (selectElement.options.length > 10) {
      selectElement.style.height = optionHeight * 10 + 15 + 'px'
    } else {
      selectElement.style.height =
        selectElement.options.length * optionHeight + 15 + 'px'
    }
  }
}

/**
 * 紀錄按鈕原始資訊
 * @letructor
 * @memberof module:servkit
 * @this {LoadingButton}
 * @param {DOM} btnElement 按鈕物件
 */
function LoadingButton(btnElement) {
  this.btn = btnElement
  this.btnContent = btnElement.innerHTML
  $(btnElement).data('loadingButton', this)
}

/**
 * 繪製旋轉中的螺絲圖示，並取消按鈕功能
 * @this {LoadingButton}
 */
LoadingButton.prototype.doing = function () {
  this.btn.innerHTML = '<i class="fa fa-gear fa-2x fa-spin fa-lg"></i>'
  this.btn.setAttribute('disabled', 'disabled')
}
/**
 * 在0.5秒後將按鈕資訊還原，並重新開起按鈕功能
 * @this {LoadingButton}
 */
LoadingButton.prototype.done = function () {
  setTimeout(
    _.bind(function () {
      this.btn.innerHTML = this.btnContent
      this.btn.removeAttribute('disabled')
    }, this),
    500
  )
}

/**
 * 建置一載入中的按鈕
 * @memberof module:servkit
 * @param {DOM} btnElement
 * @returns {LoadingButton} LoadingButton(btnElement) 創建的函式
 */
function loadingButton(btnElement) {
  return new LoadingButton(btnElement)
}

/**
 * 取得table資訊並下載為Excel檔
 * @memberof module:servkit
 * @param {DOM} btn 取得按鈕物件
 * @param {Function} dataCallback 回傳資料的格式
 */
// 下載 Excel
function downloadExcel(btn, dataCallback) {
  let hiddenFormId

  $(btn).on('click', function (e) {
    hiddenFormId && $('#' + hiddenFormId).remove()
    hiddenFormId = 'hiddenFormId' + moment().format('YYYYMMDDHHmmssSSSS')

    const $submitForm = $('<form id="' + hiddenFormId + '"></form>')
    const iframeHtml =
      '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;"></iframe>'
    $submitForm.append(
      $('<input>').attr('name', 'data').val(JSON.stringify(dataCallback()))
    )
    $submitForm.attr({
      action: servkit.rootPath + '/api/excel/download',
      method: 'post',
      target: 'download_target',
    })
    $(this).after($submitForm.hide())
    $submitForm.append(iframeHtml)

    document.querySelector('#' + hiddenFormId).submit()
  })
}
/**
 * 客製化取得table資訊並下載為Excel檔
 * @memberof module:servkit
 * @param {DOM} btn 取得按鈕物件
 * @param {Function} dataCallback 回傳資料的格式
 */
// 下載 Excel
function downloadCustomizedExcel(btn, dataCallback) {
  let hiddenFormId

  $(btn).on('click', function (e) {
    hiddenFormId && $('#' + hiddenFormId).remove()
    hiddenFormId = 'hiddenFormId' + moment().format('YYYYMMDDHHmmssSSSS')

    const $submitForm = $('<form id="' + hiddenFormId + '"></form>')
    const iframeHtml =
      '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;"></iframe>'
    $submitForm.append(
      $('<input>').attr('name', 'data').val(JSON.stringify(dataCallback()))
    )
    $submitForm.attr({
      action: servkit.rootPath + '/api/excel/fromTemplate',
      method: 'post',
      target: 'download_target',
    })
    $(this).after($submitForm.hide())
    $submitForm.append(iframeHtml)

    document.querySelector('#' + hiddenFormId).submit()
  })
}

/**
 * 下載paramCallback回傳的資料
 * @memberof module:servkit
 * @param {DOM} btn 取得按鈕物件
 * @param {String} url 指定要呼叫的API
 * @param {Function} paramCallback 下載後的行為
 */
function downloadFile(btn, url, paramCallback, method) {
  let hiddenFormId

  $(btn).on('click', function (e) {
    hiddenFormId && $('#' + hiddenFormId).remove()
    hiddenFormId = 'hiddenFormId' + moment().format('YYYYMMDDHHmmssSSSS')

    const $submitForm = $('<form id="' + hiddenFormId + '"></form>')
    const iframeHtml =
      '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;"></iframe>'
    const param = paramCallback(e)
    if (!param) {
      return
    }
    for (const key in param) {
      if (Object.prototype.hasOwnProperty.call(param, key)) {
        $submitForm.append($('<input>').attr('name', key).val(param[key]))
      }
    }
    $submitForm.attr({
      action: servkit.rootPath + url,
      method: method || 'post',
      target: 'download_target',
    })
    $(this).after($submitForm.hide())
    $submitForm.append(iframeHtml)

    document.querySelector('#' + hiddenFormId).submit()
  })
}

/**
 * 當沒有資料時產生一dialog視窗提醒
 * @memberof module:servkit
 * @returns {DOM} $dialog
 */
function noDataDialog() {
  // 佈署查無資料時的提示視窗
  $('#content').append(
    $('<div id="dialog-no-data" title="Dialog No Data"></div>')
  )
  const $dialog = $('#dialog-no-data')
  $dialog.dialog({
    autoOpen: false,
    width: 200,
    resizable: false,
    modal: true,
    title: 'No Data',
    buttons: [
      {
        html: "<i class='fa fa-frown-o'></i>&nbsp; OK",
        class: 'btn btn-default',
        click: function () {
          $(this).dialog('close')
        },
      },
    ],
  })
  return $dialog
}

/**
 * 去檔案取資料
 * @memberof module:servkit
 * @param {Object} dataConfig 資料格式
 * @param {DOM} $select
 * @param {Function} cb 載完下拉式選單後執行的函式
 */
function initSelect(dataConfig, $select, cb) {
  servkit.ajax(
    {
      url: servkit.rootPath + '/api/getdata/file',
      type: 'POST',
      contentType: 'application/json',
      async: true,
      data: JSON.stringify(dataConfig),
    },
    function (data) {
      const html = []
      _.each(data, function (elem) {
        html.push("<option value='" + elem[0] + "'>" + elem[1] + '</option>')
      })

      if ($select.length === 1) {
        $select.html(html.join(''))
      } else {
        _.each($select, function (dom) {
          $(dom).html(html.join(''))
        })
      }

      if (cb && typeof cb === 'function') {
        cb(data)
      }
    }
  )
}

/**
 * 初始機台選擇的狀態
 * @memberof module:servkit
 * @param {DOM} $machineSelect
 * @param {Boolean} defaultSelectAll 是否預設為全選
 */
function initMachineSelect($machineSelect, defaultSelectAll) {
  const machineSelectHtml = $machineSelect.attr('multiple')
    ? ['<option>ALL</option>']
    : []
  const machineObjAry = []
  servkit.eachMachine(function (id, name) {
    machineObjAry.push({
      key: id,
      name: name,
    })
  })
  _.each(machineObjAry.sort(naturalCompareValue), function (elem) {
    machineSelectHtml.push(
      '<option style="padding:3px 0 3px 3px;" value="' +
        elem.key +
        '">' +
        elem.name +
        '</option>'
    )
  })
  renderSelect($machineSelect, machineSelectHtml, defaultSelectAll)
}

/**
 * 初始多選下拉式的選單內容
 * @memberof module:servkit
 * @param {Object} dataList 機台ID和name
 * @param {DOM} $select
 * @param {Boolean} defaultSelectAll 是否預設為全選
 */
function initSelectWithList(dataList, $select, defaultSelectAll) {
  const selectHtml = []

  if (_.isArray(dataList)) {
    const isTwoDimention = _.isArray(dataList[0])
    let key
    let value

    _.each(dataList, function (elem) {
      if (isTwoDimention) {
        ;[key, value] = elem
      } else {
        value = key = elem
      }
      selectHtml.push(
        '<option style="padding:3px 0 3px 3px;" value="' +
          key +
          '">' +
          value +
          '</option>'
      )
    })
  } else {
    _.each(map2NaturalComparedObjArray(dataList), function (elem) {
      selectHtml.push(
        '<option style="padding:3px 0 3px 3px;" value="' +
          elem.key +
          '">' +
          elem.name +
          '</option>'
      )
    })
  }

  if ($select.attr('multiple') && !$select.hasClass('select2')) {
    selectHtml.unshift('<option>ALL</option>')
    renderSelect($select, selectHtml, defaultSelectAll)
  } else {
    $select.html(selectHtml.join(''))
  }
}

/**
 * 當裝置為平板或手機時，chrome會另外渲染出一多選的下拉式選單，因此all這個選項需要另外判斷
 * @memberof module:servkit
 * @param {DOM} $select
 * @param {Array} selectHtmlAry 下拉式選單選項的html
 * @param {Boolean} defaultSelectAll 是否預設為全選
 */
function renderSelect($select, selectHtmlAry, defaultSelectAll) {
  $select.html(selectHtmlAry.join(''))
  multiselectHeightOptimization($select[0])
  $select
    .off('mousedown')
    .on('mousedown', multiselectWithoutCtrlMouseDown)
    .off('mousemove')
    .on('mousemove', multiselectWithoutCtrlMouseMove)

  if ($select.attr('multiple')) {
    // for mobile and tablet. Seems like the option is not what we saw on desktop browser, more like
    // chorme app render extra view over the multi-select options.
    let lastSelectAll = $select.find('option:first').prop('selected')
    $select.off('change').on('change', function (e) {
      const isSelectAll = $select.find('option:first').prop('selected')
      if (isSelectAll !== lastSelectAll) {
        $select.find('option').prop('selected', isSelectAll)
      }
      lastSelectAll = isSelectAll
    })

    $select
      .find('option:first')
      .off('click')
      .on('click', function (e) {
        const selectScrollTop = e.target.parentNode.scrollTop
        $select.find('option').prop('selected', this.selected)

        // 調整 scrollTop 的動作必須要延遲到所有 mousedown 事件都做完後
        setTimeout(function () {
          e.target.parentNode.scrollTop = selectScrollTop
        }, 0)
      })
  }

  if (defaultSelectAll) {
    $select.find('option').prop('selected', 'selected')
  }
}

/**
 * 初始化 datepicker ，若有兩個則會包含 startDate <= endDate 的驗證
 * @memberof module:servkit
 * @param  {DOM} $startDate - first datepicker
 * @param  {DOM} [$endDate] - second datepicker (optional)
 * @param  {Boolean} [bothToday=false] - is first and second datepicker both today?
 * @param  {int} [durationLimit] - max duration between startDate and endDate
 */
function initDatePicker(
  $startDate,
  $endDate,
  bothToday = false,
  durationLimit,
  submitBtnSelector = '#submit',
  option = {}
) {
  const datepickerConfig = Object.assign(
    {
      dateFormat: 'yy/mm/dd',
      prevText: '<i class="fa fa-chevron-left"></i>',
      nextText: '<i class="fa fa-chevron-right"></i>',
    },
    option
  )
  const yesterday = moment().add(-1, 'd').format('YYYY/MM/DD')
  const today = moment().format('YYYY/MM/DD')

  if (!$startDate) {
    return
  }
  if ($endDate && !bothToday) {
    $startDate.datepicker(datepickerConfig).val(yesterday)
  } else {
    $startDate.datepicker(datepickerConfig).val(today)
  }

  if ($endDate) {
    $endDate.datepicker(datepickerConfig).val(today)

    // make sure startDate <= endDate and duration doesn't exceed the limit
    // 起始時間可以自由選擇，按下送出按鈕才會驗證開始時間
    $endDate.on('change', function (evt) {
      const startDate = $startDate.val()
      const endDate = this.value
      if (!moment(endDate, 'YYYY/MM/DD', true).isValid()) {
        return
      }
      const isEarlierThanStartDate = moment(endDate).isBefore(startDate)
      const maxEndDate = durationLimit
        ? moment(startDate).add(durationLimit, 'day').format('YYYY/MM/DD')
        : null
      const isExceedDurationLimit =
        maxEndDate && moment(maxEndDate).isBefore(endDate)
      if (isEarlierThanStartDate) {
        $.smallBox({
          sound: false,
          title: '時間範圍錯誤',
          content: `起始時間不得晚於結束時間，請修改時間`,
          color: servkit.colors.red,
          iconSmall: 'fa fa-times',
          timeout: 4000,
        })
      } else if (isExceedDurationLimit) {
        $.smallBox({
          sound: false,
          title: '時間範圍錯誤',
          content: `時間區間不得超過 ${durationLimit} 天，請修改時間`,
          color: servkit.colors.red,
          iconSmall: 'fa fa-times',
          timeout: 4000,
        })
      }
    })
    // 起始時間晚於結束時間時，起始時間等於結束時間
    // 若兩者區間大於限制，起始時間等於最小起始時間(以結束時間和區間限制算出)
    $(submitBtnSelector).on('click', (e) => {
      const startDate = $startDate.val()
      const endDate = $endDate.val()
      const minStartDate = durationLimit
        ? moment(endDate).subtract(durationLimit, 'day').format('YYYY/MM/DD')
        : null
      const isExceedDurationLimit =
        minStartDate && moment(startDate).isBefore(minStartDate)
      if (moment(endDate).isBefore(startDate)) {
        $.smallBox({
          sound: false,
          title: '時間範圍錯誤',
          content: `起始時間不得晚於結束時間，請修改時間`,
          color: servkit.colors.red,
          iconSmall: 'fa fa-times',
          timeout: 4000,
        })
        e.stopImmediatePropagation()
      } else if (isExceedDurationLimit) {
        $.smallBox({
          sound: false,
          title: '時間範圍錯誤',
          content: `時間區間不得超過 ${durationLimit} 天，請修改時間`,
          color: servkit.colors.red,
          iconSmall: 'fa fa-times',
          timeout: 4000,
        })
        e.stopImmediatePropagation()
      }
    })
  }
}

/**
 * add export to pdf / png function
 * @memberof module:servkit
 * @param {any} headId which container will add Export button
 * @param {any} canvasId which container will be export to pdf or png
 * @param {any} canvasId2 which container will be export to pdf or png
 */
function addChartExport(headId, canvasId, canvasId2) {
  const pdfid =
    headId.replace('#', '') + '_' + canvasId.replace('#', '') + '_pdf'
  const pngid =
    headId.replace('#', '') + '_' + canvasId.replace('#', '') + '_png'
  const spdfid = '#' + pdfid
  const spngid = '#' + pngid
  const buttonHtml =
    '<div class="widget-toolbar" role="menu">' +
    '<div id="export_image" class="btn-group">' +
    '<button class="btn dropdown-toggle btn-xs btn-success" data-toggle="dropdown">' +
    i18n('Export') +
    ' <i class="fa fa-caret-down"></i>' +
    '</button>' +
    '<ul class="dropdown-menu pull-right">' +
    '<li>' +
    '<a id="' +
    pdfid +
    '" href="javascript:void(0);">' +
    i18n('Download_Pdf') +
    '</a>' +
    '</li>' +
    '<li>' +
    '<a id="' +
    pngid +
    '" download="chart.png" href="">' +
    i18n('Download_Png') +
    '</a>' +
    '</li>' +
    '</ul>' +
    '</div>' +
    '</div>'

  const head = $(headId)
  if (head !== undefined) head.append(buttonHtml)

  $(spngid).on('click', function (e) {
    e.preventDefault()

    let image
    html2canvas($(canvasId)[0], {
      onrendered: function (canvas) {
        const a = document.createElement('a')
        // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
        a.href = canvas
          .toDataURL('img/png')
          .replace('img/png', 'img/octet-stream')
        a.download = 'chart.png'
        a.click()
      },
    })

    if (canvasId2 !== undefined) {
      if ($(canvasId2)[0].children.length > 0) {
        html2canvas($(canvasId2)[0], {
          onrendered: function (canvas) {
            const a = document.createElement('a')
            // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
            a.href = canvas
              .toDataURL('img/png')
              .replace('img/png', 'img/octet-stream')
            a.download = 'chart2.png'
            a.click()
          },
        })
      }
    }
    this.href = image
  })

  $(spdfid).on('click', function (e) {
    e.preventDefault()

    // $(".legendColorBox").switchClass('legendColorBox', 'legendColorBoxs');
    html2canvas($(canvasId)[0], {
      onrendered: function (canvas) {
        subOnrendered(canvas, 'chart.pdf')
      },
    })
    // $(".legendColorBoxs").switchClass('legendColorBoxs', 'legendColorBox');

    if (canvasId2 !== undefined) {
      if ($(canvasId2)[0].children.length > 0) {
        html2canvas($(canvasId2)[0], {
          onrendered: function (canvas) {
            subOnrendered(canvas, 'chart2.pdf')
          },
        })
      }
    }
  })

  function subOnrendered(canvas, pdfName) {
    const image = canvas
      .toDataURL('img/png')
      .replace('img/png', 'img/octet-stream')
    const zoom = canvas.height ? canvas.height / 1000 : 1 / 1000
    const imgobj = new Image()
    let imgW = imgobj.width
    let imgH = imgobj.height
    imgobj.src = image
    imgW = Math.floor(imgW * 0.264583)
    imgH = Math.floor(imgH * 0.264583)

    imgobj.onload = function () {
      imgW = imgobj.width
      imgH = imgobj.height
    }

    if (imgobj.width === 0) imgW = 285
    if (imgobj.height === 0) imgH = 200

    // l : 橫向 or  p : 直向 , 'mm' : 單位
    const JsPDF = jsPDF // just to avoid eslint new-cap error, letructor should start with an uppercase letter
    const doc = new JsPDF('l', 'mm', 'a4')
    // doc.addImage(imgobj, 'PNG', 2, 2, imgW, imgH * zoom)
    doc.addImage(
      imgobj,
      'PNG',
      10,
      10,
      277,
      (canvas.height * 277) / canvas.width
    )
    doc.save(pdfName)
    // doc.save('chart2.pdf')
    // window.location = image;
  }
}
/**
 * add export to pdf / png function
 * @memberof module:servkit
 * @param {any} headId which container will add Export button
 */
function addmultiChartExport(headId, canvasarr) {
  const pdfid = headId.replace('#', '') + '_' + 'stack-chart_pdf'
  const pngid = headId.replace('#', '') + '_' + 'stack-chart_png'
  const spdfid = '#' + pdfid
  const spngid = '#' + pngid
  const buttonHtml =
    '<div class="widget-toolbar" role="menu">' +
    '<div id="export_image" class="btn-group">' +
    '<button id="export-btn" class="btn dropdown-toggle btn-xs btn-success" data-toggle="dropdown">' +
    i18n('Export') +
    '<i class="fa fa-caret-down"></i>' +
    '</button>' +
    '<ul class="dropdown-menu pull-right">' +
    '<li>' +
    '<a id="' +
    pdfid +
    '" href="javascript:void(0);">' +
    i18n('Download_Pdf') +
    '</a>' +
    '</li>' +
    '<li>' +
    '<a id="' +
    pngid +
    '" download="chart.png" href="">' +
    i18n('Download_Png') +
    '</a>' +
    '</li>' +
    '</ul>' +
    '</div>' +
    '</div>'

  const head = $(headId)
  if (head !== undefined) head.append(buttonHtml)
  const chartLoadingBtn = loadingButton(document.querySelector('#export-btn'))

  $(spngid).on('click', function (e) {
    e.preventDefault()
    chartLoadingBtn.doing()
    let image
    const promises = []
    _.each(canvasarr, function (canvasId) {
      promises.push(
        new Promise(function (resolve) {
          html2canvas($(canvasId)[0], {
            onrendered: function (canvas) {
              const a = document.createElement('a')
              // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
              a.href = canvas
                .toDataURL('img/png')
                .replace('img/png', 'img/octet-stream')
              a.download = 'chart.png'
              a.click()
              resolve(canvasId)
            },
          })
        })
      )
    })
    Promise.all(promises).then(function () {
      chartLoadingBtn.done()
    })
    this.href = image
  })

  $(spdfid).on('click', function (e) {
    e.preventDefault()
    chartLoadingBtn.doing()
    const copyarr = canvasarr.slice(0)
    // l : 橫向 or  p : 直向 , 'mm' : 單位
    const JsPDF = jsPDF // just to avoid eslint new-cap error, letructor should start with an uppercase letter
    servkit.exportPdfDoc = new JsPDF('l', 'mm', 'a4')
    servkit.exportPdfDoc.runcheck = copyarr.length
    servkit.exportPdfDoc.runIndex = 0
    servkit.exportPdfDoc.pagechk = true
    copyarr.reverse()
    subOnrendered(copyarr)
  })

  function subOnrendered(canvasarr) {
    if (canvasarr.length > 0) {
      new Promise(function (resolve, reject) {
        html2canvas($(canvasarr[canvasarr.length - 1])[0], {
          onrendered: function (canvas) {
            const zoom = canvas.height ? canvas.height / 1000 : 1 / 1000
            const doc = servkit.exportPdfDoc
            doc.pagechk == true ? (doc.pagechk = false) : doc.addPage()
            doc.runIndex += 1
            doc.image = canvas
              .toDataURL('img/png')
              .replace('img/png', 'img/octet-stream')
            doc.imgobj = new Image()
            doc.imgobj.src = doc.image

            if (doc.imgobj.width === 0) doc.imgW = 285
            if (doc.imgobj.height === 0) doc.imgH = 200
            doc.addImage(doc.imgobj, 'PNG', 2, 2, doc.imgW, doc.imgH * zoom)
            canvasarr.pop()
            resolve(canvasarr)
          },
        })
      }).then(function (data) {
        subOnrendered(data)
      })
    } else {
      servkit.exportPdfDoc.save('Chart.pdf')
      delete servkit.exportPdfDoc
      chartLoadingBtn.done()
    }
  }
}

/**
 * 一定要在綁定查詢事件前呼叫
 * @memberof module:servkit
 * @param {DOM} $form
 * @param {DOM} $submitBtn
 */
function validateForm($form, $submitBtn, option = {}) {
  const validator = $form.validate(
    Object.assign(
      {
        ignore: '*:not([name]), :hidden', // do not validate DOM without name attribute or, ex: the input select2 added
        errorPlacement: function (error, element) {
          if (element.is(':radio') || element.is(':checkbox')) {
            error.insertBefore(element) // insert error label before input to keep the css style ".smart-form .radio input:checked+i:after" working
          } else {
            error.insertAfter(element)
          }
        },
      },
      option
    )
  )

  $submitBtn.on('click', function (evt) {
    evt.preventDefault()
    if (!validator.form()) {
      // 沒通過驗證的話，阻止查詢資料的 Click 繼續發生
      evt.stopImmediatePropagation()
    }
  })

  return validator
}

/**
 * 更新表單內容
 * @memberof module:servkit
 * @param {Object} configObj 表單設定
 * @returns {Object} upload
 */
function uploader(configObj) {
  const form = configObj.formEle
  const api = form.action || configObj.api
  const callback = configObj.resolver
  const $form = $(form)
  const key = moment().format('YYYYMMDDHHmmssSSSS') + _.uniqueId()

  form.setAttribute('target', 'upload_target_' + key)
  form.setAttribute('action', api)
  form.setAttribute('method', 'post')
  form.setAttribute('enctype', 'multipart/form-data')

  if ($form.find('input[type="submit"]').length === 0) {
    $form.append('<input type="submit" class="hide"/>')
  }

  if ($form.parent().find('iframe').length === 0) {
    $form
      .parent()
      .append('<iframe name="upload_target_' + key + '" class="hide"></iframe>')
  }

  $form
    .parent()
    .find('iframe[name="upload_target_' + key + '"]')
    .on('load', function (evt) {
      servkit.responseRule(
        this.contentWindow.document.querySelector('body').textContent,
        callback
      )
    })

  return {
    upload: function () {
      form.submit()
    },
  }
}

/**
 * 包含要驗證的方法,基本的型態驗證
 */
const inputDataCheck = {
  isNumber(str) {
    // 空字串也等同非數字
    if (!str) {
      return false
    }
    return !isNaN(Number(str))
  },
  isFloat(n) {
    return Number(n) === n && n % 1 !== 0
  },
  isDefault(str) {
    if (this.isNull(str)) return 0
    if (this.isUndefind(str)) return -1
  },
  checkEscapeSymbol(str) {
    if (typeof val !== 'string') return str
    let temp
    let result
    if (str == null) {
      return str
    } else {
      temp = str.replace(/\\/g, '\\\\')
      result = temp.replace(/'/g, "\\'")
      return result
    }
  },
  symbolValidation(str) {
    const regSymbol = /[,"<>']/
    return regSymbol.test(str)
  },
  isNull(str) {
    return str === null
  },
  isUndefind(str) {
    return str === undefined
  },
  outOfLen(str, len) {
    return str.length > len ? true : false
  },
  unsignInt(str) {
    return parseInt(str) < 0
  },
  /*
   * -1: undefind
   * 0 : null
   * 1 : true
   */
  switchFunc(val, columnInfos) {
    const { type, size, nullable, columnType } = columnInfos
    //通用的驗證
    if (typeof val !== 'string') {
      return null
    }
    if (this.isDefault(val) < 1) {
      return null
    }
    if (type !== 'mediumtext' && this.symbolValidation(val)) {
      return i18n('Symbol_String')
    }
    if (size && this.outOfLen(val, size)) {
      return i18n('Out_Of_Len').replace('{size}', size)
    }
    if (!nullable && val.length === 0) {
      return i18n('Required')
    }
    if (columnType.includes('unsigned') && val < 0) {
      return i18n('Unsigned')
    }

    switch (type) {
      case 'float':
        if (!this.isNumber(val) && !this.isFloat(val)) {
          return i18n('Not_Float')
        }
        break
      case 'int':
      case 'tinyint':
      case 'bigint':
      case 'decimal':
      case 'double':
        if (!this.isNumber(val)) {
          return i18n('Not_Number')
        }
        break
      case 'datetime':
      case 'date':
      case 'time':
      case 'timestamp':
      default:
        return null
    }

    const decimalMatchedResult = /^decimal\((\d{1,10}),(\d{1,10})\)/.exec(
      columnType
    )
    if (decimalMatchedResult) {
      const totalDigitsCount = decimalMatchedResult[1] // 有效位數
      const decimalDigitsCount = decimalMatchedResult[2] // 小數位數
      const integerDigitsCount = totalDigitsCount - decimalDigitsCount
      const isDecimal = new RegExp(
        `^\\d{0,${integerDigitsCount}}\\.{0,1}\\d{0,${decimalDigitsCount}}$`
      ).test(val)
      return isDecimal
        ? null
        : i18n('Decimal_Format_Error')
            .replace('{S}', decimalDigitsCount)
            .replace('{P}', totalDigitsCount)
    }
  },
}

function getSelect2LazyLoadFn(pageSize = 20) {
  return function (queryInfo) {
    const queryResult = []

    if (queryInfo.term) {
      this.data
        .filter(({ text }) => {
          return (
            text
              .toString()
              .toUpperCase()
              .indexOf(queryInfo.term.toUpperCase()) >= 0
          )
        })
        .forEach((val) => queryResult.push(val))
    } else {
      this.data.forEach((val) => queryResult.push(val))
    }
    queryInfo.callback({
      results: queryResult.slice(
        (queryInfo.page - 1) * pageSize,
        queryInfo.page * pageSize
      ),
      more: queryResult.length >= queryInfo.page * pageSize,
    })
  }
}
function initSelect2WithData(el, data, isLazyload = true, option = {}) {
  const defaultConfig = {}

  if (_.isArray(data)) {
    defaultConfig.data = data.map((val) => ({
      id: val,
      text: val.toString(), // text 一定要是字串
    }))
  } else if (_.isObject(data)) {
    defaultConfig.data = Object.entries(data).map(([key, val]) => ({
      id: key,
      text: val.toString(), // text 一定要是字串
    }))
  }

  if (isLazyload) {
    defaultConfig.query = getSelect2LazyLoadFn(option.pageSize)
  }
  $(el).select2(Object.assign(defaultConfig, option))
  if (option.allowClear && option.placeholder) {
    select2AllowClearHelper(el)
  }
}
// 初始化廠區與機台連動的 select，會過濾有綁定廠牌功能的機台 m_app_func_brand
function renderPlantAndMachineSelect(
  plantAreaMachineMap,
  $plantSelect,
  $machineSelect,
  appId,
  funcId
) {
  const filteredPlantAreaMachineMap = _.chain(plantAreaMachineMap)
    .mapObject((machineMap) =>
      servkit.filterFuncBindMachine(machineMap, appId, funcId)
    )
    .pick((machineMap) => !_.isEmpty(machineMap))
    .value()
  const plantMap = _.mapObject(filteredPlantAreaMachineMap, (val, plantId) =>
    servkit.getPlantAreaName(plantId)
  )
  if (_.isEmpty(filteredPlantAreaMachineMap)) {
    $.smallBox({
      sound: false,
      title: '無法顯示廠區和機台',
      content: `「管理廠區」和「管理APP功能廠牌」設定的機台沒有交集<br>麻煩請確認`,
      color: colors.red,
      iconSmall: 'fa fa-times',
    })
    return
  }
  servkit.initSelectWithList(plantMap, $plantSelect)
  $plantSelect
    .data('plantAreaMachineMap', filteredPlantAreaMachineMap)
    .on('change', function (e) {
      const plantId = $(this).val()
      servkit.initSelectWithList(
        $(this).data('plantAreaMachineMap')[plantId],
        $machineSelect
      )
    })
    .trigger('change')
}

async function getPlantMachineOptionMap(isMultiSelect = true) {
  const plantAreaMachineMap = await servkit.fetchPlantAreaDataPromise.then(() =>
    servkit.getPlantAreaMachineMap()
  )
  const result = _.mapObject(plantAreaMachineMap, (machineList) =>
    Object.fromEntries(
      machineList.map((machineId) => [machineId, getMachineName(machineId)])
    )
  )
  if (isMultiSelect) {
    const allPlantMachineMap = {
      __ALL: Object.assign({}, ...Object.values(result)),
    }
    return Object.assign(allPlantMachineMap, result)
  } else {
    return result
  }
}

export {
  switchDataFormat,
  dateFormateString,
  multiselectHeightOptimization,
  multiselectSettingSelectAll,
  multiselectWithoutCtrlMouseDown,
  multiselectWithoutCtrlMouseMove,
  loadingButton,
  downloadExcel,
  downloadCustomizedExcel,
  downloadFile,
  noDataDialog,
  initSelect,
  initMachineSelect,
  initSelectWithList,
  renderSelect,
  initDatePicker,
  addChartExport,
  addmultiChartExport,
  validateForm,
  uploader,
  inputDataCheck,
  initSelect2WithData,
  renderPlantAndMachineSelect,
  getPlantMachineOptionMap,
}
