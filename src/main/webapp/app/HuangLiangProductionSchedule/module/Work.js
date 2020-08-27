import {
  DATETIME_FORMAT_WITHOUT_SEC,
  DATETIME_FORMAT,
  dateReg,
  datetimeReg,
  DATETIME_FORMAT_BACKEND,
  MILLISECONDS_PER_HOUR,
} from './constans.js'
import { ajax } from '../../../js/servtech/module/servkit/ajax.js'
import { context } from './page/04_pre_scheduling.js'
import { fetchRearrangedData, fetchNonProductionData } from './dataModel.js'

// calendar上的排程
class Work {
  constructor(option = {}) {
    this.data = {}
    this.conflictTableContentMap = {
      ProductionScheduling: {
        header: [
          '生產指令',
          '機台名稱',
          '預排數量',
          '預計生產日',
          '預計完成日',
          '變更後預計生產日',
          '變更後預計完成日',
        ],
        typeText: '機台排程',
      },
      WoMStatus: {
        header: [
          '生產指令',
          '機台名稱',
          '派工時間',
          '管編',
          '派工數',
          '預期交期',
          '預計上線日',
          '預計完工日',
          '變更後預計上線日',
          '變更後預計完工日',
        ],
        typeText: '機台派工',
      },
      NonProduction: {
        header: [
          '機台名稱',
          '原因',
          '其他原因內容',
          '預計起始時間',
          '預計結束時間',
          '變更後起始時間',
          '變更後結束時間',
        ],
        typeText: '非量產',
      },
    }
    this.workKey = option.workKey // 用來辨識目前是哪種排程(停機、預排、派工)
    this.eventColor = {
      border: option.color.border,
      background: {
        correction: '#c3c3c3ad', // 灰色
        main: '#ffffffad', // 白色
        buffer: option.color.bufferBackground,
      },
    }
    this.eventResourceIndex = option.eventResourceIndex
    this.events = option.events
    this.eventSize = option.eventSize
    this.pkNameList = option.pkNameList || []
    this.formatFnMap = option.formatFnMap || {}
  }
  setData(id, value) {
    // id 是由 key 以 || 做分隔組成的字串
    const ids = id.split('||')
    let data = this.data
    for (let i = 0; i < ids.length; i++) {
      if (!data[ids[i]]) data[ids[i]] = {}
      data = data[ids[i]]
    }
    for (let member in data) {
      delete data[member]
    }
    for (let member in value) {
      data[member] = Work.formatTimeData(value[member])
    }
  }
  getData(id) {
    // id 是由 key 以 || 做分隔組成的字串
    const ids = id.split('||')
    let data = this.data
    for (let i = 0; i < ids.length; i++) {
      data = data[ids[i]]
      if (data === undefined) break
    }

    return data
  }
  deleteData(id) {
    const idArr = id.split('||')
    let data = this.data
    for (let i = 0; i < idArr.length - 1; i++) {
      data = data[idArr[i]]
      if (!data) {
        break
      }
    }
    if (data) {
      delete data[idArr[idArr.length - 1]]
    }
  }
  getEventTime(startTimeStr, endTimeStr, correction, buffer) {
    // (date格式)
    // start和end皆為calendar的時間
    const dbStart = new Date(startTimeStr)
    const dbEnd = new Date(endTimeStr)
    const correctionEnd = new Date(
      moment(startTimeStr).add(correction, 'hours')
    )
    const bufferEnd = new Date(moment(endTimeStr).add(buffer, 'hours'))
    return {
      correction: {
        start: dbStart,
        end: correctionEnd,
      },
      main: {
        start: correctionEnd,
        end: dbEnd,
      },
      buffer: {
        start: dbEnd,
        end: bufferEnd,
      },
    }
  }
  getEventId(id) {
    // 取得 event 的 id
    return `${id}-${this.workKey}`
  }
  getId(data) {
    return this.pkNameList
      .map((pk) =>
        Object.prototype.hasOwnProperty.call(this.formatFnMap, pk)
          ? this.formatFnMap[pk](data[pk])
          : data[pk]
      )
      .join('||')
  }
  createEvent(data, machineId, events, times, editable, clickable) {
    const id = this.getId(data)
    // 先刪掉已存在的event
    this.removeEvent(id, events)

    // 建立資料
    this.setData(id, data)

    const eventId = this.getEventId(id)
    const start = Object.values(times).reduce((a, x) =>
      a.start > x.start ? x : a
    ).start
    const end = Object.values(times).reduce((a, x) => (a.end < x.end ? x : a))
      .end
    if (!this.isInRange(start, end, machineId)) {
      return
    }
    _.each(events, (evtData, evt) => {
      // 建立不同的event(校車、機台派工、緩衝)
      // this.eventConstraint 表示指定的可拖拉範圍(目前只會有預排有，其他都是根據machineId做變化，不可跨機台拖拉)
      const classList = [this.workKey, evt]
      if (editable) {
        classList.push('editable')
      }
      if (clickable && evt === 'main') {
        classList.push('clickable')
      }
      if (this.eventSize) {
        classList.push(`${this.eventSize}-event`)
      }
      context.calendar.addEvent({
        id: `${eventId}-${evt}`,
        classNames: classList,
        editable: editable || false,
        startEditable: editable || false,
        durationEditable: false,
        resourceEditable: editable || false,
        title: evtData.title,
        description: evtData.description || evtData.title,
        start: times[evt].start,
        end: times[evt].end,
        color: this.eventColor.background[evt], // 白色
        borderColor: this.eventColor.border,
        constraint: this.eventConstraint || this.workKey + machineId,
        resourceId: machineId + 'index' + this.eventResourceIndex,
      })
    })
  }
  removeEvent(id, events) {
    const eventId = this.getEventId(id)
    this.deleteData(id)
    _.each(events, (evtData, evt) => {
      // 刪除不同的event(校車、機台派工、緩衝)
      const event = context.calendar.getEventById(`${eventId}-${evt}`)
      if (event) {
        event.remove()
      }
    })
  }
  renderConflictTable(insertionText, rearrangedData, type, eventInfo) {
    const html = Object.entries(rearrangedData.affectedData)
      .map(([affectedType, affectedData]) =>
        affectedData.length
          ? `<div class="conflict">
          <span>${insertionText}後，以下${
              this.conflictTableContentMap[affectedType].typeText
            }將往後調整，請確認是否插入：</span>
          <table class="table table-bordered" id="${affectedType}">
            <thead>
              <tr>
              ${this.conflictTableContentMap[affectedType].header
                .map((title) => `<th>${title}</th>`)
                .join('')}
              </tr>
            </thead>
            <tbody>${this.getConflictTableBody(
              affectedType,
              affectedData
            )}</tbody>
          </table>
        </div>`
          : ''
      )
      .join('')
    $('#schedule-conflict-modal .modal-body').html(html)
    $('#insert-schedule-include-conflict-btn').data({ rearrangedData, type })
    if (eventInfo) {
      $('#cancel-insert-schedule-include-conflict-btn').data({ eventInfo })
    }
    $('#schedule-conflict-modal').modal('show')
  }
  getConflictTableBody(affectedType, affectedData) {
    const self = this
    const { purposeMap } = self
    const html = affectedData
      .map(({ before: beforeData, after: afterData }) => {
        let result
        switch (affectedType) {
          case 'NonProduction':
            result = `<tr>
            <td>${
              beforeData.machine_id
                ? servkit.getMachineName(beforeData.machine_id)
                : '---'
            }</td>
            <td>${purposeMap[afterData.purpose] || '---'}</td>
            <td>${afterData.purpose_other}</td>
            <td>${beforeData.exp_time}</td>
            <td>${beforeData.exp_edate}</td>
            <td class="conflict-alert">${afterData.exp_time}</td>
            <td class="conflict-alert">${afterData.exp_edate}</td>
          </tr>`
            break
          case 'ProductionScheduling':
            result = `<tr>
            <td>${beforeData.order_id || '---'}</td>
            <td>${
              beforeData.machine_id
                ? servkit.getMachineName(beforeData.machine_id)
                : '---'
            }</td>
            <td>${afterData.schedule_quantity || '---'}</td>
            <td>${beforeData.exp_mdate}</td>
            <td>${beforeData.exp_edate}</td>
            <td class="conflict-alert">${afterData.exp_mdate}</td>
            <td class="conflict-alert">${afterData.exp_edate}</td>
          </tr>`
            break
          case 'WoMStatus':
            result = `<tr>
            <td>${beforeData.order_id || '---'}</td>
            <td>${
              beforeData.machine_id
                ? servkit.getMachineName(beforeData.machine_id)
                : '---'
            }</td>
            <td>${beforeData.wo_m_time || '---'}</td>
            <td>${afterData.product_id || '---'}</td>
            <td>${afterData.m_qty || '---'}</td>
            <td>${
              afterData.exp_date ? afterData.exp_date.toFormatedDate() : '---'
            }</td>
            <td>${beforeData.exp_mdate}</td>
            <td>${beforeData.exp_edate}</td>
            <td class="conflict-alert">${afterData.exp_mdate}</td>
            <td class="conflict-alert">${afterData.exp_edate}</td>
          </tr>`
            break
        }
        return result
      })
      .join('')
    return html
  }
  updateAdjustedEvent(rearrangedDataList) {
    const updateNonProductionList = []
    const updateProductionSchedulingList = []
    const updateWoMStatusList = []
    rearrangedDataList.forEach((rearrangedData) => {
      if (rearrangedData.affectedData) {
        updateNonProductionList.push(
          ...rearrangedData.affectedData.NonProduction
        )
        updateProductionSchedulingList.push(
          ...rearrangedData.affectedData.ProductionScheduling
        )
        updateWoMStatusList.push(...rearrangedData.affectedData.WoMStatus)
      }
      switch (rearrangedData.insertData.type) {
        case 'NonProduction':
          updateNonProductionList.push(rearrangedData.insertData)
          break
        case 'ProductionScheduling':
          updateProductionSchedulingList.push(rearrangedData.insertData)
          break
        case 'WoMStatus':
          updateWoMStatusList.push(rearrangedData.insertData)
          break
      }
    })
    context.nonProduction.updateEvent(updateNonProductionList)
    context.productionScheduling.updateEvent(updateProductionSchedulingList)
    context.woMStatus.updateEvent(updateWoMStatusList)
  }
  updateAdjustedSchedule(rearrangedDataList) {
    const self = this
    const updateData = {
      NonProduction: {
        before: [],
        after: [],
      },
      WoMStatus: {
        after: [],
      },
      ProductionScheduling: {
        after: [],
      },
    }
    rearrangedDataList.forEach((rearrangedData) => {
      const isInsertNonProduction =
        rearrangedData.insertData.type === 'NonProduction'
      if (isInsertNonProduction) {
        updateData.NonProduction.before.push(rearrangedData.insertData.before)
      }
      updateData[rearrangedData.insertData.type].after.push(
        rearrangedData.insertData.after
      )
      if (rearrangedData.affectedData) {
        Object.entries(rearrangedData.affectedData).forEach(([type, arr]) => {
          arr.forEach((data) => {
            updateData[type].after.push(data.after)
            if (type === 'NonProduction') {
              updateData[type].before.push(data.before)
            }
          })
        })
      }
    })
    return new Promise((resolve, reject) =>
      ajax(
        {
          url: 'api/huangliangMatStock/schedule/updateNonProduction',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(updateData),
        },
        {
          success() {
            resolve()
          },
          fail(data) {
            reject(data)
          },
        }
      )
    ).then(() => {
      self.updateAdjustedEvent(rearrangedDataList) // API只會回傳success字串，所以透過傳送的資料更新event
      $('#query-wo-list-btn').click()
    })
  }
  transferRearrangedData(response, changeBeforeData, changeAfterData) {
    const result = {
      affectedData: {
        NonProduction: [],
        ProductionScheduling: [],
        WoMStatus: [],
      },
      insertData: {},
    }
    let afterData
    let transferdData
    let type
    let origData
    response.before.forEach((data, i) => {
      afterData = response.after[i]
      if (data.scheduleTime) {
        // 預排: 有scheduleTime
        transferdData = {
          before: {
            order_id: data.orderId,
            schedule_time: data.scheduleTime.toFormatedDatetime(
              null,
              DATETIME_FORMAT
            ),
            exp_mdate: data.expMdate.toFormatedDatetime(null, DATETIME_FORMAT),
            exp_edate: data.expEdate.toFormatedDatetime(null, DATETIME_FORMAT),
            machine_id: data.machineId,
            schedule_quantity: data.scheduleQuantity,
          },
          after: {
            order_id: afterData.orderId,
            schedule_time: afterData.scheduleTime.toFormatedDatetime(
              null,
              DATETIME_FORMAT
            ),
            exp_mdate: afterData.expMdate.toFormatedDatetime(
              null,
              DATETIME_FORMAT
            ),
            exp_edate: afterData.expEdate.toFormatedDatetime(
              null,
              DATETIME_FORMAT
            ),
            machine_id: afterData.machineId,
            schedule_quantity: data.scheduleQuantity,
          },
        }
        origData =
          context.productionScheduling.getData(
            context.productionScheduling.getId(transferdData.before)
          ) || {}
        transferdData.before = Object.assign({}, transferdData.before, origData)
        // transferdData.before = Object.assign({}, origData, transferdData.before);
        transferdData.after = Object.assign({}, origData, transferdData.after)
        type = 'ProductionScheduling'
      } else if (data.woMTime) {
        // 機台派工: 有woMTime
        transferdData = {
          before: {
            order_id: data.orderId,
            wo_m_time: data.woMTime.toFormatedDatetime(null, DATETIME_FORMAT),
            exp_mdate: data.expMdate.toFormatedDatetime(null, DATETIME_FORMAT),
            exp_edate: data.expEdate.toFormatedDatetime(null, DATETIME_FORMAT),
            machine_id: data.machineId,
            product_id: data.productId,
            exp_date: data.expDate,
            m_qty: data.mQty,
          },
          after: {
            order_id: afterData.orderId,
            wo_m_time: afterData.woMTime.toFormatedDatetime(
              null,
              DATETIME_FORMAT
            ),
            exp_mdate: afterData.expMdate.toFormatedDatetime(
              null,
              DATETIME_FORMAT
            ),
            exp_edate: afterData.expEdate.toFormatedDatetime(
              null,
              DATETIME_FORMAT
            ),
            machine_id: afterData.machineId,
            product_id: data.productId,
            exp_date: data.expDate,
            m_qty: data.mQty,
          },
        }
        origData =
          context.woMStatus.getData(
            context.woMStatus.getId(transferdData.before)
          ) || {}
        transferdData.before = Object.assign({}, transferdData.before, origData)
        // transferdData.before = Object.assign({}, origData, transferdData.before);
        transferdData.after = Object.assign({}, origData, transferdData.after)
        type = 'WoMStatus'
      } else {
        // 非量產時間: 上述都沒有
        transferdData = {
          before: {
            exp_time: data.expMdate.toFormatedDatetime(null, DATETIME_FORMAT),
            exp_edate: data.expEdate.toFormatedDatetime(null, DATETIME_FORMAT),
            machine_id: data.machineId,
          },
          after: {
            exp_time: afterData.expMdate.toFormatedDatetime(
              null,
              DATETIME_FORMAT
            ),
            exp_edate: afterData.expEdate.toFormatedDatetime(
              null,
              DATETIME_FORMAT
            ),
            machine_id: afterData.machineId,
          },
        }
        origData =
          context.nonProduction.getData(
            context.nonProduction.getId(transferdData.before)
          ) || {}
        transferdData.before = Object.assign({}, transferdData.before, origData)
        // transferdData.before = Object.assign({}, origData, transferdData.before);
        transferdData.after = Object.assign({}, origData, transferdData.after)
        type = 'NonProduction'
      }
      if (i === 0) {
        result.insertData = transferdData
        result.insertData.before = Object.assign(
          result.insertData.before,
          changeBeforeData
        )
        result.insertData.after = Object.assign(
          result.insertData.after,
          changeBeforeData,
          changeAfterData
        )
        result.insertData.type = type
      } else {
        result.affectedData[type].push(transferdData)
      }
    })

    return result
  }
  isInRange(start, end, machineId) {
    const calendarStart = +context.calendar.view.currentStart
    const calendarEnd = +context.calendar.view.currentEnd
    const eventStart = +moment(start)
    const eventEnd = +moment(end)
    const isTimeInRange = calendarStart <= eventEnd && calendarEnd >= eventStart
    return isTimeInRange && context.calendar.machineList.includes(machineId)
  }
  static formatTimeData(val) {
    // 轉換資料的時間格式
    if (datetimeReg.test(val)) {
      return val.toFormatedDatetime()
    } else if (dateReg.test(val)) {
      return val.toFormatedDate()
    } else {
      return val
    }
  }
  static toShiftTime(
    timeStr,
    outputFormat = DATETIME_FORMAT_WITHOUT_SEC,
    SHIFT_TIME_OFFSET_TO_CALENDAR_TIME
  ) {
    // 時間從calendar時間轉成班次時間(moment格式)
    return moment(timeStr)
      .add(SHIFT_TIME_OFFSET_TO_CALENDAR_TIME, 'hours')
      .format(outputFormat)
  }
  static toCalendarTime(
    timeStr,
    outputFormat = DATETIME_FORMAT_WITHOUT_SEC,
    SHIFT_TIME_OFFSET_TO_CALENDAR_TIME
  ) {
    // 時間從班次時間轉成calendar時間(moment格式)
    return moment(timeStr)
      .subtract(SHIFT_TIME_OFFSET_TO_CALENDAR_TIME, 'hours')
      .format(outputFormat)
  }
}

// 生產指令
class WoList {
  constructor() {
    this.data = {}
  }
  getData(order_id) {
    return this.data[order_id]
  }
  setData(order_id, woList) {
    this.data[order_id] = woList
  }
  static getQuantity(data) {
    return data.order_qty - data.all_m_qty - data.all_schedule_quantity
  }
}
// 非量產時間
class NonProduction extends Work {
  constructor() {
    const disabledColor = {
      border: '#a04f0a', // 橘色
    }
    super({
      workKey: 'nonProduction',
      color: {
        border: '#d2b24d', // 褐色
      },
      eventResourceIndex: 0,
      events: ['main'],
      pkNameList: ['machine_id', 'exp_time'],
      formatFnMap: {
        exp_time(data) {
          return Work.formatTimeData(data)
        },
      },
    })
    this.purposeMap = {
      // 停機設定的原因對應
      1: '維修保養',
      2: '治具生產',
      3: '樣品製作',
      0: '其他',
    }
  }
  createEvent(data) {
    // 拿到event的title
    const events = {
      main: {
        title: this.purposeMap[data.purpose],
      },
    }
    if (data.purpose === 0) events['main'].title = data.purpose_other || '---'
    // 拿到event的時間點
    const start = Work.toCalendarTime(data.exp_time, DATETIME_FORMAT)
    const end = Work.toCalendarTime(data.exp_edate, DATETIME_FORMAT)
    const times = this.getEventTime(start, end, 0, 0)
    let editable = true
    let clickable = true
    // 建立event
    if (data.purpose === 9) {
      this.eventColor.border = '#a04f0a' // 橘色
      events['main'].title = '休假日'
      editable = false
      clickable = false
    } else {
      this.eventColor.border = '#d2b24d' // 褐色
    }
    super.createEvent(data, data.machine_id, events, times, editable, clickable)
  }
  updateEvent(updateDataArr) {
    const events = {
      main: {},
    }
    updateDataArr.forEach(({ before, after }) => {
      this.removeEvent(this.getId(before), events)
      this.createEvent(after)
    })
  }
  saveNonProduction(beforeData, afterData, eventInfo) {
    const self = this
    return fetchRearrangedData(
      {
        exp_time: afterData.exp_time.toFormatedDatetime(
          null,
          DATETIME_FORMAT_BACKEND
        ),
        exp_edate: afterData.exp_edate.toFormatedDatetime(
          null,
          DATETIME_FORMAT_BACKEND
        ),
        machine_id: beforeData.machine_id,
        old_exp_time: [
          beforeData.exp_time.toFormatedDatetime(null, DATETIME_FORMAT_BACKEND),
        ],
        purpose: afterData.purpose || beforeData.purpose,
      },
      'NonProductionScheduling'
    ).then(({ response, request }) => {
      const isConflict = response.before.length > 1 // 最少會有一筆，自己本身
      const rearrangedData = self.transferRearrangedData(
        response,
        beforeData,
        afterData
      )
      console.log(rearrangedData)
      if (isConflict) {
        // const insertionType = 'nonProduction';
        const insertionText = `非量產${afterData.duration}H`
        context.nonProduction.renderConflictTable(
          insertionText,
          rearrangedData,
          'nonProduction',
          eventInfo
        )
      } else {
        return self.updateAdjustedSchedule([rearrangedData])
      }
    })
  }
  static getOverlappedTime(machine_id, startDatetime, endDatetime) {
    return fetchNonProductionData(startDatetime, endDatetime, [
      machine_id,
    ]).then((response) => {
      let start
      let end

      return response.map(({ exp_time, exp_edate }) => {
        start = moment(startDatetime).isBefore(moment(exp_time))
          ? exp_time
          : startDatetime
        end = moment(endDatetime).isAfter(moment(exp_edate))
          ? exp_edate
          : endDatetime
        return {
          start,
          end,
          duration: moment(end) - moment(start),
        }
      })
    })
  }
  static isOverlapped(machine_id, startDatetime, endDatetime, dataToexclude) {
    return fetchNonProductionData(startDatetime, endDatetime, [
      machine_id,
    ]).then((response) => {
      if (dataToexclude) {
        const exclude_exp_time = dataToexclude.exp_time.toFormatedDatetime()
        return !!response.filter(
          (obj) =>
            !(
              obj.exp_time.toFormatedDatetime() === exclude_exp_time &&
              obj.machine_id === dataToexclude.machine_id &&
              obj.purpose === +dataToexclude.purpose
            )
        ).length
      } else {
        return !!response.length
      }
    })
  }
}

class ProductionScheduling extends Work {
  // 預排
  constructor() {
    super({
      workKey: 'productionScheduling',
      color: {
        border: '#4a89c7', // 藍色
        bufferBackground: '#8bbaeaad', // 淺藍色
      },
      eventResourceIndex: 1,
      events: ['correction', 'main', 'buffer'],
      pkNameList: ['order_id', 'schedule_time', 'machine_id'],
      formatFnMap: {
        schedule_time(data) {
          return Work.formatTimeData(data)
        },
      },
    })
    this.eventConstraint = 'productionScheduling'
    this.editType = 'create' // 編輯時判斷為新增或更新用
  }
  createEvent(data, start, end) {
    // 拿到event的title
    const events = {}
    const eventStart =
      start || Work.toCalendarTime(data.exp_mdate, DATETIME_FORMAT)
    const eventEnd = end || Work.toCalendarTime(data.exp_edate, DATETIME_FORMAT)
    _.each(this.events, (evt) => {
      let title = ''
      switch (evt) {
        case 'correction':
          title = `${data.correction_time}H`
          break
        case 'main':
          title = `${data.order_id || '---'}, ${
            data.product_id || '---'
          }, 預排數：${data.schedule_quantity || '---'}, 製程順序：${
            data.pg_seq || '---'
          }`
          break
        case 'buffer':
          title = `緩衝${data.buffer_time}h`
          break
      }
      events[evt] = {
        title: title,
      }
    })
    // 拿到event的時間點
    const times = this.getEventTime(
      eventStart,
      eventEnd,
      data.correction_time,
      data.buffer_time
    )
    // 建立event
    super.createEvent(data, data.machine_id, events, times, false, true)
  }
  updateEvent(updateDataArr) {
    const events = {
      main: {},
      correction: {},
      buffer: {},
    }
    updateDataArr.forEach(({ before, after }) => {
      this.removeEvent(this.getId(before), events)
      this.createEvent(after)
    })
  }
}

class WoMStatus extends Work {
  // 機台派工
  constructor() {
    super({
      workKey: 'woMStatus',
      color: {
        border: '#468f46ad', // 綠色
        bufferBackground: '#94cd94ad', // 淺綠色
      },
      eventResourceIndex: 2,
      events: ['correction', 'main', 'buffer'],
      pkNameList: ['order_id', 'machine_id', 'wo_m_time'],
      formatFnMap: {
        wo_m_time(data) {
          return Work.formatTimeData(data)
        },
      },
    })
  }
  createEvent(data, start, end) {
    // 拿到event的title
    const events = {}
    const eventStart =
      start || Work.toCalendarTime(data.exp_mdate, DATETIME_FORMAT)
    const eventEnd = end || Work.toCalendarTime(data.exp_edate, DATETIME_FORMAT)
    _.each(this.events, (evt) => {
      let title = ''
      switch (evt) {
        case 'correction':
          title = context.allUserMap[data.work_by] || data.work_by
          break
        case 'main':
          title = `${data.order_id}, ${data.product_id}, 派工數：${data.m_qty}, 製程順序：${data.pg_seq}`
          break
        case 'buffer':
          title = `緩衝${data.buffer_time}h`
          break
      }
      events[evt] = {
        title: title,
      }
    })
    // 拿到event的時間點
    if (!data.correction_time) data.correction_time = 8
    if (!data.buffer_time) data.buffer_time = 8
    const times = this.getEventTime(
      eventStart,
      eventEnd,
      data.correction_time,
      data.buffer_time
    )
    // 建立event
    super.createEvent(data, data.machine_id, events, times, false, true)
  }
  updateEvent(updateDataArr) {
    const events = {
      main: {},
      correction: {},
      buffer: {},
    }
    updateDataArr.forEach(({ before, after }) => {
      this.removeEvent(this.getId(before), events)
      this.createEvent(after)
    })
  }
}

class WoMStatusAct extends Work {
  // 實際派工
  constructor() {
    super({
      workKey: 'woMStatusAct',
      color: {
        border: '#a68c6cad', // 咖啡色
        bufferBackground: '#a68c6cad', // 淺咖啡色
      },
      eventResourceIndex: 3,
      events: ['main'],
      pkNameList: ['order_id', 'machine_id', 'wo_m_time'],
      formatFnMap: {
        wo_m_time(data) {
          return Work.formatTimeData(data)
        },
      },
    })
  }
  createEvent(data) {
    return NonProduction.getOverlappedTime(
      data.machine_id,
      moment(data.act_mdate).format(DATETIME_FORMAT),
      moment(data.act_edate).format(DATETIME_FORMAT)
    ).then((overLappedData) => {
      // 拿到event的title
      const eventStart = Work.toCalendarTime(data.act_mdate, DATETIME_FORMAT)
      const eventEnd = Work.toCalendarTime(data.act_edate, DATETIME_FORMAT)
      // 應完成數、百分比 要扣除停機時間
      const nonProductionHour = overLappedData.length
        ? overLappedData.reduce((a, x) => a + x.duration, 0) /
          MILLISECONDS_PER_HOUR
        : 0
      const expQty =
        (moment(data.act_edate).diff(data.act_mdate, 'seconds') -
          nonProductionHour * 60 * 60) /
        data.m_ptime
      const effectiveness = expQty
        ? ((data.m_pqty / expQty) * 100).toFixed(2) + '%'
        : '---'
      const events = {
        main: {
          title: `${data.order_id}, 已生產：${data.m_pqty}, 應完成數：${expQty}, ${effectiveness}`,
        },
      }

      // 拿到event的時間點
      const correction_time = data.correction_time || 8
      const buffer_time = data.buffer_time || 8
      const times = this.getEventTime(
        eventStart,
        eventEnd,
        correction_time,
        buffer_time
      )
      // 建立event
      super.createEvent(data, data.machine_id, events, times, false, false)
    })
  }
}

class PartCount extends Work {
  // 顆數
  constructor() {
    super({
      workKey: 'partcount',
      color: {
        bufferBackground: '#2e8b57', // 綠色
      },
      eventResourceIndex: 3,
      events: ['main'],
      eventSize: 'xs',
      pkNameList: ['date', 'work_shift_name', 'machine_id'],
    })
  }
  createEvent(data, start, end, ids) {
    let calcData = {
      start: start,
      end: end,
      date: ids[0],
      work_shift_name: ids[1],
      machine_id: ids[2],
      part_count: 0,
      examination_goods: 0,
      data: data,
    }
    // 取得當天同班次加總顆數、例檢良品數
    _.each(data.data, (v) => {
      var key =
        v.date +
        '/' +
        v.employee_id +
        '/' +
        v.work_shift_name +
        '/' +
        v.machine_id +
        '/' +
        v.order_id +
        '/' +
        v.multi_process
      var hqedData = data.nObj[key] || {}
      calcData.part_count += v.part_count
      calcData.examination_goods +=
        hqedData && hqedData.length
          ? hqedData[0].examination_goods
          : v.part_count
    })

    // 拿到event的description
    const events = {
      main: {
        description: `${calcData.examination_goods}/${
          calcData.part_count
        }，生產指令：${data.data.map((v) => v.order_id)}`,
      },
    }

    // 拿到event的時間點
    const times = this.getEventTime(start, end, 0, 0)
    // 建立event
    if (calcData.examination_goods / calcData.part_count < 0.9) {
      this.eventColor.background['main'] = '#a90329' // 紅色
    } else {
      this.eventColor.background['main'] = '#2e8b57' // 綠色
    }
    super.createEvent(
      calcData,
      calcData.machine_id,
      events,
      times,
      false,
      false
    )
  }
}

export {
  Work,
  WoList,
  NonProduction,
  ProductionScheduling,
  WoMStatus,
  WoMStatusAct,
  PartCount,
}
