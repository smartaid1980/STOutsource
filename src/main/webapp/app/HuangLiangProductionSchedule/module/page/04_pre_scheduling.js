import {
  DATE_FORMAT,
  DATETIME_FORMAT_WITHOUT_SEC,
  DATETIME_FORMAT,
  DATETIME_FORMAT_BACKEND,
  HOURTIME_FORMAT,
  DATE_DAY_FORMAT,
  TIME_FORMAT,
  MILLISECONDS_PER_HOUR,
  MILLISECONDS_PER_DAY,
} from '../constans.js'
import {
  getHistoryInfoHtml,
  getSampleToolHistoryData,
  macro521ToUserName,
  getToolHistoryData,
} from '../historyDataController.js'
import {
  loadingButton,
  initDatePicker,
  initSelectWithList,
  validateForm,
} from '../../../../js/servtech/module/servkit/form.js'
import { ajax } from '../../../../js/servtech/module/servkit/ajax.js'
import {
  Work,
  WoList,
  NonProduction,
  ProductionScheduling,
  WoMStatus,
  WoMStatusAct,
  PartCount,
} from '../Work.js'
import { getWorkCalendar } from '../WorkCalendar.js'
import preCondition from '../../../../js/servtech/module/preCondition.js'
import { EditScheduleModal } from '../component/EditScheduleModal.js'
import { RecommendScheduleController } from '../RecommendScheduleController.js'
import {
  fetchWoList,
  fetchAllScheduleData,
  saveAssignment,
  updateScheduleStatus,
  saveFeatureData,
} from '../dataModel.js'

export const context = {
  shiftMap: {}, // 紀錄班次的起始和結束時間
  machineMap: {}, // 紀錄機台資訊
  offset: 0, // 紀錄calendar跟班次(現在)時間的差異。calendar轉班次: add，班次轉calendar: subtract
  duration: 0, // 紀錄班次時間長度
  calendar: null, // calendar相關
  datetimePickerOptions: {
    // 預設datetimepicker的設定
    locale: 'zh-tw',
    format: 'YYYY/MM/DD HH:mm',
    keyBinds: false, // 取消預設的事件行為
  },
  inspectPScheduleLoadingBtn: loadingButton(
    document.getElementById('inspect-p-schedule-btn')
  ), // 檢查排程
  insertPScheduleLoadingBtn: loadingButton(
    document.getElementById('insert-p-schedule-btn')
  ), // 插入排程
  cancelPScheduleLoadingBtn: loadingButton(
    document.getElementById('cancel-p-schedule-btn')
  ), // 取消預排
  toWoMStatusLoadingBtn: loadingButton(
    document.getElementById('to-wo-m-status-btn')
  ), // 轉派工
  transferToWoMStatusLoadingBtn: loadingButton(
    document.getElementById('transfer-to-wo-m-status-btn')
  ), // 派工
  insertnonPLoadingBtn: loadingButton(
    document.getElementById('insert-non-p-btn')
  ), // 確認(非量產時間)
  cancelScheduleLoadingBtn: loadingButton(
    document.getElementById('cancel-schedule-btn')
  ), // 刪除排程
  SHIFT_TIME_OFFSET_TO_CALENDAR_TIME: 0,
  SHIFT_DURATION: 0,
  $calendar: $('#calendar'),
  $editNonProductionForm: $('#edit-non-p-form'),
  $machineType: $('#machine-type'),
  $machineId: $('#machine-id'),
  woList: null,
  recommendScheduleController: null,
  main() {
    const context = this
    /**
     * macro521：人員
     * macro522：狀態
     * macro523：訂單
     */
    // 取得各班次時間
    context.shiftMap = context.getShiftTimeRange()
    context.shiftNameList = Object.keys(context.shiftMap)
    // 組合機台資訊
    context.machineMap = context.getMachineMap()
    context.machineIdNameMap = _.mapObject(
      context.machineMap,
      (obj) => obj.device_name
    )
    // 取得人員資訊
    context.regulateUserMap = Object.fromEntries(
      context.preCon.sysUserMap
        .filter(
          (obj) =>
            obj.sys_groups &&
            obj.sys_groups.find(
              ({ group_id }) => group_id === 'factory_service_regulate'
            )
        )
        .map((obj) => [obj.user_id, obj.user_name])
    )
    context.allUserMap = Object.assign(
      {},
      Object.fromEntries(
        context.preCon.sysUserMap.map((obj) => [obj.user_id, obj.user_name])
      ),
      context.preCon.huangliangUserMap
    )
    loadingButton(document.getElementById('query-wo-list-btn'))
    loadingButton(document.getElementById('refresh-query-wo-list-btn'))
    loadingButton(document.getElementById('query-schedule-btn'))
    // context.getEditScheduleModalInstance();
    context.initCalendar()
    // 建立各種排程的class
    context.initWork()
    context.initRecommendScheduleController()
    // 初始化編輯排程的modal
    context.initEditScheduleModal()
    context.initHistoryDataTable()
    context.initWoListWidget()
    context.initNonProductinoModal()
    context.initQueryScheduleForm()
  },
  initCalendar() {
    const context = this

    if (context.calendar) {
      return
    }
    const { $calendar } = context
    const START_TIME_OF_TODAY = new Date(moment().format(DATE_FORMAT))
    const START_TIME_OF_FIRST_SHIFT = new Date(this.preCon.getShift[0].start)
    const END_TIME_OF_FIRST_SHIFT = new Date(this.preCon.getShift[0].end)
    const SHIFT_DURATION = (context.SHIFT_DURATION = Math.ceil(
      Math.abs(START_TIME_OF_FIRST_SHIFT - END_TIME_OF_FIRST_SHIFT) /
        MILLISECONDS_PER_HOUR
    ))
    const SHIFT_TIME_OFFSET_TO_CALENDAR_TIME = (context.SHIFT_TIME_OFFSET_TO_CALENDAR_TIME =
      Math.ceil(Math.abs(START_TIME_OF_FIRST_SHIFT - START_TIME_OF_TODAY)) /
      MILLISECONDS_PER_HOUR)
    const currentCalendarTime = moment().subtract(
      SHIFT_TIME_OFFSET_TO_CALENDAR_TIME,
      'hours'
    )
    const WorkCalendar = getWorkCalendar()

    context.SHIFT_DURATION_FORMATTED = moment(SHIFT_DURATION).format(
      HOURTIME_FORMAT
    )
    context.calendar = new WorkCalendar($calendar[0], {
      now: new Date(currentCalendarTime),
    })
    context.calendar.render()
    $calendar.data('calendar', context.calendar)
  },
  // 待排程生產指令
  initWoListWidget() {
    const context = this
    const $woListResult = $('#wo-list-result')
    const $queryWoListForm = $('#query-wo-list-form')
    const $startDate = $('#order-start-date')
    const $endDate = $('#order-end-date')
    const $productId = $('#product-id')
    const $orderId = $('#order-id')
    const $preSchedule = $queryWoListForm.find('[name=pre-schedule]')

    const renderWoListCards = function (woList, isShowPreSchedule) {
      const cardHtmlArr = []
      let html
      woList.forEach((data) => {
        if (!data.pg_seq) {
          data.pg_seq = 1 // 製程順序(暫時)
        }
        context.woList.setData(data.order_id, data) // 存到生產指令資料中
        const formattedData = context.woList.getData(data.order_id)
        // 判斷 是否過濾預排過的生產指令 和 生產指令是否已經顯示在畫面上
        let isCreate = isShowPreSchedule.includes(
          formattedData.production_scheduled.toString()
        )
        if (isCreate) {
          html = `<div class="card" data-order_id="${formattedData.order_id}">
              <span class="card-body">
                <div>${formattedData.order_id}, ${formattedData.product_id}, ${
            formattedData.exp_date || '---'
          }</div>
                <div>訂單數：${formattedData.order_qty}, 報價秒數：${
            formattedData.quote_seconds
          }s</div>
                <div>已派工：${formattedData.all_m_qty}, 預排：${
            formattedData.all_schedule_quantity
          }, 製程數：${formattedData.multiprogram || '---'}</div>
              </span>
              <div>
                <span class="card-icon last-p-record-icon" title="前次生產紀錄"
                  data-order="${formattedData.order_id}" data-product="${
            formattedData.product_id
          }"
                  ><i class="fa fa-file-text-o"></i></span>
                <span class="card-icon sample-trial-tool-history-record-icon" title="樣品試作刀具履歷紀錄" data-product="${
                  formattedData.product_id
                }">
                  <i class="fa fa-list-ul"></i>
                </span>
                <span class="card-icon recommend-icon" title="智慧化推薦排程"><i class="fa fa-star"></i></span>
              </div>
            </div>`
          cardHtmlArr.push(html)
        }
      })
      $woListResult.html(cardHtmlArr.join(''))
    }
    const queryWoList = function () {
      const loadingBtn = $(this).data('loadingButton')
      return new Promise((resolve) => {
        loadingBtn.doing()
        const requestData = {
          start: $startDate.val(),
          end: $endDate.val(),
          productId: $productId.val(),
          orderId: $orderId.val(),
        }
        // 取得資訊
        fetchWoList(requestData).then((response) => {
          const isShowPreSchedule = $preSchedule
            .toArray()
            .filter((el) => el.checked)
            .map((el) => el.value)
          renderWoListCards(response, isShowPreSchedule)
          loadingBtn.done()
          resolve()
        })
      })
    }
    const refreshCardIconActive = function (icon) {
      $woListResult.find('.card-icon.active').removeClass('active')
      icon.classList.add('active')
    }
    const showLastProductionInfo = function () {
      const productId = $(this).data('product')
      refreshCardIconActive(this) // 點選效果
      // 找到同管編的macro523，並加上補上材料庫編碼的macro523
      const orderDataList = context.commons.getMacro523ByOrderIdOrSampleId(
        null,
        productId,
        context.preCon.getProductList,
        context.preCon.getSampleList
      )

      $('#last-p-record-product').text(productId)

      getHistoryInfoHtml(orderDataList, context.allUserMap).then((html) => {
        $('#last-p-record-modal .modal-body').html(
          html.length ? html : '<div class="block">無前次生產紀錄</div>'
        )
        $('#last-p-record-modal').modal('show')
      })
    }
    const showSampleInfo = function () {
      refreshCardIconActive(this) // 點選效果

      const productId = $(this).data('product')
      $('#sample-trial-tool-history-record-product').text(productId)
      getSampleToolHistoryData(productId).then((dataGroupById) => {
        const html = `<div class="block-container">
            ${Object.values(dataGroupById)
              .map(
                ([data]) => `<div class="block">
                <span>圖號：${data.sample_pid || '---'}</span>
              </div>
              <div class="block">
                <div>
                  <span>試做機台 ${
                    servkit.getMachineName(data.machine_id) || '---'
                  }</span>
                  <span>加工秒數 ${data.tool_ptime || '---'}</span>
                </div>
              </div>
              <div class="block">
                <div>
                  刀具明細
                  <a href="javascript: void(0)" class="tool-sp-history" data-tool-history-no="${
                    data.tool_history_no
                  }">檢視明細</a>
                </div>
              </div>
              <div class="block">
                <div>生產注意事項<br>${data.produce_notice || ''}</div>
              </div>
              `
              )
              .join('')}
            </div>`
        $('#sample-trial-tool-history-record-modal .modal-body').html(
          !_.isEmpty(dataGroupById)
            ? html
            : '<div class="block">無前次試作紀錄</div>'
        )
        $('#sample-trial-tool-history-record-modal').modal('show')
      })
    }
    const showSampleDetail = function () {
      const toolHistoryNo = $(this).data('tool-history-no')
      const toolList = getToolHistoryData('sp', toolHistoryNo)
      if (toolList && toolList[0]) {
        $('#tool-sp-history-info-form input').each(function () {
          let name = this.getAttribute('name')
          let value = toolList[0][name] || ''
          if (name === 'work_by') {
            value = macro521ToUserName(value, context.allUserMap)
          }
          if (name === 'machine_id') {
            value = servkit.getMachineName(value)
          }
          this.value = value
        })
      }
      let supplier
      context.toolSpHistoryTable.drawTable(
        toolList.map((tool) => {
          supplier =
            context.preCon.getSupplierData[tool.tsup_id] || tool.tsup_id
          return [
            tool.tool_id !== undefined ? tool.tool_id : '---',
            tool.tool_type !== undefined ? tool.tool_type : '---',
            tool.tool_spec !== undefined ? tool.tool_spec : '---',
            supplier !== undefined ? supplier : '---',
            tool.use_qty !== undefined ? tool.use_qty : '---',
            tool.tool_use_for !== undefined ? tool.tool_use_for : '---',
            tool.uselist_remark !== undefined ? tool.uselist_remark : '---',
            tool.life_remark !== undefined ? tool.life_remark : '---',
            tool.tool_use_no !== undefined ? tool.tool_use_no : '---',
          ]
        })
      )
      $('#tool-sp-history-modal').modal('show')
    }
    const showMpDetail = function () {
      const time = $(this).data('create-time')
      const toolList = getToolHistoryData('mp', time)
      if (toolList && toolList[0]) {
        $('#tool-mp-history-info-form input').each(function () {
          let name = this.getAttribute('name')
          let value = toolList[0][name] || ''
          if (name === 'work_by') {
            value = macro521ToUserName(value, context.allUserMap)
          }
          if (name === 'machine_id') {
            value = servkit.getMachineName(value)
          }
          this.value = value
        })
      }
      let supplier
      context.toolMpHistoryTable.drawTable(
        _.map(toolList, (tool) => {
          supplier =
            context.preCon.getSupplierData[tool.tsup_id] || tool.tsup_id
          return [
            tool.tool_id !== undefined ? tool.tool_id : '---',
            tool.tool_type !== undefined ? tool.tool_type : '---',
            tool.tool_spec !== undefined ? tool.tool_spec : '---',
            supplier !== undefined ? supplier : '---',
            tool.use_qty !== undefined ? tool.use_qty : '---',
            tool.tool_use_for !== undefined ? tool.tool_use_for : '---',
            tool.uselist_remark !== undefined ? tool.uselist_remark : '---',
            tool.life_remark !== undefined ? tool.life_remark : '---',
            tool.tool_use_no !== undefined ? tool.tool_use_no : '---',
          ]
        })
      )
      $('#tool-mp-history-modal').modal('show')
    }

    initDatePicker($startDate, $endDate)
    $('#refresh-query-wo-list-btn').on('click', function () {
      const loadingBtn = $(this).data('loadingButton')
      loadingBtn.doing()
      queryWoList
        .call(document.getElementById('query-wo-list-btn'))
        .then(() => loadingBtn.done())
    })

    $woListResult
      // 詳細資訊
      .on('click', '.last-p-record-icon', showLastProductionInfo)
      // 樣品試作刀具履歷紀錄
      .on('click', '.sample-trial-tool-history-record-icon', showSampleInfo)
      // 智慧化推薦排程
      .on('click', '.recommend-icon', function () {
        context.recommendScheduleController.showRecommendModal(this)
      })

    $('#query-wo-list-btn').on('click', queryWoList).click()

    // 刀具履歷明細 - 量產
    $('#last-p-record-modal .modal-body').on(
      'click',
      '.tool-mp-history',
      showMpDetail
    )
    // 刀具履歷明細 - 樣品
    $('#sample-trial-tool-history-record-modal .modal-body').on(
      'click',
      '.tool-sp-history',
      showSampleDetail
    )
  },
  // 查詢機台生產排程
  initQueryScheduleForm() {
    const context = this
    const $machineId = $('#machine-id')
    const $machineType = $('#machine-type')
    const $startDate = $('#start-date')
    const $endDate = $('#end-date')
    const startDate = moment().subtract(3, 'days').format(DATE_FORMAT)
    const endDate = moment().add(3, 'days').format(DATE_FORMAT)
    // 排程 - 機型過濾
    const filterMachineId = function () {
      const type = this.value
      const machineId = $machineId.val()

      // 改變機台選項
      var machineOption = {}
      _.each(context.machineMap, (val, key) => {
        if (!type || type === val.mac_type) {
          machineOption[key] = val.device_name
        }
      })
      initSelectWithList(machineOption, $machineId)
      $machineId
        .prepend('<option style="padding:3px 0 3px 3px;" value="">All</option>')
        .val(machineOption[machineId] ? machineId : '')
    }

    // 排程 - 查詢現有排程
    const querySchedule = function () {
      const loadingBtn = $(this).data('loadingButton')
      loadingBtn.doing()
      const start = $('#start-date').val()
      const end = $('#end-date').val()
      let machineList = [$machineId.val()]
      // 機台全選
      if (machineList[0] === '') {
        machineList = Array.from($machineId[0].options)
          .map((el) => el.value)
          .filter((id) => id)
      }

      context.calendar.machineList = machineList

      // 重設calendar
      context.calendar.resetCalendar(
        new Date(start),
        new Date(end),
        machineList
      )

      fetchAllScheduleData(start, end, machineList, context.shiftNameList)
        .then(
          ([
            nonProductionData,
            productionSchedulingData,
            woMStatusData,
            hippoData,
            qualityExamData,
          ]) => {
            // 建產量事件
            const nObj = _.groupBy(
              qualityExamData,
              ({
                date,
                employee_id,
                work_shift_name,
                machine_id,
                order_id,
                multi_process,
              }) => {
                return [
                  date.toFormatedDate(null, 'YYYYMMDD'),
                  employee_id,
                  work_shift_name,
                  machine_id,
                  order_id,
                  multi_process,
                ].join('/')
              }
            )

            if (hippoData) {
              const groupData = _.groupBy(hippoData.exhalable, (elem) => {
                const date = moment(elem.date, 'YYYYMMDD').format('YYYY/MM/DD')
                return context.partcount.getId(
                  Object.assign({}, elem, { date })
                )
              })
              let shiftStartTime
              let shiftEndTime
              let startTime
              let endTime
              let keyList
              let eventStart
              let eventEnd
              let shiftInfo
              _.each(groupData, (data, id) => {
                keyList = id.split('||')
                const [date, work_shift_name] = keyList
                shiftInfo = context.shiftMap[work_shift_name]
                shiftStartTime = shiftInfo.start
                shiftEndTime = shiftInfo.end
                startTime = `${
                  shiftInfo.isAddOneDay
                    ? moment(date).add(1, 'days').format('YYYY/MM/DD')
                    : date
                } ${shiftStartTime}`
                endTime = `${
                  shiftInfo.isAddOneDay || shiftInfo.isCrossDay
                    ? moment(date).add(1, 'days').format('YYYY/MM/DD')
                    : date
                } ${shiftEndTime}`
                eventStart = Work.toCalendarTime(startTime, DATETIME_FORMAT)
                eventEnd = Work.toCalendarTime(endTime, DATETIME_FORMAT)
                context.partcount.createEvent(
                  {
                    nObj,
                    data,
                  },
                  eventStart,
                  eventEnd,
                  keyList
                )
              })
            }
            // 建非量產時間事件
            nonProductionData.forEach((val) => {
              context.nonProduction.createEvent(val)
            })
            // 建預排事件
            productionSchedulingData.forEach((val) => {
              context.woList[val.order_id] = val // 存到生產指令資料中
              if (val.schedule_time) {
                context.productionScheduling.createEvent(val)
              }
            })
            // 建派工事件
            return Promise.all(
              woMStatusData.map((val) => {
                context.woMStatus.createEvent(val)
                if (val.act_mdate) {
                  // 實際派工
                  return context.woMStatusAct.createEvent(val)
                }
                return Promise.resolve()
              })
            )
          }
        )
        .then(() => {
          // y軸的scroll bar移到最上面
          $('.fc-body .fc-time-area .fc-scroller').scrollTop(0)
          $('html').scrollTop(0)
          loadingBtn.done()
        })
    }

    // 排程 - 日期
    initDatePicker($startDate, $endDate, null, 6)
    $startDate.val(startDate)
    $endDate.val(endDate)
    // 排程 - 機台
    initSelectWithList(context.machineIdNameMap, $machineId)
    $machineId
      .prepend('<option style="padding:3px 0 3px 3px;" value="">All</option>')
      .val('')
    // 排程 - 機型
    initSelectWithList(
      _.chain(context.machineMap)
        .map((obj) => obj.mac_type)
        .uniq()
        .value(),
      $machineType
    )
    $machineType.prepend(
      '<option style="padding:3px 0 3px 3px;" value="">All</option>'
    )
    $machineType.children().eq(1).prop('selected', true)

    $machineType.on('change', filterMachineId).change()
    $('#query-schedule-btn').on('click', querySchedule).click()
  },
  // 非量產時間
  initNonProductinoModal() {
    const context = this
    const { $editNonProductionForm } = context
    const nonProductionReasonMap = {
      '1': '維修保養',
      '2': '治具生產',
      '3': '樣品製作',
      '0': '其他',
    }
    const $modal = $('#edit-non-p-modal')
    const $purpose = $editNonProductionForm.find('[name=purpose]')
    const $machine_id = $editNonProductionForm.find('[name=machine_id]')
    const $exp_time = $editNonProductionForm.find('[name=exp_time]')
    const $purpose_other = $editNonProductionForm.find('[name=purpose_other]')
    const $hours = $editNonProductionForm.find('[name=hours]')
    const defaultDate = moment().format(DATETIME_FORMAT_WITHOUT_SEC)
    const $insertNonProductionBtn = $('#insert-non-p-btn')
    // 插入 / 修改停機時間
    const insertNonProduction = function () {
      context.insertnonPLoadingBtn.doing()

      const data = $(this).data('data')
      const expTime = $exp_time.val()
      const duration = $hours.val()
      const machine_id = $machine_id.val()
      const exp_time = expTime.toFormatedDatetime()
      const exp_edate = moment(expTime)
        .add(duration, 'hours')
        .format(DATETIME_FORMAT)
      const purpose = $purpose.val()
      const isOtherReason = purpose !== '0'
      const purpose_other = isOtherReason ? '' : $purpose_other.val()
      const id = context.nonProduction.getId(data)

      if (!Object.prototype.hasOwnProperty.call(data, 'purpose')) {
        data.purpose = purpose
      }
      NonProduction.isOverlapped(
        machine_id,
        exp_time,
        exp_edate,
        context.nonProduction.getData(id)
      ).then((isOverlapped) => {
        if (isOverlapped) {
          context.insertnonPLoadingBtn.done()
          return $.smallBox({
            title: '非量產時間不可重疊',
            color: servkit.statusColors.alarm,
            timeout: 4000,
          })
        } else {
          context.nonProduction
            .saveNonProduction(data, {
              machine_id,
              exp_time,
              exp_edate,
              purpose,
              purpose_other,
              duration,
            })
            .then(() => {
              context.insertnonPLoadingBtn.done()
              $modal.modal('hide')
            })
        }
      })
    }

    initSelectWithList(nonProductionReasonMap, $purpose)
    initSelectWithList(context.machineIdNameMap, $machine_id)
    $exp_time.datetimepicker(
      Object.assign({ defaultDate }, context.datetimePickerOptions)
    )

    // 非量產時間 - 非量產時間的原因選擇其他時才可以填其他原因
    $purpose.on('change', function () {
      const isOtherReason = this.value === '0'
      $purpose_other.prop('disabled', !isOtherReason)
    })

    validateForm($editNonProductionForm, $insertNonProductionBtn)
    $insertNonProductionBtn.on('click', insertNonProduction)
  },
  // 編輯非量產時間
  showNonProductionModal(nonProductionData) {
    const context = this
    const { $editNonProductionForm } = context
    const {
      machine_id,
      purpose = '1',
      purpose_other = '',
      exp_time,
      exp_edate,
    } = nonProductionData
    const duration = moment(exp_edate).diff(exp_time, 'hours')

    this.insertnonPLoadingBtn.done()
    $editNonProductionForm.find('[name=machine_id]').val(machine_id)
    $editNonProductionForm.find('[name=purpose]').val(purpose).change()
    $editNonProductionForm.find('[name=purpose_other]').val(purpose_other)
    $editNonProductionForm
      .find('[name=exp_time]')
      .val(exp_time.toFormatedDatetime(null, DATETIME_FORMAT_WITHOUT_SEC))
    $editNonProductionForm.find('[name=hours]').val(duration)

    $('#insert-non-p-btn').data('data', nonProductionData)
    $('#edit-non-p-modal').modal('show')
  },
  initHistoryDataTable() {
    const context = this

    // 刀具履歷 - 量產
    context.toolMpHistoryTable = createReportTable({
      $tableElement: $('#tool-mp-history-list-table'),
      $tableWidget: $('#tool-mp-history-list-table-widget'),
    })

    // 刀具履歷 - 樣品
    context.toolSpHistoryTable = createReportTable({
      $tableElement: $('#tool-sp-history-list-table'),
      $tableWidget: $('#tool-sp-history-list-table-widget'),
    })
  },
  initWork() {
    const context = this
    context.woList = new WoList()
    context.nonProduction = new NonProduction()
    context.productionScheduling = new ProductionScheduling()
    context.woMStatus = new WoMStatus()
    context.woMStatusAct = new WoMStatusAct()
    context.partcount = new PartCount()
  },
  initRecommendScheduleController() {
    const context = this
    if (context.recommendScheduleController) {
      return
    }

    context.recommendScheduleController = new RecommendScheduleController(
      $('#edit-p-schedule-modal')
    )
  },
  initEditScheduleModal() {
    const context = this
    const editScheduleModal = (context.editScheduleModal = new EditScheduleModal(
      $('#edit-p-schedule-modal')
    ))
    const $workBy = editScheduleModal.$modal.find('[name=work_by]')
    // 檢查排程
    const inspectSchedule = function () {
      const $modal = $('#edit-p-schedule-modal')
      // 隱藏檢查排程後顯示的文字
      $modal.find('.inspect-result-table').addClass('hide')
      $modal.find('.recommend-result-table').addClass('hide')
      $modal.find('.recommend-result-table .result-table-option').remove()
      // 確保「插入排程」按鈕可按
      context.insertPScheduleLoadingBtn.done()

      context.inspectPScheduleLoadingBtn.doing()
      let requestDataList = []
      let data
      const $form = $modal.find('.edit-group:visible')
      _.each($form, (ele, key) => {
        const $ele = $(ele)
        const id = $ele.data('id')
        data = context.productionScheduling.getData(id)
        if (!(data && data.order_id)) {
          data = context.woList.getData(id)
        }
        const machine_id = $ele.find('[name=machine_id]').val()
        const order_qty = $ele.find('[name=schedule_quantity]').val()
        const correction_time = $ele.find('[name=correction_time]').val()
        const buffer_time = $ele.find('[name=buffer_time]').val()
        const pg_seq = $ele.find('[name=pg_seq]').val()
        const exp_mdate = $ele.find('[name=exp_mdate]').val()
        const std_hour = $ele.find('[name=m_ptime]').val()
        const schedule_time = data.schedule_time
        const requestData = {
          order_id: data.order_id,
          product_id: data.product_id,
          exp_date: data.exp_date.toFormatedDate(null, 'YYYY-MM-DD'),
          order_qty,
          pg_seq,
          machine_id,
          correction_time,
          buffer_time,
          std_hour,
          exp_mdate: exp_mdate.toFormatedDatetime(null, 'YYYY-MM-DD HH:mm:ss'),
          code: 'C4',
          is_demo: false,
        }
        if (schedule_time) {
          requestData.schedule_time = schedule_time.toFormatedDatetime()
        }

        requestDataList.push(requestData)
      })
      let promise
      if ($form.length > 1) {
        // 剖半排程，只要檢查指定機台
        promise = context.recommendScheduleController.check(requestDataList)
      } else {
        // 單一機台要顯示推薦清單
        promise = context.recommendScheduleController.inspect(
          requestDataList[0]
        )
      }
      promise
        .then((datas) => {
          context.inspectPScheduleLoadingBtn.done()
          $modal.find('.inspect-result-table').removeClass('hide')
          $modal.find('.recommend-result-table').removeClass('hide')
          $modal.find('.modal-footer').removeClass('hide')
        })
        .catch((response) => {
          console.log(response)
          $.smallBox({
            title: response,
            color: servkit.statusColors.alarm,
            timeout: 4000,
          })
          context.inspectPScheduleLoadingBtn.done()
          // $modal.find('.modal-footer').removeClass('hide')
        })
    }
    // 選擇排程 推薦or指定機台
    const radioChangeHandler = function () {
      const input = this
      const isChecked = input.checked
      if (!isChecked) {
        return
      }

      const label = input.dataset.label
      const container = input.closest('.modal-body')
      const checkedEl = Array.from(
        container.querySelectorAll('input:checked')
      ).filter((el) => el !== input)

      if (label === 'C') {
        let isSelectC = false
        checkedEl.forEach((el) => {
          if (el.dataset.label === 'C') {
            el.checked = !isSelectC
            isSelectC = true
          } else {
            el.checked = false
          }
        })
      } else {
        checkedEl.forEach((el) => (el.checked = false))
      }
    }
    // 插入排程
    const insertSchedule = function () {
      context.insertPScheduleLoadingBtn.doing()
      const $form = $('#edit-p-schedule-form')
      const $checkedEls = $('#edit-p-schedule-modal')
        .find('.recommend-result-container, .check-result-container')
        .find('input:checked')
      const isFromRecommendOnly =
        context.editScheduleModal.status === 'only-recommend'
      const buffer_time = isFromRecommendOnly
        ? 24
        : $form.find('.edit-group:eq(0) [name=buffer_time]').val() || 24
      const correction_time = isFromRecommendOnly
        ? 8
        : $form.find('.edit-group:eq(0) [name=correction_time]').val() || 8
      const m_usage = isFromRecommendOnly
        ? ''
        : $form.find('.edit-group:eq(0) [name=m_usage]').val()
      if ($checkedEls.length < 1) {
        $.smallBox({
          title: '請先選擇欲插入之排程',
          color: servkit.statusColors.alarm,
          timeout: 4000,
        })
        context.insertPScheduleLoadingBtn.done()
        return
      }
      if ($checkedEls.length === 1 && $checkedEls[0].dataset.label === 'C') {
        $.smallBox({
          title: '請再選擇一筆剖半排程',
          color: servkit.statusColors.alarm,
          timeout: 4000,
        })
        context.insertPScheduleLoadingBtn.done()
        return
      }
      const formDataList = $checkedEls.toArray().map((el) => {
        const id = el.value
        const isRecommend = el.dataset.recommend === 'true'
        const data = isRecommend
          ? context.recommendScheduleController.getRecommendData([
              id.split('||')[0],
            ])[0]
          : context.recommendScheduleController.getCheckResult()
        const result = {
          order_id: data.orderId,
          machine_id: data.machineId,
          product_id: data.productId,
          m_usage,
          schedule_quantity: data.preQty,
          start: Work.toCalendarTime(data.expMdate),
          end: Work.toCalendarTime(data.expEdate),
          exp_date: data.expDate,
          pg_seq: data.pgSeq,
          correction_time,
          buffer_time,
          m_ptime: data.stdHour,
        }
        if (context.editScheduleModal.editType === 'update') {
          const schedule_time = context.productionScheduling.getData(
            $form.find('.edit-group:eq(0)').data('id')
          ).schedule_time
          result.schedule_time = schedule_time
        }
        return result
      })
      context.editScheduleModal.changeStatus('confirm-data')
      context.editScheduleModal.fillFormData(formDataList)
    }
    // 轉派工
    const convertToAssignment = function () {
      context.editScheduleModal.changeStatus('save-assignment')
    }
    // 確認派工
    const confirmconvertToAssignment = function () {
      const $form = context.editScheduleModal.$form.find('.edit-group').eq(0)
      const id = $form.data('id')
      const data = context.productionScheduling.getData(id)
      const userId = JSON.stringify(sessionStorage.getItem('loginInfo')).user_id
      const currTime = ''.toFormatedDatetime()
      const work_by = $form.find('[name=work_by]').val()
      const requestData = Object.assign({}, data, {
        wo_m_time: currTime,
        m_qty: data.schedule_quantity,
        w_m_status: 0,
        create_by: userId,
        create_time: currTime,
        modify_by: userId,
        modify_time: currTime,
        work_by,
      })
      saveAssignment(requestData)
        .then(() =>
          updateScheduleStatus(
            Object.assign(
              _.pick(requestData, [
                'schedule_time',
                'machine_id',
                'order_id',
                'modify_by',
                'modify_time',
              ]),
              {
                schedule_status: 1,
              }
            )
          )
        )
        .then(() => {
          context.woMStatus.createEvent(
            _.pick(requestData, [
              'order_id',
              'machine_id',
              'wo_m_time',
              'm_qty',
              'w_m_status',
              'exp_mdate',
              'exp_edate',
              'm_ptime',
              'm_usage',
              'pg_seq',
              'mat_control',
              'correction_time',
              'buffer_time',
              'create_by',
              'create_time',
              'modify_by',
              'modify_time',
              'work_by',
            ])
          )
          context.productionScheduling.removeEvent(id, {
            main: '',
            correction: '',
            buffer: '',
          })
          context.editScheduleModal.$modal.modal('hide')
          $('#query-wo-list').click()
        })
    }
    // 返回上一步
    const toLastStep = function () {
      const status = context.editScheduleModal.status
      const editType = context.editScheduleModal.editType
      let data
      let id
      switch (status) {
        case 'show-check-and-recommend-result':
          context.editScheduleModal.changeStatus(
            editType === 'create' ? 'create-schedule' : 'edit-schedule'
          )
          break
        case 'save-assignment':
          context.editScheduleModal.changeStatus('view-schedule')
          break
        case 'confirm-data':
          context.editScheduleModal.changeStatus(
            context.recommendScheduleController.checkResult
              ? 'show-check-and-recommend-result'
              : 'only-recommend'
          )
          break
        case 'edit-schedule':
          id = context.editScheduleModal.$form
            .find('.edit-group')
            .eq(0)
            .data('id')
          data = context.productionScheduling.getData(id)
          context.editScheduleModal.fillFormData([
            Object.assign(
              {
                start: Work.toCalendarTime(data.exp_mdate),
                end: Work.toCalendarTime(data.exp_edate),
              },
              data
            ),
          ])
          context.editScheduleModal.changeStatus('view-schedule')
          break
      }
    }
    // 確認插入
    const confirmToInsert = function () {
      let formData
      let rearrangedData
      let hasRearrangedData = false
      const dataList = $('#edit-p-schedule-form')
        .find('.edit-group:visible')
        .toArray()
        .map((form) => {
          formData = Object.fromEntries(
            Array.from(
              $(form).find('select:visible, input:visible')
            ).map((el) => [el.name, el.value])
          )
          rearrangedData = $(form).data('rearrangedData')
          if (rearrangedData) {
            hasRearrangedData = true
          }
          return Object.assign(formData, { rearrangedData })
        })
      // TODO: 這邊預設剖半排程不會有衝突發生(dataList長度為1)，但仍需要證實
      if (hasRearrangedData) {
        const insertionText = `插入預排`
        context.nonProduction.renderConflictTable(
          insertionText,
          context.nonProduction.transferRearrangedData(
            rearrangedData,
            dataList[0],
            dataList[0]
          ),
          'productionSchedule'
        )
      } else {
        saveSchedule(dataList)
      }
    }
    // 編輯預排
    const editSchedule = function () {
      context.editScheduleModal.changeStatus('edit-schedule')
    }
    // 插入排程 在確認衝突資訊之後
    const saveAfterConflictCheck = function () {
      const data = $(this).data()
      const { type, rearrangedData } = data

      // flag區別是預排或非量產時間
      switch (type) {
        case 'productionSchedule':
          saveSchedule(rearrangedData)
          break
        case 'nonProduction':
          context.nonProduction
            .updateAdjustedSchedule([$(this).data('rearrangedData')])
            .then(() => $('#schedule-conflict-modal').modal('hide'))
          break
      }
    }
    // 儲存預排
    const saveSchedule = function (dataList) {
      const selectedDataIds = new Set(
        dataList.map(
          (data) =>
            data.machine_id + '||' + data.exp_mdate + '||' + data.exp_edate
        )
      )
      let featureDataList =
        context.recommendScheduleController.recommendResult.featureList || []
      let id
      if (
        context.recommendScheduleController.checkResult &&
        context.recommendScheduleController.checkResult.checkResult
      ) {
        featureDataList.push(
          context.recommendScheduleController.checkResult.checkResult
        )
      }
      featureDataList = featureDataList.map((data) => {
        let isSelected = 0
        id =
          data.machineId +
          '||' +
          data.expMdate.toFormatedDatetime(null, DATETIME_FORMAT_WITHOUT_SEC) +
          '||' +
          data.expEdate.toFormatedDatetime(null, DATETIME_FORMAT_WITHOUT_SEC)
        if (selectedDataIds.has(id)) {
          isSelected = 1
        }
        return Object.assign({}, data, { isSelected })
      })
      saveFeatureData(featureDataList)
        .then(() =>
          context.nonProduction.updateAdjustedSchedule(
            dataList.map((data) => {
              const result = {}
              const schedule_time =
                context.editScheduleModal.$form
                  .find('.edit-group:eq(0)')
                  .data('schedule_time') || ''.toFormatedDatetime()
              result.insertData = {}
              result.insertData.before = Object.assign({}, data, {
                schedule_time,
              })
              result.insertData.after = Object.assign(
                {},
                result.insertData.before
              )
              result.insertData.type = 'ProductionScheduling'
              return result
            })
          )
        )
        .then(() => {
          context.editScheduleModal.$modal.modal('hide')
          $('#schedule-conflict-modal').modal('hide')
        })
    }
    // 刪除事件
    const removeScheduleHandler = function () {
      const id = context.editScheduleModal.$modal
        .find('.edit-group:visible')
        .data('id')
      const data = context.productionScheduling.getData(id)
      context.showCancelScheduleModal(data.order_id, data)
    }
    const removePreSchedule = function (data) {
      const schedule_time = data.schedule_time.toFormatedDatetime()
      const machine_id = data.machine_id
      const order_id = data.order_id
      const id = context.productionScheduling.getId(data)
      const events = {
        buffer: {},
        main: {},
        correction: {},
      }
      ajax(
        {
          url: 'api/stdcrud',
          type: 'PUT',
          contentType: 'application/json',
          data: JSON.stringify({
            tableModel:
              'com.servtech.servcloud.app.model.huangliang_matStock.ProductionScheduling',
            order_id,
            schedule_time,
            machine_id,
            schedule_status: '99',
          }),
        },
        {
          success() {
            context.productionScheduling.removeEvent(id, events)
            context.cancelScheduleLoadingBtn.done()
            $('#query-wo-list-btn').click()
            $('#cancel-schedule-modal').modal('hide')
            $('#edit-p-schedule-modal').modal('hide')
          },
        }
      )
    }
    const removeNonProduction = function (data) {
      const id = context.nonProduction.getId(data)
      const events = {
        main: {},
      }

      ajax(
        {
          url:
            'api/stdcrud?tableModel=com.servtech.servcloud.app.model.huangliang_matStock.NonProduction&key=pks',
          type: 'DELETE',
          contentType: 'application/json',
          data: JSON.stringify([
            {
              machine_id: data.machine_id,
              exp_time: data.exp_time,
            },
          ]),
        },
        {
          success() {
            context.nonProduction.removeEvent(id, events)
            context.cancelScheduleLoadingBtn.done()
            $('#cancel-schedule-modal').modal('hide')
          },
        }
      )
    }
    const removeSchedule = function () {
      context.cancelScheduleLoadingBtn.doing()
      const data = $('#cancel-schedule-btn').data('data')
      const isProductionScheduling = !!data.schedule_time
      if (isProductionScheduling) {
        removePreSchedule(data)
      } else {
        removeNonProduction(data)
      }
    }
    const cancelInsert = function () {
      const { eventInfo } = $(this).data()
      if (eventInfo) {
        eventInfo.revert()
      }
    }

    // 機台
    initSelectWithList(
      context.machineIdNameMap,
      editScheduleModal.$modal.find('[name=machine_id]')
    )

    editScheduleModal.$form
      .find(`input[name=exp_mdate]`)
      .datetimepicker(context.datetimePickerOptions)
    // 校車人員
    initSelectWithList(context.regulateUserMap, $workBy)
    $workBy
      .prepend(
        '<option style="padding:3px 0 3px 3px;" value="">無校車人員</option>'
      )
      .val($workBy.find('option:first').val())

    // TODO: 檢查起始時間不能晚於期望交期
    // TODO: validateForm改成自訂方法
    validateForm($('#edit-p-schedule-form'), $('#inspect-p-schedule-btn'))
    validateForm($('#edit-p-schedule-form'), $('#confirm-insert-btn'))

    $('#inspect-p-schedule-btn').on('click', inspectSchedule)
    $('#edit-p-schedule-modal .modal-body').on(
      'change',
      'input[type=radio]',
      radioChangeHandler
    )
    $('#insert-p-schedule-btn').on('click', insertSchedule)
    $('#edit-schedule-btn').on('click', editSchedule)
    $('#return-btn').on('click', toLastStep)
    $('#confirm-insert-btn').on('click', confirmToInsert)
    $('#to-wo-m-status-btn').on('click', convertToAssignment)
    $('#transfer-to-wo-m-status-btn').on('click', confirmconvertToAssignment)
    $('#cancel-p-schedule-btn').on('click', removeScheduleHandler)
    $('#insert-schedule-include-conflict-btn').on(
      'click',
      saveAfterConflictCheck
    )
    $('#cancel-schedule-btn').on('click', removeSchedule)
    $('#cancel-insert-schedule-include-conflict-btn').on('click', cancelInsert)

    // 排程 - 更新排程編輯
    // const elementList = ['machine_id', 'm_ptime', 'm_usage', 'schedule_quantity', 'correction_time', 'buffer_time']
    // $('#edit-p-schedule-modal').on('change', elementList.map(c => `[name=${c}]`).join(','), () => context.resetToCheckSchedule())
  },
  showCancelScheduleModal(order_id = '', data) {
    $('#cancel-schedule-modal .delete-order').text(order_id)
    $('#cancel-schedule-btn').data('data', data)
    $('#cancel-schedule-modal').modal('show')
  },
  getShiftTimeRange() {
    const context = this
    let start
    let end
    let isCrossDay
    let isAddOneDay
    let lastStartTime
    return context.preCon.getShift.reduce((a, obj) => {
      start = obj.start.split(' ')[1]
      end = obj.end.split(' ')[1]
      isCrossDay = start.localeCompare(end) > 0
      isAddOneDay = lastStartTime
        ? lastStartTime.localeCompare(start) > 0
        : false
      lastStartTime = start
      a[obj.name] = {
        start,
        end,
        isCrossDay,
        isAddOneDay,
      }
      return a
    }, {})
  },
  getMachineMap() {
    const context = this
    const machineMap = servkit.getMachineMap()
    return _.mapObject(context.preCon.getMachineTypeData, (type, id) => {
      return Object.assign({}, machineMap[id], { mac_type: type || '---' })
    })
  },
}
export default async function () {
  const preConditionObj = {
    getShift(done) {
      ajax(
        {
          url: 'api/workshift/today',
          type: 'GET',
        },
        {
          success(data) {
            done(data)
          },
        }
      )
    },
    sysUserMap(done) {
      ajax(
        {
          url: 'api/user/read',
          type: 'GET',
          contentType: 'application/json',
        },
        {
          success(data) {
            done(data)
          },
        }
      )
    },
    huangliangUserMap(done) {
      hippo
        .newSimpleExhaler()
        .space('HUL_care_employees')
        .index('customer_id', ['HuangLiang'])
        .columns('employee_id', 'employee_name')
        .exhale(function (exhalable) {
          done(
            Object.fromEntries(
              exhalable.exhalable.map((obj) => {
                return [obj.employee_id, obj.employee_name]
              })
            )
          )
        })
    },
    getRepairCode(done) {
      ajax(
        {
          url: 'api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: 'a_huangliang_repair_code',
            columns: ['repair_code', 'repair_code_name'],
          }),
        },
        {
          success(data) {
            var repairMap = {}
            _.each(data, function (val) {
              return (repairMap[val.repair_code] = val.repair_code_name)
            })
            done(repairMap)
          },
        }
      )
    },
    getSampleList(done) {
      ajax(
        {
          url: 'api/huangliang/sample/get',
          contentType: 'application/json',
          type: 'GET',
        },
        {
          success(data) {
            done(data)
          },
        }
      )
    },
    getProductList(done) {
      ajax(
        {
          url: 'api/huangliang/product/get',
          contentType: 'application/json',
          type: 'GET',
        },
        {
          success(data) {
            done(data)
          },
        }
      )
    },
    getMachineTypeData(done) {
      ajax(
        {
          url: 'api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: 'a_huangliang_mac_list',
            columns: ['machine_id', 'mac_type'],
            whereClause: `is_open='Y'`,
          }),
        },
        {
          success(data) {
            var typeData = {}
            _.each(data, function (elem) {
              typeData[elem.machine_id] = elem.mac_type
            })
            done(typeData)
          },
        }
      )
    },
    getSupplierData(done) {
      ajax(
        {
          url: 'api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: 'a_huangliang_supplier',
            columns: ['sup_id', 'sup_name'],
          }),
        },
        {
          success(data) {
            var supMap = {}
            _.each(data, (elem) => (supMap[elem.sup_id] = elem.sup_name))
            done(supMap)
          },
        }
      )
    },
  }
  const preCon = await preCondition(preConditionObj)

  Object.assign(context, { preCon })

  GoGoAppFun({
    gogo(goGoContext) {
      window.c = Object.assign(goGoContext, context)
      goGoContext.main()
    },
    dependencies: [
      [
        '/js/plugin/fullcalendar/fullcalendar-core-v4.3.min.js',
        '/js/plugin/fullcalendar/fullcalendar-interaction-v4.3.min.js',
        '/js/plugin/fullcalendar/fullcalendar-daygrid-v4.3.min.js',
        '/js/plugin/fullcalendar/fullcalendar-timegrid-v4.3.min.js',
        '/js/plugin/fullcalendar/fullcalendar-list-v4.3.min.js',
        '/js/plugin/fullcalendar/fullcalendar-timeline-v4.3.min.js',
        '/js/plugin/fullcalendar/fullcalendar-resource-common-v4.3.min.js',
        '/js/plugin/fullcalendar/fullcalendar-resource-daygrid-v4.3.min.js',
        '/js/plugin/fullcalendar/fullcalendar-resource-timegrid-v4.3.min.js',
        '/js/plugin/fullcalendar/fullcalendar-resource-timeline-v4.3.min.js',
        '/js/plugin/fullcalendar/fullcalendar-bootstrap-v4.3.min.js',
        '/js/plugin/fullcalendar/fullcalendar-google-calendar-v4.3.min.js',
        '/js/plugin/fullcalendar/fullcalendar-rrule-v4.3.min.js',
        '/js/plugin/fullcalendar/fullcalendar-luxon-v4.3.min.js',
        '/js/plugin/fullcalendar/fullcalendar-moment-v4.3.min.js',
        '/js/plugin/fullcalendar/fullcalendar-moment-timezone-v4.3.min.js',
      ],
      ['/js/plugin/bootstrap-datetimepicker/bootstrap-datetimepicker.min.js'],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatables/jquery.dataTables.rowReordering.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
